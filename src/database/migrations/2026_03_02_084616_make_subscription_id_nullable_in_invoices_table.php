<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'central';

    public function up(): void
    {
        Schema::connection('central')->table('invoices', function (Blueprint $table) {
            $table->uuid('subscription_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::connection('central')->table('invoices', function (Blueprint $table) {
            $table->uuid('subscription_id')->nullable(false)->change();
        });
    }
};