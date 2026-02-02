"""
Test script for the 5 dedicated test data endpoints
Run this after starting the Python AI service with: python main.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint_name, endpoint_path, template, count=5):
    """Test a single endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {endpoint_name}")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            f"{BASE_URL}{endpoint_path}",
            json={
                "template": template,
                "count": count
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code} OK")
            print(f"✅ Success: {data.get('success')}")
            print(f"✅ Data Count: {len(data.get('data', []))}")
            print(f"✅ Test Data Type: {data.get('metadata', {}).get('testDataType')}")
            print(f"✅ Endpoint: {data.get('metadata', {}).get('endpoint')}")
            
            # Print first test case
            if data.get('data'):
                print(f"\n📋 First Test Case:")
                first_case = data['data'][0]
                print(json.dumps(first_case, indent=2))
            
            # Print metadata
            print(f"\n📊 Metadata:")
            metadata = data.get('metadata', {})
            for key, value in metadata.items():
                if isinstance(value, list):
                    print(f"  {key}: {len(value)} items")
                else:
                    print(f"  {key}: {value}")
            
            return True
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False


def main():
    """Run all endpoint tests"""
    print("\n" + "="*60)
    print("🚀 Testing 5 Dedicated Test Data Endpoints")
    print("="*60)
    
    results = {}
    
    # Test 1: Security Endpoint
    results['security'] = test_endpoint(
        "Security Test Data",
        "/api/testdata/generate/security",
        {
            "email": "{{faker.email}}",
            "password": "{{faker.password}}"
        },
        count=10
    )
    
    # Test 2: Boundary Endpoint
    results['boundary'] = test_endpoint(
        "Boundary Value Analysis",
        "/api/testdata/generate/boundary",
        {
            "age": "{{faker.number(0-120)}}",
            "amount": "{{faker.number(0-999999)}}"
        },
        count=15
    )
    
    # Test 3: Equivalence Endpoint
    results['equivalence'] = test_endpoint(
        "Equivalence Partitioning",
        "/api/testdata/generate/equivalence",
        {
            "email": "{{faker.email}}",
            "transferAmount": "{{faker.number(1-1000000)}}"
        },
        count=12
    )
    
    # Test 4: Positive Endpoint
    results['positive'] = test_endpoint(
        "Positive Test Data",
        "/api/testdata/generate/positive",
        {
            "email": "{{faker.email}}",
            "name": "{{faker.name}}",
            "phone": "{{faker.phone}}"
        },
        count=10
    )
    
    # Test 5: Negative Endpoint
    results['negative'] = test_endpoint(
        "Negative Test Data",
        "/api/testdata/generate/negative",
        {
            "email": "{{faker.email}}",
            "password": "{{faker.password}}",
            "name": "{{faker.name}}"
        },
        count=10
    )
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    
    for endpoint, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{endpoint:15} {status}")
    
    total_passed = sum(results.values())
    total_tests = len(results)
    
    print(f"\n{'='*60}")
    print(f"Total: {total_passed}/{total_tests} tests passed")
    print(f"{'='*60}\n")
    
    if total_passed == total_tests:
        print("🎉 All endpoints working perfectly!")
    else:
        print("⚠️  Some endpoints failed. Check the service logs.")


if __name__ == "__main__":
    print("\n⚡ Starting endpoint tests...")
    print("📌 Make sure the Python AI service is running on http://localhost:8000")
    print("   Run: cd ai-analysis-service && python main.py\n")
    
    try:
        # Quick health check
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Service is running!\n")
            main()
        else:
            print("❌ Service health check failed!")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to service. Please start it first:")
        print("   cd ai-analysis-service")
        print("   python main.py")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
