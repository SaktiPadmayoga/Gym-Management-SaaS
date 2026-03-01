<?php

namespace Database\Seeders\Tenant;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TenantDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Get current tenant from tenancy context
        $tenant = tenancy()->tenant;
        
        // Create admin
        $admin = User::create([
            'name' => 'Admin ' . $tenant->name,
            'email' => 'admin@' . $tenant->id . '.local',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Create trainer
        $trainer = User::create([
            'name' => 'Trainer ' . $tenant->name,
            'email' => 'trainer@' . $tenant->id . '.local',
            'password' => Hash::make('password'),
            'role' => 'trainer',
            'is_active' => true,
        ]);

        // Create 5 members
        for ($i = 1; $i <= 5; $i++) {
            $user = User::create([
                'name' => 'Member ' . $i . ' - ' . $tenant->name,
                'email' => 'member' . $i . '@' . $tenant->id . '.local',
                'password' => Hash::make('password'),
                'role' => 'member',
                'is_active' => true,
            ]);
        }

        echo "✅ Seeded tenant: " . $tenant->name . "\n";
    }
}
