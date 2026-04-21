<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Tenant\Role;
use App\Models\Tenant\RolePermission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'branch_manager' => [
                'display_name' => 'Branch Manager',
                'description'  => 'Manages all operations within a branch',
                'permissions'  => [
                    'pos', 'members', 'check_ins', 'bookings',
                    'pt_sessions', 'schedules', 'staff',
                    'reports', 'settings', 'memberships', 'master_data',
                ],
            ],
            'cashier' => [
                'display_name' => 'Cashier',
                'description'  => 'Handles POS transactions',
                'permissions'  => ['pos'],
            ],
            'receptionist' => [
                'display_name' => 'Receptionist',
                'description'  => 'Handles member check-ins and bookings',
                'permissions'  => ['members', 'check_ins', 'bookings', 'memberships', 'schedules'],
            ],
            'trainer' => [
                'display_name' => 'Trainer',
                'description'  => 'Manages PT sessions and class schedules',
                'permissions'  => ['pt_sessions', 'schedules'],
            ],
        ];

        // foreach ($roles as $name => $data) {
        //     $role = Role::updateOrCreate(
        //         ['name' => $name],
        //         [
        //             'id'           => Str::uuid(),
        //             'display_name' => $data['display_name'],
        //             'description'  => $data['description'],
        //             'is_active'    => true,
        //         ]
        //     );

        //     foreach ($data['permissions'] as $permission) {
        //         RolePermission::updateOrCreate(
        //             ['role_id' => $role->id, 'permission' => $permission],
        //         );
        //     }
        // }
    }
}