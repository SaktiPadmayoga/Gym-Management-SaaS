<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('facility_bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('facility_id');
            $table->uuid('member_id');
            $table->uuid('branch_id')->nullable(); 
            
            // Waktu Booking
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time'); // Akan dihitung otomatis (start_time + minutes_per_session)

            // Status
            $table->enum('status', ['booked', 'completed', 'cancelled', 'no_show'])->default('booked');
            $table->enum('payment_status', ['free', 'pending', 'paid', 'expired', 'failed'])->default('free');
            
            // Relasi ke Invoice (Jika berbayar)
            $table->uuid('tenant_invoice_id')->nullable();
            
            $table->uuid('booked_by')->nullable(); // ID Staff jika dipesan via kasir
            $table->text('notes')->nullable();
            $table->string('cancelled_reason')->nullable();

            $table->timestamps();

            // Foreign Keys
            $table->foreign('facility_id')->references('id')->on('facilities')->cascadeOnDelete();
            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            
            // Indexing agar query pengecekan jadwal bentrok sangat cepat
            $table->index(['facility_id', 'date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_bookings');
    }
};