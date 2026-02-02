# ============================================
# Start All Services Script
# ============================================
# This script starts both frontend and backend services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Frontend and Backend Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

# Check if .env file exists in backend
$envFile = "$rootDir\playwright-crx-enhanced\backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  .env file not found in backend directory!" -ForegroundColor Yellow
    Write-Host "   Checking for .env.example..." -ForegroundColor Gray
    
    $envExample = "$rootDir\playwright-crx-enhanced\backend\.env.example"
    if (Test-Path $envExample) {
        Write-Host "   Copying .env.example to .env..." -ForegroundColor Yellow
        Copy-Item $envExample $envFile
        Write-Host "   ✅ Created .env file from .env.example" -ForegroundColor Green
        Write-Host "   Please update the .env file with your credentials!" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "   ❌ .env.example not found either!" -ForegroundColor Red
        Write-Host "   Please create a .env file manually in backend directory" -ForegroundColor Red
        Write-Host ""
    }
}

# Check PostgreSQL connection
Write-Host "🔍 Checking PostgreSQL connection..." -ForegroundColor Green
$env:PGPASSWORD = "postgres"
$pgCheck = psql -h localhost -p 5433 -U postgres -d playwrightcrx1 -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ PostgreSQL connection successful!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  PostgreSQL connection failed!" -ForegroundColor Yellow
    Write-Host "   Please ensure PostgreSQL is running on port 5433" -ForegroundColor Yellow
    Write-Host "   Database: playwrightcrx1, User: postgres, Password: postgres" -ForegroundColor Gray
}
Write-Host ""

# Kill existing processes on ports 3001 and 5173/5174
Write-Host "🔧 Checking for existing services..." -ForegroundColor Green

$backendPort = 3001
$frontendPort = 5173

# Kill process on backend port 3001
Write-Host "   Checking port $backendPort (Backend)..." -ForegroundColor Gray
$backendProcess = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($backendProcess) {
    Write-Host "   Stopping existing backend service (PID: $backendProcess)..." -ForegroundColor Yellow
    Stop-Process -Id $backendProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Stopped existing backend service" -ForegroundColor Green
}

# Kill process on frontend ports
Write-Host "   Checking port $frontendPort (Frontend)..." -ForegroundColor Gray
$frontendProcess = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($frontendProcess) {
    Write-Host "   Stopping existing frontend service (PID: $frontendProcess)..." -ForegroundColor Yellow
    Stop-Process -Id $frontendProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Stopped existing frontend service" -ForegroundColor Green
}

# Check port 5174 as well
$frontendProcess2 = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($frontendProcess2) {
    Write-Host "   Stopping existing frontend service on 5174 (PID: $frontendProcess2)..." -ForegroundColor Yellow
    Stop-Process -Id $frontendProcess2 -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Start Backend Service
Write-Host "🚀 Starting Backend Service (Port 3001)..." -ForegroundColor Green
Write-Host "   Location: $rootDir\playwright-crx-enhanced\backend" -ForegroundColor Gray
Write-Host ""

$backendPath = "$rootDir\playwright-crx-enhanced\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '=== BACKEND SERVICE ===' -ForegroundColor Cyan; npm run dev"

Write-Host "   ✅ Backend service starting in new window..." -ForegroundColor Green
Write-Host "   URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

# Wait a bit for backend to initialize
Write-Host "   Waiting 5 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "========================================" -ForegroundColor Cyan

# Start Frontend Service
Write-Host "🚀 Starting Frontend Service (Port 5173)..." -ForegroundColor Green
Write-Host "   Location: $rootDir\playwright-crx-enhanced\frontend" -ForegroundColor Gray
Write-Host ""

$frontendPath = "$rootDir\playwright-crx-enhanced\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '=== FRONTEND SERVICE ===' -ForegroundColor Cyan; npm run dev"

Write-Host "   ✅ Frontend service starting in new window..." -ForegroundColor Green
Write-Host "   URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  • Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  • Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📝 Notes:" -ForegroundColor Yellow
Write-Host "  • Both services are running in separate windows" -ForegroundColor Gray
Write-Host "  • Backend logs will show in Backend Service window" -ForegroundColor Gray
Write-Host "  • Frontend logs will show in Frontend Service window" -ForegroundColor Gray
Write-Host "  • Close those windows or press Ctrl+C to stop services" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Open your browser and navigate to http://localhost:5173" -ForegroundColor Green
Write-Host ""
