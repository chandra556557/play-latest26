"""
Test Enhanced API Endpoints
Quick test to verify all new APIs are working
"""

import requests
import json

API_BASE = 'http://localhost:8000'

# Sample Playwright script for testing
sample_script = """
import { test, expect } from '@playwright/test';

test.describe('Banking Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://bank.example.com/login');
    });
    
    test('login and transfer', async ({ page }) => {
        // Modern locators
        await page.getByRole('textbox', { name: 'Username' }).fill('john');
        await page.getByLabel('Password').fill('secret123');
        await page.getByTestId('login-btn').click();
        
        // Legacy selectors
        await page.fill('#transfer-amount', '1000');
        
        // XPath (unstable)
        await page.locator('xpath=/html/body/div[1]/button[2]').click();
        
        // Assertions
        await expect(page.locator('.success')).toBeVisible();
        await expect(page).toHaveURL(/dashboard/);
    });
});
"""

print("=" * 80)
print("TESTING ENHANCED API ENDPOINTS")
print("=" * 80)

def test_enhanced_analysis():
    print("\n🔍 Testing: /api/ai-analysis/analyze-script-enhanced")
    try:
        response = requests.post(
            f'{API_BASE}/api/ai-analysis/analyze-script-enhanced',
            json={'script_code': sample_script, 'generate_recommendations': True}
        )
        
        if response.status_code == 200:
            data = response.json()['data']
            print(f"✅ SUCCESS")
            print(f"   Quality Score: {data['quality_score']}/100")
            print(f"   Test Pattern: {data['test_pattern']}")
            print(f"   XPath Count: {len(data['xpath_analysis'])}")
            print(f"   Recommendations: {len(data['recommendations'])}")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_quality_score():
    print("\n📊 Testing: /api/ai-analysis/quality-score")
    try:
        response = requests.post(
            f'{API_BASE}/api/ai-analysis/quality-score',
            json={'script_code': sample_script}
        )
        
        if response.status_code == 200:
            data = response.json()['data']
            print(f"✅ SUCCESS")
            print(f"   Score: {data['quality_score']}/100")
            print(f"   Rating: {data['rating']}")
            print(f"   Breakdown: {json.dumps(data['breakdown'], indent=6)}")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_xpath_analysis():
    print("\n🛡️ Testing: /api/ai-analysis/xpath-deep-analysis")
    try:
        response = requests.post(
            f'{API_BASE}/api/ai-analysis/xpath-deep-analysis',
            json={'script_code': sample_script}
        )
        
        if response.status_code == 200:
            data = response.json()['data']
            print(f"✅ SUCCESS")
            print(f"   XPath Count: {data['xpath_count']}")
            if data['xpath_count'] > 0:
                print(f"   Average Stability: {data['summary']['average_stability']:.1f}/100")
                print(f"   Unstable XPaths: {data['summary']['unstable_xpaths']}")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_recommendations():
    print("\n💡 Testing: /api/ai-analysis/recommendations")
    try:
        response = requests.post(
            f'{API_BASE}/api/ai-analysis/recommendations',
            json={'script_code': sample_script}
        )
        
        if response.status_code == 200:
            data = response.json()['data']
            print(f"✅ SUCCESS")
            print(f"   Total: {data['total_recommendations']}")
            print(f"   High Priority: {data['priority_counts']['high']}")
            print(f"   Medium Priority: {data['priority_counts']['medium']}")
            print(f"   Low Priority: {data['priority_counts']['low']}")
            
            if data['by_priority']['high']:
                print(f"\n   Top Recommendation:")
                rec = data['by_priority']['high'][0]
                print(f"   - {rec['title']}")
                print(f"   - {rec['suggestion']}")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_locator_quality():
    print("\n🎯 Testing: /api/ai-analysis/locator-quality-report")
    try:
        response = requests.post(
            f'{API_BASE}/api/ai-analysis/locator-quality-report',
            json={'script_code': sample_script}
        )
        
        if response.status_code == 200:
            data = response.json()['data']
            print(f"✅ SUCCESS")
            print(f"   Total Actions: {data['total_actions']}")
            print(f"   Quality Distribution:")
            for quality, pct in data['percentages'].items():
                print(f"     {quality}: {pct}%")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_pattern_detection():
    print("\n🔍 Testing: /api/ai-analysis/test-pattern-detection")
    try:
        response = requests.post(
            f'{API_BASE}/api/ai-analysis/test-pattern-detection',
            json={'script_code': sample_script}
        )
        
        if response.status_code == 200:
            data = response.json()['data']
            print(f"✅ SUCCESS")
            print(f"   Pattern: {data['pattern']['detected_pattern']}")
            print(f"   Has Hooks: {data['has_hooks']}")
            print(f"   Complexity: {data['complexity']}")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_comprehensive_report():
    print("\n📑 Testing: /api/ai-analysis/comprehensive-report")
    try:
        response = requests.post(
            f'{API_BASE}/api/ai-analysis/comprehensive-report',
            json={'script_code': sample_script, 'generate_recommendations': True}
        )
        
        if response.status_code == 200:
            data = response.json()['data']
            print(f"✅ SUCCESS")
            print(f"   Overview:")
            print(f"     Quality Score: {data['overview']['quality_score']}/100")
            print(f"     Pattern: {data['overview']['test_pattern']}")
            print(f"     Input Fields: {data['overview']['total_input_fields']}")
            print(f"     Actions: {data['overview']['total_actions']}")
            print(f"     Assertions: {data['overview']['total_assertions']}")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False


# Run all tests
if __name__ == "__main__":
    results = []
    
    results.append(("Enhanced Analysis", test_enhanced_analysis()))
    results.append(("Quality Score", test_quality_score()))
    results.append(("XPath Analysis", test_xpath_analysis()))
    results.append(("Recommendations", test_recommendations()))
    results.append(("Locator Quality", test_locator_quality()))
    results.append(("Pattern Detection", test_pattern_detection()))
    results.append(("Comprehensive Report", test_comprehensive_report()))
    
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print("\n" + "=" * 80)
    print(f"RESULTS: {passed}/{total} tests passed")
    print("=" * 80)
    
    if passed == total:
        print("🎉 All API endpoints working perfectly!")
    else:
        print("⚠️ Some endpoints failed. Please check the server is running on port 8000.")
