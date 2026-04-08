<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('membership_plan_class_plan', function (Blueprint $table) {
            // 1. Definisikan kolom UUID secara terpisah (Wajib!)
            $table->uuid('membership_plan_id');
            $table->uuid('class_plan_id');

            // 2. Buat Composite Primary Key dari kedua kolom tersebut
            $table->primary(['membership_plan_id', 'class_plan_id']);

            // 3. Hubungkan Foreign Key (Penting agar data konsisten)
            // Menggunakan cascade agar jika Plan dihapus, relasi di tabel ini ikut hilang
            $table->foreign('membership_plan_id', 'mp_cp_membership_id_foreign')
                  ->references('id')->on('membership_plans')->onDelete('cascade');
            
            $table->foreign('class_plan_id', 'mp_cp_class_id_foreign')
                  ->references('id')->on('class_plans')->onDelete('cascade');

            $table->boolean('unlimited_session')->default(false); // Beri default agar lebih aman
            $table->integer('monthly_quota_override')->nullable();
            $table->integer('daily_quota_override')->nullable();

            $table->timestamps();

            // Index tambahan tidak perlu lagi karena Primary Key otomatis menjadi Index
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_plan_class_plan');
    }
};
