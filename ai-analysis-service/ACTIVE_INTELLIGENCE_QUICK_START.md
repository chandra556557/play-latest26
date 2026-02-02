# 🎯 Active Intelligence Quick Start Guide

## What's New?

The Playwright Script Analyzer is now **10x more powerful** with active intelligence features that go beyond basic parsing to provide **proactive recommendations** and **quality insights**.

## 🚀 Quick Examples

### 1. Get Overall Quality Score

```python
from script_analyzer import PlaywrightScriptAnalyzer

analyzer = PlaywrightScriptAnalyzer()
analysis = analyzer.analyze(your_script_code)

# Quality score 0-100
print(f"Quality Score: {analysis.quality_score}/100")

# What it means:
# 80-100: Excellent ✅
# 60-79: Good 👍
# 40-59: Fair ⚠️
# 0-39: Poor ❌
```

### 2. Check for Unstable XPath

```python
# Automatically detects and scores XPath selectors
for xpath in analysis.xpath_analysis:
    print(f"XPath: {xpath.xpath}")
    print(f"Stability: {xpath.stability_score}/100")
    print(f"Recommendation: {xpath.recommended_alternative}")
```

**Example Output:**
```
XPath: /html/body/div[1]/button[2]
Stability: 30/100 ⚠️
Recommendation: Use getByRole('button', { name: 'Submit' }) instead
```

### 3. Get Proactive Recommendations

```python
# Analyzer automatically generates improvement suggestions
for rec in analysis.recommendations:
    print(f"[{rec['priority']}] {rec['title']}")
    print(f"Fix: {rec['suggestion']}")
```

**Example Output:**
```
[HIGH] Unstable XPath detected (line 34)
Fix: Use getByRole(), getByLabel(), or getByTestId() instead

[MEDIUM] 5 locators could be improved
Fix: Migrate to modern Playwright locators

[HIGH] No assertions detected
Fix: Add expect() assertions to verify outcomes
```

### 4. Detect Test Patterns

```python
# Automatically identifies your test architecture
print(f"Pattern: {analysis.detected_pattern.value}")

# Possible patterns:
# - basic
# - page_object_model
# - fixture_based
# - data_driven
# - api_hybrid
# - component_testing
```

### 5. Check Locator Quality

```python
# Every action has a quality rating
for action in analysis.actions:
    print(f"{action.target} - {action.quality.value}")
```

**Example Output:**
```
getByRole('button') - excellent ⭐⭐⭐⭐⭐
getByTestId('submit') - good ⭐⭐⭐⭐
#username - fair ⭐⭐⭐
xpath=//div[1] - poor ⭐⭐
.btn-a7f3d8 - unstable ⭐
```

### 6. Find External Data Sources

```python
# Detects JSON, CSV, Excel, API calls
for source in analysis.external_data_sources:
    print(f"{source.source_type}: {source.file_path or source.api_endpoint}")
```

**Example Output:**
```
json: ./data/users.json
api: https://api.example.com/test-users
csv: ./data/login-data.csv
```

### 7. Validate Assertions

```python
# Enhanced assertion analysis with types
print(f"Assertions: {len(analysis.assertions)}")

for assertion in analysis.assertions:
    print(f"Type: {assertion['type']}")  # visibility, text_content, url, value
    print(f"Expected: {assertion.get('expected_value', 'N/A')}")
```

## 💡 Real-World Use Cases

### Use Case 1: Pre-Commit Quality Check

```python
#!/usr/bin/env python
"""Pre-commit hook to check test quality"""

from script_analyzer import PlaywrightScriptAnalyzer
import sys

analyzer = PlaywrightScriptAnalyzer()

with open('tests/my-test.spec.ts') as f:
    script_code = f.read()

analysis = analyzer.analyze(script_code)

if analysis.quality_score < 60:
    print(f"❌ Test quality too low: {analysis.quality_score}/100")
    print("\nRecommendations:")
    for rec in analysis.recommendations:
        print(f"  - {rec['title']}: {rec['suggestion']}")
    sys.exit(1)

print(f"✅ Test quality: {analysis.quality_score}/100")
sys.exit(0)
```

