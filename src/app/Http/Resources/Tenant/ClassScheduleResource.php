<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $effectiveCapacity = $this->max_capacity ?? $this->classPlan?->max_capacity;
        $availableSlots    = $effectiveCapacity ? max(0, $effectiveCapacity - $this->total_booked) : null;

        return [
            'id'               => $this->id,
            'date'             => $this->date?->format('Y-m-d'),
            'start_at'         => $this->start_at,
            'end_at'           => $this->end_at,
            'status'           => $this->status,
            'class_type'       => $this->class_type,
            'max_capacity'     => $effectiveCapacity,
            'available_slots'  => $availableSlots,
            'total_booked'     => $this->total_booked,
            'total_attended'   => $this->total_attended,
            'cancelled_reason' => $this->cancelled_reason,
            'notes'            => $this->notes,
            'is_full'          => $availableSlots !== null && $availableSlots <= 0,
            'is_bookable'      => $this->isBookableByMember(),

            'class_plan' => $this->whenLoaded('classPlan', fn() => [
                'id'                 => $this->classPlan->id,
                'name'               => $this->classPlan->name,
                'category'           => $this->classPlan->category,
                'color'              => $this->classPlan->color,
                'minutes_per_session'=> $this->classPlan->minutes_per_session,
                'duration_label'     => $this->classPlan->duration_label,
                'price'              => (float) $this->classPlan->price,
            ]),

            'instructor' => $this->whenLoaded('instructor', fn() => [
                'id'   => $this->instructor->id,
                'name' => $this->instructor->name,
            ]),

            'branch' => $this->whenLoaded('branch', fn() => [
                'id'   => $this->branch->id,
                'name' => $this->branch->name,
            ]),

            'attendances' => $this->whenLoaded('attendances',
                fn() => ClassAttendanceResource::collection($this->attendances)
            ),

            'created_at' => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}