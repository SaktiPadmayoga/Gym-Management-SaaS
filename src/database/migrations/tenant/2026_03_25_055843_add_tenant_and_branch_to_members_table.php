<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {

            // home_branch_id aman karena tabel branches ada di DB tenant
            $table->foreignUuid('home_branch_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('branches')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropForeign(['home_branch_id']);
            $table->dropColumn(['home_branch_id']); // Hapus dropForeign untuk tenant_id
        });
    }
};