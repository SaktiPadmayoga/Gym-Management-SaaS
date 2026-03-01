<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MembershipPlan extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name', 'category', 'description', 'price', 'duration', 'duration_unit',
        'loyalty_point', 'max_sharing_access', 'access_type', 'class_access_type',
        'unlimited_checkin_membership', 'unlimited_checkin_class',
        'membership_quota', 'class_quota', 'unlimited_sold', 'quota', 'sold_count',
        'always_available', 'available_from', 'available_until',
        'checkin_schedule', 'is_active', 'sort_order'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'checkin_schedule' => 'array', // JSON
        'unlimited_checkin_membership' => 'boolean',
        'unlimited_checkin_class' => 'boolean',
        'unlimited_sold' => 'boolean',
        'always_available' => 'boolean',
        'is_active' => 'boolean',
        'available_from' => 'date',
        'available_until' => 'date',
    ];

    public function memberships()
    {
        return $this->hasMany(Membership::class);
    }
}