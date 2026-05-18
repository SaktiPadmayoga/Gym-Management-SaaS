<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL, Laravel creates a CHECK constraint for enum columns.
        // We drop the old constraint and create a new one with the updated values.
        DB::statement("ALTER TABLE pt_sessions DROP CONSTRAINT IF EXISTS pt_sessions_status_check;");
        DB::statement("ALTER TABLE pt_sessions ADD CONSTRAINT pt_sessions_status_check CHECK (status::text = ANY (ARRAY['requested'::text, 'scheduled'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text, 'rejected'::text]));");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE pt_sessions DROP CONSTRAINT IF EXISTS pt_sessions_status_check;");
        DB::statement("ALTER TABLE pt_sessions ADD CONSTRAINT pt_sessions_status_check CHECK (status::text = ANY (ARRAY['scheduled'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text]));");
    }
};
