<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TenantInvoiceItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_invoice_id',
        'item_type',
        'item_id',
        'item_name',
        'quantity',
        'unit_price',
        'total_price',
    ];

    protected $casts = [
        'unit_price'  => 'decimal:2',
        'total_price' => 'decimal:2',
        'quantity'    => 'integer',
    ];

    // =========================================================================
    // Relations
    // =========================================================================

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(TenantInvoice::class, 'tenant_invoice_id');
    }

    /**
     * Polymorphic — bisa MembershipPlan, Product, Booking, dsb.
     */
    public function item(): MorphTo
    {
        return $this->morphTo();
    }
}