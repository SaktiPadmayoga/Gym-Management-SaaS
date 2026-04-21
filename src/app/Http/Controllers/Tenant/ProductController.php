<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreProductRequest;
use App\Http\Requests\Tenant\UpdateProductRequest;
use App\Http\Resources\Tenant\ProductResource;
use App\Http\Resources\Tenant\StockMovementResource;
use App\Models\Tenant\Product;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');
        $query = Product::query();

        if ($branchId)                    $query->forBranch($branchId);
        if ($request->filled('category')) $query->where('category', $request->category);
        if ($request->filled('is_active'))$query->where('is_active', $request->boolean('is_active'));
        if ($request->boolean('low_stock'))    $query->lowStock();
        if ($request->boolean('out_of_stock')) $query->outOfStock();

        if ($request->filled('search')) {
            $query->where(fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%")
            );
        }

        $products = $query->orderBy('sort_order')->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success(ProductResource::collection($products)->response()->getData(true));
    }

    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();

        if (empty($data['branch_id'])) {
            $data['branch_id'] = $request->header('X-Branch-Id') ?? null;
        }

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products/images', 'public');
        }

        $initialStock = $data['stock'] ?? 0;
        $data['stock'] = 0; // mulai dari 0, catat via movement

        $product = Product::create($data);

        if ($initialStock > 0) {
            $product->increaseStock($initialStock, 'purchase', 'Initial stock');
        }

        return ApiResponse::success(new ProductResource($product->fresh('branch')), 'Product created successfully', 201);
    }

    public function show(string $id)
    {
        $product = Product::with('branch', 'stockMovements')->findOrFail($id);
        return ApiResponse::success(new ProductResource($product));
    }

    public function update(UpdateProductRequest $request, string $id)
    {
        $product = Product::findOrFail($id);
        $data    = $request->validated();

        if ($request->hasFile('image')) {
            if ($product->image) Storage::disk('public')->delete($product->image);
            $data['image'] = $request->file('image')->store('products/images', 'public');
        }

        $product->update($data);

        return ApiResponse::success(new ProductResource($product->fresh('branch')), 'Product updated successfully');
    }

    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);
        if ($product->image) Storage::disk('public')->delete($product->image);
        $product->delete();

        return ApiResponse::success(null, 'Product deleted successfully');
    }

    public function toggleActive(string $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);

        return ApiResponse::success(
            new ProductResource($product),
            'Product ' . ($product->is_active ? 'activated' : 'deactivated')
        );
    }

    // =============================================
    // Stock Management
    // =============================================

    public function adjustStock(Request $request, string $id)
    {
        $request->validate([
            'new_qty' => ['required', 'integer', 'min:0'],
            'notes'   => ['nullable', 'string'],
        ]);

        $product  = Product::findOrFail($id);
        $movement = $product->adjustStock($request->new_qty, $request->notes);

        return ApiResponse::success(new StockMovementResource($movement), 'Stock adjusted successfully');
    }

    public function addStock(Request $request, string $id)
    {
        $request->validate([
            'qty'   => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $product  = Product::findOrFail($id);
        $movement = $product->increaseStock($request->qty, 'purchase', $request->notes ?? 'Manual restock');

        return ApiResponse::success(new StockMovementResource($movement), 'Stock added successfully');
    }

    public function stockHistory(Request $request, string $id)
    {
        $product   = Product::findOrFail($id);
        $movements = $product->stockMovements()->paginate($request->get('per_page', 20));

        return ApiResponse::success(StockMovementResource::collection($movements)->response()->getData(true));
    }

    public function categories(Request $request)
    {
        $branchId = $request->header('X-Branch-Id');
        $categories = Product::query()
            ->when($branchId, fn($q) => $q->forBranch($branchId))
            ->where('is_active', true)
            ->distinct()->pluck('category')->sort()->values();

        return ApiResponse::success($categories);
    }
}