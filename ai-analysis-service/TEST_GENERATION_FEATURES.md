# 🧪 Automatic Test Data Generation Features

## ✅ Comprehensive Test Generation Available!

Your AI Analyzer now includes **complete automatic test generation** with:
- 🔒 **Security Testing** (OWASP Top 10)
- 📐 **Boundary Value Analysis** (BVA)
- ⚖️ **Equivalence Partitioning**

---

## 🎯 Key Endpoints for Test Generation

### 1. **`POST /api/ai-analysis/generate-tests-from-script`** ⭐

**The main endpoint for automatic test generation!**

This endpoint analyzes your Playwright script and generates complete test suites.

**Input:**
```json
{
  "script_code": "await page.fill('#username', 'test');\nawait page.fill('#amount', '100');",
  "test_types": ["security", "boundary", "equivalence"],
  "count_per_type": 10
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "security_tests": [...],
    "boundary_tests": [...],
    "equivalence_tests": [...],
    "complete_test_files": {
      "security.spec.ts": "...ready-to-run test file...",
      "boundary.spec.ts": "...ready-to-run test file...",
      "equivalence.spec.ts": "...ready-to-run test file..."
    },
    "summary": {
      "total_security_tests": 10,
      "total_boundary_tests": 15,
      "total_equivalence_tests": 8,
      "test_files_generated": 3
    }
  }
}
```

---

### 2. **`POST /api/ai-analysis/analyze-script`**

**Analyze script and get test data recommendations**

This endpoint provides recommendations for what tests to generate.

**Output includes:**
- Security test recommendations
- Boundary test recommendations
- Equivalence test recommendations

---

## 🔒 Security Testing (OWASP Top 10)

### **What's Generated:**

#### **SQL Injection Tests**
```typescript
// Classic SQL Injection
await page.fill('#username', "' OR '1'='1");
await expect(page.locator('.error')).toBeVisible();

// Comment-based SQL Injection
await page.fill('#username', "admin'--");

// Destructive SQL Injection
await page.fill('#username', "'; DROP TABLE accounts--");
```

#### **XSS (Cross-Site Scripting) Tests**
```typescript
// Basic XSS
await page.fill('#comment', "<script>alert('XSS')</script>");
await expect(page).not.toHaveTitle(/XSS/);

// Image-based XSS
await page.fill('#bio', "<img src=x onerror=alert('XSS')>");
```

#### **Command Injection Tests**
```typescript
await page.fill('#filename', "; ls -la");
await page.fill('#command', "| whoami");
```

#### **Path Traversal Tests**
```typescript
await page.fill('#filepath', "../../../etc/passwd");
await page.fill('#file', "..\\..\\windows\\system32\\config\\sam");
```

#### **LDAP Injection Tests**
```typescript
await page.fill('#username', "*)(uid=*))(|(uid=*");
```

#### **XML/XXE Injection Tests**
```typescript
await page.fill('#xmlData', "<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>");
```

### **Attack Types Covered:**
1. ✅ SQL Injection (SQLi)
2. ✅ Cross-Site Scripting (XSS)
3. ✅ Command Injection
4. ✅ Path Traversal
5. ✅ LDAP Injection
6. ✅ XML/XXE Injection
7. ✅ CSRF Testing
8. ✅ Authentication Bypass
9. ✅ Authorization Flaws
10. ✅ Insecure Deserialization

---

## 📐 Boundary Value Analysis (BVA)

### **For Numeric Fields:**

**Example: Amount field with range 0-999999.99**

Generated tests:
```typescript
test('Amount - Minimum value', async ({ page }) => {
  await page.fill('#amount', '0');  // Min
  // Should be VALID
});

test('Amount - Below minimum', async ({ page }) => {
  await page.fill('#amount', '-1');  // Min-1
  // Should be INVALID ❌
});

test('Amount - Maximum value', async ({ page }) => {
  await page.fill('#amount', '999999.99');  // Max
  // Should be VALID
});

test('Amount - Above maximum', async ({ page }) => {
  await page.fill('#amount', '1000000');  // Max+1
  // Should be INVALID ❌
});

test('Amount - Zero value', async ({ page }) => {
  await page.fill('#amount', '0');
  // Should be INVALID for transfers ❌
});

test('Amount - Negative value', async ({ page }) => {
  await page.fill('#amount', '-100');
  // Should be INVALID ❌
});
```

