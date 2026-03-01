<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PtSessionSchedule extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'pt_session_id', 'date', 'start_at', 'end_at',
        'status', 'notes', 'trainer_notes'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function ptSession()
    {
        return $this->belongsTo(PtSession::class);
    }
}