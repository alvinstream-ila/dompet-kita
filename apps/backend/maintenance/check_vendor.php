<?php

function checkDir($dir)
{
    if (! is_dir($dir)) {
        return;
    }
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        $path = $dir.DIRECTORY_SEPARATOR.$file;
        if (is_dir($path)) {
            checkDir($path);
        } elseif (pathinfo($path, PATHINFO_EXTENSION) === 'php') {
            $output = [];
            $returnVar = 0;
            exec('php -l '.escapeshellarg($path).' 2>&1', $output, $returnVar);
            if ($returnVar !== 0) {
                echo "ERROR in $path:\n";
                echo implode("\n", $output)."\n\n";
            }
        }
    }
}

echo "Checking vendor directory for syntax errors...\n";
checkDir(dirname(__DIR__).'/vendor');
echo "Done.\n";
