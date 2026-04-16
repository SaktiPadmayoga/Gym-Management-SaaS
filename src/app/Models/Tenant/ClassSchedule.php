<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassSchedule extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'class_schedules';

    protected $fillable = [
        'class_plan_id',
        'instructor_id',
        'branch_id',
        'date',
        'start_at',
        'end_at',
        'status',
        'max_capacity',
        'total_booked',
        'total_attended',
        'class_type',
        'cancelled_reason',
        'notes',
    ];

    protected $casts = [
        'date'           => 'date',
        'max_capacity'   => 'integer',
        'total_booked'   => 'integer',
        'total_attended' => 'integer',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function classPlan()
    {
        return $this->belongsTo(ClassPlan::class, 'class_plan_id');
    }

    public function instructor()
    {
        return $this->belongsTo(Staff::class, 'instructor_id');
    }

    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    public function attendances()
    {
        return $this->hasMany(ClassAttendance::class, 'class_schedule_id');
    }

    // =============================================
    // Helpers
    // =============================================

    public function getEffectiveCapacity(): int
    {
        return $this->max_capacity ?? $this->classPlan->max_capacity;
    }

    public function hasAvailableSlot(): bool
    {
        return $this->total_booked < $this->getEffectiveCapacity();
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isBookableByMember(): bool
    {
        return $this->status === 'scheduled' && $this->hasAvailableSlot();
    }

    // =============================================
    // Scopes
    // =============================================

    public function scopeForBranch($query, string $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    public function scopeForDate($query, string $date)
    {
        return $query->where('date', $date);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now()->toDateString())
                     ->where('status', 'scheduled');
    }
}