<?php

namespace App\Services;

use App\Models\Tenant\ClassAttendance;
use App\Models\Tenant\ClassSchedule;
use App\Models\Tenant\Member;
use App\Models\Tenant\TenantInvoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClassBookingService
{
    public function __construct(
        protected MidtransService $midtrans
    ) {}

    /**
     * Entry point utama.
     */
    public function book(
        ClassSchedule $schedule,
        Member $member,
        ?string $staffId = null,
        ?string $notes = null,
        string $paymentMethod = 'midtrans'
    ): array {
        $this->assertBookable($schedule, $member);

        $plan = $schedule->classPlan;

        if (! $plan->requiresPayment()) {
            return $this->bookFree($schedule, $member, $staffId, $notes);
        }

        return $this->bookPaid($schedule, $member, $staffId, $notes, $paymentMethod);
    }

    // ------------------------------------------------------------------
    // BOOKING GRATIS
    // ------------------------------------------------------------------

    private function bookFree(ClassSchedule $schedule, Member $member, ?string $staffId, ?string $notes): array
    {
        $attendance = DB::transaction(function () use ($schedule, $member, $staffId, $notes) {
            $attendance = ClassAttendance::create([
                'class_schedule_id' => $schedule->id,
                'member_id'         => $member->id,
                'checked_in_by'     => $staffId,
                'status'            => 'booked',
                'payment_status'    => 'free',
                'tenant_invoice_id' => null,
                'booked_at'         => now(),
                'notes'             => $notes,
            ]);

            $schedule->increment('total_booked');

            return $attendance;
        });

        $attendance->load(['member', 'checkedInBy']);

        return [
            'attendance' => $attendance,
            'invoice'    => null,
            'snap_token' => null,
        ];
    }

    // ------------------------------------------------------------------
    // BOOKING BERBAYAR (CASH / MIDTRANS)
    // ------------------------------------------------------------------

    private function bookPaid(
        ClassSchedule $schedule,
        Member $member,
        ?string $staffId,
        ?string $notes,
        string $paymentMethod
    ): array {
        $plan   = $schedule->classPlan;
        $isCash = $paymentMethod === 'cash';

        return DB::transaction(function () use ($schedule, $plan, $member, $staffId, $notes, $paymentMethod, $isCash) {

            // 1. Buat Invoice
            $invoice = TenantInvoice::create([
                'tenant_id'       => tenant('id'),
                'member_id'       => $member->id,
                'branch_id'       => $schedule->branch_id,
                'invoice_number'  => TenantInvoice::generateInvoiceNumber('CLS'),
                'subtotal'        => $plan->price,
                'tax'             => 0,
                'total_amount'    => $plan->price,
                'currency'        => $plan->currency ?? 'IDR',
                'payment_gateway' => $paymentMethod,
                'status'          => $isCash ? 'paid' : 'pending',
                'issued_at'       => now(),
                'due_date'        => now()->addHours(2),
                'paid_at'         => $isCash ? now() : null,
            ]);

            // 2. Invoice Item
            $invoice->items()->create([
                'item_type'   => ClassSchedule::class,
                'item_id'     => $schedule->id,
                'item_name'   => "{$plan->name} — " . $schedule->date . ' ' . $schedule->start_at,
                'quantity'    => 1,
                'unit_price'  => $plan->price,
                'total_price' => $plan->price,
            ]);

            // 3. Buat ClassAttendance
            $attendance = ClassAttendance::create([
                'class_schedule_id' => $schedule->id,
                'member_id'         => $member->id,
                'checked_in_by'     => $staffId,
                'status'            => 'booked',
                'payment_status'    => $isCash ? 'paid' : 'pending',
                'tenant_invoice_id' => $invoice->id,
                'booked_at'         => now(),
                'notes'             => $notes,
            ]);

            // 4. Update external reference
            $invoice->update([
                'external_reference' => $invoice->invoice_number,
            ]);

            // 5. CASH: slot langsung terkurangi, tidak perlu Midtrans
            if ($isCash) {
                $schedule->increment('total_booked');
                $attendance->load(['member', 'checkedInBy']);

                return [
                    'attendance' => $attendance,
                    'invoice'    => $invoice->fresh(['items']),
                    'snap_token' => null,
                ];
            }

            // 6. MIDTRANS: minta Snap Token
            $snapToken = $this->midtrans->getSnapToken(
                orderId:     $invoice->invoice_number,
                grossAmount: (int) $plan->price,
                member:      $member,
                plan:        $plan,
            );

            // ✅ PERBAIKAN: Untuk Midtrans, total_booked juga di-increment
            // agar kapasitas langsung terkurangi saat booking dibuat (status pending).
            // Jika payment gagal/expired, webhook Midtrans / job cleanup akan
            // cancel attendance dan decrement kembali.
            $schedule->increment('total_booked');

            $attendance->load(['member', 'checkedInBy']);

            return [
                'attendance' => $attendance,
                'invoice'    => $invoice->fresh(['items']),
                'snap_token' => $snapToken,
            ];
        });
    }

    // ------------------------------------------------------------------
    // GUARD
    // ------------------------------------------------------------------

    private function assertBookable(ClassSchedule $schedule, Member $member): void
    {
        if ($schedule->isCancelled()) {
            throw new \InvalidArgumentException('Jadwal sudah dibatalkan.');
        }

        if ($schedule->status === 'completed') {
            throw new \InvalidArgumentException('Jadwal kelas sudah selesai.');
        }

        $plan     = $schedule->classPlan;
        $capacity = $schedule->max_capacity ?? $plan->max_capacity;

        // ✅ PERBAIKAN: Karena total_booked sekarang langsung di-increment
        // saat booking (termasuk pending Midtrans), cukup cek total_booked saja.
        // Tidak perlu double-count pending attendance lagi.
        if ($schedule->total_booked >= $capacity) {
            throw new \InvalidArgumentException('Kapasitas kelas sudah penuh.');
        }

        $alreadyBooked = ClassAttendance::where('class_schedule_id', $schedule->id)
            ->where('member_id', $member->id)
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($alreadyBooked) {
            throw new \InvalidArgumentException('Member sudah terdaftar di kelas ini.');
        }
    }
}