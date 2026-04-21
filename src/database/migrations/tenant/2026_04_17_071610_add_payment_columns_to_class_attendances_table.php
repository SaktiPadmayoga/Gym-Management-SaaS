<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_attendances', function (Blueprint $table) {
            // Relasi ke invoice (nullable — null berarti booking gratis)
            $table->foreignUuid('tenant_invoice_id')
                ->nullable()
                ->after('notes')
                ->constrained('tenant_invoices')
                ->nullOnDelete();

            // Status pembayaran untuk kelas berbayar
            $table->enum('payment_status', ['free', 'pending', 'paid'])
                ->default('free')
                ->after('tenant_invoice_id');

            $table->index('tenant_invoice_id');
        });
    }

    public function down(): void
    {
        Schema::table('class_attendances', function (Blueprint $table) {
            $table->dropForeign(['tenant_invoice_id']);
            $table->dropIndex(['tenant_invoice_id']);
            $table->dropColumn(['tenant_invoice_id', 'payment_status']);
        });
    }
};