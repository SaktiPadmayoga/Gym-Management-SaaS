<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

class Permission extends Model
{
    use HasUuids;

    protected $fillable = [
        'group',
        'name',
        'display_name',
        'action',
        'description',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }

    // =============================================
    // Scopes
    // =============================================

    public function scopeByGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    // =============================================
    // Static Helpers
    // =============================================

    /**
     * Return all permissions grouped by 'group' field.
     */
    public static function grouped(): Collection
    {
        return static::orderBy('sort_order')->get()->groupBy('group');
    }

    /**
     * Get group labels for display.
     */
    public static function groupLabels(): array
    {
        return [
            'pos'         => 'Point of Sale',
            'members'     => 'Members Management',
            'check_ins'   => 'Check-ins',
            'bookings'    => 'Bookings',
            'pt_sessions' => 'PT Sessions',
            'schedules'   => 'Schedules',
            'staff'       => 'Staff Management',
            'reports'     => 'Reports',
            'settings'    => 'Settings',
            'memberships' => 'Memberships',
            'master_data' => 'Master Data',
        ];
    }
}
