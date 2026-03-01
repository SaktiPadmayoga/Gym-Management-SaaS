<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PtSession extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'pt_session_plan_id', 'member_profile_id', 'pt_id', 'additional_fee_id',
        'join_date', 'start_date', 'end_date',
        'original_price', 'final_price', 'discount_amount', 'discount_percent',
        'extra_duration_days', 'extra_session',
        'referral_sales_id', 'sales_type',
        'total_sessions', 'used_sessions', 'remaining_sessions',
        'status', 'notes'
    ];

    protected $casts = [
        'join_date' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
        'original_price' => 'decimal:2',
        'final_price' => 'decimal:2',
    ];

    public function ptSessionPlan()
    {
        return $this->belongsTo(PtSessionPlan::class);
    }

    public function memberProfile()
    {
        return $this->belongsTo(MemberProfile::class);
    }

    public function trainer()
    {
        return $this->belongsTo(Staff::class, 'pt_id');
    }

    public function schedules()
    {
        return $this->hasMany(PtSessionSchedule::class);
    }
}