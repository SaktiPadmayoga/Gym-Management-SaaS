<?php

namespace App\Models\Tenant;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantNotification extends Model
{
    protected $connection = 'tenant'; 

    protected $fillable = [
        'id',
        'branch_id',
        'staff_id',
        'type',
        'title',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'id' => 'string'
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    // Relasi ke tabel cabang (Agar Owner bisa melihat notif ini dari cabang mana)
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    // Relasi ke pembuat aksi (Opsional)
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }
}