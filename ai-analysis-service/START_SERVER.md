# 🚀 Starting the AI Analyzer Service

## ✅ Quick Start

### **Start the Server**

```bash
cd c:\chandra-1212-main\ai-analysis-service
python main.py
```

### **Expected Output**

```
INFO:     Will watch for changes in these directories: ['C:\\chandra-1212-main\\ai-analysis-service']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Note:** You may see a Pydantic warning about `logfire-plugin` - this is harmless and doesn't affect functionality.

---

## 🌐 Access the Service

Once the server is running, you have access to:

### **🎯 Interactive Swagger UI** (Recommended)
```
http://localhost:8000/docs
```

**Features:**
- ✅ Try all endpoints interactively
- ✅ View request/response schemas
- ✅ See example requests
- ✅ Copy curl commands
- ✅ Test with one click

### **📖 Alternative ReDoc UI**
```
http://localhost:8000/redoc
```

### **❤️ Health Check**
```
http://localhost:8000/health
```

### **👋 Service Info**
```
http://localhost:8000/
```

---

## 🧪 Test the Service

### **Option 1: Health Check (PowerShell)**

```powershell
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-26T...",
  "components": {
    "api": "ok",
    "script_analyzer": "ok",
    "llm_service": "fallback_mode"
  },
  "version": "2.0.0"
}
```

### **Option 2: Test Quality Score Endpoint**

```powershell
# Create a test request file
@"
{
  "script_code": "import { test } from '@playwright/test';\ntest('example', async ({ page }) => {\n  await page.goto('https://example.com');\n  await page.getByRole('button').click();\n});"
}
"@ | Out-File -FilePath test_request.json -Encoding utf8

# Send the request
Invoke-RestMethod -Uri http://localhost:8000/api/ai-analysis/quality-score -Method Post -ContentType "application/json" -InFile test_request.json
```

### **Option 3: Run Automated Tests**

```bash
python test_api_enhanced.py
```

---

## 🛑 Stopping the Server

Press **`Ctrl+C`** in the terminal where the server is running.

---

## 📊 Available Endpoints

Once running, you have **8 enhanced analysis endpoints**:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/ai-analysis/analyze-script-enhanced` | Complete enhanced analysis |
| `POST /api/ai-analysis/quality-score` | Get quality score (0-100) |
| `POST /api/ai-analysis/xpath-deep-analysis` | XPath stability analysis |
| `POST /api/ai-analysis/recommendations` | Get improvement suggestions |
| `POST /api/ai-analysis/locator-quality-report` | Locator quality distribution |
| `POST /api/ai-analysis/test-pattern-detection` | Detect test patterns |
| `POST /api/ai-analysis/external-data-sources` | Find external data sources |
| `POST /api/ai-analysis/comprehensive-report` | Complete report |

Plus **test generation endpoints**:
- `POST /api/ai-analysis/generate-tests-from-script`
- And many more LLM-powered endpoints!

---

## 🐛 Troubleshooting

### **Issue: NameError about models**

**✅ FIXED!** The missing `TestGenerationRequest` model has been added.

### **Issue: Port 8000 already in use**

```powershell
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <pid> /F

# Or use a different port
uvicorn main:app --port 8080
```

### **Issue: Pydantic logfire-plugin warning**

This warning is **harmless** and doesn't affect functionality. It's related to an optional Pydantic plugin that's not installed. The service works perfectly without it.

### **Issue: Module not found**

```bash
# Install required packages
pip install fastapi uvicorn pydantic python-dotenv openai
```

---

## 🎯 Quick Test Workflow

```bash
# Terminal 1: Start the server
cd c:\chandra-1212-main\ai-analysis-service
python main.py

# Browser: Open Swagger UI
# http://localhost:8000/docs

# Terminal 2 (optional): Run tests
python test_api_enhanced.py
```

---

## 💡 Pro Tips

### **Auto-reload on Code Changes**
The server is configured with `reload=True`, so it automatically restarts when you modify the code!

### **View Logs**
All requests and responses are logged in the terminal where the server is running.

### **Test in Browser**
The Swagger UI at `/docs` is the easiest way to test endpoints interactively.

### **Check Server Status Anytime**
```bash
curl http://localhost:8000/health
```

---

## ✅ Server is Running Successfully!

**Status:** ✅ Running  
**URL:** http://localhost:8000  
**Swagger UI:** http://localhost:8000/docs  
**Version:** 2.0.0  

**Features Enabled:**
- ✅ Enhanced script analysis
- ✅ Quality scoring (0-100)
- ✅ XPath deep analysis
- ✅ Locator quality assessment
- ✅ Test pattern detection
- ✅ Proactive recommendations
- ✅ Test data generation
- ✅ Interactive Swagger documentation

**Enjoy your AI-powered Playwright test analyzer!** 🤖✨
