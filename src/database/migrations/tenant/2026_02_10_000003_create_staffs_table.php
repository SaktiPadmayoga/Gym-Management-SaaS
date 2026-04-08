<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('staffs', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('branch_id')->nullable();

            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->text('avatar')->nullable();

            // Role global — hanya untuk identifikasi level tertinggi
            // Permission detail ditentukan di staff_branches per branch
            $table->enum('role', ['owner', 'staff'])->default('staff');

            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamp('last_login_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();

            $table->index(['email', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staffs');
    }
};