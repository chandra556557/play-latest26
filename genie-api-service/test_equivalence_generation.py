"""
Equivalence Partitioning Test Data Generation
Demonstrates representative sampling from valid and invalid input classes
"""

import requests
import json

BASE_URL = "http://localhost:3000"

SAMPLE_SCRIPT = """
import { test } from '@playwright/test';

test('account transfer form', async ({ page }) => {
  await page.goto('https://bank.example.com/transfer');
  await page.getByLabel('From Account').fill('1234567890');
  await page.getByLabel('To Account').fill('0987654321');
  await page.getByLabel('Amount').fill('1000.00');
  await page.getByLabel('Email').fill('user@bank.com');
  await page.getByLabel('Phone').fill('555-1234');
  await page.click('button:has-text("Transfer")');
});
"""

def test_equivalence_generation():
    print("="*80)
    print("⚖️ EQUIVALENCE PARTITIONING TEST DATA GENERATION")
    print("="*80)
    print("\nWhat is Equivalence Partitioning?")
    print("-"*80)
    print("""
Equivalence Partitioning divides input data into classes where:
• All values in a class should be treated the same by the system
• Test one representative value from each class
• Reduces number of test cases while maintaining coverage

Example for "Amount" field:
  Class 1: Small amounts (1-100)
  Class 2: Medium amounts (101-1000)  
  Class 3: Large amounts (1001-10000)
  Class 4: Very large amounts (10000+)
    """)
    
    payload = {
        "scriptCode": SAMPLE_SCRIPT,
        "template": {},
        "count": 6,
        "testDataType": "equivalence",
        "options": {}
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/genieapi/assistant/testdata/equivalence/generate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            metadata = result.get("metadata", {})
            test_data = result.get("data", [])
            
            print(f"\n✅ Generated {len(test_data)} Equivalence Class Samples")
            print("="*80)
            
            # Group by equivalence classes
            field_classes = {}
            fields = metadata.get("fields_detected", [])
            
            for field in fields:
                field_classes[field] = []
                for record in test_data:
                    value = record.get(field)
                    if value:
                        field_classes[field].append(value)
            
            # Display by field
            for field, values in field_classes.items():
                print(f"\n📊 {field.upper()} Field - Equivalence Classes:")
                print("-"*80)
                
                # Categorize values
                categories = categorize_equivalence_classes(field, values)
                
                for category, samples in categories.items():
                    if samples:
                        print(f"\n   Class: {category}")
                        for i, sample in enumerate(samples, 1):
                            print(f"      Sample {i}: {sample}")
            
            # Display partitioning strategy
            display_partitioning_strategy(fields)
            
            # Save results
            with open("equivalence_test_data.json", 'w') as f:
                json.dump(result, f, indent=2)
            print("\n💾 Results saved to: equivalence_test_data.json")
            
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"❌ ERROR: {e}")

