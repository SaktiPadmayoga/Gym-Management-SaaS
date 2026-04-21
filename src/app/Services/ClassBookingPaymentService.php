<?php

namespace App\Services;

use App\Models\Tenant\TenantInvoice;
use App\Models\Tenant\ClassAttendance;
use App\Models\Tenant\ClassSchedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClassBookingPaymentService
{
    /**
     * Dipanggil oleh Webhook ketika Midtrans mengirim status settlement/capture
     */
    public function confirmPayment(array $payload): void
    {
        $orderId = $payload['order_id'];

        try {
            DB::transaction(function () use ($payload, $orderId) {
                // 1. Cari Invoice berdasarkan order_id
                $invoice = TenantInvoice::where('external_reference', $orderId)
                    ->orWhere('invoice_number', $orderId)
                    ->lockForUpdate()
                    ->first();

                if (!$invoice) {
                    Log::error('[ClassBookingPayment] Invoice tidak ditemukan', ['order_id' => $orderId]);
                    return;
                }

                // Jika sudah paid, hindari proses ganda
                if ($invoice->status === 'paid') {
                    return;
                }

                // 2. Update Invoice menjadi Paid
                $invoice->update([
                    'status'           => 'paid',
                    'payment_method'   => $payload['payment_type'] ?? 'midtrans',
                    'transaction_id'   => $payload['transaction_id'] ?? null,
                    'paid_at'          => now(),
                    'gateway_response' => json_encode($payload),
                ]);

                // 3. Cari ClassAttendance MANUAL (Tanpa relasi agar tidak error)
                $attendance = ClassAttendance::where('tenant_invoice_id', $invoice->id)->first();

                if ($attendance) {
                    // Update status pembayaran kehadiran
                    $attendance->update([
                        'payment_status' => 'paid',
                        // Status kehadiran tetap 'booked', staf bisa ubah manual ke 'attended' saat member datang
                    ]);

                    // 4. PENTING: Tambah kuota kelas (karena saat pending di awal kita tidak menambahkannya)
                    if ($attendance->class_schedule_id) {
                        ClassSchedule::where('id', $attendance->class_schedule_id)->increment('total_booked');
                    }
                    
                    Log::info('[ClassBookingPayment] Sukses konfirmasi payment kelas', ['attendance_id' => $attendance->id]);
                } else {
                    Log::error('[ClassBookingPayment] ClassAttendance tidak ditemukan untuk invoice', ['invoice_id' => $invoice->id]);
                }
            });
        } catch (\Exception $e) {
            Log::error('[ClassBookingPayment] Error confirmPayment', [
                'order_id' => $orderId,
                'error'    => $e->getMessage()
            ]);
        }
    }

    /**
     * Dipanggil oleh Webhook ketika Midtrans mengirim status expire/cancel/deny
     */
    public function handleFailedPayment(array $payload, string $status): void
    {
        $orderId = $payload['order_id'];

        try {
            DB::transaction(function () use ($payload, $orderId, $status) {
                $invoice = TenantInvoice::where('external_reference', $orderId)
                    ->orWhere('invoice_number', $orderId)
                    ->first();

                if (!$invoice || $invoice->status === 'paid') {
                    return;
                }

                $invoice->update([
                    'status'           => $status, // 'failed' atau 'expired'
                    'gateway_response' => json_encode($payload),
                ]);

                // Cari ClassAttendance MANUAL
                $attendance = ClassAttendance::where('tenant_invoice_id', $invoice->id)->first();

                if ($attendance) {
                    // Batalkan kehadiran
                    $attendance->update([
                        'status'         => 'cancelled',
                        'payment_status' => $status,
                        'notes'          => 'Dibatalkan karena pembayaran expired/gagal',
                    ]);
                    
                    // Kita TIDAK PERLU mengurangi (decrement) total_booked kelas
                    // karena saat statusnya pending, kita memang belum menambahkannya.
                }
            });
        } catch (\Exception $e) {
            Log::error('[ClassBookingPayment] Error handleFailedPayment', [
                'order_id' => $orderId,
                'error'    => $e->getMessage()
            ]);
        }
    }
}