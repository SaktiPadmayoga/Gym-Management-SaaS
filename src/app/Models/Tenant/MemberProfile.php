<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MemberProfile extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id', 'name', 'gender', 'birth_date', 'identity_number',
        'phone', 'email', 'photo_profile', 'address',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
        'medical_conditions', 'allergies', 'blood_type',
        'status', 'join_date', 'notes'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'join_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function memberships()
    {
        return $this->hasMany(Membership::class);
    }

    public function classRegistrations()
    {
        return $this->hasMany(ClassRegistration::class);
    }

    public function ptSessions()
    {
        return $this->hasMany(PtSession::class);
    }
    
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
    
    public function loyaltyPoints()
    {
        return $this->hasMany(LoyaltyPoint::class);
    }
}