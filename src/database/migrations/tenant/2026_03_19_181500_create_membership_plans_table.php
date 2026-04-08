<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('branch_id')->nullable(); // null = berlaku semua branch


            $table->enum('access_type', ['single_branch', 'cross_branch'])->default('single_branch');

            $table->enum('approval_status', ['draft', 'pending', 'approved', 'rejected'])->default('approved');

            // Identity
            $table->string('name');
            $table->string('category');
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->integer('sort_order')->default(0);

            // Pricing
            $table->decimal('price', 12, 2);
            $table->string('currency')->default('IDR');
            $table->integer('duration');
            $table->enum('duration_unit', ['day', 'week', 'month', 'year']);

            // Benefits
            $table->integer('loyalty_points_reward')->default(0);
            $table->integer('max_sharing_members')->default(0);

            // Class access → dikelola via pivot membership_plan_class_plan
            // Sehingga bisa assign class plan mana saja yang boleh diakses

            // Check-in Quota (gym floor)
            $table->boolean('unlimited_checkin')->default(false);
            $table->integer('checkin_quota_per_month')->nullable();

            // Availability — stok
            $table->boolean('unlimited_sold')->default(true);
            $table->integer('total_quota')->nullable();

            // Availability — periode penjualan
            $table->boolean('always_available')->default(true);
            $table->date('available_from')->nullable();
            $table->date('available_until')->nullable();

            $table->json('checkin_schedule')->nullable();

            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('branch_id')
                ->references('id')
                ->after('id')
                ->on('branches')
                ->nullOnDelete();

            $table->index(['is_active', 'category']);
            $table->index(['branch_id', 'is_active']);
            $table->index(['access_type', 'is_active']);
            $table->index(['approval_status', 'is_active']);

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_plans');
    }
};