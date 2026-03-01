<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenant_user_branches', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_user_id');
            $table->uuid('branch_id');

            $table->enum('role', ['branch_manager', 'cashier', 'admin'])->default('admin');
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->foreign('tenant_user_id')->references('id')->on('tenant_users')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->cascadeOnDelete();

            $table->unique(['tenant_user_id', 'branch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_user_branches');
    }
};
