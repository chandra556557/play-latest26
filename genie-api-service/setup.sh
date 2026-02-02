#!/bin/bash

# Genie API Service - Setup Script (Bash)
# This script sets up the Python FastAPI service with all dependencies

echo "================================================================"
echo "  🧞 Genie API Service - Setup Script"
echo "================================================================"
echo ""

# Check if Python is installed
echo "📋 Step 1: Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "   ✅ Python found: $PYTHON_VERSION"
else
    echo "   ❌ Python not found!"
    echo "   Please install Python 3.9+ from https://www.python.org/downloads/"
    exit 1
fi

# Create virtual environment
echo ""
echo "📋 Step 2: Creating virtual environment..."
if [ -d "venv" ]; then
    echo "   ⚠️  Virtual environment already exists"
    read -p "   Do you want to recreate it? (y/N): " response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        echo "   🗑️  Removing old virtual environment..."
        rm -rf venv
        echo "   🔧 Creating new virtual environment..."
        python3 -m venv venv
        echo "   ✅ Virtual environment created"
    else
        echo "   ℹ️  Using existing virtual environment"
    fi
else
    echo "   🔧 Creating virtual environment..."
    python3 -m venv venv
    echo "   ✅ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "📋 Step 3: Activating virtual environment..."
source venv/bin/activate
echo "   ✅ Virtual environment activated"

# Upgrade pip
echo ""
echo "📋 Step 4: Upgrading pip..."
python -m pip install --upgrade pip --quiet
echo "   ✅ Pip upgraded"

# Install dependencies
echo ""
echo "📋 Step 5: Installing dependencies..."
echo "   This may take a few minutes..."
pip install -r requirements.txt --quiet
if [ $? -eq 0 ]; then
    echo "   ✅ Dependencies installed successfully"
else
    echo "   ❌ Failed to install dependencies"
    exit 1
fi

# Setup .env file
echo ""
echo "📋 Step 6: Setting up environment variables..."
if [ -f ".env" ]; then
    echo "   ⚠️  .env file already exists"
    read -p "   Do you want to overwrite it? (y/N): " response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        cp .env.example .env
        echo "   ✅ .env file created from template"
    else
        echo "   ℹ️  Keeping existing .env file"
    fi
else
    cp .env.example .env
    echo "   ✅ .env file created from template"
fi

# Check if OpenAI API key is set
echo ""
echo "📋 Step 7: Checking OpenAI API key..."
if grep -q "OPENAI_API_KEY=your-openai-api-key-here" .env || grep -q "OPENAI_API_KEY=$" .env; then
    echo "   ⚠️  OpenAI API key not configured!"
    echo ""
    echo "   IMPORTANT: You need to add your OpenAI API key to the .env file"
    echo "   1. Open .env file in a text editor"
    echo "   2. Replace 'your-openai-api-key-here' with your actual API key"
    echo "   3. Get your API key from: https://platform.openai.com/api-keys"
    echo ""
else
    echo "   ✅ OpenAI API key is configured"
fi

# Verify installation
echo ""
echo "📋 Step 8: Verifying installation..."
ALL_INSTALLED=true
for package in fastapi uvicorn openai pydantic python-dotenv; do
    if pip show $package &> /dev/null; then
        echo "   ✅ $package installed"
    else
        echo "   ❌ $package NOT installed"
        ALL_INSTALLED=false
    fi
done

echo ""
echo "================================================================"
if [ "$ALL_INSTALLED" = true ]; then
    echo "  ✅ SETUP COMPLETE!"
    echo "================================================================"
    echo ""
    echo "  📝 Next Steps:"
    echo "     1. Make sure your OpenAI API key is set in .env file"
    echo "     2. Run the service:"
    echo "        ./start.sh"
    echo ""
    echo "  📚 Test Scripts Available:"
    echo "     • python test_boundary_generation.py"
    echo "     • python test_security_generation.py"
    echo "     • python test_all_data_types.py"
    echo ""
else
    echo "  ❌ SETUP INCOMPLETE"
    echo "================================================================"
    echo "  Some packages failed to install. Please check the errors above."
    echo ""
fi

echo "================================================================"
