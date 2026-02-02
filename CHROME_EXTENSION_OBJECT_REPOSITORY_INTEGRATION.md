# 🔌 Chrome Extension → Object Repository Integration

## Overview

The Chrome Extension Recorder now integrates with the Object Repository, allowing you to automatically save recorded elements and generate Page Object Models directly from your recorded test scenarios.

---

## ✨ Features

### 1. **Automatic Element Capture**
- Records all interactions (clicks, fills, assertions, etc.)
- Automatically extracts element selectors
- Detects locator strategy (CSS, XPath, TestID, Text, ARIA)
- Determines element types (button, input, link, etc.)

### 2. **Intelligent Page Organization**
- Automatically creates pages based on URLs
- Groups elements by page
- Avoids duplicate elements

### 3. **Seamless Integration**
- One-click save to Object Repository
- Real-time session statistics
- Batch processing of multiple actions
- Error handling and retry logic

### 4. **Dashboard Connectivity**
- View saved elements in Dashboard
- Generate Page Object Models from saved elements
- Export code in 5 languages (TypeScript, JavaScript, Python, Java, C#)

---

## 📁 New Files Added

```
examples/recorder-crx/src/
├── objectRepositoryService.ts    (Object Repository service)
└── objectRepositoryUI.tsx         (UI component for saving elements)
```

---

## 🔧 How It Works

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   Chrome Extension Recorder                      │
│                                                                  │
│  1. User records test actions (click, fill, etc.)              │
│  2. Actions captured with selectors                             │
│  3. UI shows "Save to Object Repository" button                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│              objectRepositoryService.ts                          │
│                                                                  │
│  • Extract element names from selectors                         │
│  • Detect locator strategies                                    │
│  • Determine element types                                      │
│  • Create/find pages by URL                                     │
│  • Save elements to repository                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────┐
│            Object Repository Backend API                         │
│            http://localhost:3001/api/object-repository          │
│                                                                  │
│  POST /pages          - Create page definitions                 │
│  POST /elements       - Save UI elements                        │
│  GET /pages           - List all pages                          │
│  GET /elements/page/:id - Get elements for page                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                            │
│                                                                  │
│  Tables:                                                         │
│  • or_pages              (page definitions)                     │
│  • or_elements           (UI elements)                          │
│  • or_element_usages     (usage tracking)                       │
│  • or_alternative_locators (self-healing)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Usage Guide

### Step 1: Start Recording

1. Open Chrome Extension
2. Click **"Record"** button
3. Navigate to your application
4. Perform test actions (click buttons, fill forms, etc.)

### Step 2: Review Recorded Actions

The extension captures:
- **goto** - Page navigations
- **click** - Button/link clicks
- **fill** - Input field entries
- **press** - Keyboard actions
- **assertText** - Text assertions
- **assertVisibility** - Visibility checks

### Step 3: Save to Object Repository

1. Review the recorded actions in the extension panel
2. See the **"Object Repository"** section showing:
   - Current page
   - Number of recorded elements
   - List of actions
3. Click **"💾 Save to Object Repository"** button
4. Wait for confirmation:
   - ✅ Saved: X elements
   - ⏭️ Skipped: X duplicates
   - ❌ Errors: X failures

### Step 4: View in Dashboard

1. Open Dashboard: `http://localhost:3000`
2. Navigate to: **Data Management** → **🗃️ Object Repository**
3. View saved:
   - **Pages** - Automatically created from URLs
   - **Elements** - All recorded interactions
4. Generate Page Object Models in your preferred language

---

## 📊 Element Processing

### Example: Button Click

**Recorded Action:**
```javascript
{
  name: 'click',
  locator: '#submit-button',
  timestamp: 1643723400000
}
```

**Saved to Repository:**
```javascript
{
  pageId: 1,
  name: 'submitButton',
  selector: '#submit-button',
  locatorStrategy: 'css',
  elementType: 'button',
  description: 'click action recorded at 2/1/2026, 10:30:00 AM',
  action: 'click'
}
```

### Example: Input Field

**Recorded Action:**
```javascript
{
  name: 'fill',
  locator: 'input[name="email"]',
  text: 'user@example.com',
  timestamp: 1643723410000
}
```

**Saved to Repository:**
```javascript
{
  pageId: 1,
  name: 'email',
  selector: 'input[name="email"]',
  locatorStrategy: 'css',
  elementType: 'input',
  description: 'fill action recorded at 2/1/2026, 10:30:10 AM',
  action: 'fill'
}
```

---

## 🔍 Element Name Extraction

The service intelligently extracts meaningful element names from selectors:

| Selector | Extracted Name | Type |
|----------|---------------|------|
| `#login-button` | `loginButton` | button |
| `.submit-form` | `submitForm` | button |
| `input[name="username"]` | `username` | input |
| `[data-testid="search"]` | `search` | input |
| `button[type="submit"]` | `button` | button |
| `//div[@class="title"]` | `title` | element |

---

## 🎯 Locator Strategy Detection

Automatically detects the best locator strategy:

| Selector Pattern | Strategy |
|-----------------|----------|
| `//div[@id="test"]` | xpath |
| `(//button)[1]` | xpath |
| `[data-testid="btn"]` | testid |
| `[data-test-id="link"]` | testid |
| `text=Login` | text |
| `:has-text("Submit")` | text |
| `[aria-label="Close"]` | aria |
| `role=button` | aria |
| `#username` | css |
| `.form-input` | css |

---

## 🏗️ Page Organization

### Automatic Page Creation

When you visit: `https://example.com/login`

**Created Page:**
```javascript
{
  name: 'LoginPage',
  urlPattern: 'https://example.com/login',
  description: 'Auto-generated from recorder on 2/1/2026, 10:30:00 AM'
}
```

### Page Name Generation Rules

| URL | Generated Page Name |
|-----|-------------------|
| `https://example.com/` | `ExamplePage` |
| `https://example.com/login` | `LoginPage` |
| `https://example.com/dashboard` | `DashboardPage` |
| `https://example.com/user/profile` | `UserProfilePage` |
| `https://shop.com/cart` | `CartPage` |

---

## 📝 Generated Page Object Models

After saving elements, you can generate code in the Dashboard:

### TypeScript Example

```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
  }
  
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
  
  async goto() {
    await this.page.goto('https://example.com/login');
  }
}
```

### Python Example

```python
from playwright.sync_api import Page, Locator

class LoginPage:
    def __init__(self, page: Page):
        self.page = page
        self.username_input = page.locator("#username")
        self.password_input = page.locator("#password")
        self.login_button = page.locator("#login-button")
    
    def login(self, username: str, password: str):
        self.username_input.fill(username)
        self.password_input.fill(password)
        self.login_button.click()
    
    def goto(self):
        self.page.goto("https://example.com/login")
```

---

## 🔐 Authentication

The service uses the same authentication as the main application:

```typescript
// Automatically reads from localStorage
const token = localStorage.getItem('accessToken');

// Includes in all API requests
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

---

## ⚙️ Configuration

### Change API Base URL

If your backend runs on a different port:

```typescript
import { objectRepositoryService } from './objectRepositoryService';

// Change base URL
objectRepositoryService.setBaseUrl('http://localhost:4000/api/object-repository');
```

---

## 🎨 UI Components

### Object Repository Panel

Shows in the Chrome Extension:

```
┌─────────────────────────────────────────┐
│   🗃️ Object Repository                  │
├─────────────────────────────────────────┤
│                                          │
│  Current Page: LoginPage                │
│  Recorded Elements: 3                   │
│                                          │
│  Recorded Actions: 5                    │
│  ┌────────────────────────────────────┐ │
│  │ goto → https://example.com/login   │ │
│  │ fill → #username                   │ │
│  │ fill → #password                   │ │
│  │ click → #login-button              │ │
│  │ assertText → .welcome-message      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [💾 Save to Object Repository]         │
│  [🗑️ Clear Session]                     │
│                                          │
│  ✅ Saved: 3                            │
│  ⏭️ Skipped: 0                          │
│                                          │
│  💡 Tip: Elements are automatically     │
│  organized by page URL                  │
│                                          │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing

### Manual Test Flow

1. **Start Backend:**
   ```bash
   cd /home/user/play-latest26-repo/playwright-crx-enhanced/backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd /home/user/play-latest26-repo/frontend
   npm run dev
   ```

3. **Build Extension:**
   ```bash
   cd /home/user/play-latest26-repo
   npm run build:crx
   ```

4. **Load Extension in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `/home/user/play-latest26-repo/examples/recorder-crx/dist`

5. **Record Test:**
   - Open extension popup
   - Click Record
   - Perform actions on a website
   - Save to Object Repository

6. **Verify in Dashboard:**
   - Open `http://localhost:3000`
   - Go to Object Repository
   - Check saved pages and elements

---

## 📋 API Reference

### objectRepositoryService

```typescript
// Save single action
await objectRepositoryService.saveActionAsElement(action, projectId);

// Batch save actions
const result = await objectRepositoryService.saveActionsToRepository(
  actions, 
  projectId
);
// Returns: { saved: number, skipped: number, errors: number }

// Get all pages
const pages = await objectRepositoryService.getPages(projectId);

// Get elements for a page
const elements = await objectRepositoryService.getElements(pageId);

// Clear session
objectRepositoryService.clearSession();

// Get session statistics
const stats = objectRepositoryService.getSessionStats();
// Returns: { currentPage, recordedElements, elements }
```

---

## 🚨 Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `403 Forbidden` | Not authenticated | Login to Dashboard first |
| `Failed to create page` | Database error | Check backend logs |
| `No current page` | Page not set | Record a goto action first |
| `Failed to save element` | Invalid selector | Check selector format |

### Retry Logic

The service includes automatic retry for transient errors:
- Network timeouts
- Temporary server errors
- Rate limiting

---

## 🎯 Best Practices

### 1. **Meaningful Names**
Use descriptive IDs and classes in your application:
```html
<!-- Good -->
<button id="submit-form">Submit</button>
<input name="user-email" />

<!-- Avoid -->
<button class="btn-1">Click</button>
<input id="input2" />
```

### 2. **Consistent URL Patterns**
Keep URL patterns consistent:
```
✅ /login
✅ /user/profile
✅ /products/list

❌ /login?redirect=true
❌ /user/profile#settings
```

### 3. **Review Before Saving**
Always review recorded actions before saving:
- Check selectors are stable
- Remove unnecessary steps
- Verify element types

### 4. **Use Test IDs**
Add data-testid attributes for better stability:
```html
<button data-testid="submit-button">Submit</button>
```

### 5. **Regular Cleanup**
Periodically review and clean up:
- Duplicate elements
- Obsolete pages
- Unused selectors

---

## 📈 Benefits

### 1. **Time Savings**
- No manual element mapping
- Instant Page Object generation
- Reusable element definitions

### 2. **Consistency**
- Standardized element naming
- Consistent locator strategies
- Organized page structure

### 3. **Maintainability**
- Centralized element storage
- Easy updates across tests
- Self-healing locator support

### 4. **Team Collaboration**
- Shared element repository
- Version-controlled page objects
- Consistent test patterns

---

## 🔄 Workflow Example

### Complete End-to-End Flow

**1. Record Scenario:**
```
Chrome Extension Recorder
├── Navigate to https://example.com/login
├── Fill username: test@example.com
├── Fill password: password123
├── Click login button
└── Assert welcome message visible
```

**2. Save to Repository:**
```
Click "Save to Object Repository"
↓
Result:
✅ Created: LoginPage
✅ Saved 4 elements:
   • usernameInput (input)
   • passwordInput (input)
   • loginButton (button)
   • welcomeMessage (text)
```

**3. Generate Page Object:**
```
Dashboard → Object Repository → Code Gen
↓
Select: LoginPage
Language: TypeScript
↓
Generated code ready to use!
```

**4. Use in Tests:**
```typescript
import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  // Test continues...
});
```

---

## 🎉 Summary

The Chrome Extension → Object Repository integration provides:

✅ **Automatic element capture** from recorded actions  
✅ **Intelligent organization** by pages and URLs  
✅ **Seamless saving** to centralized repository  
✅ **Code generation** in multiple languages  
✅ **Dashboard management** for all saved objects  
✅ **Team collaboration** with shared repository  

**Result:** Faster test creation, better maintainability, consistent patterns!

---

## 📞 Support

For issues or questions:
1. Check Dashboard → Object Repository → Statistics
2. Review browser console for errors
3. Verify backend is running on port 3001
4. Check authentication token in localStorage

---

**Last Updated:** February 2, 2026  
**Status:** ✅ Ready to Use  
**Location:** `/home/user/play-latest26-repo/examples/recorder-crx/src/`
