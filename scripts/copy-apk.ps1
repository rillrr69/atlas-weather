$ErrorActionPreference = 'Stop'

$source = Join-Path $PSScriptRoot '..\android\app\build\outputs\apk\debug\app-debug.apk'
$destination = Join-Path $PSScriptRoot '..\atlas-debug.apk'

if (-not (Test-Path $source)) {
  throw ('APK not found: ' + $source)
}

Copy-Item -Path $source -Destination $destination -Force
$item = Get-Item $destination
Write-Output ('APK ready: ' + $item.FullName + ' (' + [math]::Round($item.Length / 1MB, 2) + ' MB)')
