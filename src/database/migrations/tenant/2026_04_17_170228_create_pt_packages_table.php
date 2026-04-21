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
        Schema::create('pt_packages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('member_id');
            $table->uuid('pt_session_plan_id');
            $table->uuid('tenant_invoice_id')->nullable(); // Link ke pembayaran
            $table->uuid('branch_id'); // Cabang tempat paket dibeli/berlaku
            
            // Quota Tracking
            $table->integer('total_sessions'); // Diambil dari plan saat beli
            $table->integer('used_sessions')->default(0); // Bertambah saat sesi 'completed'
            
            // Status & Validity
            $table->enum('status', ['pending', 'active', 'completed', 'expired', 'cancelled'])->default('pending');
            $table->date('purchased_at');
            $table->date('activated_at')->nullable();
            $table->date('expired_at')->nullable(); // Dihitung dari duration_unit di plan
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['member_id', 'status']);
            $table->foreign('member_id')->references('id')->on('members');
            $table->foreign('pt_session_plan_id')->references('id')->on('pt_session_plans');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pt_packages');
    }
};
