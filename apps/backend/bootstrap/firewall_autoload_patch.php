<?php

/**
 * ── Akaunting Firewall + Dependencies Autoload Patch ───────────────────────
 * Registers missing PSR-4 namespaces that are installed in vendor but absent
 * from the static autoload map (autoload_static.php). This is needed because
 * composer dump-autoload has not been run since these packages were added.
 *
 * Affected packages:
 *  - akaunting/laravel-firewall → Akaunting\Firewall\
 *  - jenssegers/agent           → Jenssegers\Agent\
 *
 * This patch can be removed after running `composer dump-autoload` on the server.
 */
$missingNamespaces = [
    'Akaunting\\Firewall\\' => __DIR__.'/../vendor/akaunting/laravel-firewall/src/',
    'Jenssegers\\Agent\\' => __DIR__.'/../vendor/jenssegers/agent/src/',
];

spl_autoload_register(function (string $class) use ($missingNamespaces): void {
    foreach ($missingNamespaces as $prefix => $baseDir) {
        if (! str_starts_with($class, $prefix)) {
            continue;
        }
        $relative = str_replace('\\', '/', substr($class, strlen($prefix)));
        $file = $baseDir.$relative.'.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
}, prepend: true);
