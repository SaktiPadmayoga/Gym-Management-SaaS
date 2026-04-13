<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckIn extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'check_ins';

    protected $fillable = [
        'member_id',
        'branch_id',
        'membership_id',
        'checked_in_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    public function membership()
    {
        return $this->belongsTo(Membership::class, 'membership_id');
    }
}