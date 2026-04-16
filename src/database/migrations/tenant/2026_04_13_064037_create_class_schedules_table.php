<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('class_plan_id');
            $table->foreign('class_plan_id')->references('id')->on('class_plans')->onDelete('cascade');

            $table->uuid('instructor_id');
            $table->foreign('instructor_id')->references('id')->on('staffs')->onDelete('restrict');

            $table->uuid('branch_id');
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');

            $table->date('date');
            $table->time('start_at');
            $table->time('end_at');

            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])
                  ->default('scheduled');

            // Override kapasitas dari plan (nullable = ikut plan)
            $table->unsignedInteger('max_capacity')->nullable();

            // Counter — di-update otomatis saat attendance berubah
            $table->unsignedInteger('total_booked')->default(0);
            $table->unsignedInteger('total_attended')->default(0);

            $table->enum('class_type', ['membership_only', 'public', 'private'])
                  ->default('membership_only');

            $table->string('cancelled_reason')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Index untuk query yang sering dipakai
            $table->index(['date', 'branch_id']);
            $table->index(['class_plan_id', 'date']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_schedules');
    }
};