<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;

class CustomPersonalAccessToken extends SanctumToken
{
    // Paksa pakai connection central selalu
    protected $connection = 'central'; 
        protected $table = 'personal_access_tokens'; // nama tabel yang benar

}