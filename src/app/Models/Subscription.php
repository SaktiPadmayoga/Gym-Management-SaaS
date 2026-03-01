<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Concerns\HasUuids;


class Subscription extends Model
{
    use HasFactory, SoftDeletes, HasUuids;
    
    protected $connection = 'central';
    public $incrementing = false;
    protected $keyType = 'string';

    

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->setKeyType('string');
        $this->setIncrementing(false);
    }

    protected $fillable = [
         'id',
        'tenant_id',
        'plan_id',
        'status',
        'billing_cycle',
        'amount',
        'auto_renew',
        'max_branches',
        'max_users',
        'started_at',
        'trial_ends_at',
        'current_period_ends_at',
        'canceled_at',
        'last_invoice_id',
    ];

    protected $casts = [
        'status' => 'string', 
        'billing_cycle' => 'string',
        'amount' => 'decimal:2',
        'auto_renew' => 'boolean',
        'started_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'current_period_ends_at' => 'datetime',
        'canceled_at' => 'datetime',
    ];

    // Relasi
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    // Helper methods
    public function isTrial(): bool
    {
        return $this->status === 'trial' && $this->trial_ends_at && now() < $this->trial_ends_at;
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trial']) && ($this->current_period_ends_at ? now() < $this->current_period_ends_at : true);
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired' || ($this->current_period_ends_at && now() > $this->current_period_ends_at);
    }

    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'canceled_at' => now(),
            'auto_renew' => false,
        ]);
    }

    // app/Models/Subscription.php
// app/Models/Subscription.php
public function syncToTenant(): void
{
    $tenant = $this->tenant;

    DB::table('tenants')
        ->where('id', $tenant->id)
        ->update([
            'trial_ends_at'        => $this->trial_ends_at,
            'subscription_ends_at' => $this->current_period_ends_at,
            'updated_at'           => now(), // biar updated_at ikut update
        ]);

    // Refresh model tenant
    $tenant->refresh();

    Log::info("Brute-force DB sync done for tenant {$tenant->id}: trial_ends_at = {$this->trial_ends_at}");
}
}