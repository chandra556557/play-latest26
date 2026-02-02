# 🔄 External API Backend Conversion Flow

## Overview

This document explains how the backend converts and forwards frontend requests to external Genie API for test data generation.

---

## 📊 High-Level Flow Diagram

```
Frontend Request
    ↓
Express Router (testdata-management.routes.ts)
    ↓
Controller (testData.controller.ts)
    ↓
Read .env Configuration
    ↓
Convert Request (URL, Token, Headers)
    ↓
Forward to External API (34.46.36.105:3000)
    ↓
Process Response
    ↓
Add Metadata
    ↓
Return to Frontend
```

---

## 🎯 Complete Request Conversion Flow

### **STEP 1: Frontend Sends Request**

**File:** `frontend/src/components/ScriptEnhancementModal.tsx`

```javascript
const response = await axios.post('http://localhost:3001/api/testdata/generate/positive', {
  script_code: "await page.fill('#name', 'John');",
  template: {},
  count: 10
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer user-jwt-token'
  }
});
```

**Input Request:**
```json
{
  "script_code": "await page.fill('#name', 'John');",
  "template": {},
  "count": 10
}
```

---

### **STEP 2: Express Router Receives Request**

**File:** `backend/src/routes/testdata-management.routes.ts` (Line 209)

```typescript
// External API forwarding routes - Test Data Generation (NO AUTH REQUIRED)
router.post('/generate/security', generateSecurityTestData);
router.post('/generate/boundary', generateBoundaryTestData);
router.post('/generate/equivalence', generateEquivalenceTestData);
router.post('/generate/positive', generatePositiveTestData);  // ← This route
router.post('/generate/negative', generateNegativeTestData);
```

**What Happens:**
- ✅ Request hits `/api/testdata/generate/positive`
- ✅ Router skips auth (Line 30: path starts with `/generate/`)
- ✅ Calls `generatePositiveTestData` controller

---

### **STEP 3: Controller Extracts Test Type**

**File:** `backend/src/controllers/testData.controller.ts` (Lines 369-371)

```typescript
// Generate test data - Positive
export const generatePositiveTestData = async (req: Request, res: Response) => {
  await forwardToExternalAPI('positive', req, res);
  //                          ⬆️ Test type passed here
};
```

**What Happens:**
- ✅ Controller receives `req` and `res`
- ✅ Passes test type `'positive'` to `forwardToExternalAPI`
- ✅ All 5 test types use the same core function

**Available Test Types:**
- `security` → Line 354-356
- `boundary` → Line 359-361
- `equivalence` → Line 364-366
- `positive` → Line 369-371
- `negative` → Line 374-376

---

### **STEP 4: Extract Request Body**

**File:** `backend/src/controllers/testData.controller.ts` (Line 277)

```typescript
const { script_code, template, count } = req.body;
```

**Extracted Data:**
```javascript
script_code = "await page.fill('#name', 'John');"
template = {}
count = 10
```

---

### **STEP 5: Map Test Type to External API URL**

**File:** `backend/src/controllers/testData.controller.ts` (Lines 280-288)

```typescript
// Get external API URL and token from .env
const apiUrlMap: Record<string, string | undefined> = {
  'security': process.env.EXTERNAL_SECURITY_API_URL,
  'boundary': process.env.EXTERNAL_BOUNDARY_API_URL,
  'equivalence': process.env.EXTERNAL_EQUIVALENCE_API_URL,
  'positive': process.env.EXTERNAL_POSITIVE_API_URL,    // ✅ This one selected
  'negative': process.env.EXTERNAL_NEGATIVE_API_URL
};

const externalApiUrl = apiUrlMap[testDataType];  // testDataType = 'positive'
```

**URL Mapping Table:**

| Test Type | Environment Variable | External API URL |
|-----------|---------------------|------------------|
| `security` | `EXTERNAL_SECURITY_API_URL` | `http://34.46.36.105:3000/genieapi/assistant/testdata/security/generate` |
| `boundary` | `EXTERNAL_BOUNDARY_API_URL` | `http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate` |
| `equivalence` | `EXTERNAL_EQUIVALENCE_API_URL` | `http://34.46.36.105:3000/genieapi/assistant/testdata/equivalence/generate` |
| `positive` | `EXTERNAL_POSITIVE_API_URL` | `http://34.46.36.105:3000/genieapi/assistant/testdata/positive/generate` |
| `negative` | `EXTERNAL_NEGATIVE_API_URL` | `http://34.46.36.105:3000/genieapi/assistant/testdata/negative/generate` |

**Result:**
```javascript
externalApiUrl = "http://34.46.36.105:3000/genieapi/assistant/testdata/positive/generate"
```

---

### **STEP 6: Read Bearer Token from .env**

**File:** `backend/src/controllers/testData.controller.ts` (Line 289)

```typescript
const externalToken = process.env.EXTERNAL_API_TOKEN;
```

**Configuration File:** `backend/.env`

