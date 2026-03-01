<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TenantDatabase extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'tenant_id',
        'db_host',
        'db_port',
        'db_name',
        'db_username',
        'db_password',
        'status',
        'last_checked_at',
    ];

    protected $dates = [
        'last_checked_at',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
