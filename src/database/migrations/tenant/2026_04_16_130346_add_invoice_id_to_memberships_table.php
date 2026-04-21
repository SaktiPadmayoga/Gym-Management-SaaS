<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('memberships', function (Blueprint $table) {
            // Relasi ke invoice yang membuat membership ini aktif
            $table->foreignUuid('tenant_invoice_id')
                ->nullable()
                ->after('branch_id')
                ->constrained('tenant_invoices')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('memberships', function (Blueprint $table) {
            $table->dropForeign(['tenant_invoice_id']);
            $table->dropColumn('tenant_invoice_id');
        });
    }
};