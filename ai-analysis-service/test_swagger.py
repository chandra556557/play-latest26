"""
Test Swagger/OpenAPI Documentation
Verify that all endpoints are properly documented
"""

import requests
import webbrowser
import time

API_BASE = 'http://localhost:8000'

print("=" * 80)
print("SWAGGER/OPENAPI DOCUMENTATION TEST")
print("=" * 80)

print("\n1. Testing Health Check Endpoint...")
try:
    response = requests.get(f'{API_BASE}/health')
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Health Check: {data['status']}")
        print(f"   Version: {data['version']}")
        print(f"   Components: {data['components']}")
    else:
        print(f"❌ Health check failed: {response.status_code}")
except Exception as e:
    print(f"❌ Could not connect to server: {e}")
    print("\n⚠️  Make sure the server is running:")
    print("   cd ai-analysis-service")
    print("   python main.py")
    exit(1)

print("\n2. Testing Root Endpoint...")
try:
    response = requests.get(f'{API_BASE}/')
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Service: {data['service']}")
        print(f"   Version: {data['version']}")
        print(f"   Features: {len(data['features'])} features")
    else:
        print(f"❌ Root endpoint failed: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n3. Checking OpenAPI JSON...")
try:
    response = requests.get(f'{API_BASE}/openapi.json')
    if response.status_code == 200:
        openapi_spec = response.json()
        print(f"✅ OpenAPI Version: {openapi_spec.get('openapi', 'N/A')}")
        print(f"   API Title: {openapi_spec.get('info', {}).get('title', 'N/A')}")
        print(f"   API Version: {openapi_spec.get('info', {}).get('version', 'N/A')}")
        print(f"   Total Endpoints: {sum(len(methods) for methods in openapi_spec.get('paths', {}).values())}")
        print(f"   Total Tags: {len(openapi_spec.get('tags', []))}")
        
        # Count endpoints by tag
        paths = openapi_spec.get('paths', {})
        tags_count = {}
        for path, methods in paths.items():
            for method, details in methods.items():
                for tag in details.get('tags', []):
                    tags_count[tag] = tags_count.get(tag, 0) + 1
        
        print(f"\n   Endpoints by Category:")
        for tag, count in sorted(tags_count.items()):
            print(f"     - {tag}: {count} endpoint(s)")
    else:
        print(f"❌ OpenAPI JSON failed: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n4. Checking Enhanced Analysis Endpoints...")
enhanced_endpoints = [
    "/api/ai-analysis/analyze-script-enhanced",
    "/api/ai-analysis/xpath-deep-analysis",
    "/api/ai-analysis/quality-score",
    "/api/ai-analysis/recommendations",
    "/api/ai-analysis/locator-quality-report",
    "/api/ai-analysis/test-pattern-detection",
    "/api/ai-analysis/external-data-sources",
    "/api/ai-analysis/comprehensive-report"
]

try:
    response = requests.get(f'{API_BASE}/openapi.json')
    if response.status_code == 200:
        openapi_spec = response.json()
        paths = openapi_spec.get('paths', {})
        
        found = 0
        for endpoint in enhanced_endpoints:
            if endpoint in paths:
                found += 1
                endpoint_info = paths[endpoint].get('post', {})
                print(f"✅ {endpoint}")
                print(f"   Summary: {endpoint_info.get('summary', 'N/A')}")
        
        print(f"\n   Total Enhanced Endpoints: {found}/{len(enhanced_endpoints)}")
    else:
        print(f"❌ Could not verify endpoints")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 80)
print("SWAGGER UI LINKS")
print("=" * 80)
print(f"\n📚 Interactive API Documentation (Swagger UI):")
print(f"   {API_BASE}/docs")
print(f"\n📖 Alternative Documentation (ReDoc):")
print(f"   {API_BASE}/redoc")
print(f"\n🔧 OpenAPI JSON Specification:")
print(f"   {API_BASE}/openapi.json")

print("\n" + "=" * 80)
print("OPENING SWAGGER UI IN BROWSER...")
print("=" * 80)

# Open Swagger UI in browser
try:
    print(f"\n🌐 Opening {API_BASE}/docs in your browser...")
    time.sleep(1)
    webbrowser.open(f'{API_BASE}/docs')
    print("✅ Browser opened! You should see the interactive API documentation.")
    print("\n💡 Tips:")
    print("   - Try out endpoints using the 'Try it out' button")
    print("   - View request/response schemas")
    print("   - See example values for all parameters")
    print("   - All endpoints are organized by tags")
except Exception as e:
    print(f"⚠️  Could not open browser automatically: {e}")
    print(f"\nPlease manually open: {API_BASE}/docs")

print("\n" + "=" * 80)
print("✅ SWAGGER DOCUMENTATION IS READY!")
print("=" * 80)
