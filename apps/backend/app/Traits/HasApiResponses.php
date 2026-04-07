<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

/**
 * Trait HasApiResponses
 * Standardizes API output format for the mobile and web clients.
 */
trait HasApiResponses
{
    /**
     * Standard success response.
     */
    protected function success(mixed $data = null, string $message = 'Operasi berhasil dilakukan! ✨', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Standard error response.
     */
    protected function error(string $message = 'Terjadi kesalahan sistem, Sayang. 🥺', int $code = 400, mixed $details = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'details' => $details,
        ], $code);
    }

    /**
     * Forbidden/Unauthorized response.
     */
    protected function forbidden(string $message = 'Kamu tidak punya akses ke data ini ya Sayang! 🙅‍♂️'): JsonResponse
    {
        return $this->error($message, 403);
    }
}
