<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Branch;
use App\Models\Tenant;

class Member extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, SoftDeletes, Notifiable;

    protected $fillable = [
        'home_branch_id',
        'name',
        'email',
        'phone',
        'emergency_contact',
        'gender',
        'date_of_birth',
        'avatar',
        'address',
        'id_card_number',
        'status',
        'is_active',
        'last_checkin_at',
        'last_login_at',
        'member_since',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'last_checkin_at' => 'datetime',
        'last_login_at' => 'datetime',
        'member_since' => 'date',
        'is_active' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function homeBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'home_branch_id');
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    // Helper untuk mengambil membership yang sedang aktif saat ini
    public function activeMembership()
    {
        return $this->hasOne(Membership::class)->where('status', 'active');
    }
}