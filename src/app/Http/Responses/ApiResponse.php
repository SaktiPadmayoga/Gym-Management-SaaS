<?php
// app/Http/Responses/ApiResponse.php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    /**
     * Success response with data
     */
    public static function success($data = null, string $message = 'Success', $meta = null, int $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => $meta,
        ], $code);
    }

    public static function error(string $message = 'Error', $error = null, int $code = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $error,
        ], $code);
    }

    /**
     * Paginated response helper
     */
    public static function paginated(
       
        $total,
        $perPage,
        $currentPage,
        $lastPage
    ): array {
        return [
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $currentPage,
            'last_page' => $lastPage,
        ];
    }
}