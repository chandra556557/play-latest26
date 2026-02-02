# 🔴 External API 401 Unauthorized - Troubleshooting Guide

## 🚨 Issue Detected

The external boundary API at `http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate` is returning **401 Unauthorized**.

---

## 📋 Error Details

```
Status Code: 401 Unauthorized
WWW-Authenticate: Bearer
Response: {"detail": "Not authenticated"} (or similar)
```

This means the Bearer token authentication is failing.

---

## 🔍 Possible Causes

### **1. Token Expired** ⏰

**Current Token Expiration:** December 27, 2025 (`exp: 1766816132`)

**Check:**
```bash
# Decode JWT to check expiration
# Current timestamp
date +%s

# Token expiration: 1766816132
# If current timestamp > 1766816132, token is EXPIRED
```

**Solution:** Get a new token from the API provider.

---

### **2. Token Format Issue** 📝

The external API might expect:
- Different token format
- Additional claims in the JWT
- Different authentication method

**Current Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwZ2FkbWluQGdtYWlsLmNvbSIsInVzZXJJZCI6IjEiLCJleHAiOjE3NjY4MTYxMzJ9.0GbD4u8dvdJDBJEuthYYXovq_j_c4gSem6fNMvWxtO8
```

**Verify with API docs:** Check if the API expects a different header name (e.g., `X-API-Key`, `X-Auth-Token`)

---

### **3. Token Not Being Sent** 📤

**Check `.env` file:**
```bash
# Verify token is set correctly
cat c:\chandra-1212-main\ai-analysis-service\.env | grep EXTERNAL_API_TOKEN
```

**Expected output:**
```
EXTERNAL_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**If missing:** Token is not loaded into environment.

---

### **4. API Endpoint Changed** 🔄

The external API might have changed endpoints or authentication requirements.

**Verify endpoint:**
```bash
# Check if endpoint is accessible
curl http://34.46.36.105:3000/genieapi/docs
```

**Expected:** Should return API documentation or redirect to docs.

---

### **5. Network/CORS Issue** 🌐

The API might be blocking requests from your IP or domain.

**Check:**
- Firewall rules
- CORS configuration
- IP whitelisting

---

## ✅ Solutions

### **Solution 1: Verify and Update Token**

**Step 1: Contact API Provider**
```
Request a new Bearer token from:
- API administrator
- Email: pgadmin@gmail.com (based on token subject)
```

**Step 2: Update `.env` file**
```bash
# Edit .env file
EXTERNAL_API_TOKEN=your-new-token-here
```

**Step 3: Restart service**
```bash
cd c:\chandra-1212-main\ai-analysis-service
python main.py
```

---

### **Solution 2: Test Token Directly**

**Test with cURL:**
```bash
curl -X POST http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwZ2FkbWluQGdtYWlsLmNvbSIsInVzZXJJZCI6IjEiLCJleHAiOjE3NjY4MTYxMzJ9.0GbD4u8dvdJDBJEuthYYXovq_j_c4gSem6fNMvWxtO8" \
  -d '{
    "script_code": "test",
    "template": {},
    "count": 5
  }'
```

**Expected (if token works):**
```json
{
  "success": true,
  "data": [...]
}
```

**If 401 error:** Token is invalid or expired.

---

### **Solution 3: Use Different Authentication Method**

The API might support alternative authentication:

**Option A: API Key in Query Param**
```python
response = await client.post(
    f"{external_api_url}?api_key={api_token}",
    json={...}
)
```

**Option B: Custom Header**
```python
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': api_token,  # Instead of Authorization: Bearer
}
```

**Option C: Basic Auth**
```python
from httpx import BasicAuth
response = await client.post(
    external_api_url,
    json={...},
    auth=BasicAuth('username', 'password')
)
```

---

### **Solution 4: Enable Automatic Fallback** ✅ (Already Implemented)

The system already falls back to local GPT-4o when external API fails:

```python
if response.status_code == 401:
    print("❌ Authentication failed. Falling back to local generation...")
    # Uses local GPT-4o automatically
```

**Console output:**
```
🌐 Using external boundary API: http://34.46.36.105:3000/...
🔑 Using Bearer token for authentication
   Token (first 20 chars): eyJhbGciOiJIUzI1NiIsI...
❌ Authentication failed (401). Token may be expired or invalid.
   Response: {"detail": "Not authenticated"}
   Falling back to local generation...
🤖 Using GPT-4o + Enhanced Script Analyzer...
✅ Generated test data with local GPT-4o
```

**Result:** Service continues working with local generation!

---

## 🧪 Debug Steps

### **1. Check Console Logs**

Start the service and watch for:
```bash
cd c:\chandra-1212-main\ai-analysis-service
python main.py

# Then trigger boundary request
# Watch for:
# 🔑 Using Bearer token for authentication
#    Token (first 20 chars): eyJhbGciOiJIUzI1NiIsI...
# ❌ Authentication failed (401). Token may be expired or invalid.
```

---

### **2. Verify Token Loading**

**Add temporary debug:**
```python
# In main.py, add after load_dotenv()
print(f"DEBUG: EXTERNAL_API_TOKEN = {os.getenv('EXTERNAL_API_TOKEN', 'NOT SET')[:30]}...")
```

**Restart and check:** Should print first 30 characters of token.

---

### **3. Test External API Independently**

**Python test script:**
```python
import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwZ2FkbWluQGdtYWlsLmNvbSIsInVzZXJJZCI6IjEiLCJleHAiOjE3NjY4MTYxMzJ9.0GbD4u8dvdJDBJEuthYYXovq_j_c4gSem6fNMvWxtO8"

response = requests.post(
    'http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    },
    json={
        'script_code': 'test',
        'template': {},
        'count': 5
    }
)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
```

---

## 📧 Contact API Provider

If token is valid but still getting 401:

**Contact Information:**
- **Email:** pgadmin@gmail.com (from JWT subject)
- **User ID:** 1 (from JWT payload)

**Request:**
1. Verify token is still valid
2. Check if API endpoint or authentication changed
3. Request new token if expired
4. Confirm Bearer authentication is correct method

**Information to Provide:**
- Current token (first/last 10 chars only)
- Error response from API
- Request format being used

---

## 🔄 Temporary Workaround

**Use Local GPT-4o Only:**

**Option 1: Comment out external URL in `.env`:**
```bash
# EXTERNAL_BOUNDARY_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate
```

**Option 2: Remove external URL:**
```bash
EXTERNAL_BOUNDARY_API_URL=
```

**Result:** Service will use local GPT-4o generation only (no external API calls).

---

## ✅ Current Status

**System Behavior:**
- ✅ Attempts to use external API first
- ✅ Detects 401 authentication failure
- ✅ Logs detailed error information
- ✅ Automatically falls back to local GPT-4o
- ✅ Service continues working without interruption

**User Impact:** None - users still get boundary test data from local GPT-4o.

---

## 📚 Next Steps

1. **Check token expiration** (expires Dec 27, 2025)
2. **Test token directly with cURL** (see Solution 2)
3. **Contact API provider** if token should be valid
4. **Get new token** if expired
5. **Update `.env`** with new token
6. **Restart service** to use new token

---

## 🎯 Summary

**Problem:** External API returns 401 Unauthorized
**Cause:** Token expired, invalid, or authentication method mismatch
**Impact:** None - automatic fallback to local GPT-4o works
**Solution:** Get new token from API provider and update `.env`

**Service Status:** ✅ Working (using local fallback)
