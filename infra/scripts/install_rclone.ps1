# Download Rclone
Invoke-WebRequest -Uri 'https://downloads.rclone.org/rclone-current-windows-amd64.zip' -OutFile 'rclone.zip'

# Create target dir
New-Item -ItemType Directory -Path 'rclone-cli' -Force

# Extract
Expand-Archive -Path 'rclone.zip' -DestinationPath 'rclone-temp' -Force

# Find rclone.exe inside extracted folders
$rcloneExe = Get-ChildItem -Path 'rclone-temp' -Filter 'rclone.exe' -Recurse | Select-Object -First 1

# Move rclone.exe
If ($rcloneExe) {
    Copy-Item -Path $rcloneExe.FullName -Destination 'rclone-cli\rclone.exe' -Force
    Write-Host "✅ Rclone installed successfully in rclone-cli/rclone.exe"
} Else {
    Write-Error "❌ Could not find rclone.exe in ZIP"
}

# Cleanup
Remove-Item 'rclone.zip' -Force
Remove-Item 'rclone-temp' -Recurse -Force
