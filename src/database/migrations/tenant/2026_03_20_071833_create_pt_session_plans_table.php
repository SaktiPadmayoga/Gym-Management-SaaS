<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pt_session_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();

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

            // Session Info
            $table->integer('minutes_per_session');
            $table->integer('total_sessions')->default(1); // total sesi dalam 1 paket
            $table->integer('loyalty_points_reward')->default(0);

            // Branch Access
            $table->uuid('branch_id')->nullable(); // null = berlaku semua branch

            // Availability — stok
            $table->boolean('unlimited_sold')->default(true);
            $table->integer('total_quota')->nullable(); // sold_count dihitung real-time

            // Availability — periode penjualan
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
        Schema::dropIfExists('pt_session_plans');
    }
};