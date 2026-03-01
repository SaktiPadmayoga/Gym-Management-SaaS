<?php

// app/Models/Account.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Str;

class Account extends Authenticatable
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'accounts';

    protected $fillable = [
        'name','email','password','company_name','phone','status'
    ];

    protected $hidden = ['password','remember_token'];

    public function tenants()
    {
        return $this->hasMany(Tenant::class, 'owner_id');
    }

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
        });
    }
}

