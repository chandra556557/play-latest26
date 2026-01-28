"""
Security Test Data Generation - OWASP Top 10 Coverage
Demonstrates SQL Injection, XSS, Command Injection, Path Traversal, etc.
"""

import requests
import json

BASE_URL = "http://localhost:3000"

SAMPLE_SCRIPT = """
import { test } from '@playwright/test';

test('login form security testing', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel('Email').fill('test@example.com');
  await page.click('button[type="submit"]');
});
"""

def test_security_generation():
    print("="*80)
    print("🔒 SECURITY TEST DATA GENERATION")
    print("="*80)
    print("\nOWASP Top 10 Security Testing")
    print("Generates payloads for:")
    print("  • SQL Injection (SQLi)")
    print("  • Cross-Site Scripting (XSS)")
    print("  • Command Injection")
    print("  • Path Traversal")
    print("  • LDAP Injection")
    print("  • XML External Entity (XXE)")
    
    payload = {
        "scriptCode": SAMPLE_SCRIPT,
        "template": {},
        "count": 10,
        "testDataType": "security",
        "options": {}
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/genieapi/assistant/testdata/security/generate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            metadata = result.get("metadata", {})
            test_data = result.get("data", [])
            
            print(f"\n✅ Generated {len(test_data)} Security Test Cases")
            print("="*80)
            
            # Categorize payloads
            categories = {
                "SQL Injection": [],
                "XSS Attacks": [],
                "Command Injection": [],
                "Path Traversal": [],
                "Other": []
            }
            
            for record in test_data:
                for key, value in record.items():
                    if not key.startswith('_'):
                        val_str = str(value).lower()
                        if "drop" in val_str or "select" in val_str or "'" in val_str:
                            categories["SQL Injection"].append((key, value, record.get('_index')))
                        elif "<script" in val_str or "alert" in val_str or "<img" in val_str:
                            categories["XSS Attacks"].append((key, value, record.get('_index')))
                        elif "../" in val_str or "etc/passwd" in val_str:
                            categories["Path Traversal"].append((key, value, record.get('_index')))
                        elif "$" in val_str or "{{" in val_str:
                            categories["Command Injection"].append((key, value, record.get('_index')))
                        else:
                            categories["Other"].append((key, value, record.get('_index')))
            
            # Display by category
            for category, payloads in categories.items():
                if payloads:
                    print(f"\n🔍 {category} ({len(payloads)} payloads)")
                    print("-"*80)
                    for field, value, index in payloads[:3]:  # Show first 3
                        print(f"   Test #{index} | {field:10s}: {value}")
            
            # Security testing guide
            print("\n" + "="*80)
            print("🛡️ SECURITY TESTING GUIDE")
            print("="*80)
            print("""
HOW TO USE:
1. Run these payloads against your application
2. Verify input validation blocks malicious inputs
3. Check error messages don't reveal system info
4. Ensure proper sanitization and encoding

EXPECTED BEHAVIOR:
✅ Application should REJECT all these inputs
✅ Return appropriate error messages
✅ Log security events
✅ No data exposure or system compromise

CRITICAL CHECKS:
• SQL Injection → Database queries are parameterized
• XSS → HTML/JS properly escaped in output
• Command Injection → No shell command execution
• Path Traversal → File paths are validated
            """)
            
            # Save results
            with open("security_test_data.json", 'w') as f:
                json.dump(result, f, indent=2)
            print("\n💾 Security test data saved to: security_test_data.json")
            
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_security_generation()
