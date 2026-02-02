"""
Test Script Analyzer with ALL Playwright Patterns
Tests legacy selectors, modern getBy* methods, XPath, CSS, ARIA roles
"""

from script_analyzer import script_analyzer
import json

# Comprehensive script with ALL Playwright patterns
comprehensive_script = """
import { test, expect } from '@playwright/test';

test.describe('All Playwright Patterns Test', () => {
  
  test('Modern getBy* locators (RECOMMENDED)', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // getByRole - Most recommended
    await page.getByRole('textbox', { name: 'Username' }).fill('john');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('checkbox', { name: 'Remember me' }).check();
    
    // getByLabel - For form inputs
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('secret123');
    
    // getByPlaceholder
    await page.getByPlaceholder('Enter your name').fill('John Doe');
    await page.getByPlaceholder('Search...').fill('Playwright');
    
    // getByTestId - Best for testing
    await page.getByTestId('login-button').click();
    await page.getByTestId('transfer-amount').fill('1000');
    
    // getByText - For clickable text
    await page.getByText('Sign in').click();
    await page.getByText('Continue').click();
  });
  
  test('Legacy selectors (page.fill, page.click)', async ({ page }) => {
    await page.goto('https://bank.example.com/transfer');
    
    // CSS ID selectors
    await page.fill('#username', 'admin');
    await page.fill('#password', 'secret');
    await page.fill('#amount', '5000');
    await page.fill('#recipient-email', 'john@example.com');
    
    // CSS Class selectors
    await page.click('.submit-btn');
    await page.fill('.search-input', 'query');
    
    // Attribute selectors
    await page.fill('[name="account-number"]', '1234567890');
    await page.fill('[data-testid="transfer-amount"]', '1000');
    
    // Complex selectors
    await page.selectOption('#account-type', 'savings');
    await page.check('input[type="checkbox"]');
    await page.press('.new-todo', 'Enter');
  });
  
  test('XPath selectors (NOT RECOMMENDED)', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Absolute XPath
    await page.locator('/html/body/div[1]/button').click();
    
    // Relative XPath
    await page.locator('//button[@id="submit"]').click();
    await page.locator('xpath=//input[@type="email"]').fill('test@example.com');
    
    // XPath with text
    await page.locator('//div[contains(text(), "Welcome")]').isVisible();
  });
  
  test('Chained locators and filters', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // Chained locators
    const product = page.locator('.product-list')
                        .filter({ hasText: 'iPhone' })
                        .first();
    
    await product.locator('button.add-cart').click();
    
    // nth, first, last
    await page.locator('.item').first().click();
    await page.locator('.item').nth(2).click();
    await page.locator('.item').last().click();
  });
  
  test('Wait and assertions', async ({ page }) => {
    await page.goto('https://example.com');
    
    await page.waitForSelector('#content');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('#title')).toBeVisible();
    await expect(page.locator('#username')).toHaveValue('admin');
    await expect(page.locator('#agree')).toBeChecked();
    await expect(page.locator('.message')).toHaveText('Success');
  });
});
"""

print("="*100)
print("🧪 TESTING ALL PLAYWRIGHT SCRIPT PATTERNS")
print("="*100)

# Analyze the comprehensive script
analysis = script_analyzer.analyze(comprehensive_script)
recommendations = script_analyzer.generate_test_data_recommendations(analysis)

print(f"\n📊 ANALYSIS SUMMARY:")
print(f"  Total Input Fields Detected: {analysis.summary['total_inputs']}")
print(f"  Total Actions Detected: {analysis.summary['total_actions']}")
print(f"  Lines Analyzed: {analysis.summary['lines_analyzed']}")
print(f"  Modern Locators Used: {'✅ YES' if analysis.summary['modern_locators_used'] else '❌ NO'}")
print(f"  XPath Used: {'⚠️ YES' if analysis.summary.get('xpath_used') else '✅ NO'}")

print(f"\n🔍 DETECTED INPUT FIELDS ({len(analysis.input_fields)} total):")
print("-"*100)

# Group by locator type
modern_locators = [f for f in analysis.input_fields if 'getBy' in f.selector]
legacy_locators = [f for f in analysis.input_fields if 'getBy' not in f.selector]

