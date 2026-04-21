<?php

namespace App\Services;

use App\Models\Tenant\TenantInvoice;
use App\Models\Tenant\Product;
use App\Models\Tenant\MembershipPlan;
use App\Models\Tenant\PtSessionPlan;
use App\Models\Tenant\StockMovement;
use App\Models\Tenant\Membership;
use App\Models\Tenant\PtPackage;
use App\Models\Tenant\Member;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class POSPaymentService
{
    /**
     * Dipanggil oleh Webhook ketika Midtrans mengirim status settlement/capture
     */
    public function confirmPayment(array $payload): void
    {
        DB::transaction(function () use ($payload) {
            $invoice = TenantInvoice::with('items')->where('invoice_number', $payload['order_id'])->first();

            if (!$invoice || $invoice->status === 'paid') return;

            // 1. Update Invoice menjadi Paid
            $invoice->update([
                'status'           => 'paid',
                'payment_method'   => $payload['payment_type'] ?? 'midtrans',
                'transaction_id'   => $payload['transaction_id'] ?? null,
                'paid_at'          => now(),
                'gateway_response' => json_encode($payload)
            ]);

            // 2. Eksekusi Post-Payment Hooks
            // Pada webhook, created_by diambil langsung dari invoice yang diproses
            $this->dispatchPostPaymentHooks($invoice, $invoice->items, $invoice->created_by);
            
            Log::info('[POSPayment] Transaksi POS Berhasil via Midtrans', ['invoice' => $invoice->invoice_number]);
        });
    }

    /**
     * Dipanggil oleh Webhook ketika Midtrans mengirim status expire/cancel/deny
     */
    public function handleFailedPayment(array $payload, string $status): void
    {
        DB::transaction(function () use ($payload, $status) {
            $invoice = TenantInvoice::where('invoice_number', $payload['order_id'])->first();

            if (!$invoice || $invoice->status === 'paid') return;

            $invoice->update([
                'status'           => $status,
                'gateway_response' => json_encode($payload)
            ]);
            
            Log::info('[POSPayment] Transaksi POS Batal/Expired', ['invoice' => $invoice->invoice_number]);
            // Tidak ada hook yang dieksekusi, stok aman, paket belum dibuat.
        });
    }

    /**
     * Distributor logika berdasarkan tipe item.
     * Dipanggil oleh Cash (langsung) atau Midtrans (via confirmPayment).
     * @param TenantInvoice $invoice
     * @param iterable $items Bisa berupa array (dari Cash) atau Collection TenantInvoiceItem (dari Webhook)
     * @param string|null $staffId
     */
    public function dispatchPostPaymentHooks(TenantInvoice $invoice, iterable $items, ?string $staffId): void
    {
        foreach ($items as $item) {
            // Standarisasi agar support format Array maupun Object
            $itemType = is_array($item) ? $item['item_type'] : $item->item_type;
            $itemId   = is_array($item) ? $item['item_id']   : $item->item_id;
            $quantity = is_array($item) ? $item['quantity']  : $item->quantity;

            match ($itemType) {
                Product::class        => $this->handleProductSold($itemId, $quantity, $invoice, $staffId),
                MembershipPlan::class => $this->handleMembershipSold($itemId, $invoice),
                PtSessionPlan::class  => $this->handlePtPackageSold($itemId, $invoice),
                default               => Log::warning("[POSPayment] Unknown item type: {$itemType}")
            };
        }
    }

    // -------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------

    private function handleProductSold(string $productId, int $quantity, TenantInvoice $invoice, ?string $staffId): void
    {
        $product = Product::find($productId);
        if (!$product) return;

        $qtyBefore = $product->stock;
        $qtyAfter  = $qtyBefore - $quantity;

        // Kurangi stok
        $product->decrement('stock', $quantity);

        // Catat di Stock Movement
        StockMovement::create([
            'product_id'     => $product->id,
            'branch_id'      => $invoice->branch_id,
            'type'           => 'sale',
            'qty_before'     => $qtyBefore,
            'qty_change'     => -$quantity,
            'qty_after'      => $qtyAfter,
            'reference_id'   => $invoice->id,
            'reference_type' => TenantInvoice::class,
            'created_by'     => $staffId, 
        ]);
    }

    private function handleMembershipSold(string $planId, TenantInvoice $invoice): void
    {
        $plan = MembershipPlan::find($planId);
        if (!$plan || !$invoice->member_id) return;

        $startDate = now();
        // Asumsi kamu menggunakan duration_days di tabel membership_plans
        $endDate = $plan->duration_days ? $startDate->copy()->addDays($plan->duration_days) : null;

        // Matikan paket lama jika ada (Auto Upgrade)
        Membership::where('member_id', $invoice->member_id)
            ->whereIn('status', ['active', 'pending', 'trial'])
            ->update([
                'status' => 'cancelled',
                'notes'  => 'Dibatalkan otomatis karena pembelian paket membership baru via Kasir (POS).'
            ]);

        // Buat Membership baru
        Membership::create([
            'member_id'               => $invoice->member_id,
            'membership_plan_id'      => $plan->id,
            'branch_id'               => $invoice->branch_id,
            'last_transaction_id'     => $invoice->id,
            'start_date'              => $startDate->toDateString(),
            'end_date'                => $endDate ? $endDate->toDateString() : null,
            'status'                  => 'active',
            'unlimited_checkin'       => $plan->unlimited_checkin ?? true,
            'remaining_checkin_quota' => $plan->checkin_quota ?? null,
        ]);

        // Pastikan status akun member aktif
        Member::where('id', $invoice->member_id)->update(['status' => 'active']);
    }

    private function handlePtPackageSold(string $planId, TenantInvoice $invoice): void
    {
        $plan = PtSessionPlan::find($planId);
        if (!$plan || !$invoice->member_id) return;

        PtPackage::create([
            'member_id'          => $invoice->member_id,
            'pt_session_plan_id' => $plan->id,
            'tenant_invoice_id'  => $invoice->id,
            'branch_id'          => $invoice->branch_id,
            // Deteksi penamaan field sesuai tabel kamu (total_sessions atau sessions)
            'total_sessions'     => $plan->total_sessions ?? $plan->sessions ?? 0,
            'used_sessions'      => 0,
            'status'             => 'active',
            'purchased_at'       => now()->toDateString(),
            'activated_at'       => now()->toDateString(), // Langsung aktif saat lunas
        ]);
    }
}