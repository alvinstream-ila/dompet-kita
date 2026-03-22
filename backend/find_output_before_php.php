<?php
$vendorDir = __DIR__ . '/vendor';

$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($vendorDir));
foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') {
        $path = $file->getRealPath();
        $content = file_get_contents($path);
        if (preg_match('/namespace\s+/i', $content) && !preg_match('/^\s*(<\?php|#!)/i', $content)) {
            // Something is before <?php or it's not starting with <?php/shebang
            echo "SUSPICIOUS: $path\n";
            echo "First 20 chars: " . bin2hex(substr($content, 0, 20)) . "\n\n";
        }
        
        // Check if namespace is after any output
        $posPhp = strpos($content, '<?php');
        if ($posPhp !== false) {
            $beforePhp = substr($content, 0, $posPhp);
            if (trim($beforePhp) !== '' && !preg_match('/^#!/', $beforePhp)) {
                echo "OUTPUT BEFORE PHP: $path\n";
                echo "Before PHP: " . bin2hex($beforePhp) . "\n\n";
            }
        }
    }
}
