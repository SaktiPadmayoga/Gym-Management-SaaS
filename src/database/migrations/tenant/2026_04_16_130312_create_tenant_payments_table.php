<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenant_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // relations
            $table->foreignUuid('tenant_invoice_id')->constrained('tenant_invoices')->cascadeOnDelete();

            // payment gateway info
            $table->string('provider')->default('midtrans');
            $table->string('payment_type')->nullable(); // qris, bank_transfer
            $table->string('transaction_id')->nullable(); // from midtrans
            $table->string('order_id'); // mengacu ke invoice_number

            // amount
            $table->decimal('gross_amount', 15, 2);

            // status
            $table->enum('status', [
                'pending',
                'success',
                'failed',
                'expired',
                'refund'
            ])->default('pending');

            // audit & timing
            $table->json('raw_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            
            $table->timestamps();

            // indexes
            $table->index('tenant_invoice_id');
            $table->index('transaction_id');
            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_payments');
    }
};