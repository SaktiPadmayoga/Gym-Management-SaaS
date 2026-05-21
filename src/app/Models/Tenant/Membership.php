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
    // Helpers — Status Checks
    // =========================================================================

    public function isExpired(): bool
    {
        if (!$this->end_date) return false;
        return $this->end_date->isPast();
    }

    public function isFrozen(): bool
    {
        return $this->status === 'frozen';
    }

    public function hasCheckinQuota(): bool
    {
        if ($this->unlimited_checkin) return true;
        return ($this->remaining_checkin_quota ?? 0) > 0;
    }

    // =========================================================================
    // Helpers — Actions
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

    /**
     * Freeze membership.
     * Records frozen_at, sets frozen_until, changes status to 'frozen'.
     *
     * @param int $days Number of days to freeze
     * @param string|null $reason Optional notes about why the freeze was requested
     */
    public function freeze(int $days, ?string $reason = null): void
    {
        $frozenAt = now();
        $frozenUntil = $frozenAt->copy()->addDays($days);

        $this->update([
            'status'          => 'frozen',
            'frozen_at'       => $frozenAt->toDateString(),
            'frozen_until'    => $frozenUntil->toDateString(),
            'freeze_days_used' => ($this->freeze_days_used ?? 0) + $days,
            'notes'           => $reason ?? $this->notes,
        ]);
    }

    /**
     * Unfreeze membership.
     * Calculates actual frozen days and extends end_date accordingly.
     * This compensates the member for the time lost during freeze.
     */
    public function unfreeze(): void
    {
        $actualFrozenDays = 0;

        if ($this->frozen_at) {
            $frozenAt = \Illuminate\Support\Carbon::parse($this->frozen_at);
            $actualFrozenDays = $frozenAt->diffInDays(now());
        }

        // Extend end_date by the number of days the membership was actually frozen
        $newEndDate = $this->end_date;
        if ($newEndDate && $actualFrozenDays > 0) {
            $newEndDate = \Illuminate\Support\Carbon::parse($this->end_date)
                ->addDays($actualFrozenDays)
                ->toDateString();
        }

        $this->update([
            'status'       => 'active',
            'frozen_at'    => null,
            'frozen_until' => null,
            'end_date'     => $newEndDate,
        ]);
    }
}