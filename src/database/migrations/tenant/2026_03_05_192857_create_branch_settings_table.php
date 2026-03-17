<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('branch_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('branch_id');

            $table->enum('group', [
                'appearance',
                'business',
                'operational',
                'membership',
                'notification',
                'security',
            ]);

            $table->string('key');
            $table->text('value')->nullable();
            $table->enum('type', ['string', 'integer', 'boolean', 'json', 'color'])->default('string');
            $table->boolean('is_public')->default(false); // bisa dibaca tanpa auth (untuk theming)

            $table->timestamps();

            $table->foreign('branch_id')->references('id')->on('branches')->cascadeOnDelete();
            $table->unique(['branch_id', 'key']);
            $table->index(['branch_id', 'group']);
            $table->index(['branch_id', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_settings');
    }
};