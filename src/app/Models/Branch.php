<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'branches';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'branch_code',
        'name',
        'address',
        'city',
        'phone',
        'email',
        'timezone',
        'is_active',
        'opened_at',
        'data',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'opened_at' => 'datetime',
        'data' => 'array',
    ];

    public function users()
    {
        return $this->belongsToMany(
            TenantUser::class,
            'tenant_user_branches',
            'branch_id',
            'tenant_user_id'
        )->withPivot(['role', 'is_active'])->withTimestamps();
    }

    public function domains()
    {
        return $this->hasMany(Domain::class, 'branch_id');
    }
}
