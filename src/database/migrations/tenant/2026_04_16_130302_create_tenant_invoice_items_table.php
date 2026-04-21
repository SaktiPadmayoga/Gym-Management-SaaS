<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenant_invoice_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // relations
            $table->foreignUuid('tenant_invoice_id')->constrained('tenant_invoices')->cascadeOnDelete();

            // polymorphic relations (bisa untuk MembershipPlan, Product, Booking, dll)
            $table->string('item_type');
            $table->uuid('item_id');

            // details
            $table->string('item_name');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);

            $table->timestamps();

            // indexes
            $table->index(['item_type', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_invoice_items');
    }
};