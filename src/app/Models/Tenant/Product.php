<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'products';

    protected $fillable = [
        'name', 'sku', 'category', 'description', 'color', 'sort_order',
        'branch_id', 'selling_price', 'cost_price', 'currency',
        'stock', 'min_stock', 'unit', 'image', 'is_active', 'created_by',
    ];

    protected $casts = [
        'selling_price' => 'decimal:2',
        'cost_price'    => 'decimal:2',
        'is_active'     => 'boolean',
        'stock'         => 'integer',
        'min_stock'     => 'integer',
        'sort_order'    => 'integer',
    ];

    // =============================================
    // Relationships
    // =============================================

    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class, 'product_id')->orderByDesc('created_at');
    }

    // =============================================
    // Scopes
    // =============================================

    public function scopeActive($query)        { return $query->where('is_active', true); }
    public function scopeLowStock($query)       { return $query->whereRaw('stock <= min_stock AND stock > 0'); }
    public function scopeOutOfStock($query)     { return $query->where('stock', '<=', 0); }

    public function scopeForBranch($query, string $branchId)
    {
        return $query->where(fn($q) => $q->whereNull('branch_id')->orWhere('branch_id', $branchId));
    }

    // =============================================
    // Helpers
    // =============================================

    public function isLowStock(): bool   { return $this->stock <= $this->min_stock && $this->stock > 0; }
    public function isOutOfStock(): bool { return $this->stock <= 0; }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : null;
    }

    public function getMarginAttribute(): float
    {
        if ($this->selling_price == 0) return 0;
        return round((($this->selling_price - $this->cost_price) / $this->selling_price) * 100, 2);
    }

    public function getStockStatusAttribute(): string
    {
        if ($this->isOutOfStock()) return 'out_of_stock';
        if ($this->isLowStock())   return 'low_stock';
        return 'in_stock';
    }

    public function decreaseStock(int $qty, string $type = 'sale', ?string $notes = null, ?string $referenceId = null, ?string $referenceType = null, ?string $createdBy = null): StockMovement
    {
        $before = $this->stock;
        $after  = $before - $qty;
        $this->update(['stock' => $after]);

        return StockMovement::create([
            'product_id' => $this->id, 'branch_id' => $this->branch_id,
            'type' => $type, 'qty_before' => $before, 'qty_change' => -$qty, 'qty_after' => $after,
            'notes' => $notes, 'reference_id' => $referenceId, 'reference_type' => $referenceType, 'created_by' => $createdBy,
        ]);
    }

    public function increaseStock(int $qty, string $type = 'purchase', ?string $notes = null, ?string $referenceId = null, ?string $referenceType = null, ?string $createdBy = null): StockMovement
    {
        $before = $this->stock;
        $after  = $before + $qty;
        $this->update(['stock' => $after]);

        return StockMovement::create([
            'product_id' => $this->id, 'branch_id' => $this->branch_id,
            'type' => $type, 'qty_before' => $before, 'qty_change' => $qty, 'qty_after' => $after,
            'notes' => $notes, 'reference_id' => $referenceId, 'reference_type' => $referenceType, 'created_by' => $createdBy,
        ]);
    }

    public function adjustStock(int $newQty, ?string $notes = null, ?string $createdBy = null): StockMovement
    {
        $before = $this->stock;
        $this->update(['stock' => $newQty]);

        return StockMovement::create([
            'product_id' => $this->id, 'branch_id' => $this->branch_id,
            'type' => 'adjustment', 'qty_before' => $before, 'qty_change' => $newQty - $before, 'qty_after' => $newQty,
            'notes' => $notes, 'reference_type' => 'manual', 'created_by' => $createdBy,
        ]);
    }
}