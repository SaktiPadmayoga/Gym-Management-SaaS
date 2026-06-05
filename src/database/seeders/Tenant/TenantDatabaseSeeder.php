<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Seeder;
use Database\Seeders\RolePermissionSeeder;

class TenantDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);
    }
}
