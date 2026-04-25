<?php

namespace App\Http\Controllers;

use App\Actions\Security\DeadMansSwitch\GenerateReportAction;
use App\Actions\Security\DeadMansSwitch\RecordActivityAction;
use App\Models\LegacyVaultReport;
use App\Models\User;
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
        /** @var User $user */
        $user = $request->user() ?? abort(401);

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
        /** @var User $user */
        $user = $request->user() ?? abort(401);

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
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $this->recordActivityAction->execute($user);

        return response()->json([
            'status' => 'success',
            'last_active_at' => $user->last_active_at?->toIso8601String(),
        ]);
    }

    /**
     * Manually trigger a new legacy snapshot.
     */
    public function triggerSnapshot(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);
        $password = (string) $request->input('password', '');

        $result = $this->generateReportAction->execute($user, $password ?: null);
        $filename = (string) $result['filename'];

        return response()->json([
            'status' => 'success',
            'message' => 'Legacy snapshot generated and archived.',
            'filename' => $filename,
        ]);
    }

    /**
     * Download a specific legacy report.
     */
    public function download(Request $request, string|int $id): StreamedResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $report = LegacyVaultReport::where('user_id', $user->id)->findOrFail($id);

        return Storage::disk($report->disk)->download($report->storage_path, "Legacy_Snapshot_{$report->id}.pdf");
    }

    /**
     * Generate and stream a new legacy report directly.
     */
    public function generateStream(Request $request): StreamedResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        return response()->streamDownload(function () use ($user) {
            $result = $this->generateReportAction->execute($user);
            $filename = (string) $result['filename'];

            // Generate the output again but stream it directly to avoid extra disk reads
            // Note: GenerateReportAction already saved it to Storj.
            // For immediate download, we can read it back or use the action result.
            echo Storage::disk('storj')->get($filename);
        }, "Legacy_Report_{$user->name}_{$user->id}.pdf", [
            'Content-Type' => 'application/pdf',
        ]);
    }
}
