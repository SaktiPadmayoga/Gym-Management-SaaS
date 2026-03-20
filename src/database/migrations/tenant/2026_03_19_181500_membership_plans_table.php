<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
         Schema::create('membership_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('category'); // Basic, Premium, VIP, etc (dynamic)
            $table->text('description')->nullable();
            
            // Pricing
            $table->decimal('price', 12, 2);
            $table->integer('duration'); // Numeric value
            $table->enum('duration_unit', ['day', 'week', 'month', 'year']);
            
            // Benefits
            $table->integer('loyalty_point')->default(0);
            $table->integer('max_sharing_access')->default(0); // Family/couple membership
            
            // Check-in Settings
            $table->enum('access_type', ['all_branches', 'single_branch'])->default('single_branch');
            $table->enum('class_access_type', [
                'all_classes', 
                'premium_class_only', 
                'regular_class_only', 
                'no_access_to_all_classes'
            ])->default('all_classes');
            
            $table->boolean('unlimited_checkin_membership')->default(false);
            $table->boolean('unlimited_checkin_class')->default(false);
            $table->integer('membership_quota')->nullable(); // Monthly check-in quota
            $table->integer('class_quota')->nullable(); // Monthly class quota
            
            // Availability Settings
            $table->boolean('unlimited_sold')->default(true);
            $table->integer('quota')->nullable(); // Total quota untuk plan ini
            $table->integer('sold_count')->default(0); // Track berapa sudah terjual
            
            $table->boolean('always_available')->default(true);
            $table->date('available_from')->nullable();
            $table->date('available_until')->nullable();
            
            // Check-in Schedule (JSON untuk flexibility)
            $table->json('checkin_schedule')->nullable(); // Store weekly schedule
            
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['is_active', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_plans');
    }
};


