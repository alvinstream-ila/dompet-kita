<?php

// Find function/method declarations with implicit nullable parameters
// e.g. function foo(string $a = null)
// Should be function foo(?string $a = null)

$dir = __DIR__.'/vendor';
$results = fopen(__DIR__.'/deprecation_results.txt', 'w');

$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') {
        $path = $file->getRealPath();
        $content = file_get_contents($path);

        // Match type hint + variable name + = null
        // e.g. (string $asset = null)
        // Note: We ignore ?string as that is the fix.
        // We match: (space or comma or start parenthesis) + (type name: e.g. string|int) + space + ($variable name) + (= null)
        // Regexp: /[\(\,]\s*(string|int|float|bool|array|object|callable)\s+\$\w+\s*=\s*null\s*[\,\)]/i
        if (preg_match_all('/[\(\,]\s*(string|int|float|bool|array|object|callable|(?<!\?)\w+)\s+\$\w+\s*=\s*null\s*[\,\)]/i', $content, $matches, PREG_OFFSET_CAPTURE)) {
            foreach ($matches[0] as $match) {
                // If the type hint doesn't have ? at the start
                $hit = $match[0];
                if (strpos($hit, '?') === false) {
                    fwrite($results, "DEPRECATION in $path at offset ".$match[1].": $hit\n");
                }
            }
        }
    }
}
fclose($results);
echo "Done.\n";
