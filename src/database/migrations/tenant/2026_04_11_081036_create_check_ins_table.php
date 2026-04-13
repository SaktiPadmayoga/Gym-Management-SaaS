<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_ins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->foreignUuid('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignUuid('membership_id')->nullable()->constrained('memberships')->nullOnDelete();
            
            $table->timestamp('checked_in_at');
            $table->enum('status', ['success', 'failed'])->default('success');
            $table->string('notes')->nullable(); // Alasan jika failed (misal: "Expired", "Salah Cabang")

            $table->timestamps();

            // Indexing agar pencarian riwayat check-in cepat
            $table->index('checked_in_at');
            $table->index(['member_id', 'checked_in_at']);
            $table->index(['branch_id', 'checked_in_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_ins');
    }
};