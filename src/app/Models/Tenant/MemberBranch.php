<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class MemberBranch extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'member_branches';

    protected $fillable = [
        'member_id',
        'branch_id',
        'status',
        'plan_id',
        'last_transaction_id',
        'started_at',
        'expires_at',
        'frozen_at',
        'frozen_until',
        'freeze_days_used',
        'member_code',
        'notes',
        'is_primary',
        'joined_at',
        'last_checkin_at',
    ];

    protected $casts = [
        'is_primary'       => 'boolean',
        'started_at'       => 'date',
        'expires_at'       => 'date',
        'frozen_at'        => 'date',
        'frozen_until'     => 'date',
        'joined_at'        => 'datetime',
        'last_checkin_at'  => 'datetime',
        'freeze_days_used' => 'integer',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    // =============================================
    // Helpers
    // =============================================

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isFrozen(): bool
    {
        return $this->status === 'frozen';
    }

    public function daysUntilExpiry(): ?int
    {
        return $this->expires_at
            ? now()->diffInDays($this->expires_at, false)
            : null;
    }

    // =============================================
    // Scopes
    // =============================================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpiringSoon($query, int $days = 7)
    {
        return $query->where('status', 'active')
            ->whereBetween('expires_at', [now(), now()->addDays($days)]);
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
            ->orWhere(fn($q) => $q->where('status', 'active')->where('expires_at', '<', now()));
    }
}