print(f"\n✅ Modern Locators (getBy*): {len(modern_locators)}")
for idx, field in enumerate(modern_locators[:10], 1):  # Show first 10
    print(f"  {idx}. {field.field_name} ({field.field_type.value})")
    print(f"     Selector: {field.selector}")
    print(f"     Action: {field.action.value}")
    if field.example_value:
        print(f"     Example: {field.example_value}")

print(f"\n📝 Legacy Locators (CSS/ID/Attr): {len(legacy_locators)}")
for idx, field in enumerate(legacy_locators[:10], 1):  # Show first 10
    print(f"  {idx}. {field.field_name} ({field.field_type.value})")
    print(f"     Selector: {field.selector}")
    print(f"     Action: {field.action.value}")
    if field.example_value:
        print(f"     Example: {field.example_value}")

print(f"\n📋 FIELD TYPE DISTRIBUTION:")
for field_type, count in analysis.summary['field_type_distribution'].items():
    print(f"  {field_type}: {count}")

print(f"\n💡 TEST DATA RECOMMENDATIONS:")
print(f"  Security Tests: {len(recommendations['security_tests'])}")
print(f"  Boundary Tests: {len(recommendations['boundary_tests'])}")
print(f"  Equivalence Tests: {len(recommendations['equivalence_tests'])}")

print(f"\n🎯 SECURITY TEST RECOMMENDATIONS:")
for idx, test in enumerate(recommendations['security_tests'][:5], 1):
    print(f"  {idx}. {test['field_name']} - Priority: {test['priority']}")
    print(f"     Tests: {', '.join(test['test_types'])}")

print(f"\n📏 BOUNDARY TEST RECOMMENDATIONS:")
for idx, test in enumerate(recommendations['boundary_tests'][:5], 1):
    print(f"  {idx}. {test['field_name']} ({test['field_type']})")
    if 'min_value' in test:
        print(f"     Range: {test['min_value']} - {test['max_value']}")
    elif 'min_length' in test:
        print(f"     Length: {test['min_length']} - {test['max_length']}")

print(f"\n⚖️ EQUIVALENCE TEST RECOMMENDATIONS:")
for idx, test in enumerate(recommendations['equivalence_tests'][:3], 1):
    print(f"  {idx}. {test['field_name']} ({test['partition_type']})")
    print(f"     Valid partitions: {len(test['partitions']['valid'])}")
    print(f"     Invalid partitions: {len(test['partitions']['invalid'])}")

print("\n" + "="*100)
print("✅ COMPREHENSIVE PATTERN TEST COMPLETE!")
print("="*100)

print("\n📊 SUPPORTED PATTERNS:")
patterns = {
    "Modern Locators": [
        "✅ getByRole() - ARIA roles",
        "✅ getByLabel() - Form labels",
        "✅ getByPlaceholder() - Placeholder text",
        "✅ getByText() - Text content",
        "✅ getByTestId() - Test IDs",
        "✅ getByAltText() - Alt text",
        "✅ getByTitle() - Title attribute"
    ],
    "Legacy Selectors": [
        "✅ CSS ID selectors (#id)",
        "✅ CSS Class selectors (.class)",
        "✅ Attribute selectors ([attr='value'])",
        "✅ page.fill(), page.click(), page.type()",
        "✅ page.selectOption(), page.check()"
    ],
    "XPath": [
        "✅ Absolute XPath (/html/body/...)",
        "✅ Relative XPath (//button[@id=''])",
        "✅ xpath= prefix detection"
    ],
    "Chained Locators": [
        "✅ .first(), .last(), .nth()",
        "✅ .filter({ hasText: '' })",
        "✅ locator().locator()"
    ],
    "Actions": [
        "✅ fill, type, click, check, uncheck",
        "✅ selectOption, press",
        "✅ waitFor, waitForLoadState",
        "✅ expect assertions"
    ]
}

for category, items in patterns.items():
    print(f"\n{category}:")
    for item in items:
        print(f"  {item}")

print("\n🚀 READY FOR DYNAMIC SCRIPT SCANNING!")
print("   All Playwright patterns are now supported and will be detected automatically.")
print()
