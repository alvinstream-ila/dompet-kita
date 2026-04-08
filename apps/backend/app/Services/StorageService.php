<?php

namespace App\Services;

use App\Exceptions\FileStorageException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Service StorageService
 * Handles remote and local file retrieval with security guards.
 */
class StorageService
{
    private const IMAGE_JPEG = 'image/jpeg';

    /**
     * Get base64 data and mime type from request params.
     *
     * @return array{0: string, 1: string}
     */
    public function getFileDataFromRequest(Request $request): array
    {
        $filePath = $request->receipt_path;
        $fileContents = null;

        if (! $filePath && $request->filled('receipt_url')) {
            $filePath = $this->tryExtractPathFromUrl($request->receipt_url);
        }

        if ($filePath) {
            $fileContents = $this->tryReadFromDisk($filePath);
        }

        if (! $fileContents && $request->filled('receipt_url')) {
            $fileContents = $this->tryDownloadFromUrl($request->receipt_url);
        }

        if (! $fileContents) {
            throw new FileStorageException('Gagal membaca file dari server storage maupun URL eksternal.');
        }

        return $this->formatFileData($fileContents, $filePath, $request->receipt_url);
    }

    private function tryExtractPathFromUrl(string $url): ?string
    {
        if (str_contains($url, 'gateway.storjshare.io')) {
            $bucket = config('filesystems.disks.storj.bucket');

            return str_replace("https://gateway.storjshare.io/{$bucket}/", '', $url);
        }

        return null;
    }

    private function tryReadFromDisk(string $path): ?string
    {
        $disk = config('filesystems.disks.storj.key') ? 'storj' : config('filesystems.default', 'public');
        try {
            return Storage::disk($disk)->get($path);
        } catch (\Exception $e) {
            Log::warning("Gagal baca via disk {$disk}: ".$e->getMessage());

            return null;
        }
    }

    private function tryDownloadFromUrl(string $url): ?string
    {
        $parsedHost = parse_url($url, PHP_URL_HOST);
        $safeHosts = ['localhost', '127.0.0.1', 'gateway.storjshare.io', parse_url(config('app.url'), PHP_URL_HOST)];

        if (! in_array($parsedHost, array_filter($safeHosts))) {
            Log::warning("SSRF BLOCKED: Domain $parsedHost bukan whitelist.");

            return null;
        }

        try {
            $response = Http::timeout(10)->get($url);

            return $response->successful() ? $response->body() : null;
        } catch (\Exception $e) {
            Log::warning('Gagal download receipt_url: '.$e->getMessage());

            return null;
        }
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function formatFileData(string $content, ?string $path, ?string $url): array
    {
        $base64Data = base64_encode($content);
        $reference = $path ?: $url;
        $urlPath = parse_url((string) $reference, PHP_URL_PATH);
        $ext = strtolower(pathinfo((string) $urlPath, PATHINFO_EXTENSION));

        $mimeType = match ($ext) {
            'png' => 'image/png',
            'webp' => 'image/webp',
            'heic' => 'image/heic',
            'heif' => 'image/heif',
            'jpg', 'jpeg' => self::IMAGE_JPEG,
            default => self::IMAGE_JPEG
        };

        return [$base64Data, $mimeType];
    }
}
