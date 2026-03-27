<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Upload a file to Object Storage.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:10240', // 10MB limit with universal image check
        ]);

        try {
            $file = $request->file('file');
            $fileName = \Illuminate\Support\Str::random(10) . '-' . time() . '.' . $file->getClientOriginalExtension();
            $filePath = "receipts/{$fileName}";

            $diskName = \config('filesystems.default', 'public');

            // Store onto current disk
            \Illuminate\Support\Facades\Storage::disk($diskName)->put($filePath, file_get_contents($file), 'public');

            // Construct Public URL
            if ($diskName === 'storj') {
                $bucket = \config('filesystems.disks.storj.bucket');
                $url = "https://gateway.storjshare.io/{$bucket}/{$filePath}";
            } else {
                $url = \Illuminate\Support\Facades\Storage::disk($diskName)->url($filePath);
                // Ensure Absolute URL if relative
                if (!str_starts_with($url, 'http')) {
                    $url = \config('app.url') . $url;
                }
            }

            return \response()->json([
                'success' => true,
                'url' => $url,
                'path' => $filePath
            ]);

        } catch (\Exception $e) {
            return \response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah ke cloud: ' . $e->getMessage()
            ], 500);
        }
    }
}
