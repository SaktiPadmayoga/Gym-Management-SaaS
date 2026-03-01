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
        // ==========================================
        // CORE USER MANAGEMENT
        // ==========================================

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['owner', 'admin', 'trainer', 'receptionist', 'member'])->default('member');
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['email', 'is_active']);
        });


        Schema::create('staff', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            
            $table->string('name'); // Denormalized for quick access
            $table->string('phone')->nullable();
            $table->enum('staff_type', ['trainer', 'receptionist', 'admin', 'manager', 'maintenance'])->default('trainer');
            
            // Employment Info
            $table->date('join_date');
            $table->date('end_date')->nullable();
            $table->decimal('base_salary', 12, 2)->nullable();
            $table->enum('payment_type', ['monthly', 'hourly', 'commission'])->default('monthly');
            
            // Trainer Specific
            $table->json('specializations')->nullable(); // ["Yoga", "Pilates", "HIIT"]
            $table->json('certifications')->nullable();
            $table->text('bio')->nullable();
            $table->string('photo')->nullable();
            
            // Commission Settings (for sales staff)
            $table->decimal('commission_rate', 5, 2)->default(0); // Percentage
            
            $table->enum('status', ['active', 'inactive', 'resigned', 'terminated'])->default('active');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['staff_type', 'status']);
        });

        Schema::create('additional_fees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2);
            $table->enum('fee_type', ['registration', 'insurance', 'card', 'locker', 'other'])->default('other');
            $table->boolean('is_mandatory')->default(false);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
        });


        

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // ==========================================
        // MEMBER PROFILES (Pisah dari Users untuk flexibility)
        // ==========================================
        
        Schema::create('member_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained()->onDelete('set null'); // Bisa null jika walk-in customer
            
            // Personal Info
            $table->string('name');
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('birth_date')->nullable();
            $table->string('identity_number')->nullable()->unique(); // KTP/ID Card
            $table->string('phone', 20);
            $table->string('email')->nullable(); // Email bisa berbeda dari user email
            $table->string('photo_profile')->nullable();
            $table->text('address')->nullable();
            
            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            
            // Health Info (Important for gym safety)
            $table->text('medical_conditions')->nullable();
            $table->text('allergies')->nullable();
            $table->string('blood_type')->nullable();
            
            // Member Status
            $table->enum('status', ['active', 'inactive', 'suspended', 'banned'])->default('active');
            $table->date('join_date');
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['phone', 'status']);
            $table->index('join_date');
        });

        // ==========================================
        // MEMBERSHIP PLANS (Package/Pricing)
        // ==========================================
        
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
            $table->enum('access_type', ['all_club', 'single_club'])->default('single_club');
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

        // ==========================================
        // MEMBERSHIPS (Active membership instances)
        // ==========================================
        
        Schema::create('memberships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_profile_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('membership_plan_id')->constrained()->onDelete('restrict');
            $table->foreignUuid('additional_fee_id')->nullable()->constrained('additional_fees')->onDelete('set null');
            
            // Transaction Info
            $table->date('join_date');
            $table->date('start_date'); // Bisa beda dengan join_date (defer start)
            $table->date('end_date');
            $table->decimal('original_price', 12, 2);
            $table->decimal('final_price', 12, 2); // After discount
            
            // Discount
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            
            // Bonus
            $table->integer('extra_duration_days')->default(0);
            $table->integer('extra_membership_session')->default(0);
            
            // Sales Info
            $table->foreignUuid('referral_sales_id')->nullable()->constrained('staff')->onDelete('set null');
            $table->string('sales_type')->nullable(); // Direct, Referral, Online, etc
            
            // Usage Tracking
            $table->integer('used_checkin_count')->default(0); // Track usage
            $table->integer('used_class_count')->default(0);
            $table->timestamp('last_checkin_at')->nullable();
            
            // Status
            $table->enum('status', ['active', 'inactive', 'expired', 'suspended', 'cancelled'])->default('active');
            $table->text('notes')->nullable();
            
            // Auto-renewal (untuk subscription model)
            $table->boolean('auto_renew')->default(false);
            $table->date('renewal_date')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['member_profile_id', 'status']);
            $table->index(['start_date', 'end_date']);
            $table->index('status');
        });

        // ==========================================
        // CLASS PLANS (Class packages)
        // ==========================================
        
        Schema::create('class_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->integer('max_visitor');
            $table->integer('minutes_per_session');
            $table->enum('access_type', ['all_club', 'single_club'])->default('single_club');
            
            // Session Settings
            $table->boolean('unlimited_monthly_session')->default(false);
            $table->boolean('unlimited_daily_session')->default(false);
            $table->integer('monthly_quota')->nullable();
            $table->integer('daily_quota')->nullable();
            
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
        });

        // ==========================================
        // CLASS SCHEDULES
        // ==========================================
        
        Schema::create('class_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('class_plan_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('instructor_id')->constrained('staff')->onDelete('restrict');
            
            $table->date('date');
            $table->time('start_at');
            $table->time('end_at'); // Calculated from start_at + minutes_per_session
            
            $table->enum('class_type', ['membership_only', 'public', 'private'])->default('public');
            $table->enum('access', ['public', 'private', 'member_only'])->default('public');
            
            // Capacity
            $table->integer('max_capacity'); // From class_plan
            $table->integer('current_capacity')->default(0);
            $table->integer('total_manual_checkin')->default(0); // Walk-in without booking
            
            $table->text('note')->nullable();
            $table->enum('status', ['scheduled', 'cancelled', 'completed', 'ongoing'])->default('scheduled');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['date', 'status']);
            $table->index(['instructor_id', 'date']);
        });

        // ==========================================
        // CLASS REGISTRATIONS (Bookings)
        // ==========================================
        
        Schema::create('class_registrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_profile_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('class_schedule_id')->constrained()->onDelete('cascade');
            
            $table->timestamp('registered_at');
            $table->enum('status', ['registered', 'cancelled', 'attended', 'no_show'])->default('registered');
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            $table->timestamps();
            
            $table->unique(['member_profile_id', 'class_schedule_id']);
            $table->index(['class_schedule_id', 'status']);
        });

        // ==========================================
        // PT SESSION PLANS
        // ==========================================
        
        Schema::create('pt_session_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category');
            
            // Pricing
            $table->decimal('price', 12, 2);
            $table->integer('duration');
            $table->enum('duration_unit', ['day', 'week', 'month', 'year']);
            
            // Session Info
            $table->integer('minutes_per_session');
            $table->integer('total_sessions')->default(1); // Total session dalam 1 paket
            $table->integer('loyalty_point')->default(0);
            
            // Availability Settings
            $table->boolean('unlimited_sold')->default(true);
            $table->integer('quota')->nullable();
            $table->integer('sold_count')->default(0);
            
            $table->boolean('always_available')->default(true);
            $table->date('available_from')->nullable();
            $table->date('available_until')->nullable();
            
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
        });

        // ==========================================
        // PT SESSIONS (Active PT packages)
        // ==========================================
        
        Schema::create('pt_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pt_session_plan_id')->constrained()->onDelete('restrict');
            $table->foreignUuid('member_profile_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('pt_id')->constrained('staff')->onDelete('restrict');
            $table->foreignUuid('additional_fee_id')->nullable()->constrained('additional_fees')->onDelete('set null');
            
            // Transaction Info
            $table->date('join_date');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('original_price', 12, 2);
            $table->decimal('final_price', 12, 2);
            
            // Discount
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            
            // Bonus
            $table->integer('extra_duration_days')->default(0);
            $table->integer('extra_session')->default(0);
            
            // Sales Info
            $table->foreignUuid('referral_sales_id')->nullable()->constrained('staff')->onDelete('set null');
            $table->string('sales_type')->nullable();
            
            // Session Tracking
            $table->integer('total_sessions'); // From plan + extra
            $table->integer('used_sessions')->default(0);
            $table->integer('remaining_sessions')->default(0);
            
            $table->enum('status', ['active', 'expired', 'suspended', 'completed'])->default('active');
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['member_profile_id', 'status']);
            $table->index(['pt_id', 'status']);
        });

        // ==========================================
        // PT SESSION SCHEDULES (Individual sessions)
        // ==========================================
        
        Schema::create('pt_session_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pt_session_id')->constrained()->onDelete('cascade');
            
            $table->date('date');
            $table->time('start_at');
            $table->time('end_at');
            
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'no_show'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->text('trainer_notes')->nullable(); // Notes from PT about the session
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['pt_session_id', 'date']);
        });

        // ==========================================
        // FACILITIES
        // ==========================================
        
        Schema::create('facilities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('class_type', ['public', 'private'])->default('public');
            
            $table->decimal('price', 12, 2)->default(0); // Per session
            $table->integer('minutes_per_session');
            
            $table->time('operational_hour_from');
            $table->time('operational_hour_until');
            
            $table->integer('capacity')->default(1); // Max people per session
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
        });

        // ==========================================
        // FACILITY BOOKINGS
        // ==========================================
        
        Schema::create('facility_bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('facility_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('member_profile_id')->constrained()->onDelete('cascade');
            
            $table->date('booking_date');
            $table->time('start_at');
            $table->time('end_at');
            
            $table->decimal('price', 12, 2);
            $table->enum('status', ['confirmed', 'cancelled', 'completed', 'no_show'])->default('confirmed');
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['facility_id', 'booking_date']);
        });

        // ==========================================
        // PRODUCTS (Inventory/Shop)
        // ==========================================
        
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('sku')->unique()->nullable();
            $table->string('category');
            $table->text('description')->nullable();
            
            // Pricing
            $table->decimal('selling_price', 12, 2);
            $table->decimal('cost_price', 12, 2);
            
            // Inventory
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0); // Alert threshold
            $table->string('unit')->default('pcs'); // pcs, box, bottle, etc
            
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['category', 'is_active']);
            $table->index('stock');
        });

        // ==========================================
        // EQUIPMENT
        // ==========================================
        
        Schema::create('equipment', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('category')->nullable(); // Cardio, Strength, etc
            $table->integer('quantity')->default(1);
            $table->string('location')->nullable();
            $table->enum('condition', ['excellent', 'good', 'fair', 'needs_repair', 'broken'])->default('good');
            
            // Maintenance
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 12, 2)->nullable();
            $table->date('last_maintenance')->nullable();
            $table->date('next_maintenance')->nullable();
            $table->text('maintenance_notes')->nullable();
            
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('condition');
        });

     

        // ==========================================
        // ATTENDANCE (Member check-in/out)
        // ==========================================
        
        Schema::create('attendance', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_profile_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('membership_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignUuid('class_schedule_id')->nullable()->constrained()->onDelete('set null');
            
            $table->dateTime('check_in_time');
            $table->dateTime('check_out_time')->nullable();
            $table->integer('duration_minutes')->nullable(); // Auto-calculated
            
            $table->enum('type', ['membership', 'class', 'trial', 'day_pass'])->default('membership');
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            $table->index(['member_profile_id', 'check_in_time']);
            $table->index('check_in_time');
        });

        // ==========================================
        // PAYMENTS & INVOICES
        // ==========================================
        
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number')->unique();
            $table->foreignUuid('member_profile_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('staff_id')->nullable()->constrained()->onDelete('set null'); // Cashier
            
            // Item details (polymorphic)
            $table->uuid('item_id')->nullable(); // membership_id, pt_session_id, product_id, etc
            $table->string('item_type')->nullable(); // Membership, PTSession, Product, etc
            
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            
            // Amounts
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('remaining_amount', 12, 2)->default(0);
            
            $table->enum('status', ['draft', 'pending', 'paid', 'partial', 'overdue', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['member_profile_id', 'status']);
            $table->index(['invoice_date', 'status']);
            $table->index(['item_id', 'item_type']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('member_profile_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('staff_id')->nullable()->constrained()->onDelete('set null');
            
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['cash', 'debit_card', 'credit_card', 'bank_transfer', 'e_wallet', 'qris'])->default('cash');
            $table->string('reference_number')->nullable();
            
            $table->dateTime('paid_at');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('completed');
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['invoice_id', 'status']);
            $table->index('paid_at');
        });

        // ==========================================
        // ADDITIONAL FEES (Insurance, Registration, etc)
        // ==========================================
        
        
        // ==========================================
        // LOYALTY POINTS
        // ==========================================
        
        Schema::create('loyalty_points', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_profile_id')->constrained()->onDelete('cascade');
            
            $table->integer('points');
            $table->enum('type', ['earned', 'redeemed', 'expired', 'adjusted'])->default('earned');
            $table->string('source')->nullable(); // Membership, PT Session, Referral, etc
            $table->uuid('source_id')->nullable();
            $table->text('description')->nullable();
            $table->date('expires_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['member_profile_id', 'type']);
        });

        // ==========================================
        // NOTIFICATIONS (For member reminders)
        // ==========================================
        
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_profile_id')->constrained()->onDelete('cascade');
            
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['membership_expiry', 'class_reminder', 'payment_due', 'promotion', 'system'])->default('system');
            $table->json('data')->nullable(); // Extra metadata
            
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['member_profile_id', 'is_read']);
        });

        // ==========================================
        // ACTIVITY LOGS (Audit trail)
        // ==========================================
        
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained()->onDelete('set null');
            
            $table->string('action'); // created, updated, deleted, etc
            $table->string('model'); // Membership, Payment, etc
            $table->uuid('model_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamps();
            
            $table->index(['model', 'model_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('loyalty_points');
        Schema::dropIfExists('additional_fees');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('attendance');
        Schema::dropIfExists('staff');
        Schema::dropIfExists('equipment');
        Schema::dropIfExists('products');
        Schema::dropIfExists('facility_bookings');
        Schema::dropIfExists('facilities');
        Schema::dropIfExists('pt_session_schedules');
        Schema::dropIfExists('pt_sessions');
        Schema::dropIfExists('pt_session_plans');
        Schema::dropIfExists('class_registrations');
        Schema::dropIfExists('class_schedules');
        Schema::dropIfExists('class_plans');
        Schema::dropIfExists('memberships');
        Schema::dropIfExists('membership_plans');
        Schema::dropIfExists('member_profiles');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};