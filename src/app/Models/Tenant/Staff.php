<?php

namespace App\Models\Tenant;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Staff extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable, SoftDeletes;

    protected $table = 'staffs';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'role',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active'          => 'boolean',
        'email_verified_at'  => 'datetime',
        'last_login_at'      => 'datetime',
        'password'           => 'hashed',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function staffBranches()
    {
        return $this->hasMany(StaffBranch::class, 'staff_id');
    }

    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'staff_branches', 'staff_id', 'branch_id')
            ->withPivot(['role', 'is_active', 'joined_at'])
            ->withTimestamps()
            ->wherePivot('is_active', true);
    }

    // =============================================
    // Helpers
    // =============================================

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Cek apakah staff punya akses ke branch tertentu
     */
    public function hasAccessToBranch(string $branchId): bool
    {
        if ($this->isOwner()) return true;

        return $this->staffBranches()
            ->where('branch_id', $branchId)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Ambil role staff di branch tertentu
     */
    public function getRoleInBranch(string $branchId): ?string
    {
        if ($this->isOwner()) return 'owner';

        $pivot = $this->staffBranches()
            ->where('branch_id', $branchId)
            ->where('is_active', true)
            ->first();

        return $pivot?->role;
    }
}