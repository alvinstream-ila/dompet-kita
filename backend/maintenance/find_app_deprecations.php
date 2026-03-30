<?php

// find_app_deprecations.php
$dir = __DIR__.'/../app';
if (! is_dir($dir)) {
    exit("App dir not found.\n");
}
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') {
        $content = file_get_contents($file->getRealPath());
        if (preg_match_all('/[\(\,]\s*(string|int|float|bool|array|object|callable)\s+\$\w+\s*=\s*null\s*[\,\)]/i', $content, $matches, PREG_OFFSET_CAPTURE)) {
            foreach ($matches[0] as $match) {
                if (strpos($match[0], '?') === false) {
                    echo 'DEP: '.$file->getRealPath().' at '.$match[1].' code: '.$match[0]."\n";
                }
            }
        }
    }
}
