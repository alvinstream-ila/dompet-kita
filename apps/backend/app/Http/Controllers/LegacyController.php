<?php

declare(strict_types=1);

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
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        $reports = LegacyVaultReport::query()
            ->where('household_id', $user->household_id)
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
        if (!$user instanceof User) {
            abort(401);
        }

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
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

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
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }
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
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        /** @var LegacyVaultReport $report */
        $report = LegacyVaultReport::query()
            ->where('household_id', $user->household_id)
            ->findOrFail((int) $id);

        $obscuredName = 'Legacy_Snapshot_' . substr(hash('sha256', (string)$report->id), 0, 12) . '.pdf';

        return Storage::disk($report->disk)->download($report->storage_path, $obscuredName);
    }

    /**
     * Generate and stream a new legacy report directly.
     */
    public function generateStream(Request $request): StreamedResponse
    {
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        return response()->streamDownload(function () use ($user): void {
            $result = $this->generateReportAction->execute($user);
            $filename = (string) $result['filename'];

            $stream = Storage::disk('storj')->readStream($filename);
            if ($stream) {
                fpassthru($stream);
                if (is_resource($stream)) {
                    fclose($stream);
                }
            }
        }, "Legacy_Financial_Archive.pdf", [
            'Content-Type' => 'application/pdf',
        ]);
    }
}
