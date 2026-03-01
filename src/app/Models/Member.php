<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'phone',
        'join_date',
        'status',
        'address',
        'emergency_contact',
        'emergency_phone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}