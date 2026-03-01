<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AdditionalFee extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name', 'description', 'amount', 'fee_type',
        'is_mandatory', 'is_active'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_mandatory' => 'boolean',
        'is_active' => 'boolean',
    ];
}