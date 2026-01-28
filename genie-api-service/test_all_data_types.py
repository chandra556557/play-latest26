"""
Comprehensive Test Suite for ALL Test Data Generation Types
Demonstrates: Boundary, Positive, Negative, Security, and Equivalence Partitioning
"""

import requests
import json
from typing import Dict, List, Any

BASE_URL = "http://localhost:3000"

# Sample Playwright script for testing
SAMPLE_SCRIPT = """
import { test, expect } from '@playwright/test';

test('user registration form', async ({ page }) => {
  await page.goto('https://example.com/register');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('SecurePass123!');
  await page.getByLabel('Username').fill('john_doe');
  await page.getByLabel('Phone').fill('1234567890');
  await page.getByLabel('Age').fill('25');
  await page.getByRole('button', { name: 'Register' }).click();
});
"""

def generate_test_data(test_type: str, count: int = 5) -> Dict[str, Any]:
    """Generate test data for a specific type"""
    
    endpoint_map = {
        "boundary": f"{BASE_URL}/genieapi/assistant/testdata/boundary/generate",
        "positive": f"{BASE_URL}/genieapi/assistant/testdata/positive/generate",
        "negative": f"{BASE_URL}/genieapi/assistant/testdata/negative/generate",
        "security": f"{BASE_URL}/genieapi/assistant/testdata/security/generate",
        "equivalence": f"{BASE_URL}/genieapi/assistant/testdata/equivalence/generate"
    }
    
    payload = {
        "scriptCode": SAMPLE_SCRIPT,
        "template": {},
        "count": count,
        "testDataType": test_type,
        "options": {}
    }
    
    try:
        response = requests.post(
            endpoint_map[test_type],
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}
    
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Connection failed. Is the API running?"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def display_test_data(test_type: str, result: Dict[str, Any]):
    """Display test data results in a formatted way"""
    
    type_info = {
        "boundary": {
            "emoji": "🎯",
            "title": "BOUNDARY VALUE ANALYSIS",
            "description": "Tests edge cases: min, max, empty, extreme values"
        },
        "positive": {
            "emoji": "✅",
            "title": "POSITIVE TEST DATA",
            "description": "Valid inputs that should be accepted"
        },
        "negative": {
            "emoji": "❌",
            "title": "NEGATIVE TEST DATA",
            "description": "Invalid inputs that should be rejected"
        },
        "security": {
            "emoji": "🔒",
            "title": "SECURITY TEST DATA",
            "description": "SQL injection, XSS, command injection, path traversal"
        },
        "equivalence": {
            "emoji": "⚖️",
            "title": "EQUIVALENCE PARTITIONING",
            "description": "Representative samples from valid/invalid classes"
        }
    }
    
    info = type_info[test_type]
    
    print(f"\n{'='*80}")
    print(f"{info['emoji']} {info['title']}")
    print(f"{'='*80}")
    print(f"📝 {info['description']}")
    
    if not result.get("success"):
        print(f"\n❌ ERROR: {result.get('error')}")
        return
    
    metadata = result.get("metadata", {})
    test_data = result.get("data", [])
    
    print(f"\n📊 Metadata:")
    print(f"  • Total Records: {metadata.get('count')}")
    print(f"  • Test Type: {metadata.get('testDataType')}")
    print(f"  • Fields Detected: {', '.join(metadata.get('fields_detected', []))}")
    print(f"  • Generated At: {metadata.get('generated_at')}")
    
    print(f"\n🧪 Test Cases ({len(test_data)} records):")
    print("="*80)
    
    for i, record in enumerate(test_data, 1):
        print(f"\n📋 Test Case #{i}")
        print(f"   Type: {record.get('_testDataType')} | Index: {record.get('_index')}")
        print("-"*80)
        
        for key, value in record.items():
            if not key.startswith('_'):
                display_value = format_value_display(value, test_type)
                category = categorize_value(key, value, test_type)
                print(f"   • {key:12s}: {display_value:45s} [{category}]")

def format_value_display(value: Any, test_type: str) -> str:
    """Format value for display with appropriate context"""
    if value == "":
        return '""  (empty)'
    elif value is None:
        return "(null)"
    elif test_type == "security" and len(str(value)) > 40:
        return f'"{str(value)[:37]}..."'
    else:
        return f'"{value}"'

def categorize_value(field_name: str, value: Any, test_type: str) -> str:
    """Categorize the value based on test type"""
    
    categories = {
        "boundary": {
            "": "Empty/Null",
            "short": "Minimal Length",
            "medium": "Valid Boundary",
            "long": "Maximum Length"
        },
        "positive": {
            "all": "Valid Input"
        },
        "negative": {
            "": "Empty (Invalid)",
            "all": "Invalid Format"
        },
        "security": {
            "sql": "SQL Injection",
            "xss": "XSS Attack",
            "cmd": "Command Injection",
            "path": "Path Traversal"
        },
        "equivalence": {
            "all": "Equivalence Class"
        }
    }
    
    if test_type == "boundary":
        if value == "":
            return categories["boundary"][""]
        elif len(str(value)) <= 2:
            return categories["boundary"]["short"]
        elif len(str(value)) > 30:
            return categories["boundary"]["long"]
        else:
            return categories["boundary"]["medium"]
    
    elif test_type == "security":
        val_str = str(value).lower()
        if "drop" in val_str or "select" in val_str or "'" in val_str:
            return categories["security"]["sql"]
        elif "<script" in val_str or "alert" in val_str:
            return categories["security"]["xss"]
        elif "../" in val_str or "etc/passwd" in val_str:
            return categories["security"]["path"]
        else:
            return "Security Payload"
    
    elif test_type == "negative":
        return categories["negative"]["" if value == "" else "all"]
    
    elif test_type == "positive":
        return categories["positive"]["all"]
    
    else:  # equivalence
        return categories["equivalence"]["all"]

