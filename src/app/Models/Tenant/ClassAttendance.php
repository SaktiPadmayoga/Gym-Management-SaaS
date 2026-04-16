<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassAttendance extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'class_attendances';

    protected $fillable = [
        'class_schedule_id',
        'member_id',
        'checked_in_by',
        'status',
        'booked_at',
        'attended_at',
        'cancelled_at',
        'notes',
    ];

    protected $casts = [
        'booked_at'    => 'datetime',
        'attended_at'  => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function schedule()
    {
        return $this->belongsTo(ClassSchedule::class, 'class_schedule_id');
    }

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function checkedInBy()
    {
        return $this->belongsTo(Staff::class, 'checked_in_by');
    }

    // =============================================
    // Helpers
    // =============================================

    public function isAttended(): bool
    {
        return $this->status === 'attended';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }
}