```env
EXTERNAL_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwZ2FkbWluQGdtYWlsLmNvbSIsInVzZXJJZCI6IjEiLCJleHAiOjE3NjY4MjcwODR9.a_2uqlhnaA6mWVRpSgubud9Kxk-eLLvj-KmlcMX1JMw
```

**Token Details:**
- **Type:** JWT (JSON Web Token)
- **Algorithm:** HS256
- **Expiration:** December 27, 2025
- **User:** pgadmin@gmail.com
- **User ID:** 1

---

### **STEP 7: Validate Configuration**

**File:** `backend/src/controllers/testData.controller.ts` (Lines 291-305)

```typescript
if (!externalApiUrl) {
  res.status(400).json({
    success: false,
    error: `External API URL for ${testDataType} not configured in .env file`
  });
  return;
}

if (!externalToken) {
  res.status(400).json({
    success: false,
    error: 'EXTERNAL_API_TOKEN not configured in .env file'
  });
  return;
}
```

**Validation Checks:**
1. ✅ External API URL exists in `.env`
2. ✅ External API token exists in `.env`
3. ❌ Returns 400 Bad Request if either is missing

**Console Output:**
```bash
📤 Forwarding to external API: http://34.46.36.105:3000/genieapi/assistant/testdata/positive/generate
🔑 Using token from .env
```

---

### **STEP 8: Build & Send External API Request**

**File:** `backend/src/controllers/testData.controller.ts` (Lines 310-320)

```typescript
// Forward request to external API
const response = await axios.post(externalApiUrl, {
  script_code,      // ← From frontend request body
  template,         // ← From frontend request body
  count             // ← From frontend request body
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${externalToken}`  // ← From .env
  }
});
```

---

## 🔄 Request Transformation

### **Before Conversion (Frontend → Backend)**

```http
POST http://localhost:3001/api/testdata/generate/positive HTTP/1.1
Content-Type: application/json
Authorization: Bearer user-jwt-token-here

{
  "script_code": "await page.fill('#name', 'John');",
  "template": {},
  "count": 10
}
```

### **After Conversion (Backend → External API)**

```http
POST http://34.46.36.105:3000/genieapi/assistant/testdata/positive/generate HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "script_code": "await page.fill('#name', 'John');",
  "template": {},
  "count": 10
}
```

### **Key Changes**

| Component | Before (Frontend → Backend) | After (Backend → External) |
|-----------|----------------------------|---------------------------|
| **URL** | `localhost:3001/api/testdata/generate/positive` | `34.46.36.105:3000/genieapi/assistant/testdata/positive/generate` |
| **Authorization** | User JWT Token | External API Token (from `.env`) |
| **Body** | `{script_code, template, count}` | Same (passed through) |
| **Headers** | `Content-Type: application/json` | Same + Bearer token |

---

### **STEP 9: Receive External API Response**

**File:** `backend/src/controllers/testData.controller.ts` (Line 322)

```typescript
console.log(`✅ External API response received`);
```

**Example External API Response:**
```json
{
  "data": [
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "age": 25,
      "phone": "+1-555-0123",
      "_testDataType": "positive",
      "_scenario_type": "valid_user"
    },
    {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "age": 30,
      "phone": "+1-555-0456",
      "_testDataType": "positive",
      "_scenario_type": "valid_user"
    }
    // ... 8 more records
  ]
}
```

---

### **STEP 10: Add Metadata & Return to Frontend**

**File:** `backend/src/controllers/testData.controller.ts` (Lines 324-333)

```typescript
// Return external API response
res.status(200).json({
  success: true,
  data: response.data,        // ← External API response
  metadata: {
    external_endpoint: externalApiUrl,
    test_data_type: testDataType,
    source: 'external_api'    // ← Indicates data came from external API
  }
});
```

**Final Response to Frontend:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "age": 25,
        "phone": "+1-555-0123",
        "_testDataType": "positive"
      },
      {
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "age": 30,
        "phone": "+1-555-0456",
        "_testDataType": "positive"
      }
    ]
  },
  "metadata": {
    "external_endpoint": "http://34.46.36.105:3000/genieapi/assistant/testdata/positive/generate",
    "test_data_type": "positive",
    "source": "external_api"
  }
}
```

---

## 🔧 Error Handling

**File:** `backend/src/controllers/testData.controller.ts` (Lines 334-350)

```typescript
} catch (error: any) {
  console.error(`❌ External API Error:`, error.message);
  if (error.response) {
    console.error(`👉 Status:`, error.response.status);
    console.error(`👉 Response:`, error.response.data);
  }

  res.status(error.response?.status || 500).json({
    success: false,
    error: error.response?.data || error.message,
    metadata: {
      external_endpoint: error.config?.url,
      test_data_type: testDataType,
      source: 'external_api_error'
    }
  });
}
```

**Error Response Example:**
```json
{
  "success": false,
  "error": {
    "detail": "Not authenticated"
  },
  "metadata": {
    "external_endpoint": "http://34.46.36.105:3000/genieapi/assistant/testdata/positive/generate",
    "test_data_type": "positive",
    "source": "external_api_error"
  }
}
```

