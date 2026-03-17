<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Identity
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('avatar')->nullable();
            $table->text('address')->nullable();
            $table->string('id_card_number')->nullable(); // KTP

            // Auth (opsional — untuk member app)
            $table->string('password')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();

            // Status
            $table->enum('status', [
                'active',       // membership aktif
                'inactive',     // belum punya membership
                'expired',      // membership expired
                'frozen',       // membership di-freeze
                'banned',       // diblokir
            ])->default('inactive');

            $table->boolean('is_active')->default(true); // akun aktif/nonaktif
            $table->timestamp('last_checkin_at')->nullable();
            $table->timestamp('last_login_at')->nullable();

            // Member sejak (tanggal pertama kali join, tidak berubah meski ganti branch)
            $table->date('member_since')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['email', 'is_active']);
            $table->index(['status', 'is_active']);
            $table->index('phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};