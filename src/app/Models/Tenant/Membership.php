<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Membership extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'member_profile_id', 'membership_plan_id', 'additional_fee_id',
        'join_date', 'start_date', 'end_date',
        'original_price', 'final_price', 'discount_amount', 'discount_percent',
        'extra_duration_days', 'extra_membership_session',
        'referral_sales_id', 'sales_type',
        'used_checkin_count', 'used_class_count', 'last_checkin_at',
        'status', 'notes', 'auto_renew', 'renewal_date'
    ];

    protected $casts = [
        'join_date' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
        'renewal_date' => 'date',
        'last_checkin_at' => 'datetime',
        'original_price' => 'decimal:2',
        'final_price' => 'decimal:2',
        'auto_renew' => 'boolean',
    ];

    public function memberProfile()
    {
        return $this->belongsTo(MemberProfile::class);
    }

    public function membershipPlan()
    {
        return $this->belongsTo(MembershipPlan::class);
    }

    public function salesStaff()
    {
        return $this->belongsTo(Staff::class, 'referral_sales_id');
    }
}