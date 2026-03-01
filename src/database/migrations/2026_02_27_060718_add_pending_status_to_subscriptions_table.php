<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    protected $connection = 'central';

    public function up(): void
    {
        DB::connection('central')->statement("
            ALTER TABLE subscriptions 
            DROP CONSTRAINT subscriptions_status_check
        ");

        DB::connection('central')->statement("
            ALTER TABLE subscriptions 
            ADD CONSTRAINT subscriptions_status_check 
            CHECK (status IN ('active', 'pending', 'cancelled', 'expired', 'trial'))
        ");
    }

    public function down(): void
    {
        DB::connection('central')->statement("
            ALTER TABLE subscriptions 
            DROP CONSTRAINT subscriptions_status_check
        ");

        DB::connection('central')->statement("
            ALTER TABLE subscriptions 
            ADD CONSTRAINT subscriptions_status_check 
            CHECK (status IN ('active', 'cancelled', 'expired', 'trial'))
        ");
    }
};