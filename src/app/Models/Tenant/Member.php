<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Member extends Authenticatable
{
    use HasFactory, HasUuids, Notifiable, SoftDeletes;

    protected $table = 'members';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'emergency_contact',
        'gender',
        'date_of_birth',
        'avatar',
        'address',
        'id_card_number',
        'password',
        'status',
        'is_active',
        'last_checkin_at',
        'last_login_at',
        'member_since',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active'          => 'boolean',
        'date_of_birth'      => 'date',
        'member_since'       => 'date',
        'email_verified_at'  => 'datetime',
        'last_checkin_at'    => 'datetime',
        'last_login_at'      => 'datetime',
        'password'           => 'hashed',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function memberBranches()
    {
        return $this->hasMany(MemberBranch::class, 'member_id');
    }

    public function branches()
    {
        return $this->belongsToMany(\App\Models\Branch::class, 'member_branches', 'member_id', 'branch_id')
            ->withPivot(['status', 'plan_id', 'started_at', 'expires_at', 'member_code', 'is_primary', 'joined_at'])
            ->withTimestamps();
    }

    public function primaryBranch()
    {
        return $this->hasOne(MemberBranch::class, 'member_id')->where('is_primary', true);
    }

    // =============================================
    // Helpers
    // =============================================

    public function isActiveInBranch(string $branchId): bool
    {
        return $this->memberBranches()
            ->where('branch_id', $branchId)
            ->where('status', 'active')
            ->exists();
    }

    public function getMembershipInBranch(string $branchId): ?MemberBranch
    {
        return $this->memberBranches()
            ->where('branch_id', $branchId)
            ->first();
    }

    public function getAge(): ?int
    {
        return $this->date_of_birth
            ? $this->date_of_birth->age
            : null;
    }
}