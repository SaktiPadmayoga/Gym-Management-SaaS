<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'facilities';

    protected $fillable = [
        'name',
        'category',
        'description',
        'color',
        'sort_order',
        'price',
        'currency',
        'minutes_per_session',
        'capacity',
        'access_type',
        'branch_id',
        'operational_hours',
        'always_available',
        'available_from',
        'available_until',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'price'            => 'decimal:2',
        'is_active'        => 'boolean',
        'always_available' => 'boolean',
        'available_from'   => 'date',
        'available_until'  => 'date',
        'operational_hours'=> 'array',
        'minutes_per_session' => 'integer',
        'capacity'         => 'integer',
        'sort_order'       => 'integer',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    public function bookings()
    {
        return $this->hasMany(FacilityBooking::class);
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

    public function scopePublic($query)
    {
        return $query->where('access_type', 'public');
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

    /**
     * Cek apakah fasilitas buka pada hari & jam tertentu
     */
    public function isOpenAt(string $dayKey, string $time): bool
    {
        if (!$this->operational_hours) return true; // tidak ada jadwal = selalu buka

        $schedule = $this->operational_hours[$dayKey] ?? null;
        if (!$schedule || !($schedule['is_open'] ?? false)) return false;

        return $time >= $schedule['open'] && $time <= $schedule['close'];
    }

    public function getDurationLabelAttribute(): string
    {
        return $this->minutes_per_session . ' min';
    }
}