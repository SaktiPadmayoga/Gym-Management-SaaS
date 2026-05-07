<?php

namespace App\Support;

use Throwable;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class ErrorResolver
{
    public static function resolve(Throwable $e): string
    {
        // DB error
        if ($e instanceof QueryException) {
            if (str_contains($e->getMessage(), 'Duplicate')) {
                return 'Data sudah digunakan (email / slug sudah terdaftar)';
            }
            return 'Terjadi kesalahan database';
        }

        // Validation
        if ($e instanceof ValidationException) {
            return collect($e->errors())->flatten()->first();
        }

        // Default
        return app()->isLocal()
            ? $e->getMessage()
            : 'Terjadi kesalahan pada server';
    }
}