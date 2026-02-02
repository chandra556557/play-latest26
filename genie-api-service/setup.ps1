# Genie API Service - Setup Script (PowerShell)
# This script sets up the Python FastAPI service with all dependencies

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Genie API Service - Setup Script" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Step 1: Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   [OK] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Python not found!" -ForegroundColor Red
    Write-Host "   Please install Python 3.9+ from https://www.python.org/downloads/" -ForegroundColor Red
    exit 1
}

# Check Python version
$versionMatch = $pythonVersion -match "Python (\d+)\.(\d+)"
if ($versionMatch) {
    $majorVersion = [int]$Matches[1]
    $minorVersion = [int]$Matches[2]
    
    if ($majorVersion -lt 3 -or ($majorVersion -eq 3 -and $minorVersion -lt 9)) {
        Write-Host "   [ERROR] Python version too old. Need 3.9+, found $pythonVersion" -ForegroundColor Red
        exit 1
    }
}

# Create virtual environment
Write-Host ""
Write-Host "Step 2: Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "   [INFO] Virtual environment already exists" -ForegroundColor Yellow
    $response = Read-Host "   Do you want to recreate it? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "   Removing old virtual environment..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "venv"
        Write-Host "   Creating new virtual environment..." -ForegroundColor Yellow
        python -m venv venv
        Write-Host "   [OK] Virtual environment created" -ForegroundColor Green
    } else {
        Write-Host "   [INFO] Using existing virtual environment" -ForegroundColor Cyan
    }
} else {
    Write-Host "   Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "   [OK] Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Step 3: Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "   [OK] Virtual environment activated" -ForegroundColor Green

# Upgrade pip
Write-Host ""
Write-Host "Step 4: Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "   [OK] Pip upgraded" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Step 5: Installing dependencies..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Cyan
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Setup .env file
Write-Host ""
Write-Host "Step 6: Setting up environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   [INFO] .env file already exists" -ForegroundColor Yellow
    $response = Read-Host "   Do you want to overwrite it? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "   [OK] .env file created from template" -ForegroundColor Green
    } else {
        Write-Host "   [INFO] Keeping existing .env file" -ForegroundColor Cyan
    }
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "   [OK] .env file created from template" -ForegroundColor Green
}

# Check if OpenAI API key is set
Write-Host ""
Write-Host "Step 7: Checking OpenAI API key..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match "OPENAI_API_KEY=your-openai-api-key-here" -or $envContent -match "OPENAI_API_KEY=\s*`$") {
    Write-Host "   [WARNING] OpenAI API key not configured!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   IMPORTANT: You need to add your OpenAI API key to the .env file" -ForegroundColor Red
    Write-Host "   1. Open .env file in a text editor" -ForegroundColor Cyan
    Write-Host "   2. Replace 'your-openai-api-key-here' with your actual API key" -ForegroundColor Cyan
    Write-Host "   3. Get your API key from: https://platform.openai.com/api-keys" -ForegroundColor Cyan
    Write-Host ""
    $response = Read-Host "   Do you want to enter your API key now? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        $apiKey = Read-Host "   Enter your OpenAI API key"
        if ($apiKey) {
            $envContent = $envContent -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$apiKey"
            Set-Content ".env" $envContent
            Write-Host "   [OK] API key saved to .env file" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   [OK] OpenAI API key is configured" -ForegroundColor Green
}

# Verify installation
Write-Host ""
Write-Host "Step 8: Verifying installation..." -ForegroundColor Yellow
$packages = @("fastapi", "uvicorn", "openai", "pydantic", "python-dotenv")
$allInstalled = $true

foreach ($package in $packages) {
    $installed = pip show $package 2>$null
    if ($installed) {
        Write-Host "   [OK] $package installed" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] $package NOT installed" -ForegroundColor Red
        $allInstalled = $false
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
if ($allInstalled) {
    Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Next Steps:" -ForegroundColor Yellow
    Write-Host "     1. Make sure your OpenAI API key is set in .env file" -ForegroundColor Cyan
    Write-Host "     2. Run the service:" -ForegroundColor Cyan
    Write-Host "        .\start.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "  Test Scripts Available:" -ForegroundColor Yellow
    Write-Host "     - python test_boundary_generation.py" -ForegroundColor Cyan
    Write-Host "     - python test_security_generation.py" -ForegroundColor Cyan
    Write-Host "     - python test_all_data_types.py" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "  SETUP INCOMPLETE" -ForegroundColor Red
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  Some packages failed to install. Please check the errors above." -ForegroundColor Red
    Write-Host ""
}

Write-Host "================================================================" -ForegroundColor Cyan
