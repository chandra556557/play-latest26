# 🌐 External Boundary API Configuration

## ✅ Configuration Complete

The AI Analysis Service now supports using an **external LLM-integrated API** for boundary value analysis test data generation.

---

## 📝 Environment Variable Added

### **File:** `.env`

```bash
# OpenAI API Key for GPT-4o Integration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# External LLM-Integrated API Endpoints
# Boundary Value Analysis - External Genie API
EXTERNAL_BOUNDARY_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate
```

---

## 🔧 How It Works

### **Automatic Fallback Strategy**

The service now uses a smart fallback approach:

```
1. Check if EXTERNAL_BOUNDARY_API_URL is set
   ↓
2. If YES → Use external LLM API (34.46.36.105:3000)
   ↓
3. If NO or FAILS → Fall back to local GPT-4o generation
```

### **Code Implementation**

**File:** `main.py` (Lines 5220-5291)

```python
async def generate_boundary_testdata(request: DynamicTestDataRequest):
    """
    Generate BOUNDARY VALUE ANALYSIS test data.
    
    If EXTERNAL_BOUNDARY_API_URL is set, forwards the request to external LLM-integrated API.
    Otherwise, uses local GPT-4o generation.
    """
    try:
        # Check if external boundary API is configured
        external_api_url = os.getenv('EXTERNAL_BOUNDARY_API_URL')
        
        if external_api_url:
            # Use external LLM-integrated API
            import httpx
            print(f"🌐 Using external boundary API: {external_api_url}")
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    external_api_url,
                    json={
                        'script_code': request.script_code,
                        'template': request.template,
                        'count': request.count,
                        'options': request.options
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    # Add metadata to indicate external API was used
                    result['metadata']['source'] = 'external_llm_api'
                    result['metadata']['external_endpoint'] = external_api_url
                    print("✅ External boundary API response received")
                    return result
                else:
                    print(f"⚠️ External API failed, falling back to local generation")
        
        # Fall back to local generation
        request.testDataType = 'boundary'
        result = await generate_dynamic_testdata(request)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")
```

---

## 🚀 Usage

### **1. Set the Environment Variable**

**Option A: Update `.env` file**
```bash
# Edit c:\chandra-1212-main\ai-analysis-service\.env
EXTERNAL_BOUNDARY_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate
```

**Option B: Set in terminal (Windows PowerShell)**
```powershell
$env:EXTERNAL_BOUNDARY_API_URL="http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate"
```

**Option C: Set in terminal (Linux/Mac)**
```bash
export EXTERNAL_BOUNDARY_API_URL="http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate"
```

---

### **2. Start the AI Analysis Service**

```bash
cd c:\chandra-1212-main\ai-analysis-service
python main.py
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

### **3. Test Boundary Endpoint**

**Using cURL:**
```bash
curl -X POST http://localhost:8000/api/testdata/generate/boundary \
  -H "Content-Type: application/json" \
  -d '{
    "script_code": "await page.fill('"'"'#age'"'"', '"'"'25'"'"');",
    "template": {"age": "{{faker.number}}"},
    "count": 10
  }'
```

**Using Python:**
```python
import requests

response = requests.post(
    'http://localhost:8000/api/testdata/generate/boundary',
    json={
        'script_code': "await page.fill('#age', '25');",
        'template': {'age': '{{faker.number}}'},
        'count': 10
    }
)

