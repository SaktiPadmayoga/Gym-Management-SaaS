<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('memberships', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi Member & Paket
            $table->foreignUuid('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignUuid('plan_id')->constrained('membership_plans')->cascadeOnDelete();

            $table->uuid('branch_id')->nullable();
            
            // Periode Aktif
            $table->date('start_date');
            $table->date('end_date');
            
            // Kuota Operasional
            $table->boolean('unlimited_checkin')->default(false);
            $table->integer('remaining_checkin_quota')->nullable(); 
            $table->integer('total_checkins')->default(0); 

            // Status
            $table->enum('status', [
                'active', 
                'expired', 
                'cancelled', 
                'frozen'
            ])->default('active');

            $table->date('frozen_until')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            // Index untuk kecepatan validasi scan barcode
            $table->index(['member_id', 'status', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};