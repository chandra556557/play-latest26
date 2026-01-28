#!/bin/bash

# Genie API Service - Start Script (Bash)
# This script starts the Python FastAPI service on port 3000

echo "================================================================"
echo "  🧞 Starting Genie API Service"
echo "================================================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo ""
    echo "Please run setup first:"
    echo "  ./setup.sh"
    echo ""
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please run setup first:"
    echo "  ./setup.sh"
    echo ""
    exit 1
fi

# Check if OpenAI API key is set
echo "📋 Checking configuration..."
if grep -q "OPENAI_API_KEY=your-openai-api-key-here" .env || grep -q "OPENAI_API_KEY=$" .env; then
    echo "   ⚠️  OpenAI API key not configured!"
    echo ""
    echo "   Please add your OpenAI API key to the .env file:"
    echo "   1. Open .env file in a text editor"
    echo "   2. Replace 'your-openai-api-key-here' with your actual API key"
    echo "   3. Get your API key from: https://platform.openai.com/api-keys"
    echo ""
    exit 1
fi
echo "   ✅ Configuration verified"

# Activate virtual environment
echo ""
echo "📋 Activating virtual environment..."
source venv/bin/activate
echo "   ✅ Virtual environment activated"

# Check if port 3000 is already in use
echo ""
echo "📋 Checking port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "   ⚠️  Port 3000 is already in use!"
    echo ""
    PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    echo "   Process $PID is using port 3000"
    read -p "   Do you want to kill it and continue? (y/N): " response
    
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        echo "   🔫 Killing process $PID..."
        kill -9 $PID
        sleep 2
        echo "   ✅ Process killed"
    else
        echo "   Exiting..."
        exit 0
    fi
else
    echo "   ✅ Port 3000 is available"
fi

# Start the service
echo ""
echo "================================================================"
echo "  🚀 Starting Genie API Service on http://0.0.0.0:3000"
echo "================================================================"
echo ""
echo "  📍 API Endpoints:"
echo "     • Swagger UI:  http://localhost:3000/docs"
echo "     • ReDoc:       http://localhost:3000/redoc"
echo "     • Health:      http://localhost:3000/"
echo ""
echo "  🧪 Test Data Endpoints:"
echo "     • Boundary:    /genieapi/assistant/testdata/boundary/generate"
echo "     • Positive:    /genieapi/assistant/testdata/positive/generate"
echo "     • Negative:    /genieapi/assistant/testdata/negative/generate"
echo "     • Security:    /genieapi/assistant/testdata/security/generate"
echo "     • Equivalence: /genieapi/assistant/testdata/equivalence/generate"
echo ""
echo "  📝 Press CTRL+C to stop the service"
echo ""
echo "================================================================"
echo ""

# Run the service
python main.py

echo ""
echo "================================================================"
echo "  👋 Service stopped"
echo "================================================================"
echo ""
