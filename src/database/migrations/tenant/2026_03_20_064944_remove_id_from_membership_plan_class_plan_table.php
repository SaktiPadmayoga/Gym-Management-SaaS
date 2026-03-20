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
        Schema::table('membership_plan_class_plan', function (Blueprint $table) {
            $table->dropColumn('id');
            $table->primary(['membership_plan_id', 'class_plan_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('membership_plan_class_plan', function (Blueprint $table) {
            //
        });
    }
};
