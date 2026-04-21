<?php

namespace App\Models\Tenant;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PtPackage extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $connection = 'tenant';
    protected $table = 'pt_packages';

    protected $fillable = [
        'member_id',
        'pt_session_plan_id',
        'tenant_invoice_id',
        'branch_id',
        'total_sessions',
        'used_sessions',
        'status',
        'purchased_at',
        'activated_at',
        'expired_at',
    ];

    protected $casts = [
        'purchased_at' => 'date',
        'activated_at' => 'date',
        'expired_at'   => 'date',
        'total_sessions' => 'integer',
        'used_sessions'  => 'integer',
    ];

    // Accessor untuk mendapatkan sisa kuota (secara instan)
    public function getRemainingSessionsAttribute(): int
    {
        return max(0, $this->total_sessions - $this->used_sessions);
    }

    // Relasi
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(PtSessionPlan::class, 'pt_session_plan_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(TenantInvoice::class, 'tenant_invoice_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(PtSession::class);
    }
}