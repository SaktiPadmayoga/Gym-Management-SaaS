<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LoyaltyPoint extends Model
{
    use HasUuids;

    protected $fillable = [
        'member_profile_id', 'points', 'type',
        'source', 'source_id',
        'description', 'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'date',
    ];

    public function memberProfile()
    {
        return $this->belongsTo(MemberProfile::class);
    }
}