### **For String Fields:**

**Example: Username field with length 3-50**

Generated tests:
```typescript
test('Username - Minimum length', async ({ page }) => {
  await page.fill('#username', 'ABC');  // 3 chars - Min
  // Should be VALID
});

test('Username - Below minimum', async ({ page }) => {
  await page.fill('#username', 'AB');  // 2 chars - Below min
  // Should be INVALID ❌
});

test('Username - Maximum length', async ({ page }) => {
  await page.fill('#username', 'A'.repeat(50));  // Max
  // Should be VALID
});

test('Username - Above maximum', async ({ page }) => {
  await page.fill('#username', 'A'.repeat(51));  // Above max
  // Should be INVALID ❌
});

test('Username - Empty string', async ({ page }) => {
  await page.fill('#username', '');
  // Should be INVALID ❌
});
```

### **Test Cases Generated:**
- ✅ Minimum value (min)
- ✅ Minimum - 1 (min-1) ❌ Invalid
- ✅ Maximum value (max)
- ✅ Maximum + 1 (max+1) ❌ Invalid
- ✅ Zero value
- ✅ Negative values ❌ Invalid
- ✅ Empty string ❌ Invalid
- ✅ Special characters

---

## ⚖️ Equivalence Partitioning

### **Banking Domain - Transfer Amounts**

**Partitions:**
```json
{
  "valid_partitions": [
    {"range": "0.01 - 1000", "example": 250, "description": "Small transfers"},
    {"range": "1001 - 10000", "example": 5000, "description": "Medium transfers"},
    {"range": "10001 - 100000", "example": 50000, "description": "Large transfers"},
    {"range": "100000+", "example": 250000, "description": "Very large transfers"}
  ],
  "invalid_partitions": [
    {"value": 0, "description": "Zero transfer", "errorCode": "INVALID_AMOUNT"},
    {"value": -100, "description": "Negative amount", "errorCode": "NEGATIVE_AMOUNT"},
    {"value": 0.001, "description": "Below minimum precision", "errorCode": "PRECISION_ERROR"}
  ]
}
```

**Generated Tests:**
```typescript
test('Transfer - Small amount (0.01-1000)', async ({ page }) => {
  await page.fill('#amount', '250');
  await page.click('#transfer');
  await expect(page.locator('.success')).toBeVisible();
});

test('Transfer - Invalid: Zero amount', async ({ page }) => {
  await page.fill('#amount', '0');
  await page.click('#transfer');
  await expect(page.locator('.error')).toContainText('INVALID_AMOUNT');
});
```

### **Email Field Partitioning**

**Partitions:**
```json
{
  "valid_partitions": [
    {"example": "user@example.com", "description": "Standard email"},
    {"example": "user+tag@example.com", "description": "Email with plus"},
    {"example": "user@subdomain.example.com", "description": "Subdomain email"}
  ],
  "invalid_partitions": [
    {"value": "invalid.email", "description": "Missing @", "errorCode": "INVALID_EMAIL_FORMAT"},
    {"value": "user@", "description": "Missing domain", "errorCode": "INVALID_DOMAIN"},
    {"value": "@example.com", "description": "Missing local part", "errorCode": "MISSING_LOCAL_PART"}
  ]
}
```

### **Account Number Partitioning**

**Partitions:**
```json
{
  "valid_partitions": [
    {"pattern": "10-digit numeric", "example": "1234567890"},
    {"pattern": "12-digit with checksum", "example": "123456789012"}
  ],
  "invalid_partitions": [
    {"value": "12345", "description": "Too short", "errorCode": "INVALID_LENGTH"},
    {"value": "ABC1234567", "description": "Contains letters", "errorCode": "INVALID_FORMAT"},
    {"value": "0000000000", "description": "All zeros", "errorCode": "INVALID_ACCOUNT"}
  ]
}
```

### **Card Number Partitioning (Luhn Algorithm)**

