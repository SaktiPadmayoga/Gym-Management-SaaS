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

/**
 * @property string|null $home_branch_id
 */
class Member extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, SoftDeletes, Notifiable;

    protected $connection = 'tenant';
    protected $table = 'members';

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
        'qr_token',
        'status',
        'is_active',
        'last_checkin_at',
        'last_login_at',
        'member_since',
        'password', 
        'remember_token',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
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
        return $this->hasOne(Membership::class)
            ->where('status', 'active')
            ->orderByDesc('created_at');
    }

    public function ptPackages(): HasMany
    {
        return $this->hasMany(PtPackage::class);
    }

    public function ptSessions(): HasMany
    {
        return $this->hasMany(PtSession::class);
    }

}