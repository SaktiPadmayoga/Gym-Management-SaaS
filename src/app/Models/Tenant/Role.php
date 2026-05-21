<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'display_name', 'description', 'is_active'];

    // =============================================
    // Relationships
    // =============================================

    /**
     * The permissions that belong to this role (many-to-many via role_permissions pivot).
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions');
    }

    // =============================================
    // Helpers
    // =============================================

    /**
     * Return flat array of permission names: ['members.view', 'pos.manage', ...]
     */
    public function permissionList(): array
    {
        return $this->permissions()->pluck('name')->toArray();
    }

    /**
     * Return array of permission UUIDs.
     */
    public function permissionIds(): array
    {
        return $this->permissions()->pluck('permissions.id')->toArray();
    }

    /**
     * Check if this role has a specific permission by name.
     */
    public function hasPermission(string $permissionName): bool
    {
        return $this->permissions()->where('name', $permissionName)->exists();
    }

    /**
     * Get the current access level for a resource group.
     * Returns 'manage', 'view', or 'none'.
     */
    public function getAccessLevel(string $group): string
    {
        $perms = $this->permissions()->where('group', $group)->pluck('action')->toArray();

        if (in_array('manage', $perms)) return 'manage';
        if (in_array('view', $perms))   return 'view';
        return 'none';
    }
}