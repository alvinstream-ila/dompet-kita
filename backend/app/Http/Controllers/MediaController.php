<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MediaController extends Controller
{
    /**
     * @OA\Post(
     *     path="/media/upload",
     *     summary="Upload a file to storage",
     *     tags={"Media"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="file", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="url", type="string", example="https://example.com/receipts/abc-123.jpg"),
     *             @OA\Property(property="path", type="string", example="receipts/abc-123.jpg")
     *         )
     *     )
     * )
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,webp,pdf|max:10240', // Optimized mimes
        ]);

        try {
            $file = $request->file('file');
            $fileName = Str::random(16) . '-' . time() . '.' . $file->getClientOriginalExtension();
            $folder = 'receipts';
            $filePath = "{$folder}/{$fileName}";

            $diskName = config('filesystems.default', 'public');

            // Store using more efficient stream if possible
            Storage::disk($diskName)->putFileAs($folder, $file, $fileName, 'public');

            // Construct Public URL
            if ($diskName === 'storj') {
                $bucket = config('filesystems.disks.storj.bucket');
                $url = "https://gateway.storjshare.io/{$bucket}/{$filePath}";
            } else {
                $url = Storage::disk($diskName)->url($filePath);
                // Ensure Absolute URL if relative
                if (!str_starts_with($url, 'http')) {
                    $url = config('app.url') . (str_starts_with($url, '/') ? '' : '/') . $url;
                }
            }

            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $filePath,
            ]);

        } catch (\Exception $e) {
            Log::error('Upload failed: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah ke cloud: ' . $e->getMessage(),
            ], 500);
        }
    }
}