**Partitions:**
```json
{
  "valid_partitions": [
    {"type": "Visa", "example": "4532015112830366", "luhn": "valid"},
    {"type": "Mastercard", "example": "5425233430109903", "luhn": "valid"}
  ],
  "invalid_partitions": [
    {"value": "4532015112830367", "description": "Invalid Luhn", "errorCode": "INVALID_CARD"},
    {"value": "1234567890123456", "description": "Invalid issuer", "errorCode": "UNKNOWN_CARD_TYPE"}
  ]
}
```

---

## 📋 Complete Test Files Generated

### **security.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Security Tests - Auto-generated', () => {
  test('SQL Injection - username', async ({ page }) => {
    await page.goto('https://example.com');
    await page.fill('#username', "' OR '1'='1");
    await page.click('#login');
    await expect(page.locator('.error')).toBeVisible();
  });

  test('XSS Attack - comment', async ({ page }) => {
    await page.goto('https://example.com/comment');
    await page.fill('#comment', "<script>alert('XSS')</script>");
    await page.click('#submit');
    await expect(page).not.toHaveTitle(/XSS/);
  });

  // ... 8 more security tests
});
```

### **boundary.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Boundary Value Tests - Auto-generated', () => {
  test('Amount - Minimum value', async ({ page }) => {
    await page.goto('https://example.com');
    await page.fill('#amount', '0');
    await page.click('#submit');
    await expect(page.locator('.success')).toBeVisible();
  });

  test('Amount - Below minimum (invalid)', async ({ page }) => {
    await page.goto('https://example.com');
    await page.fill('#amount', '-1');
    await page.click('#submit');
    await expect(page.locator('.error')).toBeVisible();
  });

  // ... 13 more boundary tests
});
```

