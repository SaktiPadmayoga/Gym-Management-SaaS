<?php

namespace App\Models\Tenant;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PtSession extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $connection = 'tenant';
    protected $table = 'pt_sessions';

    protected $fillable = [
        'pt_package_id',
        'member_id',
        'trainer_id',
        'branch_id',
        'date',
        'start_at',
        'end_at',
        'status',
        'notes',
        'cancelled_reason',
    ];

    protected $casts = [
        'date' => 'date',
        // start_at & end_at umumnya dibiarkan string 'H:i:s' oleh Laravel, 
        // tapi bisa kamu format di Resource nanti.
    ];

    // Relasi
    public function package(): BelongsTo
    {
        return $this->belongsTo(PtPackage::class, 'pt_package_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    // Asumsi kamu menggunakan model Staff untuk trainer
    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'trainer_id'); 
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function attendance(): HasOne
    {
        return $this->hasOne(PtSessionAttendance::class);
    }
}