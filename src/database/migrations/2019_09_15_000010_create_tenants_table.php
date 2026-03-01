<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('name');
            $table->string('slug')->unique();
            $table->string('owner_name');
            $table->string('owner_email');

            $table->enum('status', ['trial','active','suspended','expired'])->default('trial');

            $table->integer('max_branches')->default(1);
            $table->integer('current_branch_count')->default(1);

            $table->string('logo_url')->nullable();
            $table->string('timezone')->default('Asia/Jakarta');
            $table->string('locale')->default('id');

            $table->json('data')->nullable();

            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
