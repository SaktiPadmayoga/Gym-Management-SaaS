<?php
// StoreProductRequest.php
namespace App\Http\Requests\Tenant;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:100'],
            'sku'           => ['nullable', 'string', 'max:50', 'unique:products,sku'],
            'category'      => ['required', 'string', 'max:50'],
            'description'   => ['nullable', 'string'],
            'color'         => ['nullable', 'string', 'max:20'],
            'sort_order'    => ['nullable', 'integer', 'min:0'],
            'branch_id'     => ['nullable', 'uuid'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'cost_price'    => ['nullable', 'numeric', 'min:0'],
            'currency'      => ['nullable', 'string', 'size:3'],
            'stock'         => ['nullable', 'integer', 'min:0'],
            'min_stock'     => ['nullable', 'integer', 'min:0'],
            'unit'          => ['nullable', 'string', 'max:20'],
            'image'         => ['nullable', 'image', 'max:2048'],
            'is_active'     => ['nullable', 'boolean'],
        ];
    }
}