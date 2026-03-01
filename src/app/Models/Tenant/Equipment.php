<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Equipment extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'equipment'; // Singular name often needs explicit table definition

    protected $fillable = [
        'name', 'code', 'category', 'quantity', 'location', 'condition',
        'purchase_date', 'purchase_price', 'last_maintenance', 'next_maintenance',
        'maintenance_notes', 'is_active'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'last_maintenance' => 'date',
        'next_maintenance' => 'date',
        'purchase_price' => 'decimal:2',
    ];
}