print(response.json())
```

---

## 📊 Response Examples

### **When External API is Used:**

```json
{
  "success": true,
  "data": [
    {
      "age": 0,
      "_boundary_type": "min",
      "_description": "Minimum boundary value"
    },
    {
      "age": 120,
      "_boundary_type": "max",
      "_description": "Maximum boundary value"
    },
    {
      "age": -1,
      "_boundary_type": "min-1",
      "_description": "Below minimum (off-by-one)"
    }
  ],
  "metadata": {
    "source": "external_llm_api",  // ✅ External API was used
    "external_endpoint": "http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate",
    "testDataType": "boundary",
    "count": 10,
    "boundary_types": ["min", "max", "min-1", "max+1", "zero", "null", "empty", "overflow", "underflow"],
    "coverage_level": "comprehensive",
    "endpoint": "/api/testdata/generate/boundary"
  }
}
```

### **When Local GPT-4o is Used (Fallback):**

```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "source": "gpt4o_with_script_analyzer",  // ✅ Local GPT-4o was used
    "testDataType": "boundary",
    "analyzer_version": "2.0",
    "fields_analyzed": 1,
    "constraints_used": true,
    "boundary_types": ["min", "max", "min-1", "max+1", "zero", "null", "empty", "overflow", "underflow"],
    "endpoint": "/api/testdata/generate/boundary"
  }
}
```

---

## 🔍 Verification

### **Check Console Output**

When the service receives a boundary request, you'll see one of these logs:

**External API Used:**
```
🌐 Using external boundary API: http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate
✅ External boundary API response received
```

**Fallback to Local:**
```
⚠️ External API failed with status 500, falling back to local generation
🤖 Using GPT-4o + Enhanced Script Analyzer...
```

**No External API Configured:**
```
🤖 Using GPT-4o + Enhanced Script Analyzer...
(No external API logs)
```

---

## 🎯 Benefits

### **Using External API:**
- ✅ **Advanced LLM Models:** Uses specialized LLM service
- ✅ **Dedicated Processing:** Offloads computation to external server
- ✅ **Better Performance:** Optimized for boundary analysis
- ✅ **No Local GPU Required:** External API handles computation

### **Fallback to Local:**
- ✅ **Reliability:** Works even if external API is down
- ✅ **Privacy:** Keeps data local when needed
- ✅ **Offline Support:** No internet dependency for fallback

---

## ⚙️ Configuration Options

### **Disable External API**

To use only local GPT-4o generation, remove or comment out the environment variable:

```bash
# .env file
# EXTERNAL_BOUNDARY_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate
```

Or set it to empty:
```bash
EXTERNAL_BOUNDARY_API_URL=
```

### **Change External Endpoint**

To use a different external API:

```bash
# .env file
EXTERNAL_BOUNDARY_API_URL=https://your-custom-api.com/boundary/generate
```

---

## 🔒 Security Considerations

### **1. Network Access**
- Ensure `34.46.36.105:3000` is accessible from your network
- Check firewall rules if connection fails
- Use HTTPS in production: `https://34.46.36.105:3000/...`

### **2. API Authentication**

If the external API requires authentication, modify the request in `main.py`:

```python
response = await client.post(
    external_api_url,
    json={...},
    headers={
        'Authorization': 'Bearer YOUR_API_TOKEN',
        'X-API-Key': 'your-api-key'
    }
)
```

And add to `.env`:
```bash
EXTERNAL_API_TOKEN=your-token-here
```

### **3. Timeout Configuration**

The default timeout is 60 seconds. To adjust:

```python
async with httpx.AsyncClient(timeout=120.0) as client:  # 2 minutes
```

---

## 🐛 Troubleshooting

### **Issue 1: External API Connection Failed**

**Error:**
```
⚠️ External API failed with status 500, falling back to local generation
```

**Solutions:**
1. Check if external API is running: `curl http://34.46.36.105:3000/genieapi/docs`
2. Verify network connectivity: `ping 34.46.36.105`
3. Check firewall rules
4. Ensure API URL is correct in `.env`

---

### **Issue 2: ModuleNotFoundError: httpx**

**Error:**
```
ModuleNotFoundError: No module named 'httpx'
```

**Solution:**
```bash
pip install httpx==0.25.1
```

Or reinstall all dependencies:
```bash
pip install -r requirements.txt
```

---

### **Issue 3: External API Returns 400/422**

**Error:**
```
⚠️ External API failed with status 422, falling back to local generation
```

**Cause:** Request format mismatch

**Solution:** Check external API documentation for expected request format. The current format sent is:
```json
{
  "script_code": "string",
  "template": {},
  "count": 10,
  "options": {}
}
```

---

## 📚 Related Documentation

- **External API Docs:** `http://34.46.36.105:3000/genieapi/docs`
- **Frontend Integration:** [`EXTERNAL_BOUNDARY_API_INTEGRATION.md`](../EXTERNAL_BOUNDARY_API_INTEGRATION.md)
- **Environment Variables:** [`.env.example`](.env.example)
- **Main Service:** [`main.py`](main.py)

---

## ✅ Summary

**Configuration Files:**
- ✅ `.env` - Added `EXTERNAL_BOUNDARY_API_URL`
- ✅ `.env.example` - Updated with external API example
- ✅ `main.py` - Enhanced `generate_boundary_testdata` function

**Features:**
- ✅ Automatic external API detection
- ✅ Smart fallback to local GPT-4o
- ✅ Comprehensive error handling
- ✅ Console logging for debugging
- ✅ Metadata tracking (external vs local)

**Status:** Ready to use! 🚀

---

## 🧪 Quick Test

```bash
# 1. Set the environment variable
echo "EXTERNAL_BOUNDARY_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate" >> .env

# 2. Start the service
python main.py

# 3. Test the endpoint
curl -X POST http://localhost:8000/api/testdata/generate/boundary \
  -H "Content-Type: application/json" \
  -d '{"script_code": "await page.fill('"'"'#age'"'"', '"'"'25'"'"');", "template": {"age": "{{faker.number}}"}, "count": 5}'

# 4. Check the response - look for "source": "external_llm_api"
```

**Expected:** You should see `"source": "external_llm_api"` in the response metadata! ✅
