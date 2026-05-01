<?php

declare(strict_types=1);

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Services\AI\AiProviderManager;
use Illuminate\Http\JsonResponse;

class AiMaintenanceController extends Controller
{
    public function reset(AiProviderManager $manager): JsonResponse
    {
        try {
            $manager->forceReset();

            return response()->json([
                'status' => 'Success',
                'message' => 'AI Provider quarantine and failure states have been cleared in production cache.',
                'timestamp' => now()->toDateTimeString(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'Error',
                'message' => $e->getMessage(),
                'trace' => substr($e->getTraceAsString(), 0, 500),
            ], 500);
        }
    }
}
