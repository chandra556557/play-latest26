"""
Test Boundary Data Generation Example
Demonstrates how the Genie API generates boundary test cases
"""

import requests
import json

# API endpoint
BASE_URL = "http://localhost:3000"

# Sample Playwright script for testing
PLAYWRIGHT_SCRIPT = """
import { test, expect } from '@playwright/test';

test('login form boundary testing', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel('Age').fill('25');
  await page.getByLabel('Phone').fill('1234567890');
  await page.getByRole('button', { name: 'Login' }).click();
});
"""

def test_boundary_generation():
    """Test boundary test data generation"""
    
    print("=" * 80)
    print("🧪 BOUNDARY TEST DATA GENERATION EXAMPLE")
    print("=" * 80)
    
    # Request payload
    payload = {
        "scriptCode": PLAYWRIGHT_SCRIPT,
        "template": {},
        "count": 10,
        "testDataType": "boundary",
        "options": {}
    }
    
    print("\n📝 Input Script:")
    print("-" * 80)
    print(PLAYWRIGHT_SCRIPT)
    
    print("\n📤 Sending request to API...")
    print(f"Endpoint: {BASE_URL}/genieapi/assistant/testdata/boundary/generate")
    print(f"Count: {payload['count']} test cases")
    
    try:
        # Call API
        response = requests.post(
            f"{BASE_URL}/genieapi/assistant/testdata/boundary/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print("\n✅ SUCCESS - Boundary Test Data Generated!")
            print("=" * 80)
            
            # Display metadata
            metadata = result.get("metadata", {})
            print("\n📊 Metadata:")
            print(f"  • Total Records: {metadata.get('count')}")
            print(f"  • Test Data Type: {metadata.get('testDataType')}")
            print(f"  • Fields Detected: {', '.join(metadata.get('fields_detected', []))}")
            print(f"  • Generated At: {metadata.get('generated_at')}")
            
            # Display test data
            test_data = result.get("data", [])
            print(f"\n🧪 Generated {len(test_data)} Boundary Test Cases:")
            print("=" * 80)
            
            for i, record in enumerate(test_data, 1):
                print(f"\n📋 Test Case #{i} (Index: {record.get('_index')})")
                print(f"   Type: {record.get('_testDataType')}")
                print("-" * 80)
                
                # Display field values
                for key, value in record.items():
                    if not key.startswith('_'):
                        # Format value display
                        display_value = f'"{value}"' if value else '(empty)'
                        
                        # Add boundary category
                        category = get_boundary_category(key, value)
                        print(f"   • {key:12s}: {display_value:40s} [{category}]")
            
            # Summary
            print("\n" + "=" * 80)
            print("📈 BOUNDARY COVERAGE SUMMARY")
            print("=" * 80)
            
            # Analyze coverage
            fields = metadata.get('fields_detected', [])
            for field in fields:
                field_values = [rec.get(field) for rec in test_data]
                print(f"\n🔍 {field.upper()} Field Coverage:")
                print(f"   • Empty values: {field_values.count('')}")
                print(f"   • Minimal values: {count_minimal_values(field_values)}")
                print(f"   • Valid values: {count_valid_values(field_values)}")
                print(f"   • Maximum values: {count_max_values(field_values)}")
                print(f"   • Edge cases: {count_edge_cases(field_values)}")
            
            # Save to file
            output_file = "boundary_test_data.json"
            with open(output_file, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\n💾 Full results saved to: {output_file}")
            
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print("\n❌ CONNECTION ERROR")
        print("Make sure the Genie API service is running on port 3000")
        print("Run: python main.py")
    
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

def get_boundary_category(field_name: str, value: str) -> str:
    """Determine boundary category based on value"""
    if value == "":
        return "Empty/Null"
    elif len(str(value)) <= 2:
        return "Minimal Length"
    elif len(str(value)) > 30:
        return "Maximum Length"
    elif "@" in str(value) and len(str(value)) < 10:
        return "Edge Case"
    elif str(value).lower() in ["test@example.com", "password123", "1234567890", "25"]:
        return "Valid Boundary"
    else:
        return "Boundary Value"

def count_minimal_values(values: list) -> int:
    """Count minimal boundary values"""
    return sum(1 for v in values if len(str(v)) <= 2 and v != "")

def count_valid_values(values: list) -> int:
    """Count valid boundary values"""
    return sum(1 for v in values if 3 <= len(str(v)) <= 30)

def count_max_values(values: list) -> int:
    """Count maximum length values"""
    return sum(1 for v in values if len(str(v)) > 30)

def count_edge_cases(values: list) -> int:
    """Count edge case values"""
    return sum(1 for v in values if 0 < len(str(v)) <= 5 and v != "")

if __name__ == "__main__":
    test_boundary_generation()
    
    print("\n" + "=" * 80)
    print("🎯 BOUNDARY TESTING BEST PRACTICES")
    print("=" * 80)
    print("""
Boundary Value Analysis covers:

1. ✅ EMPTY VALUES
   - Test with empty strings
   - Verify validation messages
   - Check required field handling

2. ✅ MINIMAL VALUES
   - Single character inputs
   - Minimum length boundaries
   - Edge of valid range

3. ✅ VALID BOUNDARIES
   - Just above minimum
   - Just below maximum
   - Typical valid values

4. ✅ MAXIMUM VALUES
   - Maximum length strings
   - Upper boundary values
   - System limits

5. ✅ EDGE CASES
   - Special boundary conditions
   - Format edge cases (e.g., 'a@b.c')
   - Transition points

💡 TIP: Use these boundary test cases to verify:
   - Input validation works correctly
   - Error messages are appropriate
   - System handles edge cases gracefully
   - No crashes or unexpected behavior
    """)
    print("=" * 80)
