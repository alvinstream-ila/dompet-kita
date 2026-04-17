<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

echo "🚀 Dompet Kita: Sovereign Health Check (v7.1.18)\n";
echo "─────────────────────────────────────────────────\n";

// 1. Check AI Provider architecture
echo 'Checking AI Provider architecture... ';
$providerPath = __DIR__.'/../app/Services/AI/GeminiProvider.php';
if (File::exists($providerPath)) {
    $providerCode = File::get($providerPath);
    if (strpos($providerCode, 'gemini-1.5-flash') !== false || strpos($providerCode, 'gemini-2.0') !== false) {
        echo "SUCCESS (Gemini Flash active)\n";
    } else {
        echo "WARNING (Check model version)\n";
    }
} else {
    echo "FAILURE (GeminiProvider missing)\n";
}

// 2. Check Action-Based Monolith Integrity
echo 'Checking Action Architecture... ';
$actionPath = __DIR__.'/../app/Actions/Financial/Asset/UpdateAssetAction.php';
if (File::exists($actionPath)) {
    echo "SUCCESS (Actions are present)\n";
} else {
    echo "FAILURE (Action classes missing!)\n";
}

// 3. Check Observability (Sentry)
echo 'Checking Sentry Logging... ';
$logChannels = Config::get('logging.channels');
if (isset($logChannels['sentry'])) {
    echo "SUCCESS (Channel configured)\n";
} else {
    echo "FAILURE (Sentry missing in logging.php)\n";
}

// 4. Check Security (DB SSL & Production Guard)
echo 'Checking Security Gates... ';
$sslMode = Config::get('database.connections.pgsql.sslmode');
$isProd = $app->environment('production');

if ($sslMode === 'prefer' || $sslMode === 'verify-full') {
    echo "SUCCESS (SSL Mode: {$sslMode})\n";
} else {
    echo "WARNING (SSL Mode insecure: {$sslMode})\n";
}

if ($isProd) {
    $provider = File::get(__DIR__.'/../app/Providers/AppServiceProvider.php');
    if (strpos($provider, 'app()->environment(\'production\')') !== false) {
        echo "Security Guard: ACTIVE ✨\n";
    } else {
        echo "Security Guard: MISSING! ❌\n";
    }
} else {
    echo "Env: DEVELOPMENT (Guard idle)\n";
}

echo "─────────────────────────────────────────────────\n";
echo "Sovereign Health Check COMPLETE.\n";
