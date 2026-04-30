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
    private const string IMAGE_JPEG = 'image/jpeg';

    private const string USER_AGENT = 'DompetKita-Storage/1.0';

    /**
     * Get base64 data and mime type from request params.
     *
     * @return array{0: string, 1: string}
     */
    public function getFileDataFromRequest(): array
    {
        /** @var array<string, mixed> $requestData */
        $requestData = (array) \Illuminate\Support\Facades\Request::input();
        $filePath = is_string($requestData['receipt_path'] ?? null) ? $requestData['receipt_path'] : null;
        $fileContents = null;

        if (! $filePath && ! empty($requestData['receipt_url'])) {
            $receiptUrl = $requestData['receipt_url'];
            if (is_string($receiptUrl)) {
                $filePath = $this->tryExtractPathFromUrl($receiptUrl);
            }
        }

        if ($filePath) {
            $fileContents = $this->tryReadFromDisk($filePath);
        }

        if (! $fileContents && ! empty($requestData['receipt_url'])) {
            $receiptUrl = $requestData['receipt_url'];
            if (is_string($receiptUrl)) {
                $fileContents = $this->tryDownloadFromUrl($receiptUrl);
            }
        }

        if (! $fileContents) {
            throw new FileStorageException('Gagal membaca file dari server storage maupun URL eksternal.');
        }

        $finalReceiptUrl = $requestData['receipt_url'] ?? null;

        return $this->formatFileData($fileContents, $filePath, is_string($finalReceiptUrl) ? $finalReceiptUrl : null);
    }

    private function tryExtractPathFromUrl(string $url): ?string
    {
        if (str_contains($url, 'gateway.storjshare.io')) {
            $bucket = config('filesystems.disks.storj.bucket');
            $bucketStr = is_string($bucket) ? $bucket : '';

            return str_replace("https://gateway.storjshare.io/{$bucketStr}/", '', $url);
        }

        return null;
    }

    private function tryReadFromDisk(string $path): ?string
    {
        $disk = config('filesystems.disks.storj.key') ? 'storj' : config('filesystems.default', 'local');
        $diskStr = is_string($disk) ? $disk : 'local';

        try {
            return Storage::disk($diskStr)->get($path);
        } catch (\Exception $e) {
            Log::warning("🛡️ Storage Read Failed via disk {$diskStr}: ".$e->getMessage());

            return null;
        }
    }

    private function tryDownloadFromUrl(string $url): ?string
    {
        /** @var string|null $parsedHost */
        $parsedHost = parse_url($url, PHP_URL_HOST);
        $appUrl = config('app.url');
        $appUrlStr = is_string($appUrl) ? $appUrl : 'http://localhost';
        $safeHosts = ['localhost', '127.0.0.1', 'gateway.storjshare.io', parse_url($appUrlStr, PHP_URL_HOST)];

        if (! in_array($parsedHost, array_filter($safeHosts), true)) {
            $hostStr = is_string($parsedHost) ? $parsedHost : 'unknown';
            Log::warning("🛡️ SSRF BLOCKED: Domain {$hostStr} is not whitelisted.");

            return null;
        }

        try {
            // Hardened HTTP Client with Identity and Timeout
            $response = Http::withHeaders([
                'User-Agent' => self::USER_AGENT,
                'Accept' => 'image/*,application/pdf',
            ])
                ->timeout(15)
                ->retry(2, 500)
                ->get($url);

            return $response->successful() ? $response->body() : null;
        } catch (\Exception $e) {
            Log::warning('🛡️ Media Download Failed: '.$e->getMessage(), ['url' => $url]);

            return null;
        }
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function formatFileData(string $content, ?string $path, ?string $url): array
    {
        $base64Data = base64_encode($content);

        // 🛡️ High-Reliability MIME Detection
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $detectedMime = $finfo->buffer($content);

        if ($detectedMime && $detectedMime !== 'application/octet-stream') {
            return [$base64Data, $detectedMime];
        }

        // Fallback to extension-based detection
        $reference = $path ?: $url;
        $urlPath = parse_url((string) $reference, PHP_URL_PATH);
        $ext = strtolower(pathinfo((string) $urlPath, PATHINFO_EXTENSION));

        $mimeType = match ($ext) {
            'png' => 'image/png',
            'webp' => 'image/webp',
            'heic' => 'image/heic',
            'heif' => 'image/heif',
            'pdf' => 'application/pdf',
            'jpg', 'jpeg' => self::IMAGE_JPEG,
            default => self::IMAGE_JPEG
        };

        return [$base64Data, $mimeType];
    }
}
