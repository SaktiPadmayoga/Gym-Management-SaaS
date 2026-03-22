<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasUuids;

    protected $table      = 'stock_movements';
    public    $timestamps = false;

    protected $fillable = [
        'product_id', 'branch_id', 'type',
        'qty_before', 'qty_change', 'qty_after',
        'notes', 'reference_id', 'reference_type', 'created_by',
    ];

    protected $casts = [
        'qty_before' => 'integer',
        'qty_change' => 'integer',
        'qty_after'  => 'integer',
        'created_at' => 'datetime',
    ];

    public function product() { return $this->belongsTo(Product::class, 'product_id'); }
    public function branch()  { return $this->belongsTo(\App\Models\Branch::class, 'branch_id'); }
    public function isIncoming(): bool { return $this->qty_change > 0; }
    public function isOutgoing(): bool { return $this->qty_change < 0; }
}