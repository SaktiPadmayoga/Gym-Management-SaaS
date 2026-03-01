<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $connection = 'central';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'code', 'description',
        'price_monthly', 'price_yearly', 'currency',
        'max_membership', 'max_staff', 'max_branches',
        'allow_multi_branch',
        'allow_cross_branch_attendance',
        'features', 'is_active', 'is_public',
    ];

    protected $casts = [
        'features' => 'array', 
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'price_monthly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
        'setup_fee' => 'decimal:2',
        'allow_multi_branch' => 'boolean',
        'allow_cross_branch_attendance' => 'boolean',
    ];

    // Relasi ke subscriptions
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    // Helper methods (best practice untuk business logic)
    public function isUnlimitedMembers(): bool
    {
        return $this->max_membership === 0;
    }

    public function isUnlimitedStaff(): bool
    {
        return $this->max_staff === 0;
    }

    public function isUnlimitedBranches(): bool
    {
        return $this->max_branches === 0;
    }

    public function hasFeature(string $feature): bool
    {
        return in_array($feature, $this->features ?? []);
    }
}