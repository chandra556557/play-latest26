# ============================================
# Stop All Services Script
# ============================================
# This script stops all running frontend and backend services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stopping All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPort = 3001
$frontendPorts = @(5173, 5174)

# Stop Backend Service
Write-Host "🛑 Stopping Backend Service (Port $backendPort)..." -ForegroundColor Yellow
$backendProcess = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($backendProcess) {
    foreach ($pid in $backendProcess) {
        Write-Host "   Stopping process PID: $pid" -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   ✅ Backend service stopped" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No backend service running on port $backendPort" -ForegroundColor Gray
}

Write-Host ""

# Stop Frontend Services
Write-Host "🛑 Stopping Frontend Service..." -ForegroundColor Yellow

foreach ($port in $frontendPorts) {
    $frontendProcess = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($frontendProcess) {
        foreach ($pid in $frontendProcess) {
            Write-Host "   Stopping process on port $port (PID: $pid)" -ForegroundColor Gray
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        Write-Host "   ✅ Frontend service on port $port stopped" -ForegroundColor Green
    }
}

Write-Host "   ℹ️  Checked ports: $($frontendPorts -join ', ')" -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All Services Stopped!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
