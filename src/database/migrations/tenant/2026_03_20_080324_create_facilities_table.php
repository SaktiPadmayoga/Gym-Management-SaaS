<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('facilities', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Identity
            $table->string('name');
            $table->string('category')->nullable(); // Kolam Renang, Sauna, Squash, dll
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->integer('sort_order')->default(0);

            // Pricing
            $table->decimal('price', 12, 2)->default(0); // 0 = gratis / include membership
            $table->string('currency')->default('IDR');

            // Session
            $table->integer('minutes_per_session');
            $table->integer('capacity')->default(1); // max orang per sesi/booking

            // Access Type
            // public  = bisa dibook siapa saja (walk-in)
            // private = hanya member atau member dengan plan tertentu
            $table->enum('access_type', ['public', 'private'])->default('public');

            // Branch
            $table->uuid('branch_id')->nullable(); // null = semua branch

            // Operational Hours per hari (JSON — fleksibel tiap hari berbeda)
            // {"mon":{"open":"06:00","close":"22:00","is_open":true}, ...}
            $table->json('operational_hours')->nullable();

            // Availability
            $table->boolean('always_available')->default(true);
            $table->date('available_from')->nullable();
            $table->date('available_until')->nullable();

            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'category']);
            $table->index(['branch_id', 'is_active']);
            $table->index(['access_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilities');
    }
};