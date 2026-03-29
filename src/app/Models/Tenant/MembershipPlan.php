<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Branch;
use App\Models\Tenant;

class MembershipPlan extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'branch_id',
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
        'access_type',
        'approval_status',
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
        'price' => 'decimal:2',
        'checkin_schedule' => 'array', 
        'available_from' => 'date',
        'available_until' => 'date',
        'is_active' => 'boolean',
        'unlimited_checkin' => 'boolean',
        'unlimited_sold' => 'boolean',
        'always_available' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Cabang yang MEMBUAT plan ini
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    // Cabang yang DIIZINKAN diakses oleh plan ini (Tabel Pivot)
    public function accessibleBranches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class, 'plan_branch_access', 'plan_id', 'branch_id')
                    ->withTimestamps();
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class, 'plan_id');
    }

    public function classPlans()
    {
        return $this->belongsToMany(
            ClassPlan::class,
            'membership_plan_class_plan',
            'class_plan_id',
            'membership_plan_id'
        )->withPivot([
            'unlimited_session',
            'monthly_quota_override',
            'daily_quota_override',
        ])->withTimestamps();
    }

    // ====================================================
    // LOCAL SCOPES
    // ====================================================

    /**
     * Filter plan yang berhak dilihat/dijual oleh sebuah cabang.
     * Logika baru:
     * 1. Cabang bisa melihat Plan buatannya sendiri (branch_id = $branchId).
     * 2. Cabang bisa melihat Plan dari cabang lain JIKA access_type = 'cross_branch', 
     * statusnya 'approved', DAN cabang tersebut ada di tabel pivot plan_branch_access.
     */
    public function scopeForBranch($query, $branchId)
    {
        return $query->where(function ($q) use ($branchId) {
            // Kondisi 1: Milik cabang ini sendiri
            $q->where('branch_id', $branchId)
              // Kondisi 2: Milik cabang lain tapi cross-branch dan diizinkan
              ->orWhere(function ($subQ) use ($branchId) {
                  $subQ->where('access_type', 'cross_branch')
                       ->where('approval_status', 'approved')
                       ->whereHas('accessibleBranches', function ($pivotQ) use ($branchId) {
                           // Memastikan branch ini ada di tabel pivot
                           $pivotQ->where('plan_branch_access.branch_id', $branchId);
                       });
              });
        });
    }
}