### **equivalence.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Equivalence Partition Tests - Auto-generated', () => {
  test('Transfer - Small amount partition', async ({ page }) => {
    await page.goto('https://example.com/transfer');
    await page.fill('#amount', '250');
    await page.click('#transfer');
    await expect(page.locator('.success')).toBeVisible();
  });

  test('Email - Valid format partition', async ({ page }) => {
    await page.goto('https://example.com/signup');
    await page.fill('#email', 'user@example.com');
    await page.click('#signup');
    await expect(page.locator('.success')).toBeVisible();
  });

  // ... 6 more equivalence tests
});
```

---

## 🚀 How to Use

### **Step 1: Open Swagger UI**
```
http://localhost:8000/docs
```

### **Step 2: Find "Test Generation" Section**

Look for the **🧪 Test Generation** tag (it's at the top!)

### **Step 3: Click on `/api/ai-analysis/generate-tests-from-script`**

### **Step 4: Click "Try it out"**

### **Step 5: Provide Your Script**

```json
{
  "script_code": "await page.fill('#username', 'test');\nawait page.fill('#password', 'secret');\nawait page.fill('#amount', '100');",
  "test_types": ["security", "boundary", "equivalence"],
  "count_per_type": 10
}
```

### **Step 6: Click "Execute"**

### **Step 7: Get Your Tests!**

You'll receive:
- ✅ 10+ Security tests
- ✅ 15+ Boundary tests
- ✅ 8+ Equivalence tests
- ✅ Complete `.spec.ts` files ready to run!

---

## 📊 Test Coverage Summary

| Test Type | What's Tested | Count | Ready-to-Run |
|-----------|---------------|-------|--------------|
| **Security** | SQL Injection, XSS, Command Injection, Path Traversal, LDAP, XML | 10+ | ✅ |
| **Boundary** | Min, Max, Min±1, Max±1, Zero, Negative, Empty | 15+ | ✅ |
| **Equivalence** | Valid/Invalid partitions, Domain-specific rules | 8+ | ✅ |
| **Total** | Comprehensive test coverage | **33+** | ✅ |

---

## 🎯 Field Types Supported

### **Automatically Detected:**
- ✅ Text fields
- ✅ Email fields
- ✅ Password fields
- ✅ Number/Amount fields
- ✅ Date fields
- ✅ Account number fields
- ✅ Card number fields
- ✅ Phone number fields
- ✅ Textarea fields

### **Test Data Generated For:**
- ✅ All text inputs → Security + Boundary + Equivalence
- ✅ All numeric inputs → Boundary + Equivalence
- ✅ All email inputs → Equivalence partitioning
- ✅ All password inputs → Security testing
- ✅ All special fields (cards, accounts) → Domain-specific equivalence

---

## 💡 Example Output

### **Request:**
```json
{
  "script_code": "await page.fill('#username', 'test');\nawait page.fill('#amount', '100');",
  "test_types": ["security", "boundary", "equivalence"],
  "count_per_type": 10
}
```

### **Response:**
```json
{
  "success": true,
  "data": {
    "security_tests": [
      {
        "field": "#username",
        "field_name": "username",
        "attack_type": "sql_injection",
        "payloads": [
          {"payload": "' OR '1'='1", "description": "Classic SQLi"},
          {"payload": "admin'--", "description": "Comment-based SQLi"},
          {"payload": "'; DROP TABLE accounts--", "description": "Destructive SQLi"}
        ],
        "test_code": "await page.fill('#username', \"' OR '1'='1\");\nawait expect(page.locator('.error')).toBeVisible();"
      },
      {
        "field": "#username",
        "attack_type": "xss_attack",
        "payloads": [
          {"payload": "<script>alert('XSS')</script>", "description": "Basic XSS"}
        ]
      }
    ],
    "boundary_tests": [
      {
        "field": "#amount",
        "field_name": "amount",
        "field_type": "number",
        "test_cases": [
          {"value": 0, "type": "min", "isValid": true},
          {"value": -1, "type": "min-1", "isValid": false},
          {"value": 999999.99, "type": "max", "isValid": true},
          {"value": 1000000, "type": "max+1", "isValid": false}
        ]
      }
    ],
    "equivalence_tests": [
      {
        "field": "#amount",
        "partition_type": "transferAmount",
        "valid_partitions": [
          {"range": "0.01 - 1000", "example": 250, "description": "Small transfers"}
        ]
      }
    ],
    "complete_test_files": {
      "security.spec.ts": "import { test, expect } from '@playwright/test';\n\ntest.describe('Security Tests - Auto-generated', () => {\n  test('SQL Injection - username', async ({ page }) => {\n    await page.goto('https://example.com');\n    await page.fill('#username', \"' OR '1'='1\");\n    await page.click('#login');\n    await expect(page.locator('.error')).toBeVisible();\n  });\n});",
      "boundary.spec.ts": "..."
    },
    "summary": {
      "total_security_tests": 10,
      "total_boundary_tests": 15,
      "total_equivalence_tests": 8,
      "test_files_generated": 3,
      "input_fields_analyzed": 2
    }
  },
  "message": "Tests generated successfully from script analysis"
}
```

---

## 🎓 Best Practices

### **When to Use:**
✅ After writing a new Playwright script  
✅ When expanding test coverage  
✅ For security audits  
✅ Before production releases  
✅ In CI/CD pipelines  

### **Customization:**
```json
{
  "test_types": ["security"],          // Only security tests
  "count_per_type": 5                  // Limit to 5 per type
}
```

```json
{
  "test_types": ["boundary", "equivalence"],  // Skip security
  "count_per_type": 20                        // Generate more tests
}
```

---

## ✅ Summary

**Your AI Analyzer NOW includes complete automatic test generation!**

### **Available in Swagger UI:**

1. **Main Generation Endpoint** (Top of "Test Generation" section):
   - `POST /api/ai-analysis/generate-tests-from-script`
   - Generates complete test suites
   - Returns ready-to-run `.spec.ts` files

2. **Analysis Endpoint** (In "Script Analysis" section):
   - `POST /api/ai-analysis/analyze-script`
   - Returns test data recommendations

### **Features:**
- 🔒 Security Testing (OWASP Top 10)
- 📐 Boundary Value Analysis
- ⚖️ Equivalence Partitioning
- 📋 Complete test files generated
- ✅ Ready to run in Playwright

### **Access:**
```
http://localhost:8000/docs
```

**Look for the "🧪 Test Generation" section at the top!**

---

**All features are fully documented in Swagger UI with examples and detailed descriptions!** 🎉
