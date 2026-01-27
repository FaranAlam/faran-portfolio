# 🚀 Quick Setup Script for Admin Dashboard
# Run this in PowerShell from project root directory

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   Faran's Portfolio - Admin Setup" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if MongoDB is running
Write-Host "📋 Step 1: Checking MongoDB..." -ForegroundColor Green
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue

if ($mongoService) {
    if ($mongoService.Status -ne 'Running') {
        Write-Host "   Starting MongoDB service..." -ForegroundColor Yellow
        try {
            Start-Service MongoDB
            Write-Host "   ✅ MongoDB started successfully!" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to start MongoDB. Please start it manually." -ForegroundColor Red
            Write-Host "   Run: net start MongoDB" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ✅ MongoDB is already running!" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  MongoDB service not found." -ForegroundColor Yellow
    Write-Host "   Please ensure MongoDB is installed and running." -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Navigate to newsletter-app
Write-Host "📋 Step 2: Setting up backend..." -ForegroundColor Green
Set-Location -Path "newsletter-app"

# Step 3: Install dependencies
Write-Host "   Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to install dependencies." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Check .env file
Write-Host "📋 Step 3: Checking environment configuration..." -ForegroundColor Green
if (Test-Path ".env") {
    Write-Host "   ✅ .env file found!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "   ✅ .env file created!" -ForegroundColor Green
    Write-Host "   ⚠️  IMPORTANT: Edit .env file with your settings!" -ForegroundColor Yellow
    Write-Host "   Required: SMTP_USER, SMTP_PASS, JWT_SECRET" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Create admin account
Write-Host "📋 Step 4: Creating admin account..." -ForegroundColor Green
Write-Host "   This will create your admin login credentials..." -ForegroundColor Yellow

$createAdmin = Read-Host "   Create admin account now? (y/n)"
if ($createAdmin -eq 'y' -or $createAdmin -eq 'Y') {
    node create-admin.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "   ✅ Admin account created!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "   ⚠️  Admin creation skipped or failed." -ForegroundColor Yellow
        Write-Host "   You can create it later by running: node create-admin.js" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 6: Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   ✅ Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Edit .env file with your email settings" -ForegroundColor White
Write-Host "   2. Get Gmail App Password from: https://myaccount.google.com/apppasswords" -ForegroundColor White
Write-Host "   3. Start the server: npm start" -ForegroundColor White
Write-Host "   4. Open admin-dashboard.html in browser" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "   Email: faranalam14203@gmail.com" -ForegroundColor White
Write-Host "   Password: Admin@123" -ForegroundColor White
Write-Host "   ⚠️  Change password after first login!" -ForegroundColor Red
Write-Host ""
Write-Host "🚀 To start server:" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Access Dashboard:" -ForegroundColor Yellow
Write-Host "   Open: admin-dashboard.html" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to start server now
$startServer = Read-Host "Start server now? (y/n)"
if ($startServer -eq 'y' -or $startServer -eq 'Y') {
    Write-Host ""
    Write-Host "🚀 Starting server..." -ForegroundColor Green
    Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm start
}

# Go back to root directory
Set-Location -Path ".."
