<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->index('status');
            $table->index('tenant_id');
            $table->index('plan_id');
            $table->index('current_period_ends_at');
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {   
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['tenant_id']);
            $table->dropIndex(['plan_id']);
            $table->dropIndex(['current_period_ends_at']);
            $table->dropIndex(['tenant_id', 'status']);
        });
    }
};
