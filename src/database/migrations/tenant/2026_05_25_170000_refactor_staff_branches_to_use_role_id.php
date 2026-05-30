<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        // 1. Tambah kolom role_id (nullable dulu untuk transisi data)
        Schema::table('staff_branches', function (Blueprint $table) {
            $table->uuid('role_id')->nullable()->after('branch_id');
        });

        // 2. Data Migration: Petakan role (string) lama ke roles.id
        $staffBranches = DB::table('staff_branches')->get();
        $roles = DB::table('roles')->get();

        foreach ($staffBranches as $sb) {
            $oldRoleName = $sb->role; // e.g. "receptionist"

            // Cari matching role by name
            $matchingRole = $roles->firstWhere('name', $oldRoleName);

            // Jika tidak ditemukan, fallback ke role receptionist (atau role pertama yang tersedia)
            if (!$matchingRole) {
                $matchingRole = $roles->firstWhere('name', 'receptionist') ?? $roles->first();
            }

            if ($matchingRole) {
                DB::table('staff_branches')
                    ->where('id', $sb->id)
                    ->update(['role_id' => $matchingRole->id]);
            }
        }

        // 3. Drop kolom role lama
        Schema::table('staff_branches', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        // 4. Ubah role_id menjadi NOT NULL dan tambahkan Foreign Key
        Schema::table('staff_branches', function (Blueprint $table) {
            $table->uuid('role_id')->nullable(false)->change();
            $table->foreign('role_id')
                ->references('id')
                ->on('roles')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        // Kebalikan: hapus FK, tambahkan kembali kolom role string, petakan ID ke string name, drop role_id
        Schema::table('staff_branches', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->string('role')->default('receptionist')->after('branch_id');
        });

        $staffBranches = DB::table('staff_branches')
            ->join('roles', 'staff_branches.role_id', '=', 'roles.id')
            ->select('staff_branches.id', 'roles.name as role_name')
            ->get();

        foreach ($staffBranches as $sb) {
            DB::table('staff_branches')
                ->where('id', $sb->id)
                ->update(['role' => $sb->role_name]);
        }

        Schema::table('staff_branches', function (Blueprint $table) {
            $table->dropColumn('role_id');
        });
    }
};
