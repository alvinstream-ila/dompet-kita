<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Upload a file to Storj Object Storage.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB limit with MIME type check
        ]);

        try {
            $file = $request->file('file');
            $fileName = Str::random(10) . '-' . time() . '.' . $file->getClientOriginalExtension();
            $filePath = "receipts/{$fileName}";

            // Store onto 'storj' disk
            Storage::disk('storj')->put($filePath, file_get_contents($file), 'public');

            // Construct Storj Public URL
            $bucket = config('filesystems.disks.storj.bucket');
            $url = "https://gateway.storjshare.io/{$bucket}/{$filePath}";

            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $filePath
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah ke cloud: ' . $e->getMessage()
            ], 500);
        }
    }
}
