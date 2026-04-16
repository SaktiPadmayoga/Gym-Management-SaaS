<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('class_schedule_id');
            $table->foreign('class_schedule_id')->references('id')->on('class_schedules')->onDelete('cascade');

            $table->uuid('member_id');
            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');

            // Staff yang melakukan check-in manual (nullable = member self check-in)
            $table->uuid('checked_in_by')->nullable();
            $table->foreign('checked_in_by')->references('id')->on('staffs')->onDelete('set null');

            $table->enum('status', ['booked', 'attended', 'cancelled', 'no_show'])
                  ->default('booked');

            $table->timestamp('booked_at')->nullable();
            $table->timestamp('attended_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Satu member hanya boleh booking sekali per jadwal
            $table->unique(['class_schedule_id', 'member_id']);

            $table->index(['member_id', 'status']);
            $table->index('class_schedule_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_attendances');
    }
};