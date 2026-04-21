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
        Schema::create('pt_session_attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pt_session_id');
            $table->uuid('member_id');
            $table->uuid('pt_package_id'); 
            
            $table->enum('status', ['scheduled', 'attended', 'cancelled', 'no_show']);
            $table->timestamp('attended_at')->nullable();
            $table->uuid('recorded_by')->nullable(); // Staff yang melakukan check-in
            
            $table->timestamps();

            $table->foreign('pt_session_id')->references('id')->on('pt_sessions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pt_session_attendances');
    }
};
