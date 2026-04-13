<?php

namespace App\Http\Controllers;

use App\Actions\Security\DeadMansSwitch\GenerateReportAction;
use App\Actions\Security\DeadMansSwitch\PrepareArchiveAction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LegacyController extends Controller
{
    public function __construct(
        protected GenerateReportAction $generateReportAction,
        protected PrepareArchiveAction $prepareArchiveAction
    ) {}

    /**
     * Get the digital legacy report summary.
     */
    public function getReport(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $reportData = $this->generateReportAction->execute($user);

        return response()->json([
            'status' => 'success',
            'data' => $reportData,
            'message' => 'Laporan warisan digital berhasil dibuat.',
        ]);
    }

    /**
     * Prepare full archive (Documents & Transactions).
     */
    public function prepareArchive(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }
        $message = $this->prepareArchiveAction->execute($user);

        return response()->json([
            'status' => 'success',
            'message' => $message,
        ]);
    }
}
