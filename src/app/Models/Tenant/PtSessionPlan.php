<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class PtSessionPlan extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'pt_session_plans';

    protected $fillable = [
        'name',
        'category',
        'description',
        'color',
        'sort_order',
        'price',
        'currency',
        'duration',
        'duration_unit',
        'minutes_per_session',
        'total_sessions',
        'loyalty_points_reward',
        'branch_id',
        'unlimited_sold',
        'total_quota',
        'always_available',
        'available_from',
        'available_until',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'price'                 => 'decimal:2',
        'unlimited_sold'        => 'boolean',
        'always_available'      => 'boolean',
        'is_active'             => 'boolean',
        'available_from'        => 'date',
        'available_until'       => 'date',
        'duration'              => 'integer',
        'minutes_per_session'   => 'integer',
        'total_sessions'        => 'integer',
        'loyalty_points_reward' => 'integer',
        'total_quota'           => 'integer',
        'sort_order'            => 'integer',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    // =============================================
    // Scopes
    // =============================================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->where('always_available', true)
                  ->orWhere(function ($q2) {
                      $q2->where('available_from', '<=', now())
                         ->where('available_until', '>=', now());
                  });
            });
    }

    public function scopeForBranch($query, string $branchId)
    {
        return $query->where(function ($q) use ($branchId) {
            $q->whereNull('branch_id')
              ->orWhere('branch_id', $branchId);
        });
    }

    // =============================================
    // Helpers
    // =============================================

    public function isAvailable(): bool
    {
        if (!$this->is_active) return false;
        if ($this->always_available) return true;
        return $this->available_from <= now() && $this->available_until >= now();
    }

    public function hasStock(): bool
    {
        if ($this->unlimited_sold || is_null($this->total_quota)) return true;
        return $this->sold_count < $this->total_quota;
    }

    /**
     * sold_count dihitung real-time — tidak disimpan di DB
     * Nanti akan dihitung dari tabel transaksi PT
     */
    public function getSoldCountAttribute(): int
    {
        // TODO: ganti dengan relasi ke tabel transaksi PT saat sudah dibuat
        return 0;
    }

    public function getRemainingQuotaAttribute(): ?int
    {
        if ($this->unlimited_sold || is_null($this->total_quota)) return null;
        return max(0, $this->total_quota - $this->sold_count);
    }

    public function calculateExpiryDate(?\DateTime $startDate = null): \Carbon\Carbon
    {
        $start = $startDate ? \Carbon\Carbon::instance($startDate) : now();

        return match ($this->duration_unit) {
            'day'   => $start->addDays($this->duration),
            'week'  => $start->addWeeks($this->duration),
            'month' => $start->addMonths($this->duration),
            'year'  => $start->addYears($this->duration),
            default => $start->addMonths($this->duration),
        };
    }
}