"""
Genie API - Test Data Generation Service
FastAPI + OpenAI GPT-4 for intelligent test data generation
Port: 3000
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime
import re
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="🧞 Genie API - Test Data Generation Service",
    description="""
    AI-Powered Test Data Generation using OpenAI GPT-4
    
    ### Features:
    - 🎯 Boundary Value Analysis
    - ✅ Positive Test Data
    - ❌ Negative Test Data  
    - 🔒 Security Test Data (SQL Injection, XSS, etc.)
    - ⚖️ Equivalence Partitioning
    
    ### How It Works:
    1. Receives Playwright script code
    2. Uses GPT-4 to extract input fields
    3. Generates intelligent test data based on field types
    4. Returns structured JSON with test data
    """,
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ==================== Models ====================

class TestDataRequest(BaseModel):
    """Request model for test data generation"""
    scriptCode: str = Field(..., description="Playwright script code")
    template: Dict[str, Any] = Field(default_factory=dict, description="Optional template")
    count: int = Field(default=10, description="Number of test records to generate")
    testDataType: str = Field(default="all", description="Type of test data")
    options: Dict[str, Any] = Field(default_factory=dict, description="Additional options")

class TestDataResponse(BaseModel):
    """Response model for test data"""
    success: bool
    data: List[Dict[str, Any]]
    metadata: Dict[str, Any]

# ==================== Helper Functions ====================

def extract_fields_with_gpt4(script_code: str) -> List[Dict[str, str]]:
    """
    Use GPT-4 to intelligently extract input fields from Playwright script
    Handles ANY Playwright pattern: fill(), type(), selectOption(), check(), etc.
    Returns list of fields with name and inferred type
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert at analyzing Playwright test scripts.
                    Extract ALL input fields from the script regardless of how they're accessed.
                    
                    Detect fields from these Playwright patterns:
                    - page.fill('#selector', 'value')
                    - page.type('.class', 'value')
                    - page.getByLabel('Label').fill('value')
                    - page.getByPlaceholder('text').fill('value')
                    - page.getByRole('textbox', {name: 'Field'}).fill('value')
                    - page.locator('#id').fill('value')
                    - page.selectOption('select', 'value')
                    - page.check('checkbox')
                    - page.setInputFiles('input', 'file')
                    
                    Infer the field type based on:
                    - Label/placeholder text (e.g., 'Email' → email)
                    - Variable/selector names (e.g., '#password' → password)
                    - Context in the script (e.g., login form → username/password)
                    
                    Common types: email, password, username, text, number, phone, date, url, search, address, textarea, select, checkbox, file
                    
                    Return ONLY a JSON array:
                    [{"name": "fieldName", "type": "fieldType"}]
                    
                    Example:
                    [{"name": "email", "type": "email"}, {"name": "password", "type": "password"}]
                    """
                },
                {
                    "role": "user",
                    "content": f"Extract ALL input fields from this Playwright script:\n\n{script_code}"
                }
            ],
            temperature=0.2,
            max_tokens=1000
        )
        
        content = response.choices[0].message.content.strip()
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        import json
        fields = json.loads(content)
        return fields
    except Exception as e:
        print(f"GPT-4 extraction error: {e}")
        # Fallback to regex-based extraction
        return extract_fields_regex(script_code)

def extract_fields_regex(script_code: str) -> List[Dict[str, str]]:
    """
    Fallback: Extract fields using regex patterns
    Handles multiple Playwright patterns
    """
    fields = []
    
    # Comprehensive Playwright patterns
    patterns = [
        # Modern Playwright locators
        r'getByLabel\([\'"]([^\'\"]+)[\'"]\)',
        r'getByPlaceholder\([\'"]([^\'\"]+)[\'"]\)',
        r'getByRole\([\'"]textbox[\'"],\s*\{\s*name:\s*[\'"]([^\'\"]+)[\'"]\}\)',
        r'getByRole\([\'"]searchbox[\'"],\s*\{\s*name:\s*[\'"]([^\'\"]+)[\'"]\}\)',
        
        # Classic selectors with fill/type
        r'\.fill\([\'"]#([^\'\"\.\s]+)[\'"]',
        r'\.fill\([\'"]\.([^\'\"\.\s]+)[\'"]',
        r'\.type\([\'"]#([^\'\"\.\s]+)[\'"]',
        r'\.type\([\'"]\.([^\'\"\.\s]+)[\'"]',
        r'locator\([\'"]#([^\'\"\.\s]+)[\'"]\)',
        r'locator\([\'"]\.([^\'\"\.\s]+)[\'"]\)',
        
        # Attribute-based patterns
        r'name:\s*[\'"]([^\'\"]+)[\'"]',
        r'placeholder:\s*[\'"]([^\'\"]+)[\'"]',
        r'aria-label[\'"]\]\s*\{\s*[\'"]([^\'\"]+)[\'"]',
        
        # Input types
        r'\[type=[\'"]([^\'\"]+)[\'"]\]',
        
        # Select and checkbox
        r'selectOption\([\'"]([^\'\"]+)[\'"]',
        r'check\([\'"]([^\'\"]+)[\'"]',
    ]
    
    seen = set()
    for pattern in patterns:
        matches = re.finditer(pattern, script_code, re.IGNORECASE)
        for match in matches:
            field_name = match.group(1).lower().strip()
            
            # Clean up field name
            field_name = re.sub(r'[^a-z0-9_-]', '', field_name)
            
            # Skip invalid names
            if (not field_name or 
                field_name in seen or 
                field_name.startswith('http') or
                len(field_name) < 2 or
                field_name in ['btn', 'button', 'submit', 'click']):
                continue
            
            seen.add(field_name)
            
            # Infer type from name with better heuristics
            field_type = infer_field_type(field_name)
            
            fields.append({"name": field_name, "type": field_type})
    
    return fields

def infer_field_type(field_name: str) -> str:
    """
    Infer field type from field name with comprehensive heuristics
    """
    name_lower = field_name.lower()
    
    # Email patterns
    if any(x in name_lower for x in ['email', 'e-mail', 'mail']):
        return "email"
    
    # Password patterns
    if any(x in name_lower for x in ['password', 'passwd', 'pwd', 'pass']):
        return "password"
    
    # Username patterns
    if any(x in name_lower for x in ['username', 'user', 'login', 'account']):
        return "username"
    
    # Phone patterns
    if any(x in name_lower for x in ['phone', 'mobile', 'tel', 'contact']):
        return "phone"
    
    # Number patterns
    if any(x in name_lower for x in ['age', 'year', 'amount', 'quantity', 'number', 'count', 'price']):
        return "number"
    
    # Date patterns
    if any(x in name_lower for x in ['date', 'dob', 'birth', 'day', 'month', 'year']):
        return "date"
    
    # URL patterns
    if any(x in name_lower for x in ['url', 'website', 'link', 'site']):
        return "url"
    
    # Address patterns
    if any(x in name_lower for x in ['address', 'street', 'city', 'state', 'zip', 'postal', 'country']):
        return "address"
    
    # Search patterns
    if any(x in name_lower for x in ['search', 'query', 'find']):
        return "search"
    
    # Textarea patterns
    if any(x in name_lower for x in ['comment', 'message', 'description', 'notes', 'text']):
        return "textarea"
    
    # Default to text
    return "text"

def generate_boundary_data(field_name: str, field_type: str, count: int) -> List[Any]:
    """Generate boundary test values"""
    boundary_values = {
        "email": ["", "a", "a@b", "test@example.com", "very.long.email.address.with.many.dots@example.com"],
        "password": ["", "1", "12345", "Pass123!", "VeryLongPassword123!@#$%^&*()_+="],
        "username": ["", "a", "ab", "user123", "verylongusername1234567890"],
        "text": ["", "a", "test", "Lorem ipsum dolor sit amet consectetur"],
        "number": ["-999999", "0", "1", "999999"],
        "phone": ["", "123", "1234567890", "12345678901234567890"],
        "default": ["", "a", "test", "very long value with many characters"]
    }
    
    values = boundary_values.get(field_type, boundary_values["default"])
    # Cycle through values to match count
    return [values[i % len(values)] for i in range(count)]

def generate_positive_data(field_name: str, field_type: str, count: int) -> List[Any]:
    """Generate positive test values"""
    positive_values = {
        "email": "test@example.com",
        "password": "Password123!",
        "username": "testuser",
        "text": "valid input",
        "number": "100",
        "phone": "1234567890",
        "default": "valid_value"
    }
    
    value = positive_values.get(field_type, positive_values["default"])
    return [f"{value}{i}" if i > 0 else value for i in range(count)]

def generate_negative_data(field_name: str, field_type: str, count: int) -> List[Any]:
    """Generate negative test values"""
    negative_values = {
        "email": ["invalid", "missing@", "@domain.com", "spaces in@email.com", "double@@domain.com"],
        "password": ["short", "12345", "nospecialchar", "NOLOWERCASE123!"],
        "username": ["", "  ", "123", "user@#$", "a"],
        "text": ["", "  ", "  spaces  "],
        "number": ["abc", "-1", "999999999999", "1.5e10"],
        "phone": ["abc", "123", "++1234", "phone123"],
        "default": ["", "  ", "invalid", "@#$%"]
    }
    
    values = negative_values.get(field_type, negative_values["default"])
    return [values[i % len(values)] for i in range(count)]

def generate_security_data(field_name: str, field_type: str, count: int) -> List[Any]:
    """Generate security test payloads"""
    security_payloads = [
        "'; DROP TABLE users; --",
        "<script>alert('XSS')</script>",
        "../../../etc/passwd",
        "${7*7}",
        "%00null%00",
        "admin' OR '1'='1",
        "<img src=x onerror=alert(1)>",
        "{{7*7}}",
        "' OR 1=1--",
        "<svg/onload=alert(1)>"
    ]
    return [security_payloads[i % len(security_payloads)] for i in range(count)]

def generate_equivalence_data(field_name: str, field_type: str, count: int) -> List[Any]:
    """Generate equivalence partitioning test values"""
    equivalence_values = {
        "email": ["valid@example.com", "user@domain.co.uk", "test+tag@test.com"],
        "password": ["Pass123!", "Another456#", "Secure789$"],
        "username": ["user1", "user2", "user3"],
        "text": ["short", "medium length text", "very long text with many words"],
        "number": ["10", "100", "1000"],
        "phone": ["1234567890", "9876543210", "5555555555"],
        "default": ["value1", "value2", "value3"]
    }
    
    values = equivalence_values.get(field_type, equivalence_values["default"])
    return [values[i % len(values)] for i in range(count)]

# ==================== API Endpoints ====================

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "service": "Genie API - Test Data Generation",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/genieapi/assistant/testdata/boundary/generate", 
          response_model=TestDataResponse,
          tags=["Test Data Generation"])
async def generate_boundary_test_data(request: TestDataRequest):
    """
    Generate boundary value test data
    
    Analyzes the Playwright script using GPT-4 to extract fields,
    then generates boundary test cases (min, max, edge cases)
    """
    try:
        # Extract fields using GPT-4
        fields = extract_fields_with_gpt4(request.scriptCode)
        
        if not fields:
            raise HTTPException(status_code=400, detail="No input fields detected in script")
        
        # Generate test data
        test_data = []
        for i in range(request.count):
            record = {
                "_testDataType": "boundary",
                "_index": i
            }
            
            for field in fields:
                field_name = field["name"]
                field_type = field["type"]
                boundary_values = generate_boundary_data(field_name, field_type, request.count)
                record[field_name] = boundary_values[i]
            
            test_data.append(record)
        
        return TestDataResponse(
            success=True,
            data=test_data,
            metadata={
                "count": len(test_data),
                "testDataType": "boundary",
                "template": request.template,
                "generated_at": datetime.now().isoformat(),
                "fields_detected": [f["name"] for f in fields],
                "pure_type": True,
                "type_distribution": {"boundary": len(test_data)}
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating boundary data: {str(e)}")

@app.post("/genieapi/assistant/testdata/positive/generate",
          response_model=TestDataResponse,
          tags=["Test Data Generation"])
async def generate_positive_test_data(request: TestDataRequest):
    """Generate positive test data (valid inputs)"""
    try:
        fields = extract_fields_with_gpt4(request.scriptCode)
        
        if not fields:
            raise HTTPException(status_code=400, detail="No input fields detected in script")
        
        test_data = []
        for i in range(request.count):
            record = {
                "_testDataType": "positive",
                "_index": i
            }
            
            for field in fields:
                field_name = field["name"]
                field_type = field["type"]
                positive_values = generate_positive_data(field_name, field_type, request.count)
                record[field_name] = positive_values[i]
            
            test_data.append(record)
        
        return TestDataResponse(
            success=True,
            data=test_data,
            metadata={
                "count": len(test_data),
                "testDataType": "positive",
                "template": request.template,
                "generated_at": datetime.now().isoformat(),
                "fields_detected": [f["name"] for f in fields],
                "pure_type": True,
                "type_distribution": {"positive": len(test_data)}
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating positive data: {str(e)}")

@app.post("/genieapi/assistant/testdata/negative/generate",
          response_model=TestDataResponse,
          tags=["Test Data Generation"])
async def generate_negative_test_data(request: TestDataRequest):
    """Generate negative test data (invalid inputs)"""
    try:
        fields = extract_fields_with_gpt4(request.scriptCode)
        
        if not fields:
            raise HTTPException(status_code=400, detail="No input fields detected in script")
        
        test_data = []
        for i in range(request.count):
            record = {
                "_testDataType": "negative",
                "_index": i
            }
            
            for field in fields:
                field_name = field["name"]
                field_type = field["type"]
                negative_values = generate_negative_data(field_name, field_type, request.count)
                record[field_name] = negative_values[i]
            
            test_data.append(record)
        
        return TestDataResponse(
            success=True,
            data=test_data,
            metadata={
                "count": len(test_data),
                "testDataType": "negative",
                "template": request.template,
                "generated_at": datetime.now().isoformat(),
                "fields_detected": [f["name"] for f in fields],
                "pure_type": True,
                "type_distribution": {"negative": len(test_data)}
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating negative data: {str(e)}")

@app.post("/genieapi/assistant/testdata/security/generate",
          response_model=TestDataResponse,
          tags=["Test Data Generation"])
async def generate_security_test_data(request: TestDataRequest):
    """Generate security test data (SQL injection, XSS, etc.)"""
    try:
        fields = extract_fields_with_gpt4(request.scriptCode)
        
        if not fields:
            raise HTTPException(status_code=400, detail="No input fields detected in script")
        
        test_data = []
        for i in range(request.count):
            record = {
                "_testDataType": "security",
                "_index": i
            }
            
            for field in fields:
                field_name = field["name"]
                field_type = field["type"]
                security_values = generate_security_data(field_name, field_type, request.count)
                record[field_name] = security_values[i]
            
            test_data.append(record)
        
        return TestDataResponse(
            success=True,
            data=test_data,
            metadata={
                "count": len(test_data),
                "testDataType": "security",
                "template": request.template,
                "generated_at": datetime.now().isoformat(),
                "fields_detected": [f["name"] for f in fields],
                "pure_type": True,
                "type_distribution": {"security": len(test_data)}
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating security data: {str(e)}")

@app.post("/genieapi/assistant/testdata/equivalence/generate",
          response_model=TestDataResponse,
          tags=["Test Data Generation"])
async def generate_equivalence_test_data(request: TestDataRequest):
    """Generate equivalence partitioning test data"""
    try:
        fields = extract_fields_with_gpt4(request.scriptCode)
        
        if not fields:
            raise HTTPException(status_code=400, detail="No input fields detected in script")
        
        test_data = []
        for i in range(request.count):
            record = {
                "_testDataType": "equivalence",
                "_index": i
            }
            
            for field in fields:
                field_name = field["name"]
                field_type = field["type"]
                equiv_values = generate_equivalence_data(field_name, field_type, request.count)
                record[field_name] = equiv_values[i]
            
            test_data.append(record)
        
        return TestDataResponse(
            success=True,
            data=test_data,
            metadata={
                "count": len(test_data),
                "testDataType": "equivalence",
                "template": request.template,
                "generated_at": datetime.now().isoformat(),
                "fields_detected": [f["name"] for f in fields],
                "pure_type": True,
                "type_distribution": {"equivalence": len(test_data)}
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating equivalence data: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3000,
        reload=True
    )
