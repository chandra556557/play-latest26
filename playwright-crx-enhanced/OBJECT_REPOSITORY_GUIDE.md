# 📦 Object Repository - Complete Integration Guide

## Version: 1.0.0
## Date: 2025-02-01

---

## 🎯 Overview

The **Object Repository** is a centralized element storage system with Page Object Model (POM) support integrated into the Playwright CRX platform. It allows teams to:

- **Store UI elements centrally** with multiple locator strategies
- **Generate Page Object Model** code in TypeScript, JavaScript, Python, Java, and C#
- **Track element usage** and health status
- **Enable self-healing** for broken locators
- **Share elements** across multiple tests and team members

---

## 🏗️ Architecture

### Components

1. **Backend Service** (`backend/src/services/objectRepository.service.ts`)
   - PostgreSQL database integration
   - CRUD operations for pages and elements
   - Locator management and healing history
   - Statistics and reporting

2. **Backend Controller** (`backend/src/controllers/objectRepository.controller.ts`)
   - REST API endpoints
   - Request validation
   - Error handling

3. **Backend Routes** (`backend/src/routes/objectRepository.routes.ts`)
   - API routing configuration
   - Endpoint documentation

4. **Frontend Component** (`frontend/src/components/ObjectRepository.tsx`)
   - React-based UI
   - Page and element management
   - Search and filtering
   - Statistics dashboard

5. **Code Generator** (`frontend/src/services/pageObjectCodeGenerator.ts`)
   - Multi-language POM code generation
   - TypeScript, JavaScript, Python, Java, C#

6. **Database Schema** (`backend/database/migrations/006_create_object_repository.sql`)
   - Tables: page_objects, ui_elements, element_locators, healing_history
   - Views for reporting and statistics
   - Triggers for data integrity

---

## 🚀 Getting Started

### 1. Database Setup

**Run the migration:**

```bash
cd /home/user/webapp/backend
psql -U postgres -d playwright_crx -f database/migrations/006_create_object_repository.sql
```

**Verify tables:**

```sql
\dt page_objects
\dt ui_elements
\dt element_locators
\dt healing_history
```

### 2. Backend Setup

**Start the backend server:**

```bash
cd /home/user/webapp/backend/src
npm run dev
```

**Verify Object Repository API:**

```bash
curl http://localhost:3001/api/object-repository/statistics
```

### 3. Frontend Setup

**Import the component in your app:**

```typescript
import ObjectRepository from './components/ObjectRepository';

function App() {
  return (
    <div>
      <ObjectRepository projectId="optional-project-id" />
    </div>
  );
}
```

---

## 📚 API Reference

### Base URL

```
http://localhost:3001/api/object-repository
```

### Page Objects

#### Create Page Object

```http
POST /api/object-repository/pages
Content-Type: application/json

{
  "name": "LoginPage",
  "displayName": "Login Page",
  "description": "User login page",
  "url": "https://example.com/login",
  "urlPattern": ".*/login.*",
  "projectId": "uuid",
  "codeLanguage": "typescript",
  "namespace": "pages"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "LoginPage",
    "displayName": "Login Page",
    ...
  },
  "message": "Page object created successfully"
}
```

#### List Page Objects

```http
GET /api/object-repository/pages?projectId=uuid
```

#### Get Page Object with Elements

```http
GET /api/object-repository/pages/:id?includeElements=true
```

#### Update Page Object

```http
PUT /api/object-repository/pages/:id
Content-Type: application/json

{
  "displayName": "Updated Name",
  "url": "https://example.com/new-url"
}
```

#### Delete Page Object

```http
DELETE /api/object-repository/pages/:id
```

### UI Elements

#### Create Element

```http
POST /api/object-repository/elements
Content-Type: application/json

{
  "name": "loginButton",
  "displayName": "Login Button",
  "description": "Primary login button",
  "pageObjectId": "uuid",
  "category": "button",
  "tagName": "button",
  "attributes": {
    "class": "btn btn-primary",
    "type": "submit"
  },
  "xpath": "//button[@id='login']",
  "cssSelector": "#login",
  "locators": [
    {
      "type": "id",
      "value": "login",
      "confidence": 1.0,
      "isPrimary": true
    },
    {
      "type": "css",
      "value": "#login",
      "confidence": 0.9
    },
    {
      "type": "xpath",
      "value": "//button[@id='login']",
      "confidence": 0.8
    }
  ],
  "tags": ["login", "authentication"]
}
```

#### Search Elements

