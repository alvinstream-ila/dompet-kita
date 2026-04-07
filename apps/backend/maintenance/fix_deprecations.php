<?php

// fix_deprecations.php
// Automatically fixes "Implicitly marking a parameter as nullable is deprecated in PHP 8.4"

$dirs = [__DIR__.'/../vendor', __DIR__.'/../app'];
$fixedCount = 0;

foreach ($dirs as $dir) {
    if (! is_dir($dir)) {
        continue;
    }
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    foreach ($iterator as $file) {
        if ($file->isFile() && $file->getExtension() === 'php') {
            $path = $file->getRealPath();
            $content = file_get_contents($path);

            // Regex to find: (char)(type hint)(space)(variable name)(= null)(char)
            // But NOT if it already has ? or |null
            // We only fix single type hints (e.g. string, int, etc.) or class names without ?

            $patterns = [
                // (char) (type) (space) ($var) (= null) (char)
                '/([\(\,]\s*)(string|int|float|bool|array|object|callable)\s+(\$\w+)(\s*=\s*null\s*[\,\)])/i',
                // (char) (ClassName) (space) ($var) (= null) (char)
                // Note: we exclude types that already have ? or are complex union types for simplicity
                '/([\(\,]\s*)(?<!\?|\\\\)([a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*)\s+(\$\w+)(\s*=\s*null\s*[\,\)])/i',
            ];

            $newContent = $content;
            foreach ($patterns as $pattern) {
                $newContent = preg_replace_callback($pattern, function ($matches) {
                    $prefix = $matches[1];
                    $type = $matches[2];
                    $var = $matches[3];
                    $suffix = $matches[4];

                    // Don't add ? to 'mixed' or reserved words like 'self', 'parent', 'static'
                    $reserved = ['mixed', 'self', 'parent', 'static', 'void', 'never', 'null', 'false', 'true'];
                    if (in_array(strtolower($type), $reserved)) {
                        return $matches[0];
                    }

                    // Prepend ? to the type hint
                    return $prefix.'?'.$type.' '.$var.$suffix;
                }, $newContent);
            }

            if ($newContent !== $content) {
                file_put_contents($path, $newContent);
                $fixedCount++;
                echo "Fixed: $path\n";
            }
        }
    }
}

echo "\nDone. Total files fixed: $fixedCount\n";
