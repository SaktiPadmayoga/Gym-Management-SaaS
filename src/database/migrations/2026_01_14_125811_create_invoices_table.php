<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // relations
            $table->uuid('tenant_id');
            $table->uuid('subscription_id');

            // invoice identity
            $table->string('invoice_number')->unique(); // INV-2026-0001
            $table->string('external_reference')->nullable(); // midtrans order_id

            // amount
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('IDR');

            // payment info
            $table->string('payment_gateway')->default('midtrans');
            $table->string('payment_method')->nullable(); // qris, va, gopay, cc
            $table->string('transaction_id')->nullable(); // midtrans transaction_id

            // status
            $table->enum('status', [
                'pending',
                'paid',
                'failed',
                'expired',
                'canceled'
            ])->default('pending');

            // timing
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();

            // audit
            $table->json('gateway_response')->nullable(); // raw webhook payload
            $table->text('notes')->nullable();

            $table->timestamps();

            // foreign keys
            $table->foreign('tenant_id')
                ->references('id')->on('tenants')
                ->cascadeOnDelete();

            $table->foreign('subscription_id')
                ->references('id')->on('subscriptions')
                ->cascadeOnDelete();

            $table->index(['tenant_id', 'subscription_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};