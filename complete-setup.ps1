# ============================================
# Complete Setup Script
# ============================================
# This script runs all setup steps in sequence

param(
    [switch]$SkipInstall,
    [switch]$StartServices
)

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Set-Location $rootDir

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Playwright CRX Enhanced - Complete Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Prerequisites
Write-Host "📋 STEP 1: Checking Prerequisites..." -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Cyan
& "$rootDir\setup-prerequisites.ps1"

Write-Host ""
Write-Host "Press any key to continue to dependency installation (or Ctrl+C to exit)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 2: Install Dependencies
if (-not $SkipInstall) {
    Write-Host "📦 STEP 2: Installing Dependencies..." -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Cyan
    & "$rootDir\install-dependencies.ps1"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Dependency installation failed! Please check errors above." -ForegroundColor Red
        Write-Host ""
        exit 1
    }
} else {
    Write-Host "⏭️  STEP 2: Skipping dependency installation (--SkipInstall flag)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 3: Optionally Start Services
if ($StartServices) {
    Write-Host "🚀 STEP 3: Starting Services..." -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Cyan
    & "$rootDir\start-services.ps1"
} else {
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Configure your .env file: playwright-crx-enhanced\backend\.env" -ForegroundColor White
    Write-Host "2. Ensure PostgreSQL is running (port 5433, database: playwrightcrx1)" -ForegroundColor White
    Write-Host "3. Run: .\start-services.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Or run this script with -StartServices flag to start services immediately:" -ForegroundColor Cyan
    Write-Host "   .\complete-setup.ps1 -StartServices" -ForegroundColor Gray
    Write-Host ""
}
