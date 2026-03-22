$dirs = "vendor", "app", "config", "routes", "tests", "database"
$count = 0
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Get-ChildItem -Path $dir -Filter *.php -Recurse | ForEach-Object {
            try {
                $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
                if ($bytes.Count -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
                    Write-Host "UTF-16LE detected: $($_.FullName)"
                    $count++
                }
            } catch {}
        }
    }
}
Write-Host "Total UTF-16LE files: $count"
