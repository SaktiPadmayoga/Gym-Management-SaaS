<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();

            $table->bigInteger('price_monthly')->default(0);
            $table->bigInteger('price_yearly')->default(0);
            $table->bigInteger('setup_fee')->default(0);
            $table->string('currency',3)->default('IDR');

            $table->integer('max_membership')->default(0);
            $table->integer('max_staff')->default(0);
            $table->integer('max_branches')->default(1);

            $table->boolean('allow_multi_branch')->default(false);
            $table->boolean('allow_cross_branch_attendance')->default(false);

            $table->json('features')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(true);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
