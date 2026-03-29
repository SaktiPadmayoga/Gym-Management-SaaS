<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Menghapus tabel secara permanen
        Schema::dropIfExists('member_branches');
    }

    public function down(): void
    {
        // (Opsional) Re-create basic table jika terjadi rollback
        Schema::create('member_branches', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->timestamps();
        });
    }
};