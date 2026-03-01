<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClassSchedule extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'class_plan_id', 'instructor_id',
        'date', 'start_at', 'end_at',
        'class_type', 'access',
        'max_capacity', 'current_capacity', 'total_manual_checkin',
        'note', 'status'
    ];

    protected $casts = [
        'date' => 'date',
        // start_at & end_at biasanya string 'H:i:s' di Laravel jika tipe data database TIME
    ];

    public function classPlan()
    {
        return $this->belongsTo(ClassPlan::class);
    }

    public function instructor()
    {
        return $this->belongsTo(Staff::class, 'instructor_id');
    }

    public function registrations()
    {
        return $this->hasMany(ClassRegistration::class);
    }
}