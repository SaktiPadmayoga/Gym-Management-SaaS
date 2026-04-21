<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class MembershipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'member_id'               => $this->member_id,
            'membership_plan_id'      => $this->membership_plan_id,
            'branch_id'               => $this->branch_id,

            // Informasi Utama
            'start_date'              => $this->start_date?->format('Y-m-d'),
            'end_date'                => $this->end_date?->format('Y-m-d'),
            'status'                  => $this->status,
            
            // Label yang lebih user-friendly untuk dashboard
            'status_label'            => $this->getStatusLabel(),
            'status_color'            => $this->getStatusColor(),

            'unlimited_checkin'       => $this->unlimited_checkin,
            'remaining_checkin_quota' => $this->remaining_checkin_quota,
            'total_checkins'          => $this->total_checkins ?? 0,

            'frozen_until'            => $this->frozen_until?->format('Y-m-d'),
            'notes'                   => $this->notes,

            // Informasi Waktu
            'created_at'              => $this->created_at?->format('Y-m-d H:i'),
            'days_remaining'          => $this->daysUntilExpiry(),           // ← Sangat penting untuk dashboard
            'is_expired'              => $this->isExpired(),
            'is_frozen'               => $this->isFrozen(),

            // Relasi (load minimal yang dibutuhkan dashboard)
            'member' => $this->whenLoaded('member', function () {
                return [
                    'id'    => $this->member->id,
                    'name'  => $this->member->name,
                    'email' => $this->member->email,
                    'phone' => $this->member->phone,
                    'avatar'=> $this->member->avatar ? Storage::url($this->member->avatar) : null,
                ];
            }),

            'plan' => $this->whenLoaded('plan', function () {
                return [
                    'id'              => $this->plan->id,
                    'name'            => $this->plan->name,
                    'duration'        => $this->plan->duration,
                    'duration_unit'   => $this->plan->duration_unit,
                    'price'           => $this->plan->price,
                    'unlimited_checkin' => $this->plan->unlimited_checkin,
                ];
            }),

            'branch' => $this->whenLoaded('branch', function () {
                return [
                    'id'   => $this->branch->id,
                    'name' => $this->branch->name,
                ];
            }),
        ];
    }

    /**
     * Helper untuk label status yang lebih mudah dibaca di frontend
     */
    private function getStatusLabel(): string
    {
        return match($this->status) {
            'active'    => 'Aktif',
            'expired'   => 'Kadaluarsa',
            'frozen'    => 'Dibekukan',
            'cancelled' => 'Dibatalkan',
            default     => ucfirst($this->status),
        };
    }

    /**
     * Helper untuk warna status di dashboard (Tailwind / DaisyUI)
     */
    private function getStatusColor(): string
    {
        return match($this->status) {
            'active'    => 'success',
            'expired'   => 'error',
            'frozen'    => 'warning',
            'cancelled' => 'ghost',
            default     => 'info',
        };
    }
        public function daysUntilExpiry()
    {
        if (!$this->end_date) return null;
        
        $end = Carbon::parse($this->end_date)->startOfDay();
        $today = Carbon::now()->startOfDay();
        
        return (int) $today->diffInDays($end, false); // false agar bisa menghasilkan angka negatif jika sudah lewat
    }
    public function isExpired()
    {
        if (!$this->end_date) return false;
        return Carbon::parse($this->end_date)->isPast();
    }   
    public function isFrozen()
    {
        return $this->status === 'frozen';
    }   
}