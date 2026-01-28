# Genie API Service - Start Script (PowerShell)
# This script starts the Python FastAPI service on port 3000

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  🧞 Starting Genie API Service" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run setup first:" -ForegroundColor Yellow
    Write-Host "  .\setup.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run setup first:" -ForegroundColor Yellow
    Write-Host "  .\setup.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Check if OpenAI API key is set
Write-Host "📋 Checking configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match "OPENAI_API_KEY=your-openai-api-key-here" -or $envContent -match "OPENAI_API_KEY=\s*$") {
    Write-Host "   ⚠️  OpenAI API key not configured!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please add your OpenAI API key to the .env file:" -ForegroundColor Yellow
    Write-Host "   1. Open .env file in a text editor" -ForegroundColor Cyan
    Write-Host "   2. Replace 'your-openai-api-key-here' with your actual API key" -ForegroundColor Cyan
    Write-Host "   3. Get your API key from: https://platform.openai.com/api-keys" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
Write-Host "   ✅ Configuration verified" -ForegroundColor Green

# Activate virtual environment
Write-Host ""
Write-Host "📋 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "   ✅ Virtual environment activated" -ForegroundColor Green

# Check if port 3000 is already in use
Write-Host ""
Write-Host "📋 Checking port 3000..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "   ⚠️  Port 3000 is already in use!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Another process is using port 3000." -ForegroundColor Red
    Write-Host "   Do you want to:" -ForegroundColor Yellow
    Write-Host "   1. Kill the process and continue" -ForegroundColor Cyan
    Write-Host "   2. Exit (you can manually stop the other process)" -ForegroundColor Cyan
    Write-Host ""
    $response = Read-Host "   Enter your choice (1/2)"
    
    if ($response -eq '1') {
        $processId = $portInUse | Select-Object -ExpandProperty OwningProcess -First 1
        Write-Host "   🔫 Killing process $processId..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Start-Sleep -Seconds 2
        Write-Host "   ✅ Process killed" -ForegroundColor Green
    } else {
        Write-Host "   Exiting..." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "   ✅ Port 3000 is available" -ForegroundColor Green
}

# Start the service
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  🚀 Starting Genie API Service on http://0.0.0.0:3000" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📍 API Endpoints:" -ForegroundColor Yellow
Write-Host "     • Swagger UI:  http://localhost:3000/docs" -ForegroundColor Cyan
Write-Host "     • ReDoc:       http://localhost:3000/redoc" -ForegroundColor Cyan
Write-Host "     • Health:      http://localhost:3000/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🧪 Test Data Endpoints:" -ForegroundColor Yellow
Write-Host "     • Boundary:    /genieapi/assistant/testdata/boundary/generate" -ForegroundColor Cyan
Write-Host "     • Positive:    /genieapi/assistant/testdata/positive/generate" -ForegroundColor Cyan
Write-Host "     • Negative:    /genieapi/assistant/testdata/negative/generate" -ForegroundColor Cyan
Write-Host "     • Security:    /genieapi/assistant/testdata/security/generate" -ForegroundColor Cyan
Write-Host "     • Equivalence: /genieapi/assistant/testdata/equivalence/generate" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📝 Press CTRL+C to stop the service" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Run the service
try {
    python main.py
} catch {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Red
    Write-Host "  ❌ Error starting service" -ForegroundColor Red
    Write-Host "================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  👋 Service stopped" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