---

## 📋 Configuration Summary

### **Environment Variables Required**

**File:** `backend/.env`

```env
# External API URLs (5 endpoints)
EXTERNAL_SECURITY_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/security/generate
EXTERNAL_BOUNDARY_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/boundary/generate
EXTERNAL_EQUIVALENCE_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/equivalence/generate
EXTERNAL_POSITIVE_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/positive/generate
EXTERNAL_NEGATIVE_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/negative/generate

# External API Authentication Token
EXTERNAL_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwZ2FkbWluQGdtYWlsLmNvbSIsInVzZXJJZCI6IjEiLCJleHAiOjE3NjY4MjcwODR9.a_2uqlhnaA6mWVRpSgubud9Kxk-eLLvj-KmlcMX1JMw
```

---

## 🎯 Key Files Involved

| File | Purpose | Lines |
|------|---------|-------|
| `backend/.env` | Configuration (URLs & Token) | 66-83 |
| `testdata-management.routes.ts` | Route definitions | 206-210 |
| `testData.controller.ts` | Request forwarding logic | 275-376 |
| `ScriptEnhancementModal.tsx` | Frontend API calls | 393-523 |

---

## 💡 Why This Design?

### **Benefits of Backend Conversion**

1. **🔒 Security**
   - External API token hidden in backend `.env`
   - Not exposed to frontend/browser
   - Single point of credential management

2. **🔄 Flexibility**
   - Change external API URLs without frontend changes
   - Easy to switch between environments (dev/staging/prod)
   - Can add fallback APIs if primary fails

3. **🎯 Single Point of Control**
   - All external API calls go through backend
   - Centralized logging and monitoring
   - Easy to add rate limiting or caching

4. **🛡️ Error Handling**
   - Backend catches and handles external API errors
   - Can implement retry logic
   - Clean error messages to frontend

5. **📊 Metadata Injection**
   - Backend adds tracking metadata to responses
   - Source identification (`source: 'external_api'`)
   - Endpoint tracking for debugging

6. **🌐 CORS Bypass**
   - Frontend doesn't need CORS access to external API
   - External API only needs to trust backend server
   - Simplifies security configuration

---

## 🚀 Request Flow Summary

```
1. Frontend → Backend
   URL: localhost:3001/api/testdata/generate/positive
   Auth: User JWT Token
   
2. Backend Processing
   - Extract test type: 'positive'
   - Read .env: EXTERNAL_POSITIVE_API_URL
   - Read .env: EXTERNAL_API_TOKEN
   - Validate configuration
   
3. Backend → External API
   URL: 34.46.36.105:3000/genieapi/assistant/testdata/positive/generate
   Auth: External API Token (from .env)
   Body: {script_code, template, count}
   
4. External API → Backend
   Response: {data: [...test records...]}
   
5. Backend → Frontend
   Response: {success: true, data: {...}, metadata: {...}}
```

---

## 📝 Testing the Flow

### **Test External API Connection**

```bash
# From backend directory
curl -X POST http://localhost:3001/api/testdata/generate/positive \
  -H "Content-Type: application/json" \
  -d '{
    "script_code": "await page.fill(\"#name\", \"test\");",
    "template": {},
    "count": 5
  }'
```

### **Expected Response**

```json
{
  "success": true,
  "data": {
    "data": [
      {"name": "...", "email": "...", "_testDataType": "positive"}
    ]
  },
  "metadata": {
    "external_endpoint": "http://34.46.36.105:3000/genieapi/assistant/testdata/positive/generate",
    "test_data_type": "positive",
    "source": "external_api"
  }
}
```

### **Check Backend Logs**

```bash
📤 Forwarding to external API: http://34.46.36.105:3000/genieapi/assistant/testdata/positive/generate
🔑 Using token from .env
✅ External API response received
```

---

## 🔧 Deployment Considerations

### **Environment Setup**

For different environments (staging, production), update `.env`:

```env
# Development
EXTERNAL_POSITIVE_API_URL=http://34.46.36.105:3000/genieapi/assistant/testdata/positive/generate

# Staging
EXTERNAL_POSITIVE_API_URL=https://staging-api.example.com/testdata/positive/generate

# Production
EXTERNAL_POSITIVE_API_URL=https://api.example.com/testdata/positive/generate
```

### **Token Rotation**

Current token expires: **December 27, 2025**

To update:
1. Get new token from API provider
2. Update `EXTERNAL_API_TOKEN` in `.env`
3. Restart backend server
4. No code changes needed

---

## 🎓 Summary

The backend acts as a **secure proxy** that:
1. ✅ Receives requests from frontend
2. ✅ Reads configuration from `.env`
3. ✅ Converts URLs and authentication
4. ✅ Forwards to external Genie API
5. ✅ Processes and enriches responses
6. ✅ Returns data to frontend

This architecture provides security, flexibility, and maintainability while keeping the frontend simple and external API credentials secure.
