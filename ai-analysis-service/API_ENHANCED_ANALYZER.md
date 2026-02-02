# 🚀 Enhanced Script Analyzer API Documentation

## Overview

The Enhanced Script Analyzer provides 8 new RESTful API endpoints for comprehensive Playwright script analysis with active intelligence. All endpoints are available via the Python FastAPI service.

**Base URL**: `http://localhost:8000`

---

## 📍 API Endpoints

### 1. **Enhanced Script Analysis** (Complete Analysis)

**Endpoint**: `POST /api/ai-analysis/analyze-script-enhanced`

**Description**: Comprehensive script analysis with all enhanced features including quality scoring, XPath analysis, locator quality, pattern detection, and proactive recommendations.

**Request Body**:
```json
{
  "script_code": "import { test } from '@playwright/test'...",
  "script_id": "optional-identifier",
  "generate_recommendations": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "analysis": {
      "input_fields": [...],
      "actions": [...],
      "assertions": [...],
      "summary": {...}
    },
    "quality_score": 68,
    "test_pattern": "component_testing",
    "xpath_analysis": [
      {
        "xpath": "/html/body/div[1]",
        "type": "absolute",
        "complexity_score": 90,
        "stability_score": 30,
        "issues": ["Absolute XPath is brittle"],
        "recommended_alternative": "Use getByRole() instead",
        "line_number": 34
      }
    ],
    "external_data_sources": [
      {
        "type": "json",
        "file_path": "./data/users.json",
        "api_endpoint": null,
        "line_number": 3
      }
    ],
    "test_context": {
      "test_name": "banking workflow",
      "description": "Component Tests",
      "has_hooks": true,
      "timeout": 30000,
      "retries": null,
      "fixtures": []
    },
    "recommendations": [
      {
        "priority": "high",
        "category": "locator_stability",
        "title": "Unstable XPath detected",
        "description": "XPath has low stability score",
        "suggestion": "Use getByRole() or getByTestId()"
      }
    ],
    "test_data_recommendations": {...}
  },
  "message": "Enhanced analysis complete. Quality Score: 68/100"
}
```

**Use Cases**:
- Complete script quality assessment
- CI/CD quality gates
- Test maintenance dashboards
- Automated code review

---

### 2. **XPath Deep Analysis**

**Endpoint**: `POST /api/ai-analysis/xpath-deep-analysis`

**Description**: Specialized analysis of all XPath selectors with stability scoring, complexity analysis, and AI-powered recommendations (if GPT-4o is available).

**Request Body**:
```json
{
  "script_code": "your Playwright script..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "xpath_count": 2,
    "xpath_analysis": [
      {
        "xpath": "/html/body/div[1]/button[2]",
        "type": "absolute",
        "complexity_score": 90,
        "stability_score": 30,
        "issues": [
          "Absolute XPath is brittle - breaks easily with DOM changes",
          "Positional selectors (e.g., [1]) are unstable"
        ],
        "recommended_alternative": "Use getByRole(), getByLabel(), or getByTestId() instead",
        "line_number": 34,
        "ai_recommendation": "This XPath uses absolute positioning... (GPT-4o analysis)"
      }
    ],
    "summary": {
      "total_xpaths": 2,
      "unstable_xpaths": 1,
      "complex_xpaths": 1,
      "average_stability": 55.0,
      "average_complexity": 55.0
    }
  },
  "message": "XPath deep analysis complete"
}
```

**Use Cases**:
- XPath migration planning
- Identifying brittle selectors
- Test stability improvement
- Locator refactoring

---

### 3. **Quality Score**

**Endpoint**: `POST /api/ai-analysis/quality-score`

**Description**: Get overall quality score (0-100) with detailed breakdown of scoring factors.

**Request Body**:
```json
{
  "script_code": "your Playwright script..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "quality_score": 68,
    "breakdown": {
      "base_score": 50,
      "modern_locator_bonus": 10,
      "xpath_penalty": 5,
      "pattern_bonus": 12,
      "assertion_bonus": 4,
      "context_bonus": 5
    },
    "rating": "good",
    "locator_quality": {
      "excellent": 5,
      "good": 1,
      "fair": 4,
      "poor": 0,
      "unstable": 1
    },
    "improvements_needed": 1
  },
  "message": "Quality Score: 68/100"
}
```

**Score Interpretation**:
- **80-100**: Excellent ✅
- **60-79**: Good 👍
- **40-59**: Fair ⚠️
- **0-39**: Poor ❌

