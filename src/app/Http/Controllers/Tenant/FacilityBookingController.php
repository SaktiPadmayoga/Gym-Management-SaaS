<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Facility;
use App\Models\Tenant\Member;
use App\Models\Tenant\FacilityBooking;
use App\Services\FacilityBookingService;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FacilityBookingController extends Controller
{
    /**
     * Tampilkan semua booking fasilitas
     */
    public function index(Request $request)
    {
        $query = FacilityBooking::with(['facility', 'member', 'invoice']);

        if ($request->filled('date')) {
            $query->where('date', $request->date);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        $bookings = $query->orderBy('date', 'desc')
                          ->orderBy('start_time', 'asc')
                          ->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'data' => $bookings->items(),
            'meta' => [
                'total'        => $bookings->total(),
                'per_page'     => $bookings->perPage(),
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
            ],
        ]);
    }

    /**
     * Tampilkan detail booking
     */
    public function show(string $id)
    {
        $booking = FacilityBooking::with(['facility', 'member', 'invoice'])->findOrFail($id);
        return ApiResponse::success($booking);
    }

    /**
     * Proses Booking & Bayar (Sudah kita buat sebelumnya)
     */
    public function store(Request $request, FacilityBookingService $service)
    {
        $request->validate([
            'facility_id'    => 'required|uuid|exists:facilities,id',
            'member_id'      => 'required|uuid|exists:members,id',
            'date'           => 'required|date|after_or_equal:today',
            'start_time'     => 'required|date_format:H:i',
            'payment_method' => 'nullable|in:cash,midtrans',
            'notes'          => 'nullable|string',
        ]);

        try {
            $facility = Facility::findOrFail($request->facility_id);
            $member   = Member::findOrFail($request->member_id);
            $staffId  = auth('staff')->id();

            $result = $service->book(
                $facility, 
                $member, 
                $request->date, 
                $request->start_time, 
                $staffId, 
                $request->notes, 
                $request->payment_method ?? 'midtrans'
            );

            return ApiResponse::success([
                'booking'    => $result['booking'],
                'invoice'    => $result['invoice'],
                'snap_token' => $result['snap_token'],
            ], 'Fasilitas berhasil dipesan.', 201);

        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return ApiResponse::error('Gagal memproses pesanan.', null, 500);
        }
    }

    /**
     * Update Booking (Edit Jadwal/Notes)
     */
    public function update(Request $request, string $id)
    {
        $booking = FacilityBooking::findOrFail($id);

        $request->validate([
            'date'       => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'notes'      => 'nullable|string',
            'status'     => 'required|in:booked,completed,cancelled,no_show',
        ]);

        // Cek overlap jika merubah waktu/tanggal
        if ($request->date !== $booking->date || $request->start_time !== substr($booking->start_time, 0, 5)) {
            $facility = Facility::findOrFail($booking->facility_id);
            $start = Carbon::parse("{$request->date} {$request->start_time}");
            $end   = $start->copy()->addMinutes($facility->minutes_per_session);
            
            $startStr = $start->format('H:i:s');
            $endStr   = $end->format('H:i:s');

            $overlapping = FacilityBooking::where('facility_id', $facility->id)
                ->where('date', $request->date)
                ->where('id', '!=', $booking->id) // Abaikan booking ini sendiri
                ->whereIn('status', ['booked', 'completed'])
                ->where(function ($q) use ($startStr, $endStr) {
                    $q->where('start_time', '<', $endStr)
                      ->where('end_time', '>', $startStr);
                })->count();

            if ($overlapping >= $facility->capacity) {
                return ApiResponse::error('Fasilitas penuh pada jam tersebut.', null, 422);
            }

            $booking->date       = $request->date;
            $booking->start_time = $startStr;
            $booking->end_time   = $endStr;
        }

        $booking->notes  = $request->notes;
        $booking->status = $request->status;
        $booking->save();

        return ApiResponse::success($booking, 'Booking berhasil diperbarui.');
    }

    /**
     * Delete / Cancel Booking
     */
    public function destroy(string $id)
    {
        $booking = FacilityBooking::findOrFail($id);
        
        $booking->update([
            'status' => 'cancelled',
            'cancelled_reason' => request('reason', 'Dibatalkan oleh Staff'),
        ]);

        // Optional: Jika invoice masih pending, batalkan juga
        if ($booking->invoice && $booking->invoice->status === 'pending') {
            $booking->invoice->update(['status' => 'cancelled']);
        }

        return ApiResponse::success(null, 'Booking berhasil dibatalkan.');
    }
}