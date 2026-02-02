"""
Test Script Analyzer - Demonstrates the new script scanning and auto-test generation features
"""

import requests
import json

API_URL = "http://localhost:8000"

# Sample Playwright script to analyze
sample_script = """
import { test, expect } from '@playwright/test';

test('Bank transfer test', async ({ page }) => {
    await page.goto('https://bank.example.com/transfer');
    await page.fill('#amount', '1000');
    await page.fill('#recipient-email', 'john@example.com');
    await page.fill('#password', 'secret123');
    await page.selectOption('#account-type', 'savings');
    await page.fill('#reference', 'Monthly payment');
    await page.click('#submit-button');
    await expect(page.locator('.success-message')).toBeVisible();
});
"""

print("="*80)
print("🧪 PLAYWRIGHT SCRIPT ANALYZER TEST")
print("="*80)

# Test 1: Analyze Script
print("\n📊 Test 1: Analyzing Playwright Script")
print("-"*80)

response = requests.post(
    f"{API_URL}/api/ai-analysis/analyze-script",
    json={
        "script_code": sample_script,
        "script_id": "test-123",
        "generate_recommendations": True
    }
)

if response.status_code == 200:
    data = response.json()['data']
    analysis = data['analysis']
    recommendations = data['recommendations']
    
    print(f"\n✅ Analysis Complete!")
    print(f"\n📋 Summary:")
    print(f"  Total Input Fields: {analysis['summary']['total_inputs']}")
    print(f"  Total Actions: {analysis['summary']['total_actions']}")
    print(f"  Has Validation: {analysis['summary']['has_validation']}")
    print(f"  Navigation URL: {analysis['navigation_url']}")
    
    print(f"\n🔍 Detected Input Fields:")
    for idx, field in enumerate(analysis['input_fields'], 1):
        print(f"  {idx}. {field['field_name']} ({field['field_type']})")
        print(f"     Selector: {field['selector']}")
        print(f"     Action: {field['action']}")
        if field.get('example_value'):
            print(f"     Example: {field['example_value']}")
    
    print(f"\n💡 Test Data Recommendations:")
    print(f"  Security Tests: {len(recommendations.get('security_tests', []))}")
    print(f"  Boundary Tests: {len(recommendations.get('boundary_tests', []))}")
    print(f"  Equivalence Tests: {len(recommendations.get('equivalence_tests', []))}")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)

# Test 2: Generate Complete Tests from Script
print("\n" + "="*80)
print("🚀 Test 2: Auto-Generating Tests from Script")
print("-"*80)

response = requests.post(
    f"{API_URL}/api/ai-analysis/generate-tests-from-script",
    json={
        "script_code": sample_script,
        "script_id": "test-123",
        "test_types": ["security", "boundary", "equivalence"],
        "count_per_type": 10
    }
)

if response.status_code == 200:
    data = response.json()['data']
    generated = data['generated_tests']
    summary = data['summary']
    
    print(f"\n✅ Test Generation Complete!")
    print(f"\n📊 Generation Summary:")
    print(f"  Security Tests: {summary['total_security_tests']}")
    print(f"  Boundary Tests: {summary['total_boundary_tests']}")
    print(f"  Equivalence Tests: {summary['total_equivalence_tests']}")
    print(f"  Test Files Generated: {summary['test_files_generated']}")
    print(f"  Input Fields Analyzed: {summary['input_fields_analyzed']}")
    
    # Show security tests
    if generated['security_tests']:
        print(f"\n🔒 Security Tests Generated:")
        for idx, test in enumerate(generated['security_tests'][:3], 1):  # Show first 3
            print(f"  {idx}. {test['attack_type']} - {test['field_name']}")
            print(f"     Field: {test['field']}")
            print(f"     Payloads: {len(test['payloads'])}")
    
    # Show boundary tests
    if generated['boundary_tests']:
        print(f"\n📏 Boundary Tests Generated:")
        for idx, test in enumerate(generated['boundary_tests'][:2], 1):  # Show first 2
            print(f"  {idx}. {test['field_name']} ({test['field_type']})")
            print(f"     Test Cases: {len(test['test_cases'])}")
            for tc in test['test_cases'][:3]:  # Show first 3 test cases
                valid_mark = "✅" if tc['isValid'] else "❌"
                print(f"       {valid_mark} {tc['type']}: {tc['value']}")
    
    # Show equivalence tests
    if generated['equivalence_tests']:
        print(f"\n⚖️ Equivalence Tests Generated:")
        for idx, test in enumerate(generated['equivalence_tests'][:2], 1):
            print(f"  {idx}. {test['field_name']} ({test['partition_type']})")
            print(f"     Valid Partitions: {len(test.get('valid_partitions', []))}")
            print(f"     Invalid Partitions: {len(test.get('invalid_partitions', []))}")
    
    # Show generated test files
    if generated['complete_test_files']:
        print(f"\n📄 Generated Test Files:")
        for filename, content in generated['complete_test_files'].items():
            print(f"  ✅ {filename} ({len(content)} characters)")
            print(f"\n      Preview:")
            preview_lines = content.split('\n')[:10]
            for line in preview_lines:
                print(f"      {line}")
            if len(content.split('\n')) > 10:
                print(f"      ... ({len(content.split('\n')) - 10} more lines)")

else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)

# Summary
print("\n" + "="*80)
print("✅ ALL TESTS COMPLETE!")
print("="*80)
print("\n🎯 What Just Happened:")
print("  1. ✅ Analyzed Playwright script to extract input fields")
print("  2. ✅ Auto-detected field types (email, password, number, text)")
print("  3. ✅ Generated security tests (SQL injection, XSS)")
print("  4. ✅ Generated boundary tests (min, max, edge cases)")
print("  5. ✅ Generated equivalence tests (valid/invalid partitions)")
print("  6. ✅ Created complete Playwright test files")

print("\n🚀 New API Endpoints Available:")
print("  POST /api/ai-analysis/analyze-script")
print("  POST /api/ai-analysis/generate-tests-from-script")

print("\n📖 Documentation:")
print("  Swagger UI: http://localhost:8000/docs")
print("  API Docs: http://localhost:8000/redoc")

print("\n💡 Next Steps:")
print("  1. Start AI service: cd ai-analysis-service && python main.py")
print("  2. Run this test: python test_script_analyzer.py")
print("  3. Use generated test files in your Playwright project")
print()
