<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {

            $table->foreign('branch_id')
                  ->references('id')
                  ->on('branches')
                  ->cascadeOnDelete();

            $table->dropColumn('access_type');
        });

        Schema::table('membership_plans', function (Blueprint $table) {
            $table->enum('access_type', ['single_branch', 'cross_branch'])
                  ->default('single_branch')
                  ->after('branch_id');

            $table->enum('approval_status', ['draft', 'pending', 'approved', 'rejected'])
                  ->default('approved')
                  ->after('access_type');
                  
            $table->index(['branch_id']);
            $table->index(['approval_status', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {
            // FIX: Hapus dropForeign untuk tenant_id
            $table->dropForeign(['branch_id']);
            $table->dropIndex(['tenant_id', 'branch_id']);
            $table->dropIndex(['approval_status', 'is_active']);
            
            $table->dropColumn(['tenant_id', 'approval_status']);
            $table->dropColumn('access_type');
        });

        Schema::table('membership_plans', function (Blueprint $table) {
            $table->enum('access_type', ['all_branches', 'single_branch'])->default('single_branch');
        });
    }
};