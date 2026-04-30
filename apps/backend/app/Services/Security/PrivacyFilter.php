<?php

declare(strict_types=1);

namespace App\Services\Security;

class PrivacyFilter
{
    /**
     * Mask potential PII (Personally Identifiable Information) in a string.
     * This is a simple heuristic-based masking for AI data safety.
     */
    public function mask(string $text): string
    {
        if ($text === '' || $text === '0') {
            return $text;
        }

        // 1. Mask Email Addresses
        $maskedText = preg_replace('/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i', '[EMAIL_REDACTED]', $text);
        if (is_string($maskedText)) {
            $text = $maskedText;
        }

        // 2. Mask Potential Phone Numbers (ID/General format)
        // Matches sequences of 8+ digits, possibly with spaces/dashes
        $maskedText = preg_replace('/(\+?62|08)\d{8,11}/', '[PHONE_REDACTED]', $text);
        if (is_string($maskedText)) {
            $text = $maskedText;
        }

        // 3. Mask Credit Card / Account Numbers (12-16 digits)
        $maskedText = preg_replace('/\b\d{12,16}\b/', '[ID_NUM_REDACTED]', $text);
        if (is_string($maskedText)) {
            return $maskedText;
        }

        return $text;
    }

    /**
     * Mask PII in a collection or summary text.
     */
    public function maskSummary(string $summary): string
    {
        // Split by lines and mask each
        $lines = explode("\n", $summary);
        $maskedLines = array_map($this->mask(...), $lines);

        return implode("\n", $maskedLines);
    }
}
