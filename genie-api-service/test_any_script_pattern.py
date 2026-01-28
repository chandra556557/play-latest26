"""
Test Field Extraction from ANY Playwright Script Pattern
Demonstrates how the API automatically detects fields from various Playwright syntax
"""

import requests
import json

BASE_URL = "http://localhost:3000"

# Test different Playwright patterns
TEST_SCRIPTS = {
    "Modern Locators (getBy*)": """
import { test } from '@playwright/test';

test('registration form', async ({ page }) => {
  await page.goto('https://example.com/register');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('secret123');
  await page.getByPlaceholder('Enter your phone').fill('1234567890');
  await page.getByRole('textbox', { name: 'Username' }).fill('johndoe');
  await page.getByRole('button', { name: 'Sign Up' }).click();
});
    """,
    
    "Classic Selectors (CSS/XPath)": """
import { test } from '@playwright/test';

test('login with selectors', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'Pass123!');
  await page.type('.username-input', 'testuser');
  await page.locator('#phone').fill('9876543210');
  await page.click('button[type="submit"]');
});
    """,
    
    "Complex E-commerce Form": """
import { test } from '@playwright/test';

test('checkout form', async ({ page }) => {
  await page.goto('https://shop.example.com/checkout');
  
  // Personal Info
  await page.getByLabel('Full Name').fill('John Smith');
  await page.getByLabel('Email Address').fill('john@example.com');
  await page.getByLabel('Phone Number').fill('555-123-4567');
  
  // Shipping Address
  await page.getByPlaceholder('Street Address').fill('123 Main St');
  await page.getByPlaceholder('City').fill('New York');
  await page.selectOption('#state', 'NY');
  await page.getByLabel('ZIP Code').fill('10001');
  
  // Payment
  await page.getByLabel('Card Number').fill('4532123456789012');
  await page.getByLabel('CVV').fill('123');
  await page.getByLabel('Expiry Date').fill('12/25');
  
  await page.check('#terms-checkbox');
  await page.click('button:has-text("Complete Purchase")');
});
    """,
    
    "Banking Transfer Form": """
import { test } from '@playwright/test';

test('bank transfer', async ({ page }) => {
  await page.goto('https://bank.example.com/transfer');
  
  await page.getByLabel('From Account').fill('1234567890');
  await page.getByLabel('To Account').fill('0987654321');
  await page.getByLabel('Amount').fill('1000.50');
  await page.getByLabel('Transfer Date').fill('2025-12-15');
  await page.getByPlaceholder('Add a note (optional)').fill('Payment for invoice');
  await page.getByLabel('OTP Code').fill('123456');
  
  await page.click('button:has-text("Transfer")');
});
    """,
    
    "Mixed Modern & Legacy Patterns": """
import { test } from '@playwright/test';

test('complex form', async ({ page }) => {
  // Modern locators
  await page.getByLabel('Username').fill('user123');
  await page.getByPlaceholder('Enter email').fill('user@test.com');
  
  // Legacy selectors
  await page.fill('#password', 'Pass123!');
  await page.type('.phone-field', '1234567890');
  
  // Locator API
  await page.locator('[name="age"]').fill('25');
  await page.locator('input[type="url"]').fill('https://example.com');
  
  // Role-based
  await page.getByRole('textbox', { name: 'Address' }).fill('123 Street');
  await page.getByRole('searchbox').fill('search query');
});
    """
}

def test_script_pattern(script_name: str, script_code: str):
    """Test field extraction for a specific script pattern"""
    
    print(f"\n{'='*80}")
    print(f"🧪 Testing: {script_name}")
    print(f"{'='*80}")
    
    payload = {
        "scriptCode": script_code,
        "template": {},
        "count": 5,
        "testDataType": "boundary",
        "options": {}
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/genieapi/assistant/testdata/boundary/generate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            metadata = result.get("metadata", {})
            fields = metadata.get("fields_detected", [])
            
            print(f"\n✅ SUCCESS - Detected {len(fields)} fields!")
            print(f"\n📋 Fields Detected:")
            
            # Get first test case to show field types
            test_data = result.get("data", [])
            if test_data:
                first_record = test_data[0]
                
                for i, field_name in enumerate(fields, 1):
                    value = first_record.get(field_name, "")
                    print(f"   {i}. {field_name:20s} = \"{value}\" (boundary value)")
            
            return fields
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            return []
    
    except requests.exceptions.Timeout:
        print("\n⚠️ TIMEOUT - GPT-4 analysis taking longer than expected")
        print("This is normal for first run. Retry or check API key.")
        return []
    
    except requests.exceptions.ConnectionError:
        print("\n❌ CONNECTION ERROR")
        print("Make sure Genie API is running: python main.py")
        return []
    
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return []

def main():
    print("="*80)
    print("🔍 AUTOMATIC FIELD DETECTION FROM ANY PLAYWRIGHT SCRIPT")
    print("="*80)
    print("\nThis test demonstrates how the API automatically extracts fields from:")
    print("  • Modern Playwright locators (getByLabel, getByPlaceholder, etc.)")
    print("  • Classic CSS/ID selectors (#id, .class)")
    print("  • Role-based locators (getByRole)")
    print("  • XPath and complex selectors")
    print("  • Form elements (input, select, checkbox)")
    
    all_fields = {}
    
    for script_name, script_code in TEST_SCRIPTS.items():
        fields = test_script_pattern(script_name, script_code)
        all_fields[script_name] = fields
    
    # Summary
    print("\n" + "="*80)
    print("📊 SUMMARY - Fields Detected Per Script")
    print("="*80)
    
    for script_name, fields in all_fields.items():
        print(f"\n{script_name}:")
        print(f"  Total Fields: {len(fields)}")
        print(f"  Fields: {', '.join(fields) if fields else 'None detected'}")
    
    print("\n" + "="*80)
    print("💡 KEY FEATURES")
    print("="*80)
    print("""
✅ AUTOMATIC DETECTION
   - No manual field mapping needed
   - Works with ANY Playwright syntax
   - GPT-4 intelligently extracts fields

✅ SMART TYPE INFERENCE
   - Detects field types (email, password, phone, etc.)
   - Based on field names and context
   - Generates appropriate test data per type

✅ COMPREHENSIVE PATTERNS
   - Modern: getByLabel(), getByPlaceholder()
   - Legacy: fill('#id'), type('.class')
   - Advanced: getByRole(), locator()
   - All input types: text, select, checkbox, file

✅ FALLBACK MECHANISM
   - Tries GPT-4 first (intelligent)
   - Falls back to regex (fast)
   - Always extracts fields successfully

🎯 USE CASE
   Just send ANY Playwright script to the API!
   It automatically:
   1. Detects all input fields
   2. Infers field types
   3. Generates appropriate test data
   4. Returns structured JSON
    """)
    print("="*80)

if __name__ == "__main__":
    main()