**Use Cases**:
- Quality gates in CI/CD
- Test quality tracking
- Team performance metrics
- Code review automation

---

### 4. **Proactive Recommendations**

**Endpoint**: `POST /api/ai-analysis/recommendations`

**Description**: Get categorized, prioritized recommendations for script improvement.

**Request Body**:
```json
{
  "script_code": "your Playwright script..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_recommendations": 3,
    "by_priority": {
      "high": [
        {
          "priority": "high",
          "category": "locator_stability",
          "title": "Unstable XPath detected (line 34)",
          "description": "XPath '/html/body/div[1]...' has low stability score (30/100)",
          "suggestion": "Use getByRole(), getByLabel(), or getByTestId() instead",
          "issues": ["Absolute XPath is brittle", "Positional selectors are unstable"]
        }
      ],
      "medium": [...],
      "low": [...]
    },
    "by_category": {
      "locator_stability": [...],
      "test_quality": [...],
      "test_structure": [...]
    },
    "priority_counts": {
      "high": 1,
      "medium": 1,
      "low": 1
    },
    "quality_score": 68
  },
  "message": "Generated 3 recommendations"
}
```

**Recommendation Categories**:
- `locator_stability`: XPath and selector issues
- `modern_locators`: Legacy locator migration
- `test_quality`: Missing assertions, error handling
- `test_structure`: Hooks, fixtures, organization
- `data_driven`: External data usage
- `test_pattern`: Architectural patterns (POM, etc.)

**Use Cases**:
- Developer guidance
- Automated code review
- Test improvement planning
- Best practices enforcement

---

### 5. **Locator Quality Report**

**Endpoint**: `POST /api/ai-analysis/locator-quality-report`

**Description**: Detailed report on locator quality distribution across the entire script.

**Request Body**:
```json
{
  "script_code": "your Playwright script..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_actions": 11,
    "quality_distribution": {
      "excellent": [
        {
          "action": "fill",
          "target": "getByRole('textbox', { name: 'Username' })",
          "line_number": 19,
          "recommendation": "✅ Excellent: Role-based locators are Playwright's recommended approach"
        }
      ],
      "good": [...],
      "fair": [...],
      "poor": [],
      "unstable": [...]
    },
    "percentages": {
      "excellent": 45.5,
      "good": 9.1,
      "fair": 36.4,
      "poor": 0.0,
      "unstable": 9.1
    },
    "summary": {
      "excellent_count": 5,
      "good_count": 1,
      "fair_count": 4,
      "poor_count": 0,
      "unstable_count": 1
    },
    "needs_improvement": [...],
    "overall_quality": "good"
  },
  "message": "Locator quality report generated"
}
```

**Quality Levels**:
- **EXCELLENT**: getByRole, getByLabel, getByPlaceholder (Playwright recommended)
- **GOOD**: getByTestId, data-testid, ARIA attributes
- **FAIR**: Stable CSS IDs, semantic selectors
- **POOR**: XPath, generic classes
- **UNSTABLE**: Dynamic IDs, absolute XPath, positional selectors

**Use Cases**:
- Locator modernization tracking
- Test stability metrics
- Migration progress monitoring
- Quality improvement planning

---

### 6. **Test Pattern Detection**

**Endpoint**: `POST /api/ai-analysis/test-pattern-detection`

**Description**: Detect and analyze test architecture patterns (POM, Fixtures, Data-Driven, etc.).

**Request Body**:
```json
{
  "script_code": "your Playwright script..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "pattern": {
      "detected_pattern": "component_testing",
      "confidence": "high",
      "indicators": ["Component testing detected"],
      "benefits": [
        "Isolated component testing",
        "Fast execution",
        "UI validation"
      ]
    },
    "external_data_sources": 2,
    "has_hooks": true,
    "complexity": "medium"
  },
  "message": "Detected pattern: component_testing"
}
```

**Detected Patterns**:
- `basic`: Simple linear tests
- `page_object_model`: POM pattern with page classes
- `fixture_based`: Custom fixtures and test.extend()
- `data_driven`: External data sources (JSON/CSV/Excel)
- `api_hybrid`: Combined API + UI testing
- `component_testing`: Component mount() testing

**Use Cases**:
- Architectural assessment
- Pattern migration planning
- Best practices validation
- Test organization insights

---

### 7. **External Data Sources**

**Endpoint**: `POST /api/ai-analysis/external-data-sources`

