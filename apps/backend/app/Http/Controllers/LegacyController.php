<?php

namespace App\Http\Controllers;

use App\Actions\Security\DeadMansSwitch\GenerateReportAction;
use App\Actions\Security\DeadMansSwitch\RecordActivityAction;
use App\Models\LegacyVaultReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LegacyController extends Controller
{
    public function __construct(
        protected GenerateReportAction $generateReportAction,
        protected RecordActivityAction $recordActivityAction
    ) {}

    /**
     * Get the list of legacy snapshots in the vault.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $reports = LegacyVaultReport::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $reports,
        ]);
    }

    /**
     * Update Legacy Settings (Threshold & Partner).
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'legacy_threshold_months' => 'required|integer|min:1|max:60',
            'legacy_partner_name' => 'nullable|string|max:255',
            'legacy_partner_email' => 'nullable|email|max:255',
            'partner_id' => 'nullable|exists:users,id',
        ]);

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Legacy settings updated successfully.',
            'data' => $user->only(['legacy_threshold_months', 'legacy_partner_name', 'legacy_partner_email', 'partner_id']),
        ]);
    }

    /**
     * Record a heartbeat from the frontend.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        $this->recordActivityAction->execute($request->user());

        return response()->json([
            'status' => 'success',
            'last_active_at' => $request->user()->last_active_at,
        ]);
    }

    /**
     * Manually trigger a new legacy snapshot.
     */
    public function triggerSnapshot(Request $request): JsonResponse
    {
        $user = $request->user();
        $password = $request->input('password'); // Optional, encrypted with password if provided

        $filename = $this->generateReportAction->execute($user, $password);

        return response()->json([
            'status' => 'success',
            'message' => 'Legacy snapshot generated and archived.',
            'filename' => $filename,
        ]);
    }

    /**
     * Download a specific legacy report.
     */
    public function download(Request $request, $id): StreamedResponse
    {
        $user = $request->user();
        $report = LegacyVaultReport::where('user_id', $user->id)->findOrFail($id);

        return Storage::disk($report->disk)->download($report->storage_path, "Legacy_Snapshot_{$report->id}.pdf");
    }
}
