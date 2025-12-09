# ============================================
# Install Dependencies Script
# ============================================
# This script installs all npm dependencies for frontend and backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Project Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

# Install Backend Dependencies
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Green
Write-Host "   Location: $rootDir\playwright-crx-enhanced\backend" -ForegroundColor Gray
Write-Host ""

Set-Location "$rootDir\playwright-crx-enhanced\backend"

if (Test-Path "package.json") {
    Write-Host "   Running npm install..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Backend dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Backend dependency installation failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ❌ package.json not found in backend directory!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Install Frontend Dependencies
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Green
Write-Host "   Location: $rootDir\playwright-crx-enhanced\frontend" -ForegroundColor Gray
Write-Host ""

Set-Location "$rootDir\playwright-crx-enhanced\frontend"

if (Test-Path "package.json") {
    Write-Host "   Running npm install..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Frontend dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Frontend dependency installation failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ❌ package.json not found in frontend directory!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Install Playwright Browsers
Write-Host "🎭 Installing Playwright Browsers..." -ForegroundColor Green
Write-Host ""

Set-Location "$rootDir\playwright-crx-enhanced\backend"
Write-Host "   Running npx playwright install..." -ForegroundColor Yellow
npx playwright install

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Playwright browsers installed successfully!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Playwright browser installation had issues (you can retry later)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All Dependencies Installed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure your .env file in backend directory" -ForegroundColor White
Write-Host "2. Ensure PostgreSQL is running on port 5433" -ForegroundColor White
Write-Host "3. Run .\start-services.ps1 to start all services" -ForegroundColor White
Write-Host ""

Set-Location $rootDir
