<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('member_branches', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('member_id');
            $table->uuid('branch_id');

            // Membership info per branch
            $table->enum('status', [
                'active',
                'inactive',
                'expired',
                'frozen',
                'cancelled',
            ])->default('inactive');

            $table->uuid('plan_id')->nullable();        // plan yang dipakai
            $table->uuid('last_transaction_id')->nullable(); // transaksi terakhir

            $table->date('started_at')->nullable();     // mulai membership
            $table->date('expires_at')->nullable();     // akhir membership
            $table->date('frozen_at')->nullable();      // mulai freeze
            $table->date('frozen_until')->nullable();   // akhir freeze
            $table->integer('freeze_days_used')->default(0);

            $table->string('member_code')->nullable();  // kode unik member per branch
            $table->text('notes')->nullable();

            $table->boolean('is_primary')->default(false); // branch utama member ini
            $table->timestamp('joined_at')->nullable();    // pertama kali join branch ini
            $table->timestamp('last_checkin_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->cascadeOnDelete();

            $table->unique(['member_id', 'branch_id']);
            $table->unique(['branch_id', 'member_code']); // member_code unik per branch
            $table->index(['branch_id', 'status']);
            $table->index(['branch_id', 'expires_at']);
            $table->index(['member_id', 'status']);
            $table->index(['branch_id', 'is_primary']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_branches');
    }
};