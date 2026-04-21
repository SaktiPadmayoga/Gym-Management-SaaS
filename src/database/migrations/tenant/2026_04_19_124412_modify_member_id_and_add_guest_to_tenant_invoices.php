<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenant_invoices', function (Blueprint $table) {
            // 1. Hapus foreign key lama
            // Laravel otomatis mencari nama constraint berdasarkan nama kolom jika pakai array
            $table->dropForeign(['member_id']);

            // 2. Ubah kolom member_id menjadi nullable
            $table->uuid('member_id')->nullable()->change();

            // 3. Pasang kembali foreign key dengan nullOnDelete
            $table->foreign('member_id')
                  ->references('id')
                  ->on('members')
                  ->nullOnDelete();

            // 4. Tambahkan kolom guest
            $table->string('guest_name')->nullable()->after('member_id');
            $table->string('guest_phone', 20)->nullable()->after('guest_name');
            $table->string('guest_email')->nullable()->after('guest_phone');
            $table->uuid('created_by')->nullable(); // staff/cashier id

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_invoices', function (Blueprint $table) {
            // 1. Hapus constraint baru
            $table->dropForeign(['member_id']);

            // 2. Hapus kolom guest
            $table->dropColumn(['guest_name', 'guest_phone', 'guest_email', 'created_by']);

            // 3. Kembalikan member_id agar tidak nullable
            // (Hati-hati saat rollback jika ada data member_id yang sudah null, akan error)
            $table->uuid('member_id')->nullable(false)->change();

            // 4. Pasang kembali foreign key lama (cascadeOnDelete)
            $table->foreign('member_id')
                  ->references('id')
                  ->on('members')
                  ->cascadeOnDelete();
        });
    }
};