<?php

namespace App\Http\Controllers;

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
            $fileName = Str::random(16).'-'.time().'.'.$file->getClientOriginalExtension();
            $folder = 'receipts';
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
}
