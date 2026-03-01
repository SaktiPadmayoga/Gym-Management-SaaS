<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Facility extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name', 'description', 'class_type', 'price', 'minutes_per_session',
        'operational_hour_from', 'operational_hour_until', 'capacity', 'is_active'
    ];
}