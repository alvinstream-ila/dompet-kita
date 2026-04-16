<?php

$vendorDir = __DIR__.'/vendor';
$results = fopen(__DIR__.'/find_results.txt', 'w');

$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($vendorDir));
foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') {
        $path = $file->getRealPath();
        $content = file_get_contents($path);

        // Only care about files with NAMESPACE
        if (preg_match('/^\s*namespace\s+/im', $content)) {
            $posPhp = strpos($content, '<?php');
            if ($posPhp !== false) {
                $beforePhp = substr($content, 0, $posPhp);
                if (trim($beforePhp) !== '' && ! preg_match('/^#!/', $beforePhp)) {
                    fwrite($results, "ERROR: Namespace in file with output before <?php: {$path}\n");
                    fwrite($results, 'Before PHP (hex): '.bin2hex($beforePhp)."\n\n");
                }
            }
        }
    }
}
fclose($results);
echo "Done.\n";
