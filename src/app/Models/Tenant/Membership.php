<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Membership extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'memberships';

    // Bersih dari tenant_id!
    protected $fillable = [
        'member_id',
        'plan_id',
        'branch_id',
        'last_transaction_id',
        'start_date',
        'end_date',
        'status',
        'unlimited_checkin',
        'remaining_checkin_quota',
        'total_checkins',
        'frozen_at',
        'frozen_until',
        'freeze_days_used',
        'notes',
    ];

    protected $casts = [
        'start_date'              => 'date',
        'end_date'                => 'date',
        'frozen_at'               => 'date',
        'frozen_until'            => 'date',
        'unlimited_checkin'       => 'boolean',
        'remaining_checkin_quota' => 'integer',
        'total_checkins'          => 'integer',
        'freeze_days_used'        => 'integer',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function plan()
    {
        return $this->belongsTo(MembershipPlan::class, 'plan_id');
    }

    /**
     * Cabang tempat pendaftaran / pembelian paket ini.
     */
    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    // =============================================
    // Helpers
    // =============================================

    public function isExpired(): bool
    {
        return $this->end_date && Carbon::parse($this->end_date)->isPast();
    }

    public function isFrozen(): bool
    {
        return $this->status === 'frozen';
    }

    public function daysUntilExpiry(): ?int
    {
        return $this->end_date
            ? now()->diffInDays(Carbon::parse($this->end_date), false)
            : null;
    }

    public function hasCheckinQuota(): bool
    {
        if ($this->unlimited_checkin) return true;
        return $this->remaining_checkin_quota > 0;
    }

    // =============================================
    // Scopes (Sangat berguna untuk fitur Dashboard/Cronjob)
    // =============================================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Cari paket yang akan expired dalam X hari.
     * Cocok untuk sistem notifikasi/email perpanjangan.
     */
    public function scopeExpiringSoon($query, int $days = 7)
    {
        return $query->where('status', 'active')
            ->whereNotNull('end_date')
            ->whereBetween('end_date', [now()->toDateString(), now()->addDays($days)->toDateString()]);
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
            ->orWhere(function ($q) {
                $q->where('status', 'active')
                  ->whereNotNull('end_date')
                  ->where('end_date', '<', now()->toDateString());
            });
    }
}