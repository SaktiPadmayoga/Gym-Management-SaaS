<?php

namespace App\Models\Tenant;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class StaffBranch extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'staff_branches';

    protected $fillable = [
        'staff_id',
        'branch_id',
        'role',
        'is_active',
        'joined_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'joined_at' => 'datetime',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}
