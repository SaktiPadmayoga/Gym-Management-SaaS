<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BranchSetting extends Model
{
    use HasUuids;

    protected $table = 'branch_settings';

    protected $fillable = [
        'branch_id',
        'group',
        'key',
        'value',
        'type',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    // =============================================
    // Cast value sesuai type
    // =============================================

    public function getCastedValueAttribute(): mixed
    {
        return match ($this->type) {
            'boolean' => $this->value === 'true' || $this->value === '1',
            'integer' => (int) $this->value,
            'json'    => json_decode($this->value, true),
            default   => $this->value,
        };
    }

    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    public function branchSettings()
    {
        return $this->hasMany(BranchSetting::class, 'branch_id');
    }

    /**
     * Ambil value setting berdasarkan key
     */
    public function setting(string $key, mixed $default = null): mixed
    {
        $setting = $this->branchSettings->firstWhere('key', $key);
        if (!$setting) return $default;

        return $setting->casted_value;
    }

    /**
     * Set/update satu setting
     */
    public function setSetting(string $key, mixed $value, string $group = 'business', string $type = 'string', bool $isPublic = false): void
    {
        $this->branchSettings()->updateOrCreate(
            ['key' => $key],
            [
                'group'     => $group,
                'value'     => is_array($value) ? json_encode($value) : (string) $value,
                'type'      => $type,
                'is_public' => $isPublic,
            ]
        );
    }

    /**
     * Ambil semua setting dalam group tertentu
     */
    public function settingsByGroup(string $group): Collection
    {
        return $this->branchSettings
            ->where('group', $group)
            ->mapWithKeys(fn($s) => [$s->key => $s->casted_value]);
    }

    /**
     * Ambil semua setting sebagai flat key-value
     */
    public function allSettings(): Collection
    {
        return $this->branchSettings
            ->mapWithKeys(fn($s) => [$s->key => $s->casted_value]);
    }
}