<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PtSessionPlan extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name', 'description', 'category', 'price',
        'duration', 'duration_unit', 'minutes_per_session', 'total_sessions',
        'loyalty_point', 'unlimited_sold', 'quota', 'sold_count',
        'always_available', 'available_from', 'available_until', 'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'unlimited_sold' => 'boolean',
        'always_available' => 'boolean',
        'available_from' => 'date',
        'available_until' => 'date',
    ];
}