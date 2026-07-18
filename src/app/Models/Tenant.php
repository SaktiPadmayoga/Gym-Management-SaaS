<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, SoftDeletes;

    protected $connection = 'central';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'data' => 'array',
        'name' => 'string',
        'slug' => 'string',
        'owner_name' => 'string',
        'owner_email' => 'string',
        'status' => 'string',
        'max_branches' => 'integer',
        'current_branch_count' => 'integer',
        'timezone' => 'string',
        'locale' => 'string',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
    ];

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'slug',
            'owner_name',
            'owner_email',
            'status',
            'max_branches',
            'current_branch_count',
            'logo_url',
            'timezone',
            'locale',
            'created_at',
            'updated_at',
            'deleted_at',
            'trial_ends_at',
            'subscription_ends_at',
            'data',
        ];
    }

    // =============================================
    // Accessors
    // =============================================

    /**
     * Kembalikan full URL logo gym.
     * Jika logo_url adalah path R2 (tenant_xxx/logos/...) → generate via Storage::disk('r2')
     * Jika sudah berupa URL lengkap (http/https) → return as-is (backward compatible)
     * Jika null → return null
     */
    public function getLogoUrlAttribute(): ?string
    {
        $raw = $this->attributes['logo_url'] ?? null;
        if (!$raw) return null;

        // Sudah berupa URL lengkap (data lama atau URL eksternal)
        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
            return $raw;
        }

        // Gunakan disk R2 jika key R2 tersedia (production)
        if (!config('filesystems.disks.r2.key')) {
            return '/storage/' . $raw;
        }

        // Path R2 relatif → generate full CDN URL
        return Storage::disk('r2')->url($raw);
    }

    // Removed redundant getLandingPageAttribute and setLandingPageAttribute
    // because Stancl Tenancy automatically maps non-custom columns into the `data` JSON column.

    // CATATAN: branches(), users(), settings() sekarang ada di tenant database
    // Akses melalui: $tenant->run(fn() => Branch::all())

     public function domains()
    {
        return $this->hasMany(Domain::class);
    }

    public function databases()
    {
        return $this->hasMany(TenantDatabase::class);
    }

      public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
    
       /** Semua riwayat subscription */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

     public function getLatestSubscription()
    {
        return $this->subscriptions()
            ->with('plan')
            ->first();
    }

    /** Subscription terbaru berdasarkan started_at */
    public function latestSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->whereNull('deleted_at')
            ->orderBy('started_at', 'desc');
    }

    /** Subscription aktif (termasuk trial) */
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->whereIn('status', ['active', 'trial'])
            ->orderBy('started_at', 'desc');
    }
}
