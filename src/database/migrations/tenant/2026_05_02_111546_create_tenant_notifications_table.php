<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Nullable agar bisa kirim notif sistem (global ke semua cabang)
            $table->foreignUuid('branch_id')->nullable()->constrained('branches')->cascadeOnDelete();
            
            // Opsional: Untuk mencatat siapa staff yang memicu kejadian ini (kasir siapa)
            $table->foreignUuid('staff_id')->nullable()->constrained('staffs')->nullOnDelete();

            $table->string('type'); // Contoh: 'new_member', 'pos_transaction', etc.
            $table->string('title');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_notifications');
    }
};