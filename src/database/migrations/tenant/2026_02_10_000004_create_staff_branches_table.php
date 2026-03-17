<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('staff_branches', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('staffs_id');
            $table->uuid('branch_id');

            // Role spesifik per branch — berbeda dengan role global di tabel staff
            $table->enum('role', ['branch_manager', 'trainer', 'receptionist', 'cashier'])->default('receptionist');

            $table->boolean('is_active')->default(true);
            $table->timestamp('joined_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('staffs_id')->references('id')->on('staffs')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->cascadeOnDelete();

            $table->unique(['staffs_id', 'branch_id']);
            $table->index(['branch_id', 'is_active']); // query staff per branch
            $table->index(['staffs_id', 'is_active']);  // query branch per staff
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_branches');
    }
};