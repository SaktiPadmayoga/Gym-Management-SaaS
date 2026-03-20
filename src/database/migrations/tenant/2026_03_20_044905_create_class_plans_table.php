<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('class_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Identity
            $table->string('name');
            $table->string('category')->nullable(); // Yoga, Zumba, HIIT, dll
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->integer('sort_order')->default(0);

            // Pricing — opsional, bisa 0 jika sudah include di membership
            $table->decimal('price', 12, 2)->default(0);
            $table->string('currency')->default('IDR');

            // Capacity & Duration
            $table->integer('max_capacity');          // max peserta per sesi
            $table->integer('minutes_per_session');   // durasi sesi dalam menit

            // Branch Access — konsisten dengan membership_plans
            $table->uuid('branch_id')->nullable();    // null = berlaku semua branch
            $table->enum('access_type', ['all_branches', 'single_branch'])->default('single_branch');

            // Session Quota per member
            $table->boolean('unlimited_monthly_session')->default(false);
            $table->integer('monthly_quota')->nullable();  // berapa kali per bulan

            $table->boolean('unlimited_daily_session')->default(false);
            $table->integer('daily_quota')->nullable();    // berapa kali per hari

            // Availability
            $table->boolean('always_available')->default(true);
            $table->date('available_from')->nullable();
            $table->date('available_until')->nullable();

            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'category']);
            $table->index(['branch_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_plans');
    }
};