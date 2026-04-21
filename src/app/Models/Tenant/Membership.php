<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Membership extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'member_id',
        'membership_plan_id',
        'branch_id',
        'last_transaction_id',
        'tenant_invoice_id',
        'start_date',
        'end_date',
        'status',
        'unlimited_checkin',
        'remaining_checkin_quota',
        'total_checkins',
        'frozen_at',
        'frozen_until',
        'freeze_days_used',
        'notes',
    ];

    protected $casts = [
        'start_date'              => 'date',
        'end_date'                => 'date',
        'frozen_at'               => 'date',
        'frozen_until'            => 'date',
        'unlimited_checkin'       => 'boolean',
        'remaining_checkin_quota' => 'integer',
        'total_checkins'          => 'integer',
        'freeze_days_used'        => 'integer',
    ];

    // =========================================================================
    // Relations
    // =========================================================================

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class, 'membership_plan_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Branch::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(TenantInvoice::class, 'tenant_invoice_id');
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    public function activate(?\DateTimeInterface $startDate = null): void
    {
        $plan = $this->plan;

        if (!$plan) {
            throw new \Exception("Plan tidak ditemukan untuk membership {$this->id}");
        }

        $start = $startDate
            ? \Illuminate\Support\Carbon::instance($startDate)
            : now();

        // 🔥 HITUNG BERDASARKAN UNIT
        $end = match ($plan->duration_unit) {
            'day'   => $start->copy()->addDays($plan->duration),
            'week'  => $start->copy()->addWeeks($plan->duration),
            'month' => $start->copy()->addMonths($plan->duration),
            'year'  => $start->copy()->addYears($plan->duration),
            default => $start->copy()->addDays($plan->duration ?? 30),
        };

        $this->update([
            'status'     => 'active',
            'start_date' => $start->toDateString(),
            'end_date'   => $end->toDateString(),
        ]);
    }
}