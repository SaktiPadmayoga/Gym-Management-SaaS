<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Invoice extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'invoice_number', 'member_profile_id', 'staff_id',
        'item_id', 'item_type',
        'invoice_date', 'due_date',
        'subtotal', 'discount_amount', 'tax_amount', 'total_amount',
        'paid_amount', 'remaining_amount',
        'status', 'notes'
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
    ];

    public function memberProfile()
    {
        return $this->belongsTo(MemberProfile::class);
    }

    public function cashier()
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Polymorphic relation to Membership, PtSession, Product, etc.
    public function item()
    {
        return $this->morphTo();
    }
}