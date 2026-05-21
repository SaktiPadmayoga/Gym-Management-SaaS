<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant\Permission;
use App\Models\Tenant\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Master permission definitions: group => [action => display_name]
     */
    private function getPermissionDefinitions(): array
    {
        return [
            'pos'         => ['view' => 'View POS',              'manage' => 'Manage POS'],
            'members'     => ['view' => 'View Members',          'manage' => 'Manage Members'],
            'check_ins'   => ['view' => 'View Check-ins',        'manage' => 'Manage Check-ins'],
            'bookings'    => ['view' => 'View Bookings',         'manage' => 'Manage Bookings'],
            'pt_sessions' => ['view' => 'View PT Sessions',      'manage' => 'Manage PT Sessions'],
            'schedules'   => ['view' => 'View Schedules',        'manage' => 'Manage Schedules'],
            'staff'       => ['view' => 'View Staff',            'manage' => 'Manage Staff'],
            'reports'     => ['view' => 'View Reports'],
            'settings'    => ['view' => 'View Settings',         'manage' => 'Manage Settings'],
            'memberships' => ['view' => 'View Memberships',      'manage' => 'Manage Memberships'],
            'master_data' => ['view' => 'View Master Data',      'manage' => 'Manage Master Data'],
        ];
    }

    public function run(): void
    {
        // 1. Seed master permissions (upsert by name)
        $sortOrder = 0;
        foreach ($this->getPermissionDefinitions() as $group => $actions) {
            foreach ($actions as $action => $displayName) {
                Permission::updateOrCreate(
                    ['name' => "{$group}.{$action}"],
                    [
                        'group'        => $group,
                        'display_name' => $displayName,
                        'action'       => $action,
                        'sort_order'   => $sortOrder++,
                    ]
                );
            }
        }

        // 2. Seed default roles with permissions
        $rolesConfig = [
            'branch_manager' => [
                'display_name' => 'Branch Manager',
                'description'  => 'Manages all operations within a branch',
                'permissions'  => [
                    'pos.view', 'pos.manage',
                    'members.view', 'members.manage',
                    'check_ins.view', 'check_ins.manage',
                    'bookings.view', 'bookings.manage',
                    'pt_sessions.view', 'pt_sessions.manage',
                    'schedules.view', 'schedules.manage',
                    'staff.view', 'staff.manage',
                    'reports.view',
                    'settings.view', 'settings.manage',
                    'memberships.view', 'memberships.manage',
                    'master_data.view', 'master_data.manage',
                ],
            ],
            'cashier' => [
                'display_name' => 'Cashier',
                'description'  => 'Handles POS transactions',
                'permissions'  => [
                    'pos.view', 'pos.manage',
                    'members.view',
                ],
            ],
            'receptionist' => [
                'display_name' => 'Receptionist',
                'description'  => 'Handles member check-ins and bookings',
                'permissions'  => [
                    'members.view',
                    'check_ins.view', 'check_ins.manage',
                    'bookings.view', 'bookings.manage',
                    'memberships.view',
                    'schedules.view',
                ],
            ],
            'trainer' => [
                'display_name' => 'Trainer',
                'description'  => 'Manages PT sessions and class schedules',
                'permissions'  => [
                    'pt_sessions.view', 'pt_sessions.manage',
                    'schedules.view',
                    'members.view',
                ],
            ],
        ];

        foreach ($rolesConfig as $name => $data) {
            $role = Role::updateOrCreate(
                ['name' => $name],
                [
                    'display_name' => $data['display_name'],
                    'description'  => $data['description'],
                    'is_active'    => true,
                ]
            );

            // Get permission IDs for the listed permission names
            $permissionIds = Permission::whereIn('name', $data['permissions'])
                ->pluck('id')
                ->toArray();

            // Sync permissions (detach all, attach fresh)
            $role->permissions()->sync($permissionIds);
        }
    }
}