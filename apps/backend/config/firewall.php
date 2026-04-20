<?php

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  🛡️ DOMPET KITA — INTERNAL FIREWALL CONFIGURATION                      │
 * │  Sovereign Security Fortress v7.1.18                                   │
 * │  Layer 3: Internal Guard (akaunting/laravel-firewall)                  │
 * │                                                                         │
 * │  Threat Coverage: SQLi, XSS, LFI, RFI, PHP Stream Wrappers,           │
 * │  Session Injection, Malicious Bots.                                    │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

return [

    'enabled' => env('FIREWALL_ENABLED', true),

    'whitelist' => array_filter(explode(',', env('FIREWALL_WHITELIST', '127.0.0.1'))),

    'models' => [
        'user' => '\App\Models\User',
        // Logging to DB currently disabled — relying on Sentry for observability.
        // 'log' => '\App\Models\FirewallLog',
        // 'ip'  => '\App\Models\FirewallIp',
    ],

    'responses' => [

        'block' => [
            'view' => null,
            'redirect' => null,
            'abort' => false,
            'code' => env('FIREWALL_BLOCK_CODE', 403),
        ],

    ],

    'notifications' => [

        'mail' => [
            'enabled' => env('FIREWALL_EMAIL_ENABLED', false),
            'name' => env('FIREWALL_EMAIL_NAME', 'Dompet Kita Firewall'),
            'from' => env('FIREWALL_EMAIL_FROM', 'official.dompetkita@gmail.com'),
            'to' => env('FIREWALL_EMAIL_TO', 'official.dompetkita@gmail.com'),
        ],

        'slack' => [
            'enabled' => env('FIREWALL_SLACK_ENABLED', false),
            'emoji' => ':shield:',
            'from' => env('FIREWALL_SLACK_FROM', 'Dompet Kita Firewall'),
            'to' => env('FIREWALL_SLACK_TO', null),
            'channel' => env('FIREWALL_SLACK_CHANNEL', null),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Active Middleware Stack (used with 'firewall.all' group)
    |--------------------------------------------------------------------------
    | For a JSON API, we skip: geo (no GeoIP service), session, referrer, swear.
    | We keep the high-value attack detection guards: sqli, xss, lfi, rfi, php, bot.
    */
    'all_middleware' => [
        'firewall.ip',
        'firewall.bot',
        'firewall.lfi',
        'firewall.php',
        'firewall.rfi',
        'firewall.sqli',
        'firewall.xss',
    ],

    'middleware' => [

        'ip' => [
            'methods' => ['all'],
            'routes' => [
                'only' => [],
                'except' => [],
            ],
        ],

        'agent' => [
            'methods' => ['all'],
            'routes' => ['only' => [], 'except' => []],
            'browsers' => ['allow' => [], 'block' => []],
            'platforms' => ['allow' => [], 'block' => []],
            'devices' => ['allow' => [], 'block' => []],
            'properties' => ['allow' => [], 'block' => []],
            'auto_block' => [
                'attempts' => 10,
                'frequency' => 1 * 60,
                'period' => 30 * 60,
            ],
        ],

        'bot' => [
            'methods' => ['all'],
            'routes' => ['only' => [], 'except' => []],
            'crawlers' => [
                'allow' => ['Googlebot', 'bingbot', 'DotBot', 'GuzzleHttp'],
                'block' => [],
            ],
            'auto_block' => [
                'attempts' => 5,
                'frequency' => 1 * 60,
                'period' => 30 * 60,
            ],
        ],

        'geo' => [
            'methods' => ['all'],
            'routes' => ['only' => [], 'except' => []],
            'continents' => ['allow' => [], 'block' => []],
            'regions' => ['allow' => [], 'block' => []],
            'countries' => ['allow' => [], 'block' => []],
            'cities' => ['allow' => [], 'block' => []],
            'service' => 'ipapi',
            'auto_block' => [
                'attempts' => 3,
                'frequency' => 5 * 60,
                'period' => 30 * 60,
            ],
        ],

        /*
        |----------------------------------------------------------------------
        | LFI: Local File Inclusion Detection
        | Covers: path traversal patterns like ../../etc/passwd
        |----------------------------------------------------------------------
        */
        'lfi' => [
            'methods' => ['get', 'post', 'put', 'patch', 'delete'],
            'inputs' => [
                'only' => [],
                'except' => ['password', 'password_confirmation', 'current_password'],
            ],
            'routes' => [
                'only' => [],
                'except' => ['api/auth/*'],
            ],
            'patterns' => [
                '#\.\./#is',
                '#\.\.\\\#is',
                '#%2e%2e%2f#is',
                '#%2e%2e/#is',
                '#\.\.%2f#is',
            ],
            'auto_block' => [
                'attempts' => 2,
                'frequency' => 5 * 60,
                'period' => 60 * 60,
            ],
        ],

        'login' => [
            'enabled' => true,
            'auto_block' => [
                'attempts' => 5,
                'frequency' => 1 * 60,
                'period' => 30 * 60,
            ],
        ],

        /*
        |----------------------------------------------------------------------
        | PHP Stream Wrapper Detection
        | Covers: php://, phar://, zip://, bzip2://, etc.
        |----------------------------------------------------------------------
        */
        'php' => [
            'methods' => ['get', 'post', 'put', 'patch', 'delete'],
            'inputs' => [
                'only' => [],
                'except' => ['password', 'password_confirmation', 'current_password'],
            ],
            'routes' => [
                'only' => [],
                'except' => ['api/auth/*'],
            ],
            'patterns' => [
                'bzip2://',
                'expect://',
                'glob://',
                'phar://',
                'php://',
                'ogg://',
                'rar://',
                'ssh2://',
                'zip://',
                'zlib://',
                'data://',
                'file://',
            ],
            'auto_block' => [
                'attempts' => 2,
                'frequency' => 5 * 60,
                'period' => 60 * 60,
            ],
        ],

        'referrer' => [
            'methods' => ['all'],
            'routes' => ['only' => [], 'except' => []],
            'blocked' => [],
            'auto_block' => [
                'attempts' => 3,
                'frequency' => 5 * 60,
                'period' => 30 * 60,
            ],
        ],

        /*
        |----------------------------------------------------------------------
        | RFI: Remote File Inclusion Detection
        | Covers: attempts to inject remote URL into inputs
        |----------------------------------------------------------------------
        */
        'rfi' => [
            'methods' => ['get', 'post', 'put', 'patch', 'delete'],
            'inputs' => [
                'only' => [],
                'except' => ['password', 'password_confirmation', 'current_password', 'photo', 'avatar'],
            ],
            'routes' => [
                'only' => [],
                'except' => ['api/auth/*'],
            ],
            'patterns' => [
                '#(http|ftp){1,1}(s){0,1}://.*#i',
            ],
            // Legitimate URL fields the app normally accepts — Dompet Kita has no URL inputs
            'exceptions' => [],
            'auto_block' => [
                'attempts' => 2,
                'frequency' => 5 * 60,
                'period' => 60 * 60,
            ],
        ],

        'session' => [
            'methods' => ['get', 'post', 'delete'],
            'routes' => ['only' => [], 'except' => []],
            'inputs' => ['only' => [], 'except' => []],
            'patterns' => [
                '@[\|:]O:\d{1,}:"[\w_][\w\d_]{0,}":\d{1,}:{@i',
                '@[\|:]a:\d{1,}:{@i',
            ],
            'auto_block' => [
                'attempts' => 3,
                'frequency' => 5 * 60,
                'period' => 30 * 60,
            ],
        ],

        /*
        |----------------------------------------------------------------------
        | SQLi: SQL Injection Detection
        | Aggressive patterns for financial API — no tolerance.
        |----------------------------------------------------------------------
        */
        'sqli' => [
            'methods' => ['get', 'post', 'put', 'patch', 'delete'],
            'inputs' => [
                'only' => [],
                'except' => ['password', 'password_confirmation', 'current_password'],
            ],
            'routes' => [
                'only' => [],
                'except' => ['api/auth/*'],
            ],
            'patterns' => [
                '#[\d\W](union select|union join|union distinct)[\d\W]#is',
                '#[\d\W](union|union select|insert|from|where|concat|into|cast|truncate|select|delete|having)[\d\W]#is',
                "#'[\\s]*or[\\s]*'[^']*'[\\s]*=[\\s]*'#i",
                '#--[\\s]*$#m',
                '#/\*.*?\*/#s',
                '#\b(exec|execute|sp_executesql)\b#i',
            ],
            'auto_block' => [
                'attempts' => 1,  // Zero tolerance: block immediately on first SQLi attempt
                'frequency' => 5 * 60,
                'period' => 24 * 60 * 60, // 24 hour block for SQLi attackers
            ],
        ],

        'swear' => [
            'methods' => ['post', 'put', 'patch'],
            'routes' => ['only' => [], 'except' => []],
            'inputs' => ['only' => [], 'except' => []],
            'words' => [],
            'auto_block' => [
                'attempts' => 3,
                'frequency' => 5 * 60,
                'period' => 30 * 60,
            ],
        ],

        'url' => [
            'methods' => ['all'],
            'inspections' => [],
            'auto_block' => [
                'attempts' => 5,
                'frequency' => 1 * 60,
                'period' => 30 * 60,
            ],
        ],

        'whitelist' => [
            'methods' => ['all'],
            'routes' => ['only' => [], 'except' => []],
        ],

        /*
        |----------------------------------------------------------------------
        | XSS: Cross-Site Scripting Detection
        | Financial data inputs — strict blocking of script injection.
        |----------------------------------------------------------------------
        */
        'xss' => [
            'methods' => ['post', 'put', 'patch'],
            'inputs' => [
                'only' => [],
                'except' => ['password', 'password_confirmation', 'current_password', 'description', 'notes'],
            ],
            'routes' => [
                'only' => [],
                'except' => ['api/auth/*'],
            ],
            'patterns' => [
                // Evil starting attributes
                '#(<[^>]+[\x00-\x20\"\'\/])(form|formaction|on\w*|style|xmlns|xlink:href)[^>]*>?#iUu',
                // javascript:, livescript:, vbscript:, mocha: protocols
                '!((java|live|vb)script|mocha|feed|data):(\w)*!iUu',
                '#-moz-binding[\x00-\x20]*:#u',
                // Dangerous HTML tags
                '#<\/*(applet|meta|xml|blink|link|style|script|embed|object|iframe|frame|frameset|ilayer|layer|bgsound|title|base|img)[^>]*>?#i',
                // SVG-based XSS
                '#<svg[^>]*>[^<]*<\/svg>#i',
            ],
            'auto_block' => [
                'attempts' => 3,
                'frequency' => 5 * 60,
                'period' => 30 * 60,
            ],
        ],

    ],

];
