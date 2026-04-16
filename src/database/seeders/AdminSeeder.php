<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Cek dulu apakah admin dengan email ini sudah ada (agar tidak duplicate)
        if (Admin::where('email', 'sakti14yoga@gmail.com')->exists()) {
            $this->command->info('Super Admin sudah ada, skip pembuatan.');
            return;
        }

        Admin::create([
            'name'     => 'Sakti Yoga',
            'email'    => 'sakti14yoga@gmail.com',
            'password' => Hash::make('password'),   // Password default: password
            'role'     => 'super_admin',
        ]);

        $this->command->info('Super Admin berhasil dibuat: sakti14yoga@gmail.com');
    }
}