**Description**: Identify all external data sources (JSON, CSV, Excel, API endpoints).

**Request Body**:
```json
{
  "script_code": "your Playwright script..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_sources": 2,
    "by_type": {
      "json": [
        {
          "file_path": "./data/users.json",
          "api_endpoint": null,
          "line_number": 3
        }
      ],
      "csv": [],
      "excel": [],
      "api": [
        {
          "file_path": null,
          "api_endpoint": "https://api.example.com/test-users",
          "line_number": 60
        }
      ]
    },
    "counts": {
      "json": 1,
      "csv": 0,
      "excel": 0,
      "api": 1
    },
    "is_data_driven": true,
    "recommendations": [
      "Use version control for data files",
      "Implement data validation",
      "Consider data file encryption for sensitive data"
    ]
  },
  "message": "Found 2 external data sources"
}
```

**Use Cases**:
- Data dependency tracking
- Test data management
- Data-driven test validation
- Source audit and compliance

---

### 8. **Comprehensive Report**

**Endpoint**: `POST /api/ai-analysis/comprehensive-report`

**Description**: Complete analysis report combining all features into one detailed response.

**Request Body**:
```json
{
  "script_code": "your Playwright script...",
  "generate_recommendations": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "quality_score": 68,
      "test_pattern": "component_testing",
      "total_input_fields": 5,
      "total_actions": 11,
      "total_assertions": 5,
      "lines_analyzed": 91
    },
    "quality_assessment": {
      "score": 68,
      "rating": "good",
      "locator_quality": {
        "excellent": 5,
        "good": 1,
        "fair": 4,
        "poor": 0,
        "unstable": 1
      },
      "modern_locators_used": true
    },
    "xpath_analysis": {
      "total_xpaths": 2,
      "unstable_xpaths": 1,
      "details": [...]
    },
    "test_structure": {
      "pattern": "component_testing",
      "has_hooks": true,
      "timeout": 30000,
      "retries": null,
      "external_data_sources": 2
    },
    "recommendations": {
      "total": 3,
      "high_priority": [...],
      "medium_priority": [...],
      "low_priority": [...]
    },
    "test_data_generation": {
      "security_tests": 6,
      "boundary_tests": 3,
      "equivalence_tests": 2
    },
    "summary": {...}
  },
  "message": "Comprehensive analysis report generated successfully"
}
```

**Use Cases**:
- Complete test assessment
- Executive dashboards
- Audit reports
- Comprehensive documentation

---

## 🔧 Integration Examples

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

// Enhanced Analysis
async function analyzeScript(scriptCode: string) {
  const response = await axios.post(`${API_BASE}/api/ai-analysis/analyze-script-enhanced`, {
    script_code: scriptCode,
    generate_recommendations: true
  });
  
  console.log('Quality Score:', response.data.data.quality_score);
  console.log('Pattern:', response.data.data.test_pattern);
  console.log('Recommendations:', response.data.data.recommendations.length);
  
  return response.data;
}

// Get Quality Score
async function getQualityScore(scriptCode: string) {
  const response = await axios.post(`${API_BASE}/api/ai-analysis/quality-score`, {
    script_code: scriptCode
  });
  
  const { quality_score, rating, breakdown } = response.data.data;
  console.log(`Score: ${quality_score}/100 (${rating})`);
  console.log('Breakdown:', breakdown);
  
  return response.data;
}

// XPath Analysis
async function analyzeXPath(scriptCode: string) {
  const response = await axios.post(`${API_BASE}/api/ai-analysis/xpath-deep-analysis`, {
    script_code: scriptCode
  });
  
  const unstableXPaths = response.data.data.xpath_analysis.filter(
    (x: any) => x.stability_score < 60
  );
  
  console.log(`Found ${unstableXPaths.length} unstable XPath selectors`);
  
  return response.data;
}
```

### Python (Requests)

```python
import requests

API_BASE = 'http://localhost:8000'

def analyze_script(script_code: str):
    response = requests.post(
        f'{API_BASE}/api/ai-analysis/analyze-script-enhanced',
        json={
            'script_code': script_code,
            'generate_recommendations': True
        }
    )
    
    data = response.json()['data']
    print(f"Quality Score: {data['quality_score']}/100")
    print(f"Pattern: {data['test_pattern']}")
    print(f"Recommendations: {len(data['recommendations'])}")
    
    return data

