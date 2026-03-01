<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Attendance extends Model
{
    use HasUuids;

    protected $table = 'attendance'; // Singular table name

    protected $fillable = [
        'member_profile_id', 'membership_id', 'class_schedule_id',
        'check_in_time', 'check_out_time', 'duration_minutes',
        'type', 'notes'
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
    ];

    public function memberProfile()
    {
        return $this->belongsTo(MemberProfile::class);
    }
}