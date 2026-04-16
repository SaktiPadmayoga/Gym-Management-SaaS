<?php
// UpdateClassScheduleRequest.php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassScheduleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'instructor_id'    => ['nullable', 'uuid', 'exists:staffs,id'],
            'date'             => ['nullable', 'date'],
            'start_at'         => ['nullable', 'date_format:H:i'],
            'end_at'           => ['nullable', 'date_format:H:i'],
            'status'           => ['nullable', 'in:scheduled,ongoing,completed,cancelled'],
            'class_type'       => ['nullable', 'in:membership_only,public,private'],
            'max_capacity'     => ['nullable', 'integer', 'min:1'],
            'cancelled_reason' => ['nullable', 'string'],
            'notes'            => ['nullable', 'string'],
        ];
    }
}