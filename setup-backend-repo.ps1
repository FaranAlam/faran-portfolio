# Backend Repository Setup Script
# This script prepares your backend for deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend Repository Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create backend folder
$backendPath = "d:\portfolio-backend"
Write-Host "📁 Creating backend repository folder..." -ForegroundColor Yellow

if (Test-Path $backendPath) {
    Write-Host "⚠️  Folder already exists. Removing old folder..." -ForegroundColor Red
    Remove-Item $backendPath -Recurse -Force
}

New-Item -ItemType Directory -Path $backendPath | Out-Null
Write-Host "✅ Folder created: $backendPath" -ForegroundColor Green

# Step 2: Copy backend files
Write-Host ""
Write-Host "📋 Copying backend files..." -ForegroundColor Yellow
$sourcePath = "d:\faran website personal v-15\newsletter-app"

Copy-Item -Path "$sourcePath\*" -Destination $backendPath -Recurse -Force
Write-Host "✅ Files copied successfully!" -ForegroundColor Green

# Step 3: Create .gitignore
Write-Host ""
Write-Host "📝 Creating .gitignore..." -ForegroundColor Yellow
$gitignoreContent = @"
node_modules/
.env
npm-debug.log
.DS_Store
*.log
uploads/
.vscode/
"@

Set-Content -Path "$backendPath\.gitignore" -Value $gitignoreContent
Write-Host "✅ .gitignore created!" -ForegroundColor Green

# Step 4: Update package.json for deployment
Write-Host ""
Write-Host "📦 Updating package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "$backendPath\package.json" -Raw | ConvertFrom-Json

# Ensure start script exists
if (-not $packageJson.scripts) {
    $packageJson | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{}
}
$packageJson.scripts.start = "node server.js"

# Add engines for Node version
if (-not $packageJson.engines) {
    $packageJson | Add-Member -MemberType NoteProperty -Name "engines" -Value @{
        node = ">=18.0.0"
    }
}

$packageJson | ConvertTo-Json -Depth 10 | Set-Content "$backendPath\package.json"
Write-Host "✅ package.json updated!" -ForegroundColor Green

# Step 5: Create README for backend
Write-Host ""
Write-Host "📄 Creating README.md..." -ForegroundColor Yellow
$readmeContent = @"
# Portfolio Backend API

Backend server for Faran's portfolio website.

## Features
- User authentication (JWT)
- Blog management (CRUD)
- Contact form submissions
- Newsletter subscribers
- Admin dashboard API

## Environment Variables

Create a `.env` file with:

``````env
MONGODB_URI=mongodb+srv://faranalamportfolio:alam14203faran@tasktrackr.3j7tmok.mongodb.net/newsletter
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
``````

## Installation

``````bash
npm install
npm start
``````

## API Endpoints

### Public
- GET `/blogs` - Get all published blogs
- GET `/blogs/id/:id` - Get single blog by ID
- POST `/contact` - Submit contact form

### Admin (Requires Auth)
- POST `/admin/login` - Admin login
- GET `/admin/blogs` - Get all blogs (with pagination)
- POST `/admin/blogs` - Create new blog
- PUT `/admin/blogs/:id` - Update blog
- DELETE `/admin/blogs/:id` - Delete blog
- GET `/admin/contacts` - Get all contacts
- GET `/admin/subscribers` - Get all subscribers

## Deployment

### Render.com
1. Push this repo to GitHub
2. Connect to Render.com
3. Add environment variables
4. Deploy!

### Railway.app
1. Push to GitHub
2. Create new project on Railway
3. Connect GitHub repo
4. Add environment variables
5. Deploy!

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (File uploads)
- Nodemailer

## Author
Faran Alam - Full Stack Developer
"@

Set-Content -Path "$backendPath\README.md" -Value $readmeContent
Write-Host "✅ README.md created!" -ForegroundColor Green

# Step 6: Initialize Git
Write-Host ""
Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
Set-Location $backendPath
git init
git add .
git commit -m "Initial backend setup for deployment"
Write-Host "✅ Git repository initialized!" -ForegroundColor Green

# Step 7: Instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Backend repository created at:" -ForegroundColor Yellow
Write-Host "   $backendPath" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Create a new GitHub repository named 'portfolio-backend'" -ForegroundColor Cyan
Write-Host "    https://github.com/new" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Push code to GitHub:" -ForegroundColor Cyan
Write-Host "    cd '$backendPath'" -ForegroundColor Gray
Write-Host "    git remote add origin https://github.com/YOUR-USERNAME/portfolio-backend.git" -ForegroundColor Gray
Write-Host "    git branch -M main" -ForegroundColor Gray
Write-Host "    git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Deploy on Render.com:" -ForegroundColor Cyan
Write-Host "    - Go to https://render.com" -ForegroundColor Gray
Write-Host "    - New Web Service → Connect GitHub" -ForegroundColor Gray
Write-Host "    - Select 'portfolio-backend' repo" -ForegroundColor Gray
Write-Host "    - Add environment variables (see BACKEND_DEPLOYMENT_GUIDE.md)" -ForegroundColor Gray
Write-Host "    - Click Deploy!" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  Update frontend config.js with your backend URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Read BACKEND_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Magenta
Write-Host ""

# Open folder in explorer
Write-Host "Opening backend folder..." -ForegroundColor Yellow
Start-Process $backendPath

Set-Location "d:\faran website personal v-15"
