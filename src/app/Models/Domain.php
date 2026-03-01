<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Domain extends Model
{
    use HasFactory;
    protected $connection = 'central';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'tenant_id',
        'branch_id',
        'domain',
        'type',
        'is_primary',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }


}
