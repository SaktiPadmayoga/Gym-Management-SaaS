<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
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

    /** Subscription aktif */
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->ofMany('started_at', 'max');
    }
}
