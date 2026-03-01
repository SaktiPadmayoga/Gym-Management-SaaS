<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class FacilityBooking extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'facility_id', 'member_profile_id',
        'booking_date', 'start_at', 'end_at',
        'price', 'status', 'notes'
    ];

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function memberProfile()
    {
        return $this->belongsTo(MemberProfile::class);
    }
}