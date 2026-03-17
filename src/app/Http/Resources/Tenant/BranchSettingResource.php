<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BranchSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'group'     => $this->group,
            'key'       => $this->key,
            'value'     => $this->casted_value,
            'type'      => $this->type,
            'is_public' => $this->is_public,
        ];
    }
}