# Starts the newsletter API (port 5000) and the static site (port 3000)
# in separate PowerShell windows, then opens the site in the default browser.

param(
    [int]$ApiPort = 5000,
    [int]$WebPort = 3000
)

$ErrorActionPreference = 'Stop'

function Start-Window {
    param(
        [string]$WorkDir,
        [string]$Command
    )

    Write-Host "→ Starting: $Command" -ForegroundColor Cyan
    Start-Process -FilePath "powershell.exe" -WorkingDirectory $WorkDir -ArgumentList @(
        '-NoExit',
        '-Command',
        $Command
    ) | Out-Null
}

# Resolve paths relative to this script
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ApiDir = Join-Path $Root 'newsletter-app'

# Start API server (installs deps if needed)
Start-Window -WorkDir $ApiDir -Command "npm install; $env:PORT=$ApiPort; npm start"

# Start static server on WebPort
Start-Window -WorkDir $Root -Command "npx -y serve -l $WebPort"

# Open browser to static site
$url = "http://localhost:$WebPort/"
Write-Host "→ Opening: $url" -ForegroundColor Green
Start-Process $url | Out-Null

Write-Host "All set! Two windows should be running (API and Static)." -ForegroundColor Green
