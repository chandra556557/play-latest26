"""
Positive & Negative Test Data Generation
Demonstrates valid inputs vs invalid inputs for error handling testing
"""

import requests
import json

BASE_URL = "http://localhost:3000"

SAMPLE_SCRIPT = """
import { test } from '@playwright/test';

test('user profile form', async ({ page }) => {
  await page.goto('https://example.com/profile');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Username').fill('john_doe');
  await page.getByLabel('Phone').fill('1234567890');
  await page.getByLabel('Website').fill('https://example.com');
  await page.getByLabel('Age').fill('25');
  await page.click('button:has-text("Save")');
});
"""

def test_positive_data():
    """Test positive (valid) data generation"""
    
    print("="*80)
    print("✅ POSITIVE TEST DATA GENERATION")
    print("="*80)
    print("Valid inputs that SHOULD be accepted by the application")
    
    payload = {
        "scriptCode": SAMPLE_SCRIPT,
        "template": {},
        "count": 5,
        "testDataType": "positive",
        "options": {}
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/genieapi/assistant/testdata/positive/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            test_data = result.get("data", [])
            
            print(f"\n📊 Generated {len(test_data)} Positive Test Cases")
            print("="*80)
            
            for i, record in enumerate(test_data, 1):
                print(f"\n✓ Valid Test Case #{i}")
                print("-"*80)
                for key, value in record.items():
                    if not key.startswith('_'):
                        validation = validate_positive_value(key, value)
                        print(f"   {key:12s}: {value:40s} {validation}")
            
            # Save results
            with open("positive_test_data.json", 'w') as f:
                json.dump(result, f, indent=2)
            
            return result
        else:
            print(f"❌ ERROR: {response.status_code}")
            return None
    
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None

def test_negative_data():
    """Test negative (invalid) data generation"""
    
    print("\n" + "="*80)
    print("❌ NEGATIVE TEST DATA GENERATION")
    print("="*80)
    print("Invalid inputs that SHOULD be rejected by the application")
    
    payload = {
        "scriptCode": SAMPLE_SCRIPT,
        "template": {},
        "count": 8,
        "testDataType": "negative",
        "options": {}
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/genieapi/assistant/testdata/negative/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            test_data = result.get("data", [])
            
            print(f"\n📊 Generated {len(test_data)} Negative Test Cases")
            print("="*80)
            
            for i, record in enumerate(test_data, 1):
                print(f"\n✗ Invalid Test Case #{i}")
                print("-"*80)
                for key, value in record.items():
                    if not key.startswith('_'):
                        error_type = categorize_error(key, value)
                        print(f"   {key:12s}: {value:40s} [{error_type}]")
            
            # Save results
            with open("negative_test_data.json", 'w') as f:
                json.dump(result, f, indent=2)
            
            return result
        else:
            print(f"❌ ERROR: {response.status_code}")
            return None
    
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None

def validate_positive_value(field: str, value: str) -> str:
    """Validate that positive values are actually valid"""
    field_lower = field.lower()
    
    if "email" in field_lower:
        if "@" in value and "." in value:
            return "✓ Valid email format"
    elif "phone" in field_lower:
        if value.isdigit() and len(value) >= 10:
            return "✓ Valid phone number"
    elif "age" in field_lower:
        if value.isdigit() and 1 <= int(value) <= 150:
            return "✓ Valid age"
    elif "username" in field_lower:
        if len(value) >= 3:
            return "✓ Valid username"
    elif "website" in field_lower or "url" in field_lower:
        if value.startswith("http"):
            return "✓ Valid URL"
    
    return "✓ Valid input"

def categorize_error(field: str, value: str) -> str:
    """Categorize the type of validation error"""
    field_lower = field.lower()
    
    if value == "":
        return "Empty Value"
    elif value == "  ":
        return "Whitespace Only"
    elif "email" in field_lower and "@" not in value:
        return "Missing @"
    elif "email" in field_lower and "." not in value:
        return "Missing Domain"
    elif "phone" in field_lower and not value.isdigit():
        return "Non-numeric"
    elif "age" in field_lower and not value.isdigit():
        return "Non-numeric Age"
    elif len(value) == 1:
        return "Too Short"
    else:
        return "Invalid Format"

def display_comparison():
    """Display comparison between positive and negative testing"""
    
    print("\n" + "="*80)
    print("📊 POSITIVE vs NEGATIVE TESTING")
    print("="*80)
    print("""
┌─────────────────────────────────┬─────────────────────────────────┐
│     ✅ POSITIVE TESTING         │     ❌ NEGATIVE TESTING         │
├─────────────────────────────────┼─────────────────────────────────┤
│ PURPOSE:                        │ PURPOSE:                        │
│ • Test happy path               │ • Test error handling           │
│ • Verify normal operation       │ • Verify input validation       │
│ • Confirm expected behavior     │ • Test edge cases               │
│                                 │                                 │
│ EXAMPLES:                       │ EXAMPLES:                       │
│ • test@example.com             │ • invalid-email                │
│ • Password123!                  │ • 123 (too short)              │
│ • 1234567890                    │ • abc (non-numeric)            │
│ • https://example.com           │ • spaces in@email              │
│                                 │                                 │
│ EXPECTED RESULT:                │ EXPECTED RESULT:                │
│ ✓ Input accepted                │ ✗ Input rejected                │
│ ✓ Form submits successfully     │ ✗ Error message displayed       │
│ ✓ Data saved to database        │ ✗ Validation prevents submission│
│                                 │                                 │
│ USE CASE:                       │ USE CASE:                       │
│ • Smoke testing                 │ • Validation testing            │
│ • Regression testing            │ • Error message testing         │
│ • End-to-end testing            │ • Security testing              │
└─────────────────────────────────┴─────────────────────────────────┘

💡 BEST PRACTICE:
   Always combine BOTH positive and negative testing for comprehensive coverage!
   
   Workflow:
   1. Start with POSITIVE tests (verify normal operation)
   2. Add NEGATIVE tests (verify error handling)
   3. Verify error messages are user-friendly
   4. Ensure system handles all invalid inputs gracefully
    """)

def main():
    print("="*80)
    print("🧪 POSITIVE & NEGATIVE TEST DATA COMPARISON")
    print("="*80)
    
    # Generate positive data
    positive_result = test_positive_data()
    
    # Generate negative data
    negative_result = test_negative_data()
    
    # Display comparison
    display_comparison()
    
    # Summary
    print("\n" + "="*80)
    print("📈 SUMMARY")
    print("="*80)
    
    if positive_result:
        print(f"✅ Positive Test Cases: {len(positive_result.get('data', []))}")
        print("   → Use these to verify normal application flow")
    
    if negative_result:
        print(f"❌ Negative Test Cases: {len(negative_result.get('data', []))}")
        print("   → Use these to verify input validation and error handling")
    
    print("\n💾 Files saved:")
    print("   • positive_test_data.json")
    print("   • negative_test_data.json")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    main()