```http
POST /api/object-repository/elements/search
Content-Type: application/json

{
  "query": "login",
  "category": "button",
  "isHealthy": true,
  "projectId": "uuid"
}
```

#### Get Elements by Page

```http
GET /api/object-repository/pages/:pageObjectId/elements
```

#### Update Element

```http
PUT /api/object-repository/elements/:id
Content-Type: application/json

{
  "displayName": "Updated Button",
  "isHealthy": false
}
```

#### Bulk Update Elements

```http
POST /api/object-repository/elements/bulk-update
Content-Type: application/json

{
  "elementIds": ["uuid1", "uuid2", "uuid3"],
  "updates": {
    "isHealthy": true
  }
}
```

#### Delete Element

```http
DELETE /api/object-repository/elements/:id
```

#### Increment Element Usage

```http
POST /api/object-repository/elements/:id/usage
```

### Element Locators

#### Add Locator to Element

```http
POST /api/object-repository/elements/:elementId/locators
Content-Type: application/json

{
  "type": "testId",
  "value": "login-button",
  "confidence": 0.95,
  "isPrimary": false
}
```

#### Update Locator

```http
PUT /api/object-repository/locators/:locatorId
Content-Type: application/json

{
  "value": "updated-selector",
  "confidence": 0.85,
  "isActive": true
}
```

### Healing History

#### Record Healing Event

```http
POST /api/object-repository/elements/:elementId/healing
Content-Type: application/json

{
  "oldType": "id",
  "oldValue": "old-login",
  "newType": "testId",
  "newValue": "new-login",
  "reason": "ID attribute changed",
  "autoApplied": true,
  "confidence": 0.9
}
```

#### Get Healing History

```http
GET /api/object-repository/elements/:elementId/healing
```

### Repository Settings

#### Get Settings

```http
GET /api/object-repository/settings?projectId=uuid
```

#### Create/Update Settings

```http
POST /api/object-repository/settings
Content-Type: application/json

{
  "projectId": "uuid",
  "preferredLocatorOrder": ["testId", "id", "css", "xpath"],
  "namingConvention": "camelCase",
  "defaultLanguage": "typescript",
  "defaultFramework": "playwright",
  "autoHealingEnabled": true,
  "autoHealingThreshold": 0.8,
  "versioning": false
}
```

### Statistics

#### Get Repository Statistics

```http
GET /api/object-repository/statistics?projectId=uuid
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalPages": 15,
    "totalElements": 234,
    "healthyElements": 220,
    "unhealthyElements": 14,
    "mostUsedElements": [...],
    "recentlyUpdated": [...],
    "locatorTypeDistribution": {
      "id": 50,
      "css": 80,
      "xpath": 45,
      "testId": 59
    },
    "categoryDistribution": {
      "button": 45,
      "input": 60,
      "link": 30,
      "checkbox": 15
    }
  }
}
```

---

## 💻 Usage Examples

### Example 1: Create a Login Page with Elements

```typescript
// 1. Create page object
const pageResponse = await fetch('http://localhost:3001/api/object-repository/pages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'LoginPage',
    displayName: 'Login Page',
    url: 'https://example.com/login',
    codeLanguage: 'typescript'
  })
});

const page = await pageResponse.json();
const pageId = page.data.id;

// 2. Create email input element
await fetch('http://localhost:3001/api/object-repository/elements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'emailInput',
    displayName: 'Email Input',
    pageObjectId: pageId,
    category: 'input',
    tagName: 'input',
    locators: [
      { type: 'id', value: 'email', isPrimary: true },
      { type: 'css', value: 'input[type="email"]' },
      { type: 'placeholder', value: 'Enter your email' }
    ]
  })
});

// 3. Create password input element
await fetch('http://localhost:3001/api/object-repository/elements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'passwordInput',
    displayName: 'Password Input',
    pageObjectId: pageId,
    category: 'input',
    tagName: 'input',
    locators: [
      { type: 'id', value: 'password', isPrimary: true },
      { type: 'css', value: 'input[type="password"]' }
    ]
  })
});

// 4. Create login button element
await fetch('http://localhost:3001/api/object-repository/elements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'loginButton',
    displayName: 'Login Button',
    pageObjectId: pageId,
    category: 'button',
    tagName: 'button',
    locators: [
      { type: 'testId', value: 'login-btn', isPrimary: true },
      { type: 'text', value: 'Login' },
      { type: 'css', value: 'button.login-button' }
    ]
  })
});
```

