<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff_branches', function (Blueprint $table) {
            $table->renameColumn('staffs_id', 'staff_id');
        });
    }

    public function down(): void
    {
        Schema::table('staff_branches', function (Blueprint $table) {
            $table->renameColumn('staff_id', 'staffs_id');
        });
    }
};
