<?php
namespace App\Http\Requests\Tenant;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        $productId = $this->route('product');
        return [
            'name'          => ['sometimes', 'string', 'max:100'],
            'sku'           => ['nullable', 'string', 'max:50', "unique:products,sku,{$productId}"],
            'category'      => ['sometimes', 'string', 'max:50'],
            'description'   => ['nullable', 'string'],
            'color'         => ['nullable', 'string', 'max:20'],
            'sort_order'    => ['nullable', 'integer', 'min:0'],
            'branch_id'     => ['nullable', 'uuid'],
            'selling_price' => ['sometimes', 'numeric', 'min:0'],
            'cost_price'    => ['nullable', 'numeric', 'min:0'],
            'currency'      => ['nullable', 'string', 'size:3'],
            'min_stock'     => ['nullable', 'integer', 'min:0'],
            'unit'          => ['nullable', 'string', 'max:20'],
            'image'         => ['nullable', 'image', 'max:2048'],
            'is_active'     => ['nullable', 'boolean'],
        ];
    }
}