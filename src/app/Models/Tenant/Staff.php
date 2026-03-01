<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Staff extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'staff'; // Laravel pluralizer might fail on 'staff'

    protected $fillable = [
        'user_id', 'name', 'phone', 'staff_type', 'join_date', 'end_date',
        'base_salary', 'payment_type', 'specializations', 'certifications',
        'bio', 'photo', 'commission_rate', 'status'
    ];

    protected $casts = [
        'join_date' => 'date',
        'end_date' => 'date',
        'specializations' => 'array',
        'certifications' => 'array',
        'base_salary' => 'decimal:2',
        'commission_rate' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Sebagai Instructor di Class Schedule
    public function classSchedules()
    {
        return $this->hasMany(ClassSchedule::class, 'instructor_id');
    }

    // Sebagai PT di PT Session
    public function ptSessions()
    {
        return $this->hasMany(PtSession::class, 'pt_id');
    }
}