<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
    ],

    'ai' => [
        'primary' => env('AI_PRIMARY_PROVIDER', 'groq'),
        'groq' => [
            'key' => env('GROQ_API_KEY'),
            'model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        ],
        'openrouter' => [
            'key' => env('OPENROUTER_API_KEY'),
            'model_text' => env('OPENROUTER_MODEL_TEXT', 'meta-llama/llama-3.3-70b-instruct:free'),
            'model_vision' => env('OPENROUTER_MODEL_VISION', 'google/gemini-flash-1.5-exp:free'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URL'),
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URL'),
    ],

    'unkey' => [
        'api_id' => env('UNKEY_API_ID'),
        'root_key' => env('UNKEY_ROOT_KEY'),
    ],

    'market' => [
        'failover' => [
            'usd_idr' => env('MARKET_FAILOVER_USD_IDR', 16950.0),
            'gold_antam' => env('MARKET_FAILOVER_GOLD_ANTAM', 2525000.0),
        ],
        'user_agent' => env('MARKET_USER_AGENT', 'DompetKita/1.0 (Family Wealth Hub; official.dompetkita@gmail.com)'),
    ],

];