### Example 2: Generate Page Object Code

```typescript
import { PageObjectCodeGenerator } from './services/pageObjectCodeGenerator';

// Fetch page with elements
const response = await fetch('http://localhost:3001/api/object-repository/pages/PAGE_ID?includeElements=true');
const data = await response.json();
const page = data.data;

// Generate TypeScript code
const tsCode = PageObjectCodeGenerator.generate(page, page.elements, {
  language: 'typescript',
  framework: 'playwright',
  includeComments: true,
  includeTypeDefinitions: true
});

console.log(tsCode);

// Generate Python code
const pyCode = PageObjectCodeGenerator.generate(page, page.elements, {
  language: 'python',
  framework: 'playwright',
  includeComments: true
});

console.log(pyCode);
```

### Example 3: Search Elements

```typescript
const searchResponse = await fetch('http://localhost:3001/api/object-repository/elements/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'login',
    category: 'button',
    isHealthy: true
  })
});

const results = await searchResponse.json();
console.log(`Found ${results.data.length} elements`);
```

### Example 4: Track Element Usage

```typescript
// When element is used in a test
await fetch(`http://localhost:3001/api/object-repository/elements/ELEMENT_ID/usage`, {
  method: 'POST'
});

// This increments usage_count and updates last_used_at
```

### Example 5: Record Healing Event

```typescript
// When a locator fails and self-healing finds a replacement
await fetch(`http://localhost:3001/api/object-repository/elements/ELEMENT_ID/healing`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    oldType: 'id',
    oldValue: 'old-submit-button',
    newType: 'testId',
    newValue: 'new-submit-button',
    reason: 'ID attribute was renamed',
    autoApplied: true,
    confidence: 0.92
  })
});
```

---

## 🔧 Integration with Chrome Extension Recorder

To integrate the Object Repository with the Chrome Extension recorder, follow these steps:

### 1. Capture Elements During Recording

In `examples/recorder-crx/src/background.ts`, add:

```typescript
// Listen for element interactions during recording
chrome.debugger.onEvent.addListener((source, method, params) => {
  if (method === 'DOM.querySelector' || method === 'DOM.getDocument') {
    // Extract element information
    const elementData = extractElementInfo(params);
    
    // Send to Object Repository
    saveElementToRepository(elementData);
  }
});

async function saveElementToRepository(elementData: any) {
  const response = await fetch('http://localhost:3001/api/object-repository/elements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(elementData)
  });
}
```

### 2. Use Object Repository Elements in Tests

```typescript
// Fetch elements from repository
const elements = await fetch('http://localhost:3001/api/object-repository/pages/PAGE_ID/elements');
const elementsList = await elements.json();

// Use in test generation
for (const element of elementsList.data) {
  // Generate test code using element locators
  const testCode = generateTestCode(element);
}
```

---

## 🎨 Frontend Usage

### Using the ObjectRepository Component

```typescript
import React from 'react';
import ObjectRepository from './components/ObjectRepository';

function App() {
  return (
    <div className="app">
      <h1>Test Automation Platform</h1>
      <ObjectRepository projectId="my-project-id" />
    </div>
  );
}

