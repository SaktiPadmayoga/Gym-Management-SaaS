<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TenantInvoice extends Model
{
    use HasUuids;

     protected $fillable = [
        'tenant_id', 'member_id', 'branch_id',
        'invoice_number', 'external_reference',
        'subtotal', 'tax', 'total_amount', 'currency',
        'payment_gateway', 'payment_method', 'transaction_id',
        'status', 'issued_at', 'due_date', 'paid_at',
        'gateway_response', 'notes',
        'guest_name', 'guest_phone', 'guest_email',
        'created_by',
    ];

    protected $casts = [
        'subtotal'         => 'decimal:2',
        'tax'              => 'decimal:2',
        'total_amount'     => 'decimal:2',
        'gateway_response' => 'array',
        'issued_at'        => 'datetime',
        'due_date'         => 'datetime',
        'paid_at'          => 'datetime',
    ];

    // =========================================================================
    // Relations
    // =========================================================================

    // File: App/Models/Tenant/TenantInvoice.php

    public function classAttendance()
    {
        // Pastikan foreign key-nya sesuai dengan kolom di tabel class_attendances
        return $this->hasOne(ClassAttendance::class, 'tenant_invoice_id', 'id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Branch::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(TenantInvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(TenantPayment::class);
    }

    public function membership(): HasOne
    {
        return $this->hasOne(Membership::class);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function markAsPaid(\DateTime $paidAt = null): void
    {
        $this->update([
            'status'  => 'paid',
            'paid_at' => $paidAt ?? now(),
        ]);
    }

    // =========================================================================
    // Static Helpers
    // =========================================================================

    /**
     * Generate invoice number unik.
     * Format: INV-MEM-YYYYMMDD-XXXXX
     */
    public static function generateInvoiceNumber(string $prefix = 'MEM'): string
    {
        do {
            $number = 'INV-' . $prefix . '-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5));
        } while (self::where('invoice_number', $number)->exists());

        return $number;
    }

      public function isForGuest(): bool
    {
        return is_null($this->member_id);
    }

    public function customerName(): string
    {
        return $this->member?->name ?? $this->guest_name ?? 'Walk-in';
    }
}