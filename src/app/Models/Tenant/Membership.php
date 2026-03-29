<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Membership extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'member_id',
        'plan_id',
        'branch_id', // Tambahkan ini
        'start_date',
        'end_date',
        'unlimited_checkin',
        'remaining_checkin_quota',
        'total_checkins',
        'status',
        'frozen_until',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'frozen_until' => 'date',
        'unlimited_checkin' => 'boolean',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class, 'plan_id');
    }
}