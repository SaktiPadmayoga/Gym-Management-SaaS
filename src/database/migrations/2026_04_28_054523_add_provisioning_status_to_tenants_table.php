<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // drop constraint lama
        DB::statement("ALTER TABLE tenants DROP CONSTRAINT tenants_status_check");

        // buat ulang dengan value baru
        DB::statement("
            ALTER TABLE tenants ADD CONSTRAINT tenants_status_check
            CHECK (status IN (
                'provisioning',
                'failed',
                'trial',
                'active',
                'suspended',
                'expired'
            ))
        ");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE tenants DROP CONSTRAINT tenants_status_check");

        DB::statement("
            ALTER TABLE tenants ADD CONSTRAINT tenants_status_check
            CHECK (status IN (
                'trial',
                'active',
                'suspended',
                'expired'
            ))
        ");
    }
};