<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('staff_branches', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('staff_branches', function (Blueprint $table) {
            $table->string('role')->default('receptionist')->after('branch_id');
        });
    }

    public function down(): void
    {
        Schema::table('staff_branches', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('staff_branches', function (Blueprint $table) {
            $table->enum('role', ['branch_manager', 'trainer', 'receptionist', 'cashier'])
                  ->default('receptionist')
                  ->after('branch_id');
        });
    }
};