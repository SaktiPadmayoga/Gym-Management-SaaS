<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenant\ClassAttendanceResource;
use App\Http\Responses\ApiResponse;
use App\Models\Tenant\ClassSchedule;
use App\Services\ClassBookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MemberClassBookingController extends Controller
{
    public function __construct(
        protected ClassBookingService $bookingService
    ) {}

    // POST /member/class-schedules/:id/book
    public function book(Request $request, string $scheduleId)
    {
        $schedule = ClassSchedule::with('classPlan')->findOrFail($scheduleId);
        $member   = $request->user('member');

        try {
            $result = $this->bookingService->book(
                schedule: $schedule,
                member:   $member,
                staffId:  null,   // self-booking, bukan staff
                notes:    $request->notes,
            );
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            Log::error('[MemberBooking] Exception', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);
            return ApiResponse::error('Gagal melakukan booking.', null, 500);
        }

        // Gratis — langsung confirmed
        if ($result['snap_token'] === null) {
            return ApiResponse::success(
                new ClassAttendanceResource($result['attendance']),
                'Berhasil booking kelas. Sampai jumpa!',
                201
            );
        }

        // Berbayar — kembalikan snap_token
        return ApiResponse::success(
            [
                'attendance' => new ClassAttendanceResource($result['attendance']),
                'invoice'    => [
                    'id'             => $result['invoice']->id,
                    'invoice_number' => $result['invoice']->invoice_number,
                    'total_amount'   => $result['invoice']->total_amount,
                    'due_date'       => $result['invoice']->due_date,
                ],
                'snap_token' => $result['snap_token'],
            ],
            'Silakan selesaikan pembayaran.',
            201
        );
    }

    // DELETE /member/class-schedules/:id/book
    public function cancel(Request $request, string $scheduleId)
    {
        $member = $request->user('member');

        $attendance = \App\Models\Tenant\ClassAttendance::where('class_schedule_id', $scheduleId)
            ->where('member_id', $member->id)
            ->whereNotIn('status', ['cancelled'])
            ->firstOrFail();

        if ($attendance->payment_status === 'paid') {
            return ApiResponse::error(
                'Kelas berbayar tidak bisa dibatalkan langsung. Hubungi staff.',
                null, 422
            );
        }

        $attendance->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // Kurangi slot hanya jika sudah terhitung (free/paid, bukan pending)
        if ($attendance->payment_status !== 'pending') {
            $attendance->schedule->decrement('total_booked');
        }

        return ApiResponse::success(null, 'Booking berhasil dibatalkan.');
    }
}