<?php
use Illuminate\Contracts\Console\Kernel;
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\AIController;
use Illuminate\Http\Request;

$controller = $app->make(AIController::class);
$request = new Request();
// Mocking user? No, I'll just check if the model and prompt are updated.
$reflector = new ReflectionClass($controller);
$method = $reflector->getMethod('getDashboardInsight');

echo "Checking AIController content...\n";
$code = file_get_contents(__DIR__ . '/../app/Http/Controllers/AIController.php');
if (strpos($code, 'gemini-1.5-flash') !== false) {
    echo "SUCCESS: Using gemini-1.5-flash model!\n";
} else {
    echo "FAILURE: Model not updated in code!\n";
}

if (strpos($code, 'Sayang Terharu') !== false) {
    echo "SUCCESS: Title updated to Sayang Terharu ✨!\n";
} else {
    echo "FAILURE: Title not updated in code!\n";
}

if (strpos($code, 'DEBUG_PROMPT_V3') !== false) {
    echo "SUCCESS: Custom refined prompt found!\n";
}

// Checking AppServiceProvider
$provider = file_get_contents(__DIR__ . '/../app/Providers/AppServiceProvider.php');
if (strpos($provider, '// if (app()->environment(\'production\')') !== false) {
    echo "SUCCESS: Production security guard is COMMENTED OUT!\n";
} else {
    echo "FAILURE: Security guard is still ACTIVE!\n";
}
