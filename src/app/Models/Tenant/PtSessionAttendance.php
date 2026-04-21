<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PtSessionAttendance extends Model
{
    use HasFactory, HasUuids;

    protected $connection = 'tenant';
    protected $table = 'pt_session_attendances';

    protected $fillable = [
        'pt_session_id',
        'member_id',
        'pt_package_id',
        'status',
        'attended_at',
        'recorded_by',
    ];

    protected $casts = [
        'attended_at' => 'datetime',
    ];

    // Relasi
    public function session(): BelongsTo
    {
        return $this->belongsTo(PtSession::class, 'pt_session_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(PtPackage::class, 'pt_package_id');
    }

    // Staff yang memvalidasi kehadiran member
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'recorded_by');
    }
}