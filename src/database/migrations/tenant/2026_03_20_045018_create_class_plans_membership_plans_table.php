<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('membership_plan_class_plan', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('membership_plan_id');
            $table->uuid('class_plan_id');

            // Override quota khusus untuk kombinasi ini
            // null = ikut quota default dari class_plan
            $table->boolean('unlimited_session')->nullable();
            $table->integer('monthly_quota_override')->nullable();
            $table->integer('daily_quota_override')->nullable();

            $table->timestamps();

            // Tidak pakai FK constraint karena semua di tenant DB
            // tapi tetap index untuk performa query
            $table->unique(['membership_plan_id', 'class_plan_id']);
            $table->index('membership_plan_id');
            $table->index('class_plan_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_plan_class_plan');
    }
};