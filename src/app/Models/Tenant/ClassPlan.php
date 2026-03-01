<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClassPlan extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name', 'description', 'price', 'max_visitor', 'minutes_per_session',
        'access_type', 'unlimited_monthly_session', 'unlimited_daily_session',
        'monthly_quota', 'daily_quota', 'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'unlimited_monthly_session' => 'boolean',
        'unlimited_daily_session' => 'boolean',
    ];

    public function schedules()
    {
        return $this->hasMany(ClassSchedule::class);
    }
}