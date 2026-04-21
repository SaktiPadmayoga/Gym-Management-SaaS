<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenant_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // relations
            $table->foreignUuid('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained('branches')->cascadeOnDelete();

            // invoice identity
            $table->string('invoice_number')->unique(); // cth: INV-MEM-12345
            $table->string('external_reference')->nullable(); // cth: midtrans order_id

            // amount
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
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

            // indexes
            $table->index(['member_id', 'branch_id']);
            $table->index('invoice_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_invoices');
    }
};