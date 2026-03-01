<?php
// app/Http/Responses/ApiResponse.php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    /**
     * Success response with data
     */
    public static function success(
        $data = null,
        $message = 'Success',
        $meta = null,
        $statusCode = 200
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => $meta,
        ], $statusCode);
    }

    /**
     * Error response
     */
    public static function error(
        $message = 'Error',
        $errors = null,
        $statusCode = 400
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $statusCode);
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