def categorize_equivalence_classes(field: str, values: list) -> dict:
    """Categorize values into equivalence classes"""
    
    field_lower = field.lower()
    categories = {}
    
    if "email" in field_lower:
        categories = {
            "Valid Standard Format": [],
            "Valid with Subdomain": [],
            "Valid with Plus Sign": []
        }
        for value in values:
            if "+" in value:
                categories["Valid with Plus Sign"].append(value)
            elif value.count('.') > 1:
                categories["Valid with Subdomain"].append(value)
            else:
                categories["Valid Standard Format"].append(value)
    
    elif "amount" in field_lower or "number" in field_lower:
        categories = {
            "Small (1-100)": [],
            "Medium (101-1000)": [],
            "Large (1001+)": []
        }
        for value in values:
            try:
                num = float(str(value).replace(',', ''))
                if num <= 100:
                    categories["Small (1-100)"].append(value)
                elif num <= 1000:
                    categories["Medium (101-1000)"].append(value)
                else:
                    categories["Large (1001+)"].append(value)
            except:
                pass
    
    elif "phone" in field_lower:
        categories = {
            "Format 1 (No dashes)": [],
            "Format 2 (With dashes)": [],
            "Format 3 (International)": []
        }
        for value in values:
            if "-" in value:
                categories["Format 2 (With dashes)"].append(value)
            elif value.startswith("+"):
                categories["Format 3 (International)"].append(value)
            else:
                categories["Format 1 (No dashes)"].append(value)
    
    elif "account" in field_lower:
        categories = {
            "10-digit Account": [],
            "Other Format": []
        }
        for value in values:
            if len(str(value)) == 10:
                categories["10-digit Account"].append(value)
            else:
                categories["Other Format"].append(value)
    
    else:
        # Generic categorization
        categories = {
            "Class A": values[:len(values)//2],
            "Class B": values[len(values)//2:]
        }
    
    return categories

def display_partitioning_strategy(fields: list):
    """Display recommended partitioning strategy"""
    
    print("\n" + "="*80)
    print("📚 EQUIVALENCE PARTITIONING STRATEGY")
    print("="*80)
    
    strategies = {
        "email": """
EMAIL FIELD PARTITIONS:
  Valid Classes:
    • Standard format: user@domain.com
    • Subdomain: user@mail.domain.com
    • Plus addressing: user+tag@domain.com
  Invalid Classes:
    • Missing @: userdomain.com
    • Missing domain: user@
    • Invalid chars: user@domain!com
        """,
        
        "amount": """
AMOUNT FIELD PARTITIONS:
  Valid Classes:
    • Small amounts: $1 - $100
    • Medium amounts: $101 - $1,000
    • Large amounts: $1,001 - $10,000
    • Very large: $10,000+
  Invalid Classes:
    • Negative: -$100
    • Zero: $0
    • Non-numeric: "abc"
        """,
        
        "phone": """
PHONE FIELD PARTITIONS:
  Valid Classes:
    • Standard: 1234567890
    • With dashes: 123-456-7890
    • With spaces: 123 456 7890
    • International: +1-123-456-7890
  Invalid Classes:
    • Too short: 12345
    • Letters: abc-defg
    • Special chars: (123)@456
        """,
        
        "account": """
ACCOUNT FIELD PARTITIONS:
  Valid Classes:
    • Savings: 1000000000-1999999999
    • Checking: 2000000000-2999999999
    • Credit: 3000000000-3999999999
  Invalid Classes:
    • Too short: 123456
    • Non-numeric: ACCT123
    • Invalid format: 00000000
        """
    }
    
    for field in fields:
        field_lower = field.lower()
        for key, strategy in strategies.items():
            if key in field_lower:
                print(f"\n{strategy}")
                break

def display_usage_guide():
    print("\n" + "="*80)
    print("💡 WHEN TO USE EQUIVALENCE PARTITIONING")
    print("="*80)
    print("""
✅ USE WHEN:
   • Testing large input domains
   • Reducing test case count
   • Ensuring representative coverage
   • Testing classification logic

📊 BENEFITS:
   • Reduces redundant test cases
   • Maintains comprehensive coverage
   • Efficient use of testing resources
   • Systematic approach to testing

🎯 EXAMPLE SCENARIOS:

1. BANKING APPLICATION
   Amount partitions: Small, Medium, Large transfers
   Account types: Savings, Checking, Credit

2. E-COMMERCE
   Product prices: Budget, Mid-range, Premium
   Quantities: Single, Bulk, Wholesale

3. USER REGISTRATION
   Age groups: Minor (<18), Adult (18-65), Senior (65+)
   Email formats: Standard, Corporate, International

4. SEARCH FUNCTIONALITY
   Query length: Short (1-5 chars), Medium (6-20), Long (20+)
   Result count: None, Few, Many

💡 BEST PRACTICE:
   Combine with boundary testing for complete coverage:
   • Use equivalence for general input classes
   • Use boundary for edge cases within each class
    """)

def main():
    test_equivalence_generation()
    display_usage_guide()
    
    print("\n" + "="*80)
    print("✅ EQUIVALENCE PARTITIONING TEST COMPLETE")
    print("="*80)

if __name__ == "__main__":
    main()
