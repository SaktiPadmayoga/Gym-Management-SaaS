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
        Schema::create('pt_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pt_package_id'); // Harus punya paket aktif untuk buat jadwal
            $table->uuid('member_id'); // Denormalisasi agar query lebih cepat
            $table->uuid('trainer_id'); // ID Staff (trainer)
            $table->uuid('branch_id');
            
            // Schedule Info
            $table->date('date');
            $table->time('start_at');
            $table->time('end_at');
            
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->text('cancelled_reason')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['trainer_id', 'date']);
            $table->index(['member_id', 'date']);
            $table->foreign('pt_package_id')->references('id')->on('pt_packages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pt_sessions');
    }
};
