<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Invoice extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $connection = 'central';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'subscription_id',

        'invoice_number',
        'external_reference', // midtrans order_id
        'transaction_id',     // midtrans transaction_id

        'amount',
        'currency',

        'payment_gateway',
        'payment_method',

        'status',

        'issued_at',
        'due_date',
        'paid_at',

        'description',
        'items',
        'gateway_response',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'issued_at' => 'datetime',
        'due_date' => 'datetime',
        'paid_at' => 'datetime',

        'items' => 'array',
        'gateway_response' => 'array',
    ];

    // ================= RELATIONS =================

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // ================= HELPERS =================

    public static function generateInvoiceNumber()
    {
        $date = now()->format('Ymd');
        $count = static::whereDate('created_at', now())->count() + 1;

        return "INV-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    public function markAsPaid(array $gatewayResponse = [])
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'gateway_response' => $gatewayResponse,
        ]);
    }
}