<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relations
            $table->uuid('tenant_id');
            $table->uuid('invoice_id');

            // Payment gateway info
            $table->string('provider')->default('midtrans'); 
            $table->string('payment_type')->nullable(); // qris, bank_transfer, gopay, credit_card
            $table->string('transaction_id')->nullable(); // from midtrans
            $table->string('order_id'); // invoice_number

            // Amount
            $table->decimal('gross_amount', 15, 2);

            // Status
            $table->enum('status', [
                'pending',
                'success',
                'failed',
                'expired',
                'refund'
            ])->default('pending');

            // Raw response from gateway
            $table->json('raw_response')->nullable();

            // Time
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('tenant_id');
            $table->index('invoice_id');
            $table->index('transaction_id');
            $table->index('order_id');

            // Foreign keys
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();

            $table->foreign('invoice_id')
                ->references('id')
                ->on('invoices')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};