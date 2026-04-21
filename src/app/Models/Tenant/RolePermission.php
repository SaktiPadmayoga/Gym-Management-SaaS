<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    use HasUuids;

    protected $fillable = ['role_id', 'permission'];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
}