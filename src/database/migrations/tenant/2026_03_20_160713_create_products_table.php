<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Identity
            $table->string('name');
            $table->string('code')->unique()->nullable();
            $table->string('category');
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->integer('sort_order')->default(0);

            // Branch
            $table->uuid('branch_id')->nullable();

            // Pricing
            $table->decimal('selling_price', 12, 2);
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->string('currency')->default('IDR');

            // Inventory
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->string('unit')->default('pcs');

            // Image — path relatif dari disk public
            // e.g: products/images/abc123.jpg → /storage/products/images/abc123.jpg
            $table->string('image')->nullable();

            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'is_active']);
            $table->index(['branch_id', 'is_active']);
            $table->index('stock');
            $table->index('code');
        });

        // Stock Movements — audit trail setiap perubahan stock
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('product_id');
            $table->uuid('branch_id')->nullable();

            $table->enum('type', [
                'purchase',   // beli stok baru
                'sale',       // terjual via POS
                'adjustment', // koreksi manual
                'return',     // retur dari pelanggan
                'transfer',   // transfer antar branch
            ]);

            $table->integer('qty_before');
            $table->integer('qty_change');   // positif = masuk, negatif = keluar
            $table->integer('qty_after');

            $table->text('notes')->nullable();
            $table->uuid('reference_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->uuid('created_by')->nullable();

            // Tidak ada updated_at & softDeletes — audit trail harus permanen
            $table->timestamp('created_at')->useCurrent();

            $table->index(['product_id', 'created_at']);
            $table->index(['branch_id', 'created_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('products');
    }
};