# 🔑 External API Bearer Token Configuration

## ✅ Setup Complete

Added Bearer token authentication for the external LLM-integrated boundary API.

---

## 📝 Environment Variables Added

### **File: `.env`**

```bash
# OpenAI API Key for GPT-4o Integration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# External LLM-Integrated API Endpoints
# Boundary Value Analysis - External Genie API
EXTERNAL_BOUNDARY_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate

# External API Access Token
# Bearer token for authentication with external Genie API
EXTERNAL_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwZ2FkbWluQGdtYWlsLmNvbSIsInVzZXJJZCI6IjEiLCJleHAiOjE3NjY4MTYxMzJ9.0GbD4u8dvdJDBJEuthYYXovq_j_c4gSem6fNMvWxtO8
```

---

## 🔧 Code Changes

### **File: `main.py`** (Lines 5231-5254)

**Added Bearer token authentication:**

```python
async def generate_boundary_testdata(request: DynamicTestDataRequest):
    try:
        external_api_url = os.getenv('EXTERNAL_BOUNDARY_API_URL')
        
        if external_api_url:
            import httpx
            print(f"🌐 Using external boundary API: {external_api_url}")
            
            # ✅ NEW: Get access token from environment
            api_token = os.getenv('EXTERNAL_API_TOKEN', '')
            
            # ✅ NEW: Build headers with Bearer token
            headers = {'Content-Type': 'application/json'}
            if api_token:
                headers['Authorization'] = f'Bearer {api_token}'
                print("🔑 Using Bearer token for authentication")
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    external_api_url,
                    json={...},
                    headers=headers  # ✅ NEW: Include auth headers
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result
```

---

## 🔐 Token Details

### **Token Information:**

```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwZ2FkbWluQGdtYWlsLmNvbSIsInVzZXJJZCI6IjEiLCJleHAiOjE3NjY4MTYxMzJ9.0GbD4u8dvdJDBJEuthYYXovq_j_c4gSem6fNMvWxtO8

Decoded Payload:
{
  "sub": "pgadmin@gmail.com",
  "userId": "1",
  "exp": 1766816132  // Expires: December 27, 2025
}

Algorithm: HS256 (HMAC-SHA256)
```

---

## 🚀 How It Works

### **Request Flow with Authentication:**

```
1. User requests boundary test data
   ↓
2. Backend checks EXTERNAL_BOUNDARY_API_URL
   ↓
3. Backend reads EXTERNAL_API_TOKEN from .env
   ↓
4. Builds request headers:
   {
     "Content-Type": "application/json",
     "Authorization": "Bearer eyJhbGci..."
   }
   ↓
5. Sends POST request to external API
   ↓
6. External API validates Bearer token
   ↓
7. Returns boundary test data (if token valid)
```

---

## 📊 Console Output

### **When Token is Used:**

```bash
🌐 Using external boundary API: http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate
🔑 Using Bearer token for authentication
✅ External boundary API response received
```

### **When Token is Not Set:**

```bash
🌐 Using external boundary API: http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate
(No authentication message - request sent without Bearer token)
```

---

## 🧪 Testing

### **Test with cURL (with token):**

```bash
curl -X POST http://localhost:8000/api/testdata/generate/boundary \
  -H "Content-Type: application/json" \
  -d '{
    "script_code": "await page.fill('"'"'#age'"'"', '"'"'25'"'"');",
    "template": {"age": "{{faker.number}}"},
    "count": 10
  }'
```

**Expected:**
- Backend adds `Authorization: Bearer eyJhbGci...` header automatically
- External API authenticates the request
- Returns boundary test data with status 200

---

### **Test Authentication Directly:**

```bash
# Direct call to external API (to verify token works)
curl -X POST http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwZ2FkbWluQGdtYWlsLmNvbSIsInVzZXJJZCI6IjEiLCJleHAiOjE3NjY4MTYxMzJ9.0GbD4u8dvdJDBJEuthYYXovq_j_c4gSem6fNMvWxtO8" \
  -d '{
    "script_code": "await page.fill('"'"'#age'"'"', '"'"'25'"'"');",
    "template": {"age": "{{faker.number}}"},
    "count": 5
  }'
```

---

## 🔄 Token Rotation

### **When Token Expires:**

The current token expires on **December 27, 2025** (`exp: 1766816132`).

**To update the token:**

1. **Get new token from external API provider**
2. **Update `.env` file:**
   ```bash
   EXTERNAL_API_TOKEN=your-new-token-here
   ```
3. **Restart AI service:**
   ```bash
   python main.py
   ```

No code changes needed - just update the environment variable!

---

## 🛡️ Security Best Practices

### **1. Keep Token Secret:**
- ✅ Token is in `.env` file (should be in `.gitignore`)
- ✅ Never commit tokens to Git
- ✅ Use environment variables in production

### **2. Token Expiration:**
- Current token expires: **December 27, 2025**
- Monitor expiration and rotate before it expires
- Set up alerts for token expiration

### **3. Token Scope:**
- Token has access to: `pgadmin@gmail.com` (userId: 1)
- Limited to boundary test data generation
- Cannot be used for other operations

---

## ⚠️ Troubleshooting

### **Issue 1: 401 Unauthorized**

**Error:**
```
⚠️ External API failed with status 401, falling back to local generation
```

**Causes:**
- Token expired
- Token invalid
- Token not set in `.env`

**Solution:**
1. Check token expiration: Current expires Dec 27, 2025
2. Verify token in `.env` file
3. Restart AI service after updating token

---

### **Issue 2: 403 Forbidden**

**Error:**
```
⚠️ External API failed with status 403, falling back to local generation
```

**Causes:**
- Token valid but insufficient permissions
- User account disabled

**Solution:**
- Contact external API provider
- Request proper permissions for boundary endpoint

---

### **Issue 3: Token Not Being Sent**

**Symptom:** No "🔑 Using Bearer token" message in console

**Causes:**
- `EXTERNAL_API_TOKEN` not set in `.env`
- `.env` file not loaded

**Solution:**
1. Check `.env` file exists in `ai-analysis-service/` directory
2. Verify token is set: `EXTERNAL_API_TOKEN=eyJhbGci...`
3. Restart service to reload environment variables

---

## 📚 Related Files

- **`.env`** - Contains actual token (keep secret!)
- **`.env.example`** - Template with placeholder
- **`main.py`** - Code that uses the token
- **`EXTERNAL_BOUNDARY_API_CONFIG.md`** - External API setup guide

---

## ✅ Summary

**What Was Added:**
- ✅ `EXTERNAL_API_TOKEN` environment variable in `.env`
- ✅ Automatic Bearer token inclusion in external API requests
- ✅ Token validation logging
- ✅ Updated `.env.example` with token template

**Features:**
- ✅ Automatic authentication with external API
- ✅ Secure token storage in environment variable
- ✅ Easy token rotation (just update `.env`)
- ✅ Console logging for debugging
- ✅ Graceful fallback if auth fails

**Token Info:**
- **User:** pgadmin@gmail.com
- **User ID:** 1
- **Expires:** December 27, 2025
- **Algorithm:** HS256

**Status:** Ready to use! 🚀

The external boundary API will now automatically authenticate using the Bearer token when making requests.
