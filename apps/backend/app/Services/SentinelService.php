<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * SentinelService v7.1.18 Sovereign
 * Security Monitoring and Multi-Channel Alerting (Telegram/API).
 */
class SentinelService
{
    /**
     * Notify administrators of security events.
     *
     * @param  string  $level  info|warning|critical
     * @param  array<string, mixed>  $context
     */
    public function notify(string $message, string $level = 'info', array $context = []): bool
    {
        $payload = "[SENTINEL-v7.1.18] [{$level}] ".$message;

        Log::log($level, $payload, $context);

        if (config('services.telegram.bot_token') && config('services.telegram.chat_id')) {
            return $this->sendToTelegram($payload);
        }

        return true;
    }

    /**
     * Send message to Telegram Bot with robust timeout and retries.
     */
    private function sendToTelegram(string $text): bool
    {
        try {
            $token = config('services.telegram.bot_token');
            $chatId = config('services.telegram.chat_id');
            $tokenStr = is_string($token) ? $token : '';
            $chatIdStr = is_string($chatId) ? $chatId : '';

            $response = Http::timeout(10)
                ->retry(3, 100)
                ->post("https://api.telegram.org/bot{$tokenStr}/sendMessage", [
                    'chat_id' => $chatIdStr,
                    'text' => $text,
                    'parse_mode' => 'HTML',
                ]);

            if (! $response->successful()) {
                Log::error('Sentinel Telegram Error: '.$response->body());

                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::warning('Sentinel Telegram Exception: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Audit log a specific user action for Digital Inheritance trail.
     *
     * @param  array<string, mixed>  $data
     */
    public function auditAction(string $userId, string $action, array $data = []): void
    {
        Log::channel('audit')->info("User {$userId} action: {$action}", $data);
    }
}
