<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassAttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'class_schedule_id' => $this->class_schedule_id,
            'status'            => $this->status,
            'booked_at'         => $this->booked_at?->format('Y-m-d H:i'),
            'attended_at'       => $this->attended_at?->format('Y-m-d H:i'),
            'cancelled_at'      => $this->cancelled_at?->format('Y-m-d H:i'),
            'notes'             => $this->notes,

            'member' => $this->whenLoaded('member', fn() => [
                'id'     => $this->member->id,
                'name'   => $this->member->name,
                'phone'  => $this->member->phone,
                'avatar' => $this->member->avatar_url,
            ]),

            'checked_in_by' => $this->whenLoaded('checkedInBy', fn() => [
                'id'   => $this->checkedInBy->id,
                'name' => $this->checkedInBy->name,
            ]),

            'schedule' => $this->whenLoaded('schedule', fn() => [
                'id'       => $this->schedule->id,
                'date'     => $this->schedule->date?->format('Y-m-d'),
                'start_at' => $this->schedule->start_at,
                'end_at'   => $this->schedule->end_at,
            ]),
        ];
    }
}