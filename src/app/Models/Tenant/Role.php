<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'display_name', 'description', 'is_active'];

    public function permissions(): HasMany
    {
        return $this->hasMany(RolePermission::class);
    }

    public function permissionList(): array
    {
        return $this->permissions()->pluck('permission')->toArray();
    }
}