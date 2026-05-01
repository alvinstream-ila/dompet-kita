<?php

declare(strict_types=1);

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

        // 🛡️ Persist to Activity Log for UI Dashboards and Multi-Tenancy Audit
        if (function_exists('activity')) {
            $act = activity('sentinel')
                ->withProperties(array_merge($context, [
                    'level' => $level,
                    'household_id' => $context['household_id'] ?? auth()->user()->household_id ?? null,
                ]));

            if (isset($context['causer'])) {
                $causer = $context['causer'];
                if ($causer instanceof \Illuminate\Database\Eloquent\Model || is_int($causer) || is_string($causer)) {
                    $act->causedBy($causer);
                }
            }

            $act->log($message);
        }

        if (config('services.telegram.bot_token') && config('services.telegram.chat_id')) {
            return $this->sendToTelegram($payload);
        }

        return true;
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
                ->withHeaders(['User-Agent' => 'DompetKita-Sentinel/1.0 (Telegram)'])
                ->post("https://api.telegram.org/bot{$tokenStr}/sendMessage", [
                    'chat_id' => $chatIdStr,
                    'text' => $text,
                    'parse_mode' => 'HTML',
                ]);

            if (! $response->successful()) {
                $body = str_replace($tokenStr, '***HIDDEN***', $response->body());
                Log::error('Sentinel Telegram Error: '.$body);

                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::warning('Sentinel Telegram Exception: '.$e->getMessage());

            return false;
        }
    }
}
