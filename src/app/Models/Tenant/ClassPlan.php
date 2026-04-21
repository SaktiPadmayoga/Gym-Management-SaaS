<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class ClassPlan extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'class_plans';

    protected $fillable = [
        'name',
        'category',
        'description',
        'color',
        'sort_order',
        'price',
        'currency',
        'max_capacity',
        'minutes_per_session',
        'branch_id',
        'access_type',
        'unlimited_monthly_session',
        'monthly_quota',
        'unlimited_daily_session',
        'daily_quota',
        'always_available',
        'available_from',
        'available_until',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'price'                     => 'decimal:2',
        'unlimited_monthly_session' => 'boolean',
        'unlimited_daily_session'   => 'boolean',
        'always_available'          => 'boolean',
        'is_active'                 => 'boolean',
        'available_from'            => 'date',
        'available_until'           => 'date',
        'max_capacity'              => 'integer',
        'minutes_per_session'       => 'integer',
        'monthly_quota'             => 'integer',
        'daily_quota'               => 'integer',
        'sort_order'                => 'integer',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    /**
     * Membership plans yang menginclude class plan ini
     */
    public function membershipPlans()
    {
        return $this->belongsToMany(
            MembershipPlan::class,
            'membership_plan_class_plan',
            'class_plan_id',
            'membership_plan_id'
        )->withPivot([
            'unlimited_session',
            'monthly_quota_override',
            'daily_quota_override',
        ])->withTimestamps();
    }

    // =============================================
    // Scopes
    // =============================================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->where('always_available', true)
                  ->orWhere(function ($q2) {
                      $q2->where('available_from', '<=', now())
                         ->where('available_until', '>=', now());
                  });
            });
    }

    public function scopeForBranch($query, string $branchId)
    {
        return $query->where(function ($q) use ($branchId) {
            $q->whereNull('branch_id')
              ->orWhere('branch_id', $branchId);
        });
    }

    // =============================================
    // Helpers
    // =============================================

    public function isAvailable(): bool
    {
        if (!$this->is_active) return false;
        if ($this->always_available) return true;
        return $this->available_from <= now() && $this->available_until >= now();
    }

    public function getDurationLabelAttribute(): string
    {
        return $this->minutes_per_session . ' min';
    }

    public function requiresPayment(): bool
    {
        return $this->price > 0;
    }
}