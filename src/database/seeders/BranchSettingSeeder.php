<?php

namespace Database\Seeders;

use App\Models\Tenant\BranchSetting;
use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSettingSeeder extends Seeder
{
    /**
     * Default settings yang dibuat otomatis saat branch baru dibuat.
     * Bisa dipanggil dari BranchObserver atau manual.
     */
    public static function defaultSettings(string $branchId): void
    {
        $defaults = [
            // -------------------------
            // APPEARANCE
            // -------------------------
            ['group' => 'appearance', 'key' => 'primary_color',   'value' => '#4F46E5', 'type' => 'color',   'is_public' => true],
            ['group' => 'appearance', 'key' => 'accent_color',    'value' => '#7C3AED', 'type' => 'color',   'is_public' => true],
            ['group' => 'appearance', 'key' => 'logo_url',        'value' => null,      'type' => 'string',  'is_public' => true],

            // -------------------------
            // BUSINESS
            // -------------------------
            ['group' => 'business',   'key' => 'timezone',        'value' => 'Asia/Jakarta', 'type' => 'string',  'is_public' => false],
            ['group' => 'business',   'key' => 'currency',        'value' => 'IDR',          'type' => 'string',  'is_public' => false],
            ['group' => 'business',   'key' => 'currency_symbol', 'value' => 'Rp',           'type' => 'string',  'is_public' => false],
            ['group' => 'business',   'key' => 'date_format',     'value' => 'DD/MM/YYYY',   'type' => 'string',  'is_public' => false],
            ['group' => 'business',   'key' => 'language',        'value' => 'id',           'type' => 'string',  'is_public' => false],

            // -------------------------
            // OPERATIONAL
            // -------------------------
            ['group' => 'operational', 'key' => 'operating_hours', 'type' => 'json', 'is_public' => true, 'value' => json_encode([
                'mon' => ['open' => '06:00', 'close' => '22:00', 'is_open' => true],
                'tue' => ['open' => '06:00', 'close' => '22:00', 'is_open' => true],
                'wed' => ['open' => '06:00', 'close' => '22:00', 'is_open' => true],
                'thu' => ['open' => '06:00', 'close' => '22:00', 'is_open' => true],
                'fri' => ['open' => '06:00', 'close' => '22:00', 'is_open' => true],
                'sat' => ['open' => '07:00', 'close' => '20:00', 'is_open' => true],
                'sun' => ['open' => '07:00', 'close' => '18:00', 'is_open' => false],
            ])],
            ['group' => 'operational', 'key' => 'max_capacity',        'value' => '50',  'type' => 'integer', 'is_public' => false],
            ['group' => 'operational', 'key' => 'session_duration_min', 'value' => '60', 'type' => 'integer', 'is_public' => false],

            // -------------------------
            // MEMBERSHIP
            // -------------------------
            ['group' => 'membership', 'key' => 'grace_period_days',    'value' => '7',    'type' => 'integer', 'is_public' => false],
            ['group' => 'membership', 'key' => 'auto_renewal',         'value' => 'false','type' => 'boolean', 'is_public' => false],
            ['group' => 'membership', 'key' => 'late_penalty_amount',  'value' => '0',    'type' => 'integer', 'is_public' => false],
            ['group' => 'membership', 'key' => 'freeze_allowed',       'value' => 'true', 'type' => 'boolean', 'is_public' => false],
            ['group' => 'membership', 'key' => 'max_freeze_days',      'value' => '30',   'type' => 'integer', 'is_public' => false],

            // -------------------------
            // NOTIFICATION
            // -------------------------
            ['group' => 'notification', 'key' => 'expiry_reminder_days', 'value' => json_encode([3, 7, 14]), 'type' => 'json',    'is_public' => false],
            ['group' => 'notification', 'key' => 'whatsapp_enabled',     'value' => 'false', 'type' => 'boolean', 'is_public' => false],
            ['group' => 'notification', 'key' => 'email_enabled',        'value' => 'true',  'type' => 'boolean', 'is_public' => false],
            ['group' => 'notification', 'key' => 'expiry_message_template', 'type' => 'string', 'is_public' => false,
                'value' => 'Halo {member_name}, membership kamu di {branch_name} akan berakhir pada {expiry_date}. Segera perpanjang!'],

            // -------------------------
            // SECURITY
            // -------------------------
            ['group' => 'security', 'key' => 'max_login_attempt',   'value' => '5',    'type' => 'integer', 'is_public' => false],
            ['group' => 'security', 'key' => 'session_timeout_min', 'value' => '120',  'type' => 'integer', 'is_public' => false],
            ['group' => 'security', 'key' => 'require_checkin_pin', 'value' => 'false','type' => 'boolean', 'is_public' => false],
        ];

        foreach ($defaults as $setting) {
            BranchSetting::firstOrCreate(
                ['branch_id' => $branchId, 'key' => $setting['key']],
                array_merge($setting, ['branch_id' => $branchId])
            );
        }
    }

    public function run(): void
    {
        // Seed untuk semua branch yang sudah ada
        Branch::all()->each(fn($branch) => self::defaultSettings($branch->id));
    }
}