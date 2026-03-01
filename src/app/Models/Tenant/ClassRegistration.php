<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClassRegistration extends Model
{
    use HasUuids; // Tidak ada SoftDeletes di migrasi untuk tabel ini (optional, cek migrasi)

    protected $fillable = [
        'member_profile_id', 'class_schedule_id',
        'registered_at', 'status', 'cancelled_at', 'cancellation_reason'
    ];

    protected $casts = [
        'registered_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function memberProfile()
    {
        return $this->belongsTo(MemberProfile::class);
    }

    public function classSchedule()
    {
        return $this->belongsTo(ClassSchedule::class);
    }
}