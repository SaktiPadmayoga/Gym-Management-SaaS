<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name', 'sku', 'category', 'description',
        'selling_price', 'cost_price',
        'stock', 'min_stock', 'unit',
        'image', 'is_active'
    ];
    
    protected $casts = [
        'selling_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}