<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantPayment extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_invoice_id',
        'provider',
        'payment_type',
        'transaction_id',
        'order_id',
        'gross_amount',
        'status',
        'raw_response',
        'paid_at',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'raw_response' => 'array',
        'paid_at'      => 'datetime',
    ];

    // =========================================================================
    // Relations
    // =========================================================================

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(TenantInvoice::class, 'tenant_invoice_id');
    }
}