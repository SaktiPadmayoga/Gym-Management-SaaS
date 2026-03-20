<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class MembershipPlan extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'membership_plans';

    protected $fillable = [
        'name',
        'category',
        'description',
        'color',
        'sort_order',
        'price',
        'currency',
        'duration',
        'duration_unit',
        'loyalty_points_reward',
        'max_sharing_members',
        'branch_id',
        'access_type',
        'unlimited_checkin',
        'checkin_quota_per_month',
        'unlimited_sold',
        'total_quota',
        'always_available',
        'available_from',
        'available_until',
        'checkin_schedule',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'price'                   => 'decimal:2',
        'unlimited_checkin'       => 'boolean',
        'unlimited_sold'          => 'boolean',
        'always_available'        => 'boolean',
        'is_active'               => 'boolean',
        'available_from'          => 'date',
        'available_until'         => 'date',
        'checkin_schedule'        => 'array',
        'duration'                => 'integer',
        'sort_order'              => 'integer',
        'loyalty_points_reward'   => 'integer',
        'max_sharing_members'     => 'integer',
        'checkin_quota_per_month' => 'integer',
        'total_quota'             => 'integer',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    public function memberBranches()
    {
        return $this->hasMany(MemberBranch::class, 'plan_id');
    }

    /**
     * Class plans yang termasuk dalam membership ini
     * via pivot membership_plan_inclusions
     */
    public function classPlans()
    {
        return $this->belongsToMany(
            ClassPlan::class,
            'membership_plan_class_plan',
            'membership_plan_id',
            'class_plan_id'
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

    public function hasStock(): bool
    {
        if ($this->unlimited_sold || is_null($this->total_quota)) return true;
        return $this->sold_count < $this->total_quota;
    }

    public function getSoldCountAttribute(): int
    {
        return $this->memberBranches()
            ->whereNotIn('status', ['cancelled'])
            ->count();
    }

    public function getRemainingQuotaAttribute(): ?int
    {
        if ($this->unlimited_sold || is_null($this->total_quota)) return null;
        return max(0, $this->total_quota - $this->sold_count);
    }

    public function calculateExpiryDate(?\DateTime $startDate = null): \Carbon\Carbon
    {
        $start = $startDate ? \Carbon\Carbon::instance($startDate) : now();

        return match ($this->duration_unit) {
            'day'   => $start->addDays($this->duration),
            'week'  => $start->addWeeks($this->duration),
            'month' => $start->addMonths($this->duration),
            'year'  => $start->addYears($this->duration),
            default => $start->addMonths($this->duration),
        };
    }
}