### Use Case 2: XPath Migration Tool

```python
"""Identify all XPath selectors that need migration"""

analyzer = PlaywrightScriptAnalyzer()
analysis = analyzer.analyze(script_code)

print("XPath Migration Report")
print("=" * 60)

for xpath in analysis.xpath_analysis:
    if xpath.stability_score < 70:
        print(f"\n⚠️ Line {xpath.line_number}")
        print(f"   Current: {xpath.xpath}")
        print(f"   Stability: {xpath.stability_score}/100")
        print(f"   Replace with: {xpath.recommended_alternative}")
```

### Use Case 3: Test Coverage Dashboard

```python
"""Generate test coverage metrics"""

analyzer = PlaywrightScriptAnalyzer()
analysis = analyzer.analyze(script_code)

print("Test Coverage Metrics")
print("=" * 60)
print(f"Quality Score: {analysis.quality_score}/100")
print(f"Modern Locators: {analysis.summary['locator_quality']['excellent']}")
print(f"Assertions: {len(analysis.assertions)}")
print(f"External Data: {len(analysis.external_data_sources)}")
print(f"Pattern: {analysis.detected_pattern.value}")
print(f"\nLocator Quality Distribution:")
for quality, count in analysis.summary['locator_quality'].items():
    print(f"  {quality}: {count}")
```

## 🔍 What Gets Analyzed

### ✅ Automatically Detected:

- [x] **All Modern Locators**: getByRole, getByLabel, getByPlaceholder, getByTestId, getByText
- [x] **All Legacy Selectors**: CSS IDs, classes, attributes, XPath
- [x] **All Actions**: fill, type, click, hover, press, drag, upload, screenshot
- [x] **All Assertions**: toBeVisible, toHaveText, toHaveValue, toHaveURL, toContainText
- [x] **External Data**: JSON, CSV, Excel files, API endpoints
- [x] **Test Context**: Hooks, timeouts, retries, fixtures, test names
- [x] **Test Patterns**: POM, Fixtures, Data-driven, API hybrid, Component testing

### 🎯 Quality Factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Modern Locators | +20 | Use of getBy* methods |
| XPath Stability | -5 to -20 | Penalty for unstable XPath |
| Test Pattern | +8 to +12 | Bonus for good architecture |
| Assertions | +2 each | Up to +10 for assertions |
| Hooks | +5 | beforeEach/afterEach usage |
| Configuration | +3 each | Timeout/retry settings |

## 🎨 Quality Score Breakdown

```python
# See exactly how the score is calculated
analysis = analyzer.analyze(script_code)

print(f"Base Score: 50")
print(f"Modern Locator Bonus: +{modern_bonus}")
print(f"XPath Penalty: -{xpath_penalty}")
print(f"Pattern Bonus: +{pattern_bonus}")
print(f"Assertion Bonus: +{assertion_bonus}")
print(f"Context Bonus: +{context_bonus}")
print(f"=" * 40)
print(f"Total: {analysis.quality_score}/100")
```

## 📊 Summary Output

```python
# Complete analysis summary
print(json.dumps(analysis.summary, indent=2))
```

**Example Output:**
```json
{
  "total_inputs": 5,
  "total_actions": 11,
  "has_validation": true,
  "navigation_url": "https://bank.example.com",
  "modern_locators_used": true,
  "xpath_used": true,
  "xpath_count": 2,
  "external_data_sources": 2,
  "test_pattern": "component_testing",
  "has_hooks": true,
  "locator_quality": {
    "excellent": 5,
    "good": 1,
    "fair": 4,
    "poor": 0,
    "unstable": 1
  }
}
```

