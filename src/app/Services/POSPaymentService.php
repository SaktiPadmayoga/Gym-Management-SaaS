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
use App\Models\Tenant\TenantNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str; // <-- 1. JANGAN LUPA IMPORT INI

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
        });
    }

    /**
     * Distributor logika berdasarkan tipe item.
     */
    public function dispatchPostPaymentHooks(TenantInvoice $invoice, iterable $items, ?string $staffId): void
    {
        foreach ($items as $item) {
            // BE SMART: Deteksi key dari Frontend ('type'/'id') ATAU dari Webhook ('item_type'/'item_id')
            $itemType = is_array($item) ? ($item['item_type'] ?? $item['type']) : $item->item_type;
            $itemId   = is_array($item) ? ($item['item_id'] ?? $item['id']) : $item->item_id;
            $quantity = is_array($item) ? $item['quantity'] : $item->quantity;

            // BE SMART: Cocokkan Namespace Laravel ATAU string simpel dari Frontend
            match ($itemType) {
                Product::class, 'product'               => $this->handleProductSold($itemId, $quantity, $invoice, $staffId),
                MembershipPlan::class, 'membership'     => $this->handleMembershipSold($itemId, $invoice, $staffId),
                PtSessionPlan::class, 'pt_package', 'pt_session' => $this->handlePtPackageSold($itemId, $invoice),
                default                                 => Log::warning("[POSPayment] Unknown item type: {$itemType}")
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

        $product->decrement('stock', $quantity);

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

        TenantNotification::create([
            'id'        => (string) Str::uuid(),
            'branch_id' => $invoice->branch_id,
            'staff_id'  => $staffId,
            'type'      => 'pos_transaction',
            'title'     => 'Produk Terjual!',
            'message'   => "Produk {$product->name} berhasil terjual.",
            'is_read'   => false,
        ]);
    }

    // 3. TANGKAP PARAMETER $staffId DI SINI
    private function handleMembershipSold(string $planId, TenantInvoice $invoice, ?string $staffId): void
    {
        $plan = MembershipPlan::find($planId);
        if (!$plan || !$invoice->member_id) return;

        // 4. CARI DATA MEMBER AGAR NAMANYA BISA DIAMBIL UNTUK NOTIFIKASI
        $member = Member::find($invoice->member_id);
        if (!$member) return;

        $startDate = now();
        $endDate = $plan->duration_days ? $startDate->copy()->addDays($plan->duration_days) : null;

        Membership::where('member_id', $invoice->member_id)
            ->whereIn('status', ['active', 'pending', 'trial'])
            ->update([
                'status' => 'cancelled',
                'notes'  => 'Dibatalkan otomatis karena pembelian paket membership baru via Kasir (POS).'
            ]);

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

        // 5. PERBAIKAN PAYLOAD NOTIFIKASI
        TenantNotification::create([
            'id'        => (string) Str::uuid(),
            'branch_id' => $invoice->branch_id, // Gunakan branch_id dari invoice, lebih pasti
            'staff_id'  => $staffId, // Staff ID bisa null jika diproses oleh webhook murni
            'type'      => 'pos_transaction', // Lebih cocok pos_transaction karena ini dari invoice
            'title'     => 'Paket Membership Terjual!',
            'message'   => "{$member->name} baru saja membeli/memperpanjang paket {$plan->name}.",
            'is_read'   => false,
        ]);

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
            'total_sessions'     => $plan->total_sessions ?? $plan->sessions ?? 0,
            'used_sessions'      => 0,
            'status'             => 'active',
            'purchased_at'       => now()->toDateString(),
            'activated_at'       => now()->toDateString(), 
        ]);
    }
}