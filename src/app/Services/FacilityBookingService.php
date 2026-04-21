<?php

namespace App\Services;

use App\Models\Tenant\Facility;
use App\Models\Tenant\FacilityBooking;
use App\Models\Tenant\Member;
use App\Models\Tenant\TenantInvoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FacilityBookingService
{
    public function __construct(protected MidtransService $midtrans) {}

    public function book(Facility $facility, Member $member, string $date, string $startTime, ?string $staffId = null, ?string $notes = null, string $paymentMethod = 'midtrans'): array
    {
        // 1. Hitung End Time
        $start = Carbon::parse("$date $startTime");
        $end   = $start->copy()->addMinutes($facility->minutes_per_session);
        
        $endTimeStr = $end->format('H:i:s');
        $startTimeStr = $start->format('H:i:s');

        // 2. Validasi Kapasitas & Overlap Waktu
        $this->assertAvailable($facility, $date, $startTimeStr, $endTimeStr);

        $isPaid = $facility->price > 0;

        return DB::transaction(function () use ($facility, $member, $date, $startTimeStr, $endTimeStr, $staffId, $notes, $paymentMethod, $isPaid) {
            
            $isCash = $paymentMethod === 'cash';

            // 3. Buat Data Booking Awal
            $booking = FacilityBooking::create([
                'facility_id'    => $facility->id,
                'member_id'      => $member->id,
                'branch_id'      => $facility->branch_id,
                'date'           => $date,
                'start_time'     => $startTimeStr,
                'end_time'       => $endTimeStr,
                'status'         => 'booked',
                'payment_status' => $isPaid ? ($isCash ? 'paid' : 'pending') : 'free',
                'booked_by'      => $staffId,
                'notes'          => $notes,
            ]);

            // Jika GRATIS
            if (!$isPaid) {
                return ['booking' => $booking->load(['facility', 'member']), 'invoice' => null, 'snap_token' => null];
            }

            // Jika BERBAYAR: Buat Invoice
            $invoice = TenantInvoice::create([
                'tenant_id'       => tenant('id'),
                'member_id'       => $member->id,
                'branch_id'       => $facility->branch_id,
                'invoice_number'  => TenantInvoice::generateInvoiceNumber('FCL'), // Prefix FCL
                'subtotal'        => $facility->price,
                'total_amount'    => $facility->price,
                'currency'        => $facility->currency,
                'payment_gateway' => $paymentMethod,
                'status'          => $isCash ? 'paid' : 'pending',
                'issued_at'       => now(),
                'due_date'        => now()->addHours(2),
                'paid_at'         => $isCash ? now() : null,
            ]);

            $invoice->items()->create([
                'item_type'  => FacilityBooking::class,
                'item_id'    => $booking->id,
                'item_name'  => "Sewa {$facility->name} ({$date} {$startTimeStr})",
                'quantity'   => 1,
                'unit_price' => $facility->price,
                'total_price'=> $facility->price,
            ]);

            $invoice->update(['external_reference' => $invoice->invoice_number]);
            $booking->update(['tenant_invoice_id' => $invoice->id]);

            // Lunas (Cash)
            if ($isCash) {
                return ['booking' => $booking->load(['facility', 'member']), 'invoice' => $invoice, 'snap_token' => null];
            }

            // Minta Snap Token Midtrans
            $snapToken = $this->midtrans->getSnapToken(
                orderId:     $invoice->invoice_number,
                grossAmount: (int) $facility->price,
                member:      $member,
                plan:        (object) ['id' => $facility->id, 'name' => $facility->name] // Mock object
            );

            return ['booking' => $booking->load(['facility', 'member']), 'invoice' => $invoice, 'snap_token' => $snapToken];
        });
    }

    /**
     * Cek apakah di waktu tersebut kapasitas belum penuh
     */
    private function assertAvailable(Facility $facility, string $date, string $start, string $end): void
    {
        // Logika Overlap: (existing_start < new_end) AND (existing_end > new_start)
        $overlappingBookings = FacilityBooking::where('facility_id', $facility->id)
            ->where('date', $date)
            ->whereIn('status', ['booked', 'completed'])
            ->where(function ($query) use ($start, $end) {
                $query->where('start_time', '<', $end)
                      ->where('end_time', '>', $start);
            })
            ->count();

        if ($overlappingBookings >= $facility->capacity) {
            throw new \InvalidArgumentException('Fasilitas penuh pada jam tersebut.');
        }
    }
}