## 🛠️ Integration with Backend API

The enhanced analyzer is ready for backend integration:

```python
# In main.py
from script_analyzer import script_analyzer

@app.post("/api/ai-analysis/analyze-script-enhanced")
async def analyze_script_enhanced(request: ScriptAnalysisRequest):
    """Enhanced analysis with quality scoring and recommendations"""
    
    analysis = script_analyzer.analyze(request.script_code)
    
    return {
        "success": True,
        "data": {
            "analysis": analysis.to_dict(),
            "quality_score": analysis.quality_score,
            "recommendations": analysis.recommendations,
            "xpath_analysis": [x.__dict__ for x in analysis.xpath_analysis],
            "test_pattern": analysis.detected_pattern.value
        }
    }
```

## 🎓 Best Practices

### 1. **Run Analysis on All Tests**
```bash
# Batch analyze all test files
for file in tests/**/*.spec.ts; do
    python -c "
from script_analyzer import PlaywrightScriptAnalyzer
analyzer = PlaywrightScriptAnalyzer()
with open('$file') as f:
    analysis = analyzer.analyze(f.read())
    print(f'$file: {analysis.quality_score}/100')
"
done
```

### 2. **Set Quality Thresholds**
```python
MINIMUM_QUALITY_SCORE = 65
MAX_XPATH_COMPLEXITY = 50
MIN_ASSERTIONS = 2

analysis = analyzer.analyze(script_code)

assert analysis.quality_score >= MINIMUM_QUALITY_SCORE
assert all(x.complexity_score <= MAX_XPATH_COMPLEXITY for x in analysis.xpath_analysis)
assert len(analysis.assertions) >= MIN_ASSERTIONS
```

### 3. **Track Quality Over Time**
```python
# Store quality scores in database
quality_history.append({
    'date': datetime.now(),
    'score': analysis.quality_score,
    'xpath_count': len(analysis.xpath_analysis),
    'modern_locators': analysis.summary['locator_quality']['excellent']
})

# Plot improvement trend
plt.plot(dates, scores)
plt.title('Test Quality Improvement')
```

## 🚨 Common Issues & Fixes

### Issue: Low Quality Score

**Problem**: `Quality Score: 35/100`

**Diagnosis**:
```python
print(analysis.recommendations)
# Shows specific issues
```

**Common Fixes**:
- Replace XPath with modern locators
- Add assertions to tests
- Implement test hooks for setup/cleanup
- Extract hardcoded data to external files

### Issue: Unstable XPath

**Problem**: `Stability Score: 25/100`

**Fix**:
```python
# Before (unstable)
await page.locator('xpath=/html/body/div[1]/div[2]/button[1]').click()

# After (stable)
await page.getByRole('button', { name: 'Submit' }).click()
```

### Issue: No Pattern Detected

**Problem**: `Pattern: basic`

**Recommendation**: Consider implementing POM when test complexity increases
```python
if len(analysis.input_fields) > 10 and not analysis.detected_pattern:
    print("Recommendation: Refactor to Page Object Model")
```

## 📚 Additional Resources

- **Full Documentation**: `ENHANCED_ANALYZER_SUMMARY.md`
- **Comprehensive Test**: `test_enhanced_analyzer.py`
- **Pattern Guide**: `COMPREHENSIVE_PATTERN_SUPPORT.md`
- **Reference Document**: `play.md` (719 lines of Playwright patterns)

## ✨ Quick Win Tips

1. **Immediate Value**: Run analyzer on existing tests to find XPath issues
2. **Quality Gate**: Add quality score check to CI/CD pipeline
3. **Migration Guide**: Use XPath analysis to plan modernization
4. **Best Practices**: Follow recommendations to improve test stability
5. **Dashboard**: Create quality tracking dashboard with summary metrics

---

**Ready to Start?** Run `python test_enhanced_analyzer.py` to see it in action! 🚀