def display_coverage_summary(all_results: Dict[str, Dict[str, Any]]):
    """Display comprehensive coverage summary"""
    
    print("\n" + "="*80)
    print("📈 COMPREHENSIVE TEST COVERAGE SUMMARY")
    print("="*80)
    
    for test_type, result in all_results.items():
        if result.get("success"):
            data = result.get("data", [])
            metadata = result.get("metadata", {})
            
            print(f"\n{test_type.upper()}:")
            print(f"  ✓ Records Generated: {len(data)}")
            print(f"  ✓ Fields Covered: {', '.join(metadata.get('fields_detected', []))}")
        else:
            print(f"\n{test_type.upper()}:")
            print(f"  ✗ Failed: {result.get('error')}")

def save_results(all_results: Dict[str, Dict[str, Any]]):
    """Save all results to JSON file"""
    
    output_file = "all_test_data_types.json"
    with open(output_file, 'w') as f:
        json.dump(all_results, f, indent=2)
    
    print(f"\n💾 All results saved to: {output_file}")

def display_usage_guide():
    """Display usage guide for each test type"""
    
    print("\n" + "="*80)
    print("📚 TEST DATA TYPE USAGE GUIDE")
    print("="*80)
    
    print("""
1. 🎯 BOUNDARY VALUE ANALYSIS
   USE WHEN: Testing input validation and edge cases
   EXAMPLES:
     • Empty strings → Check required field validation
     • Single character → Test minimum length
     • Very long strings → Test maximum length limits
     • Min/Max numbers → Test numeric boundaries
   
2. ✅ POSITIVE TEST DATA
   USE WHEN: Testing happy path scenarios
   EXAMPLES:
     • Valid email formats → test@example.com
     • Strong passwords → Pass123!
     • Valid phone numbers → 1234567890
     • Normal user inputs → Standard usage
   
3. ❌ NEGATIVE TEST DATA
   USE WHEN: Testing error handling and validation
   EXAMPLES:
     • Invalid email → missing@
     • Weak passwords → 123
     • Invalid formats → Spaces, special chars
     • Wrong data types → Letters in number fields
   
4. 🔒 SECURITY TEST DATA
   USE WHEN: Testing security vulnerabilities
   EXAMPLES:
     • SQL Injection → '; DROP TABLE users; --
     • XSS Attacks → <script>alert('XSS')</script>
     • Path Traversal → ../../../etc/passwd
     • Command Injection → ; rm -rf /
   
5. ⚖️ EQUIVALENCE PARTITIONING
   USE WHEN: Testing representative samples
   EXAMPLES:
     • Valid email classes → Different valid formats
     • Different password strengths → Weak, medium, strong
     • Various phone formats → With/without dashes
     • Different valid inputs → Partition sampling

💡 BEST PRACTICE:
   Use ALL 5 types together for comprehensive test coverage!
   
   Workflow:
   1. Start with POSITIVE (happy path)
   2. Add BOUNDARY (edge cases)
   3. Include NEGATIVE (error handling)
   4. Add SECURITY (vulnerability testing)
   5. Use EQUIVALENCE (representative sampling)
    """)
    print("="*80)

def main():
    print("="*80)
    print("🧪 COMPREHENSIVE TEST DATA GENERATION - ALL TYPES")
    print("="*80)
    print("\nTesting 5 test data generation types:")
    print("  1. Boundary Value Analysis")
    print("  2. Positive Test Data")
    print("  3. Negative Test Data")
    print("  4. Security Test Data")
    print("  5. Equivalence Partitioning")
    
    print(f"\n📝 Using Sample Script:")
    print("-"*80)
    print(SAMPLE_SCRIPT)
    
    # Generate all test data types
    test_types = ["boundary", "positive", "negative", "security", "equivalence"]
    all_results = {}
    
    for test_type in test_types:
        print(f"\n⏳ Generating {test_type} test data...")
        result = generate_test_data(test_type, count=5)
        all_results[test_type] = result
        display_test_data(test_type, result)
    
    # Display summary
    display_coverage_summary(all_results)
    
    # Save results
    save_results(all_results)
    
    # Display usage guide
    display_usage_guide()
    
    print("\n" + "="*80)
    print("✅ TEST COMPLETE")
    print("="*80)
    print("\nWhat you can do now:")
    print("  • Review 'all_test_data_types.json' for complete data")
    print("  • Use different test types for different scenarios")
    print("  • Integrate with your test automation framework")
    print("  • Combine multiple types for comprehensive coverage")
    print("="*80)

if __name__ == "__main__":
    main()
