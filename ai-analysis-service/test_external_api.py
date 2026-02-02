"""
Test script to verify all external API endpoints authentication
Run this to test if all tokens work for all 5 endpoints
"""

import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get configuration for all endpoints
api_endpoints = {
    'boundary': os.getenv('EXTERNAL_BOUNDARY_API_URL'),
    'positive': os.getenv('EXTERNAL_POSITIVE_API_URL'),
    'negative': os.getenv('EXTERNAL_NEGATIVE_API_URL'),
    'security': os.getenv('EXTERNAL_SECURITY_API_URL'),
    'equivalence': os.getenv('EXTERNAL_EQUIVALENCE_API_URL')
}
api_token = os.getenv('EXTERNAL_API_TOKEN')

print("=" * 60)
print("All External APIs Test")
print("=" * 60)
print()

# Check configuration
print("📋 Configuration:")
for endpoint_type, url in api_endpoints.items():
    status = "✅ Configured" if url else "❌ Missing"
    print(f"   {endpoint_type.upper()}: {status}")
    if url:
        print(f"      URL: {url}")
print(f"   Token set: {'Yes' if api_token else 'No'}")
if api_token:
    print(f"   Token length: {len(api_token)} characters")
print()

if not api_token:
    print("❌ Missing API token. Check .env file.")
    exit(1)

# Test each endpoint
success_count = 0
total_count = len([url for url in api_endpoints.values() if url])

for endpoint_type, api_url in api_endpoints.items():
    if not api_url:
        print(f"⚠️ Skipping {endpoint_type.upper()}: No URL configured")
        continue
        
    print(f"🧪 Testing {endpoint_type.upper()} endpoint...")
    print(f"   URL: {api_url}")
    
    # Build request
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_token}'
    }

    payload = {
        'script_code': f'await page.fill("#test_{endpoint_type}", "value");',
        'template': {f'test_{endpoint_type}': '{{faker.text}}'},
        'count': 3
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            print(f"   ✅ SUCCESS! Status: 200")
            result = response.json()
            print(f"   📄 Data count: {len(result.get('data', []))}")
            print(f"   🏷️ Source: {result.get('metadata', {}).get('source', 'unknown')}")
            success_count += 1
        elif response.status_code == 401:
            print(f"   ❌ AUTHENTICATION FAILED (401)")
            print(f"   Response: {response.text[:100]}...")
        else:
            print(f"   ⚠️ FAILED: Status {response.status_code}")
            print(f"   Response: {response.text[:100]}...")
            
    except requests.exceptions.Timeout:
        print(f"   ⏰ TIMEOUT (30s)")
    except requests.exceptions.ConnectionError:
        print(f"   🚫 CONNECTION ERROR")
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
    
    print()  # Empty line between tests

print("=" * 60)
print(f"Test Summary: {success_count}/{total_count} endpoints working")
if success_count == total_count:
    print("🎉 ALL ENDPOINTS WORKING! External APIs ready to use.")
else:
    print("⚠️ Some endpoints failed. Check configuration and try again.")
print("=" * 60)
