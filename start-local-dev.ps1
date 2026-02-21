# Local Development Startup Script
# This script starts the backend server and opens the website in your browser

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Faran Portfolio - Local Development  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "[1/4] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install Node.js from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate to backend directory
Write-Host ""
Write-Host "[2/4] Starting backend server..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "newsletter-app"

if (-not (Test-Path $backendPath)) {
    Write-Host "✗ Backend folder not found at: $backendPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location $backendPath

# Check if node_modules exists, if not run npm install
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start backend in background
Write-Host "✓ Starting server at http://localhost:3000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal

# Wait a bit for server to start
Start-Sleep -Seconds 3

# Open website in browser
Write-Host ""
Write-Host "[3/4] Opening website..." -ForegroundColor Yellow
$indexPath = Join-Path $PSScriptRoot "index.html"

if (Test-Path $indexPath) {
    Write-Host "✓ Opening index.html in default browser" -ForegroundColor Green
    Start-Process $indexPath
} else {
    Write-Host "✗ index.html not found" -ForegroundColor Red
}

# Open admin dashboard
Start-Sleep -Seconds 1
$adminPath = Join-Path $PSScriptRoot "admin-dashboard.html"

if (Test-Path $adminPath) {
    Write-Host "✓ Opening admin-dashboard.html" -ForegroundColor Green
    Start-Process $adminPath
} else {
    Write-Host "✗ admin-dashboard.html not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "[4/4] Development environment ready!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3000      " -ForegroundColor White
Write-Host "  Frontend: Opened in browser          " -ForegroundColor White
Write-Host "  Admin:    Opened in browser          " -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Yellow
Write-Host "  Username: faranalam14203" -ForegroundColor White
Write-Host "  Password: faranalam14203" -ForegroundColor White
Write-Host ""
Write-Host "To stop the server, close the backend PowerShell window." -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit this window"
