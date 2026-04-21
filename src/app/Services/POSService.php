<?php

namespace App\Services;

use App\Models\Tenant\TenantInvoice;
use App\Models\Tenant\TenantInvoiceItem;
use App\Models\Tenant\TenantPayment;
use App\Models\Tenant\Product;
use App\Models\Tenant\MembershipPlan;
use App\Models\Tenant\PtSessionPlan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class POSService
{
    /**
     * Main checkout entry point.
     * $payload shape:
     * [
     *   'branch_id'    => uuid,
     *   'member_id'    => uuid|null,
     *   'guest_name'   => string|null,
     *   'guest_phone'  => string|null,
     *   'guest_email'  => string|null,
     *   'created_by'   => uuid,
     *   'items'        => [
     *      ['type' => 'product',    'id' => uuid, 'quantity' => int],
     *      ['type' => 'membership', 'id' => uuid, 'quantity' => 1],
     *      ['type' => 'pt_package', 'id' => uuid, 'quantity' => 1],
     *   ],
     *   'payment_method'  => string,
     *   'amount_paid'     => float,
     *   'discount_amount' => float,
     *   'notes'           => string|null,
     * ]
     */
    public function __construct(
        protected MidtransService $midtrans
    ) {}

    public function checkout(array $payload): array
    {
        $isCash = $payload['payment_method'] === 'cash';

        return DB::transaction(function () use ($payload, $isCash) {
            $resolvedItems = $this->resolveItems($payload['items']);

            $needsMember = collect($resolvedItems)->whereIn('item_type', [
                MembershipPlan::class, PtSessionPlan::class,
            ])->isNotEmpty();

            throw_if($needsMember && is_null($payload['member_id'] ?? null), \Exception::class, 'Membership and PT Package require a registered member.');

            $subtotal = collect($resolvedItems)->sum('total_price');
            $discount = $payload['discount_amount'] ?? 0;
            $tax      = round(($subtotal - $discount) * 0.10, 2);
            $total    = $subtotal - $discount + $tax;

            $invoice = TenantInvoice::create([
                'tenant_id'      => tenant('id'),
                'branch_id'      => $payload['branch_id'],
                'member_id'      => $payload['member_id'] ?? null,
                'guest_name'     => $payload['guest_name'] ?? null,
                'guest_phone'    => $payload['guest_phone'] ?? null,
                'guest_email'    => $payload['guest_email'] ?? null,
                'created_by'     => $payload['created_by'],
                'invoice_number' => $this->generateInvoiceNumber(),
                'subtotal'       => $subtotal,
                'tax'            => $tax,
                'total_amount'   => $total,
                'currency'       => 'IDR',
                'payment_gateway'=> $isCash ? 'manual' : 'midtrans',
                'payment_method' => $payload['payment_method'],
                'status'         => $isCash ? 'paid' : 'pending',
                'issued_at'      => now(),
                'paid_at'        => $isCash ? now() : null,
            ]);

            foreach ($resolvedItems as $item) {
                TenantInvoiceItem::create([
                    'tenant_invoice_id' => $invoice->id,
                    'item_type'         => $item['item_type'],
                    'item_id'           => $item['item_id'],
                    'item_name'         => $item['item_name'],
                    'quantity'          => $item['quantity'],
                    'unit_price'        => $item['unit_price'],
                    'total_price'       => $item['total_price'],
                ]);
            }
            
            $invoice->update(['external_reference' => $invoice->invoice_number]);

            // Jika CASH: Eksekusi perubahan stok/paket langsung
            if ($isCash) {
                TenantPayment::create([
                    'tenant_invoice_id' => $invoice->id,
                    'provider'          => 'manual',
                    'payment_type'      => 'cash',
                    'order_id'          => $invoice->invoice_number,
                    'gross_amount'      => $payload['amount_paid'],
                    'status'            => 'success',
                    'paid_at'           => now(),
                ]);

                // Kita taruh logika hook bawaanmu di file terpisah khusus Post Payment
                app(POSPaymentService::class)->dispatchPostPaymentHooks($invoice, $resolvedItems, $payload['created_by']);

                return ['invoice' => $invoice->load('items', 'payments'), 'snap_token' => null];
            }

            // Jika MIDTRANS: Kembalikan Token untuk Frontend (Hooks ditahan sampai webhook sukses)
            // Note: Karena POS bisa tidak pakai member_id (guest), siapkan mock object
            // KODE BARU YANG BENAR:
            $mockMember = $invoice->member ?? new \App\Models\Tenant\Member([
                'name'  => $invoice->guest_name ?? 'Walk-In Customer',
                'email' => $invoice->guest_email ?? 'guest@example.com',
                'phone' => $invoice->guest_phone ?? '000',
            ]);

            $snapToken = $this->midtrans->getSnapToken(
                orderId: $invoice->invoice_number,
                grossAmount: (int) $total,
                member: $mockMember,
                plan: (object)['id' => 'POS', 'name' => 'POS Transaction']
            );

            return ['invoice' => $invoice->load('items'), 'snap_token' => $snapToken];
        });
    }

    // -------------------------------------------------------
    // Resolve each cart item → normalized shape with pricing
    // -------------------------------------------------------
    private function resolveItems(array $items): array
    {
        $resolved = [];

        foreach ($items as $item) {
            $resolved[] = match ($item['type']) {
                'product'    => $this->resolveProduct($item),
                'membership' => $this->resolveMembership($item),
                'pt_package' => $this->resolvePtPackage($item),
                default      => throw new \InvalidArgumentException("Unknown item type: {$item['type']}"),
            };
        }

        return $resolved;
    }

    private function resolveProduct(array $item): array
    {
        $product = Product::findOrFail($item['id']);

        throw_if(
            $product->stock < $item['quantity'],
            \Exception::class,
            "Insufficient stock for: {$product->name}"
        );

        return [
            'item_type'  => Product::class,
            'item_id'    => $product->id,
            'item_name'  => $product->name,
            'quantity'   => $item['quantity'],
            'unit_price' => $product->selling_price,
            'total_price'=> $product->selling_price * $item['quantity'],
        ];
    }

    private function resolveMembership(array $item): array
    {
        $plan = MembershipPlan::findOrFail($item['id']);

        return [
            'item_type'  => MembershipPlan::class,
            'item_id'    => $plan->id,
            'item_name'  => $plan->name,
            'quantity'   => 1,
            'unit_price' => $plan->price,
            'total_price'=> $plan->price,
        ];
    }

    private function resolvePtPackage(array $item): array
    {
        $plan = PtSessionPlan::findOrFail($item['id']);

        return [
            'item_type'  => PtSessionPlan::class,
            'item_id'    => $plan->id,
            'item_name'  => $plan->name,
            'quantity'   => 1,
            'unit_price' => $plan->price,
            'total_price'=> $plan->price,
        ];
    }

    // -------------------------------------------------------
    // Post-payment hooks — satu handler per item type
    // -------------------------------------------------------
    private function dispatchPostPaymentHooks(
        TenantInvoice $invoice,
        array $resolvedItems,
        array $payload
    ): void {
        foreach ($resolvedItems as $item) {
            match ($item['item_type']) {
                Product::class        => $this->handleProductSold($item, $invoice, $payload),
                MembershipPlan::class => $this->handleMembershipSold($item, $invoice, $payload),
                PtSessionPlan::class  => $this->handlePtPackageSold($item, $invoice, $payload),
            };
        }
    }

    private function handleProductSold(array $item, TenantInvoice $invoice, array $payload): void
    {
        $product = Product::find($item['item_id']);

        $qtyBefore = $product->stock;
        $qtyAfter  = $qtyBefore - $item['quantity'];

        $product->decrement('stock', $item['quantity']);

        \App\Models\Tenant\StockMovement::create([
            'product_id'     => $product->id,
            'branch_id'      => $invoice->branch_id,
            'type'           => 'sale',
            'qty_before'     => $qtyBefore,
            'qty_change'     => -$item['quantity'],
            'qty_after'      => $qtyAfter,
            'reference_id'   => $invoice->id,
            'reference_type' => TenantInvoice::class,
            'created_by'     => $payload['created_by'],
        ]);
    }

    private function handleMembershipSold(array $item, TenantInvoice $invoice, array $payload): void
    {
        $plan = MembershipPlan::find($item['item_id']);

        $startDate = now()->toDateString();
        $endDate   = match ($plan->duration_unit) {
            'day'   => now()->addDays($plan->duration)->toDateString(),
            'week'  => now()->addWeeks($plan->duration)->toDateString(),
            'month' => now()->addMonths($plan->duration)->toDateString(),
            'year'  => now()->addYears($plan->duration)->toDateString(),
        };

        \App\Models\Tenant\Membership::create([
            'member_id'          => $invoice->member_id,
            'membership_plan_id' => $plan->id,
            'branch_id'          => $invoice->branch_id,
            'last_transaction_id'=> $invoice->id,
            'start_date'         => $startDate,
            'end_date'           => $endDate,
            'status'             => 'active',
            'unlimited_checkin'  => $plan->unlimited_checkin,
            'remaining_checkin_quota' => $plan->checkin_quota_per_month,
        ]);
    }

    private function handlePtPackageSold(array $item, TenantInvoice $invoice, array $payload): void
    {
        $plan = PtSessionPlan::find($item['item_id']);

        \App\Models\Tenant\PtPackage::create([
            'member_id'         => $invoice->member_id,
            'pt_session_plan_id'=> $plan->id,
            'tenant_invoice_id' => $invoice->id,
            'branch_id'         => $invoice->branch_id,
            'total_sessions'    => $plan->total_sessions,
            'used_sessions'     => 0,
            'status'            => 'active',
            'purchased_at'      => now()->toDateString(),
            'activated_at'      => now()->toDateString(),
        ]);
    }

    private function generateInvoiceNumber(): string
    {
        $date   = now()->format('Ymd');
        $random = strtoupper(Str::random(6));
        return "INV-POS-{$date}-{$random}";
    }
}