# Genie API - Test Data Generation Service

🧞 **AI-Powered Test Data Generation using FastAPI + OpenAI GPT-4**

This service provides intelligent test data generation for Playwright scripts using GPT-4 to analyze scripts and generate comprehensive test data.

## Features

- ✅ **GPT-4 Powered Field Extraction**: Intelligently identifies input fields from Playwright scripts
- 🎯 **Boundary Value Analysis**: Min, max, edge cases
- ✅ **Positive Test Data**: Valid inputs
- ❌ **Negative Test Data**: Invalid inputs
- 🔒 **Security Testing**: SQL injection, XSS, command injection, path traversal
- ⚖️ **Equivalence Partitioning**: Representative samples from valid/invalid classes

## API Endpoints

All endpoints run on port **3000**:

- `POST /genieapi/assistant/testdata/boundary/generate` - Generate boundary test data
- `POST /genieapi/assistant/testdata/positive/generate` - Generate positive test data
- `POST /genieapi/assistant/testdata/negative/generate` - Generate negative test data
- `POST /genieapi/assistant/testdata/security/generate` - Generate security test data
- `POST /genieapi/assistant/testdata/equivalence/generate` - Generate equivalence test data

## Setup Instructions

### 1. Install Python 3.9+

```bash
python --version  # Should be 3.9 or higher
```

### 2. Create Virtual Environment

```bash
cd genie-api-service
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 5. Run the Service

```bash
python main.py
```

The service will start on **http://0.0.0.0:3000**

## API Documentation

Once running, access:
- **Swagger UI**: http://localhost:3000/docs
- **ReDoc**: http://localhost:3000/redoc

## Request Format

```json
{
  "scriptCode": "await page.getByLabel('Email').fill('test@example.com');\nawait page.getByLabel('Password').fill('password123');",
  "template": {},
  "count": 5,
  "testDataType": "boundary",
  "options": {}
}
```

## Response Format

```json
{
  "success": true,
  "data": [
    {
      "email": "",
      "password": "",
      "_testDataType": "boundary",
      "_index": 0
    },
    {
      "email": "a@b.c",
      "password": "123",
      "_testDataType": "boundary",
      "_index": 1
    },
    {
      "email": "test@example.com",
      "password": "Pass123!",
      "_testDataType": "boundary",
      "_index": 2
    }
  ],
  "metadata": {
    "count": 3,
    "testDataType": "boundary",
    "generated_at": "2025-12-10T14:00:00",
    "fields_detected": ["email", "password"]
  }
}
```

## How It Works

1. **Script Analysis**: GPT-4 analyzes the Playwright script to extract input fields
2. **Field Type Inference**: Determines field types (email, password, username, etc.)
3. **Data Generation**: Generates appropriate test data based on type and test category
4. **Structured Response**: Returns JSON with test data ready to use

## Integration with Node.js Backend

Your Node.js backend (port 3001) should forward requests to this service:

```javascript
const response = await axios.post('http://localhost:3000/genieapi/assistant/testdata/boundary/generate', {
  scriptCode: scriptCode,
  template: {},
  count: 5,
  testDataType: 'boundary',
  options: {}
});
```

## Production Deployment

### Update Node.js Backend .env

Point to your production URL:

```env
EXTERNAL_API_URL=http://your-production-server:3000/genieapi/assistant/testdata
EXTERNAL_API_TOKEN=your-secret-token
```

### Run with Gunicorn (Production)

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:3000
```

## Testing

### Test All Data Types Together

```bash
python test_all_data_types.py
```

This runs all 5 test data types and shows comprehensive coverage.

### Test Individual Types

```bash
# Boundary testing
python test_boundary_generation.py

# Security testing
python test_security_generation.py

# Positive & Negative testing
python test_positive_negative.py

# Equivalence partitioning
python test_equivalence_generation.py

# Any Playwright script pattern
python test_any_script_pattern.py
```

### Quick Test Examples

**1. Boundary Test Data**
```bash
curl -X POST http://localhost:3000/genieapi/assistant/testdata/boundary/generate \
  -H "Content-Type: application/json" \
  -d '{
    "scriptCode": "await page.getByLabel(\"Email\").fill(\"test@example.com\");",
    "count": 5
  }'
```

**2. Security Test Data**
```bash
curl -X POST http://localhost:3000/genieapi/assistant/testdata/security/generate \
  -H "Content-Type: application/json" \
  -d '{
    "scriptCode": "await page.getByLabel(\"Username\").fill(\"admin\");",
    "count": 10
  }'
```

**3. Positive Test Data**
```bash
curl -X POST http://localhost:3000/genieapi/assistant/testdata/positive/generate \
  -H "Content-Type: application/json" \
  -d '{
    "scriptCode": "await page.getByLabel(\"Phone\").fill(\"1234567890\");",
    "count": 5
  }'
```

**4. Negative Test Data**
```bash
curl -X POST http://localhost:3000/genieapi/assistant/testdata/negative/generate \
  -H "Content-Type: application/json" \
  -d '{
    "scriptCode": "await page.getByLabel(\"Email\").fill(\"test@example.com\");",
    "count": 8
  }'
```

**5. Equivalence Test Data**
```bash
curl -X POST http://localhost:3000/genieapi/assistant/testdata/equivalence/generate \
  -H "Content-Type: application/json" \
  -d '{
    "scriptCode": "await page.getByLabel(\"Amount\").fill(\"1000\");",
    "count": 6
  }'
```

## Test Data Types Explained

### 🎯 Boundary Value Analysis
**Use Case**: Test edge cases and input limits  
**Examples**: Empty strings, min/max lengths, extreme values  
**Test File**: `test_boundary_generation.py`

### ✅ Positive Test Data
**Use Case**: Happy path testing with valid inputs  
**Examples**: Valid emails, strong passwords, correct formats  
**Test File**: `test_positive_negative.py`

### ❌ Negative Test Data  
**Use Case**: Error handling and validation testing  
**Examples**: Invalid formats, missing required data, wrong types  
**Test File**: `test_positive_negative.py`

### 🔒 Security Test Data
**Use Case**: Security vulnerability testing (OWASP Top 10)  
**Examples**: SQL injection, XSS, command injection, path traversal  
**Test File**: `test_security_generation.py`

### ⚖️ Equivalence Partitioning
**Use Case**: Representative sampling from input classes  
**Examples**: Different email formats, amount ranges, phone formats  
**Test File**: `test_equivalence_generation.py`

## Test Boundary Data Generation

```bash
curl -X POST http://localhost:3000/genieapi/assistant/testdata/boundary/generate \
  -H "Content-Type: application/json" \
  -d '{
    "scriptCode": "await page.getByLabel(\"Email\").fill(\"test@example.com\");",
    "count": 5
  }'
```

## Support

For issues or questions, contact your development team.

---

**Version**: 1.0.0  
**Port**: 3000  
**Technology**: FastAPI + OpenAI GPT-4