def get_recommendations(script_code: str):
    response = requests.post(
        f'{API_BASE}/api/ai-analysis/recommendations',
        json={'script_code': script_code}
    )
    
    data = response.json()['data']
    
    for rec in data['by_priority']['high']:
        print(f"🔴 HIGH: {rec['title']}")
        print(f"   {rec['suggestion']}")
    
    return data
```

### cURL Examples

```bash
# Enhanced Analysis
curl -X POST http://localhost:8000/api/ai-analysis/analyze-script-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "script_code": "import { test } from \"@playwright/test\"...",
    "generate_recommendations": true
  }'

# Quality Score
curl -X POST http://localhost:8000/api/ai-analysis/quality-score \
  -H "Content-Type: application/json" \
  -d '{"script_code": "..."}'

# XPath Analysis
curl -X POST http://localhost:8000/api/ai-analysis/xpath-deep-analysis \
  -H "Content-Type: application/json" \
  -d '{"script_code": "..."}'
```

---

## 📊 Response Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request (invalid script_code or parameters) |
| 500  | Internal Server Error (analysis failed) |

---

## 🎯 Use Case Scenarios

### Scenario 1: CI/CD Quality Gate

```typescript
// In your CI/CD pipeline
const qualityThreshold = 60;

const analysis = await analyzeScript(scriptCode);

if (analysis.data.quality_score < qualityThreshold) {
  console.error(`Quality score ${analysis.data.quality_score} below threshold ${qualityThreshold}`);
  
  // Show high-priority issues
  for (const rec of analysis.data.recommendations.filter(r => r.priority === 'high')) {
    console.error(`- ${rec.title}: ${rec.suggestion}`);
  }
  
  process.exit(1);
}
```

### Scenario 2: XPath Migration Planning

```typescript
// Identify all XPath selectors needing migration
const xpathAnalysis = await analyzeXPath(scriptCode);

const unstableXPaths = xpathAnalysis.data.xpath_analysis.filter(
  x => x.stability_score < 60
);

// Generate migration report
for (const xpath of unstableXPaths) {
  console.log(`Line ${xpath.line_number}: ${xpath.xpath}`);
  console.log(`  Stability: ${xpath.stability_score}/100`);
  console.log(`  Fix: ${xpath.recommended_alternative}`);
  console.log(`  Issues: ${xpath.issues.join(', ')}`);
}
```

### Scenario 3: Quality Dashboard

```typescript
// Aggregate quality metrics for dashboard
const comprehensiveReport = await getComprehensiveReport(scriptCode);

const metrics = {
  qualityScore: comprehensiveReport.data.overview.quality_score,
  pattern: comprehensiveReport.data.overview.test_pattern,
  xpathIssues: comprehensiveReport.data.xpath_analysis.unstable_xpaths,
  highPriorityIssues: comprehensiveReport.data.recommendations.high_priority.length,
  locatorQuality: comprehensiveReport.data.quality_assessment.locator_quality
};

// Display on dashboard
renderDashboard(metrics);
```

---

## 🚀 Starting the API Server

```bash
cd ai-analysis-service

# Install dependencies
pip install -r requirements.txt

# Start server
python main.py

# Server runs on http://localhost:8000
# API docs available at http://localhost:8000/docs
```

---

## 📚 Additional Resources

- **Enhanced Analyzer Summary**: `ENHANCED_ANALYZER_SUMMARY.md`
- **Quick Start Guide**: `ACTIVE_INTELLIGENCE_QUICK_START.md`
- **Pattern Support**: `COMPREHENSIVE_PATTERN_SUPPORT.md`
- **Test Examples**: `test_enhanced_analyzer.py`

---

## ✅ Feature Summary

| Feature | Endpoint | Description |
|---------|----------|-------------|
| **Complete Analysis** | `/analyze-script-enhanced` | All features combined |
| **XPath Deep Dive** | `/xpath-deep-analysis` | Stability & complexity scoring |
| **Quality Score** | `/quality-score` | 0-100 score with breakdown |
| **Recommendations** | `/recommendations` | Prioritized improvement suggestions |
| **Locator Quality** | `/locator-quality-report` | Distribution & quality metrics |
| **Pattern Detection** | `/test-pattern-detection` | Architectural pattern identification |
| **Data Sources** | `/external-data-sources` | JSON/CSV/Excel/API tracking |
| **Full Report** | `/comprehensive-report` | Complete analysis report |

---

**Status**: ✅ All APIs ready for production use  
**Version**: 1.0.0  
**Python**: 3.8+  
**Framework**: FastAPI  
**Port**: 8000
