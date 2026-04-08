<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('plan_branch_access', function (Blueprint $table) {
            $table->id();
            
            $table->foreignUuid('plan_id')->constrained('membership_plans')->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained('branches')->cascadeOnDelete();
            
            $table->timestamps();

            // Cegah 1 plan punya relasi ganda ke branch yang sama
            $table->unique(['plan_id', 'branch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_branch_access');
    }
};