export default App;
```

### Features Available in UI

1. **Page Objects Tab**
   - Create new page objects
   - View all page objects
   - Edit page object details
   - Delete page objects
   - View elements in each page

2. **Elements Tab**
   - Search elements across all pages
   - Filter by category and health status
   - View element details
   - See locator strategies

3. **Statistics Tab**
   - Total pages and elements count
   - Health status summary
   - Most used elements
   - Locator type distribution
   - Category distribution

---

## 🔍 Best Practices

### 1. Naming Conventions

- **Page Objects**: Use PascalCase (e.g., `LoginPage`, `DashboardPage`)
- **Elements**: Use camelCase (e.g., `emailInput`, `submitButton`)
- **Display Names**: Use Title Case (e.g., "Login Page", "Submit Button")

### 2. Locator Priority

Configure preferred locator order:

```typescript
{
  preferredLocatorOrder: [
    'testId',    // Most stable
    'id',        // Stable if unique
    'role',      // Semantic
    'placeholder',
    'css',       // Flexible
    'xpath'      // Last resort
  ]
}
```

### 3. Multiple Locators

Always provide multiple locator strategies for resilience:

```typescript
{
  locators: [
    { type: 'testId', value: 'submit-btn', isPrimary: true },
    { type: 'id', value: 'submit' },
    { type: 'css', value: 'button.submit' },
    { type: 'text', value: 'Submit' }
  ]
}
```

### 4. Element Categories

Use appropriate categories for better organization:

- `button` - Buttons and submit actions
- `input` - Text inputs and form fields
- `link` - Navigation links
- `checkbox` / `radio` - Selection controls
- `select` - Dropdown menus
- `textarea` - Multi-line text inputs

### 5. Self-Healing Integration

Enable auto-healing for automated locator updates:

```typescript
{
  autoHealingEnabled: true,
  autoHealingThreshold: 0.8  // 80% confidence required
}
```

---

## 📊 Database Schema

### Tables

1. **page_objects**
   - Stores page object definitions
   - Fields: id, name, display_name, url, url_pattern, project_id, code_language

2. **ui_elements**
   - Stores UI element definitions
   - Fields: id, name, display_name, page_object_id, category, tag_name, attributes

3. **element_locators**
   - Stores multiple locator strategies per element
   - Fields: id, element_id, type, value, confidence, is_primary, is_active

4. **healing_history**
   - Tracks self-healing events
   - Fields: id, element_id, old_locator_type, old_locator_value, new_locator_type, new_locator_value

5. **repository_settings**
   - Project-level configuration
   - Fields: id, project_id, preferred_locator_order, naming_convention, auto_healing_enabled

6. **element_tags**
   - Element categorization and tagging
   - Fields: id, element_id, tag

7. **element_usage**
   - Usage tracking and analytics
   - Fields: id, element_id, test_run_id, action, success, used_at

---

## 🚀 Advanced Features

### 1. Code Generation

Generate Page Object Model code in multiple languages:

```typescript
// TypeScript
const tsCode = PageObjectCodeGenerator.generate(page, elements, {
  language: 'typescript',
  framework: 'playwright'
});

// Python
const pyCode = PageObjectCodeGenerator.generate(page, elements, {
  language: 'python',
  framework: 'playwright'
});

// Java
const javaCode = PageObjectCodeGenerator.generate(page, elements, {
  language: 'java',
  framework: 'playwright'
});
```

### 2. Bulk Operations

Update multiple elements at once:

```typescript
await fetch('http://localhost:3001/api/object-repository/elements/bulk-update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    elementIds: ['id1', 'id2', 'id3'],
    updates: {
      isHealthy: true,
      category: 'button'
    }
  })
});
```

### 3. Health Monitoring

Track element health status and healing events:

```typescript
// Get healing history
const healing = await fetch('http://localhost:3001/api/object-repository/elements/ELEMENT_ID/healing');
const history = await healing.json();

// Check unhealthy elements
const stats = await fetch('http://localhost:3001/api/object-repository/statistics');
const data = await stats.json();
console.log(`Unhealthy elements: ${data.data.unhealthyElements}`);
```

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify database exists
psql -U postgres -l | grep playwright_crx

# Run migrations
psql -U postgres -d playwright_crx -f backend/database/migrations/006_create_object_repository.sql
```

### API Not Responding

```bash
# Check backend server
curl http://localhost:3001/health

# Verify Object Repository routes
curl http://localhost:3001/api/object-repository/statistics
```

### Frontend Component Issues

```typescript
// Check API base URL
const API_BASE_URL = 'http://localhost:3001/api/object-repository';

// Verify CORS settings
// In backend/src/server.ts, ensure:
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173'
];
```

---

## 📈 Roadmap

- [ ] Visual element picker for Chrome extension
- [ ] AI-powered element naming suggestions
- [ ] Version control for page objects
- [ ] Team collaboration features
- [ ] Export/Import repository as JSON
- [ ] Integration with CI/CD pipelines
- [ ] Visual diff for element changes
- [ ] Advanced analytics dashboard

---

## 🤝 Contributing

To contribute to the Object Repository:

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Submit a pull request

---

## 📝 License

Apache License 2.0

---

## ✅ Summary

The Object Repository provides:

✅ **Centralized Element Storage** - Single source of truth  
✅ **Page Object Model** - Industry-standard pattern  
✅ **Multi-Language Support** - TypeScript, JavaScript, Python, Java, C#  
✅ **Self-Healing Integration** - Automatic locator updates  
✅ **Usage Analytics** - Track element usage and health  
✅ **Team Collaboration** - Share elements across projects  
✅ **REST API** - Full programmatic access  
✅ **Modern UI** - React-based management interface  

**Start using the Object Repository today to improve your test maintainability and reduce flakiness!** 🚀
