<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * @OA\Post(
     *     path="/media/upload",
     *     summary="Upload a file to storage securely (Private by default)",
     *     tags={"Media"},
     *     security={{"sanctum":{}}},
     *
     *     @OA\RequestBody(
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *
     *             @OA\Schema(
     *
     *                 @OA\Property(property="file", type="string", format="binary")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="url", type="string", description="Temporary Signed URL"),
     *             @OA\Property(property="path", type="string", example="receipts/abc-123.jpg")
     *         )
     *     )
     * )
     */
    public function upload(Request $request): JsonResponse
    {
        // 🛡️ Strict Validation: Only allow professional formats and limit to 10MB
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,webp,pdf|max:10240', // NOSONAR: 10MB is required and safe for documents
        ]);

        try {
            $file = $request->file('file');
            $extension = $file->extension(); // 🛡️ Guessed by server based on MIME
            $fileName = Str::random(32).'-'.time().'.'.$extension;
            /** @var User $user */
            $user = $request->user();
            $householdId = (string) ($user->household_id ?? $user->id);
            // 🛡️ Sanitize householdId for path safety
            $householdId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $householdId);
            
            $folder = "receipts/{$householdId}";
            $filePath = "{$folder}/{$fileName}";

            // Default to 'storj' (high reliability) if available, otherwise fallback to local/public
            $diskName = (string) (config('filesystems.disks.storj.key') ? 'storj' : config('filesystems.default', 'public'));

            // ⛔ SECURITY FIX: Set visibility to 'private' (default for secure apps)
            // We use putFileAs with 'private' to ensure the cloud bucket doesn't expose it
            Storage::disk($diskName)->putFileAs($folder, $file, $fileName, 'private');

            // 🔑 Generate dynamic signed URL for immediate frontend preview (Valid for 15 minutes)
            try {
                $url = Storage::disk($diskName)->temporaryUrl($filePath, now()->addMinutes(15));
            } catch (\Exception $e) {
                // Fallback for disks that don't support temporary URLs (e.g. local)
                $url = Storage::disk($diskName)->url($filePath);
            }

            return response()->json([
                'success' => true,
                'path' => $filePath, // Root path to save in Database
                'url' => $url,       // Temporary URL to display in Frontend
                'disk' => $diskName,
            ]);
        } catch (\Exception $e) {
            Log::error('🛡️ Security Leak Prevented / Upload failed: '.$e->getMessage(), [
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah aman: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Serve a protected file.
     * This method is called via a signed URL to prevent unauthorized access.
     */
    public function serve(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\Response
    {
        // 🛡️ Signed URL Verification is handled by middleware, but we double-check path integrity
        $path = (string) $request->query('path');
        if (! $path || str_contains($path, '..')) {
            abort(404);
        }

        /** @var User $user */
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        // 🛡️ Sovereign Multi-Tenancy check: Ensure the path belongs to the user's household
        $householdId = (string) ($user->household_id ?? $user->id);
        $householdId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $householdId);

        // Files are stored in 'receipts/{householdId}/{filename}'
        if (! str_starts_with($path, "receipts/{$householdId}/")) {
            // Log attempt to access file from another household
            Log::warning('🛡️ Unauthorized Media Access Attempt', [
                'user_id' => $user->id,
                'attempted_path' => $path,
                'household_id' => $householdId,
                'ip' => $request->ip(),
            ]);
            abort(403, 'Akses ditolak: File ini bukan milik Household Anda.');
        }

        $diskName = (string) (config('filesystems.disks.storj.key') ? 'storj' : config('filesystems.default', 'public'));
        
        if (! Storage::disk($diskName)->exists($path)) {
            abort(404);
        }

        return Storage::disk($diskName)->response($path);
    }
}
