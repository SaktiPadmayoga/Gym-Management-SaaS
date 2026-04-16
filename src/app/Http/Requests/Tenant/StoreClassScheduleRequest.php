<?php
// StoreClassScheduleRequest.php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassScheduleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'class_plan_id'  => ['required', 'uuid', 'exists:class_plans,id'],
            'instructor_id'  => ['required', 'uuid', 'exists:staffs,id'],
            'date'           => ['required', 'date', 'after_or_equal:today'],
            'start_at'       => ['required', 'date_format:H:i'],
            'end_at'         => ['required', 'date_format:H:i', 'after:start_at'],
            'class_type'     => ['nullable', 'in:membership_only,public,private'],
            'max_capacity'   => ['nullable', 'integer', 'min:1'],
            'notes'          => ['nullable', 'string'],
        ];
    }
}