<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Services\AI\AiProviderManager;
use Illuminate\Http\Request;

class AiMaintenanceController extends Controller
{
    public function reset(AiProviderManager $manager)
    {
        try {
            $manager->forceReset();
            
            return response()->json([
                'status' => 'Success',
                'message' => 'AI Provider quarantine and failure states have been cleared in production cache.',
                'timestamp' => now()->toDateTimeString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'Error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
