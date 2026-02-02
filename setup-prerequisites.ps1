# ============================================
# Prerequisites Setup Script for Windows
# ============================================
# This script installs all prerequisites for the Playwright CRX Enhanced project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prerequisites Setup for Playwright CRX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as Administrator. Some installations may fail." -ForegroundColor Yellow
    Write-Host "   Please run PowerShell as Administrator for full installation." -ForegroundColor Yellow
    Write-Host ""
}

# 1. Check Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js is NOT installed" -ForegroundColor Red
    Write-Host "   Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "   Recommended: Node.js v18.x or higher" -ForegroundColor Yellow
    $nodeInstalled = $false
}

# 2. Check npm
Write-Host "2. Checking npm..." -ForegroundColor Green
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm is NOT installed" -ForegroundColor Red
    $npmInstalled = $false
}

# 3. Check PostgreSQL
Write-Host "3. Checking PostgreSQL..." -ForegroundColor Green
try {
    $psqlVersion = psql --version
    Write-Host "   ✅ PostgreSQL is installed: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  PostgreSQL client not found in PATH" -ForegroundColor Yellow
    Write-Host "   Please ensure PostgreSQL is installed and running" -ForegroundColor Yellow
    Write-Host "   Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
}

# 4. Check Git
Write-Host "4. Checking Git..." -ForegroundColor Green
try {
    $gitVersion = git --version
    Write-Host "   ✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Git is NOT installed" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prerequisites Check Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run .\install-dependencies.ps1 to install all project dependencies" -ForegroundColor White
Write-Host "2. Configure your .env files in backend directory" -ForegroundColor White
Write-Host "3. Run .\start-services.ps1 to start frontend and backend services" -ForegroundColor White
Write-Host ""
