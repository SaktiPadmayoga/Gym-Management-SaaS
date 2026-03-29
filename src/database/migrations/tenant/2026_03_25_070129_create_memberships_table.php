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
        Schema::create('memberships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // ==========================================
            // RELASI UTAMA (Murni, tanpa tenant_id)
            // ==========================================
            $table->uuid('member_id');
            $table->uuid('membership_plan_id');
            
            // Cabang tempat transaksi/pembelian terjadi (Untuk Laporan Omzet)
            $table->uuid('home_branch_id')->nullable(); 
            
            // ID Transaksi untuk nyambung ke Invoice/Midtrans
            $table->string('last_transaction_id')->nullable();

            // ==========================================
            // MASA BERLAKU & STATUS
            // ==========================================
            $table->date('start_date');
            $table->date('end_date')->nullable(); // Boleh null jika paketnya "Lifetime"
            $table->string('status')->default('active'); // active, expired, frozen, cancelled

            // ==========================================
            // KUOTA CHECK-IN
            // ==========================================
            $table->boolean('unlimited_checkin')->default(false);
            $table->integer('remaining_checkin_quota')->nullable();
            $table->integer('total_checkins')->default(0);

            // ==========================================
            // SISTEM CUTI (FREEZE)
            // ==========================================
            $table->date('frozen_at')->nullable();
            $table->date('frozen_until')->nullable();
            $table->integer('freeze_days_used')->default(0);

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes(); // Wajib agar history pendapatan tidak hilang kalau paket dihapus

            // ==========================================
            // FOREIGN KEYS
            // ==========================================
            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
            $table->foreign('_membership_plan_id')->references('id')->on('membership_plans')->onDelete('cascade');
            // Jika cabang tutup/dihapus, riwayat transaksi tetap ada, tapi branch_id jadi null
            $table->foreign('home_branch_id')->references('id')->on('branches')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};