# 🗃️ Object Repository in Dashboard - Visual Access Guide

## 📱 **Dashboard Layout Overview**

```
┌────────────────────────────────────────────────────────────────────────┐
│  PLAYWRIGHT CRX - DASHBOARD                               [User] [⚙️]  │
├──────────────┬─────────────────────────────────────────────────────────┤
│              │                                                          │
│  SIDEBAR     │              MAIN CONTENT AREA                          │
│              │                                                          │
│ 📊 Overview  │  ┌──────────────────────────────────────────────┐      │
│              │  │                                               │      │
│ [Test]       │  │        Your Content Here                     │      │
│ ✅ Scripts   │  │                                               │      │
│ ⚡ Test Runs │  │  (Changes based on sidebar selection)        │      │
│              │  │                                               │      │
│ [Data]       │  └──────────────────────────────────────────────┘      │
│ 📊 Test Data │                                                          │
│ 🗃️ Object   │ ← CLICK HERE TO ACCESS OBJECT REPOSITORY               │
│    Repository│                                                          │
│              │                                                          │
│ [Other]      │                                                          │
│ 🧪 API Test  │                                                          │
│ 📈 Analytics │                                                          │
│ ⚙️ Settings  │                                                          │
│              │                                                          │
└──────────────┴─────────────────────────────────────────────────────────┘
```

---

## 🎯 **Access Method 1: Via Sidebar Menu**

### Step-by-Step Visual Guide

#### Step 1: Look at the Left Sidebar

```
┌──────────────┐
│  SIDEBAR     │
├──────────────┤
│ 📊 Overview  │
│              │
│ [Test]       │
│ ✅ Scripts   │
│ ⚡ Test Runs │
│              │
│ [Data]       │  ← Look for "Data" or "Data Management" section
│ 📊 Test Data │
│ 🗃️ Object   │  ← THIS IS IT! 🎯
│    Repository│
│              │
│ [Other]      │
│ 🧪 API Test  │
│ 📈 Analytics │
│ ⚙️ Settings  │
└──────────────┘
```

#### Step 2: Find "Data Management" Section

The sidebar is organized into categories:

1. **No Category / Overview**
   - 📊 Overview

2. **Test Management**
   - ✅ Scripts
   - ⚡ Test Runs

3. **🔍 Data Management** ← Look here!
   - 📊 Test Data Management
   - 🗃️ **Object Repository** ← Click this!

4. **Testing & Analytics**
   - 🧪 API Testing
   - 📊 Allure Reports
   - 📈 Analytics

5. **Configuration**
   - ⚙️ Settings

#### Step 3: Click on "🗃️ Object Repository"

```
┌──────────────┐
│ [Data]       │
│ 📊 Test Data │
│ 🗃️ Object   │ ← Click here
│    Repository│
│              │
└──────────────┘
                ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Object Repository                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Pages] [Elements] [Code Gen] [Statistics] [Import/Export]     │
│                                                                  │
│  Content loads here                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Access Method 2: Via Quick Actions (Overview)**

### Step-by-Step Visual Guide

#### Step 1: Go to Overview Tab

```
┌──────────────┬─────────────────────────────────────────────────┐
│  SIDEBAR     │  MAIN CONTENT                                    │
├──────────────┼─────────────────────────────────────────────────┤
│ 📊 Overview  │ ← Click "Overview" first                        │
│   (selected) │                                                  │
│              │  ┌─────────────────────────────────────────┐    │
│ [Test]       │  │   PROJECT OVERVIEW                       │    │
│ ✅ Scripts   │  │                                          │    │
│              │  │   [Project Selection Dropdown]           │    │
│              │  │                                          │    │
│              │  │   QUICK ACTIONS ↓                        │    │
│              │  └─────────────────────────────────────────┘    │
└──────────────┴─────────────────────────────────────────────────┘
```

#### Step 2: Scroll Down to "Quick Actions"

```
┌─────────────────────────────────────────────────────────────────┐
│                      QUICK ACTIONS                               │
├────────────────┬────────────────┬────────────────┬──────────────┤
│                │                │                │              │
│   📝 Create    │   ▶️ Run       │  🗃️ Object    │   📊 View    │
│   New Script   │   Tests        │  Repository    │   Analytics  │
│                │                │                │              │
│   Click to     │   Execute      │   Manage       │   See test   │
│   add script   │   test suite   │   page objects │   reports    │
│                │                │                │              │
│  [Create]      │  [Run]         │ [Open] ← CLICK │  [View]      │
│                │                │  THIS!  🎯     │              │
└────────────────┴────────────────┴────────────────┴──────────────┘
```

#### Step 3: Click "Object Repository" Card

When you click the "Object Repository" quick action card, it will:
1. Navigate to the Object Repository section
2. Load the Object Repository component
3. Display the full interface with tabs

---

## 🖥️ **Object Repository Interface Layout**

### After clicking, you'll see this interface:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OBJECT REPOSITORY                             │
│                                                                      │
│  Project: [Select Project ▼]                    [Refresh] [Export]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ [📄 Pages] [📝 Elements] [🔧 Code Gen] [📊 Stats] [📥 I/E] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │
│  │                    TAB CONTENT AREA                         │    │
│  │                                                             │    │
│  │  (Shows Pages, Elements, Code Gen, Statistics,             │    │
│  │   or Import/Export based on selected tab)                  │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📄 **Pages Tab Interface**

```
┌─────────────────────────────────────────────────────────────────────┐
│  [📄 Pages] (selected)  [📝 Elements]  [🔧 Code Gen]  ...          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [+ Add New Page]                          [🔍 Search pages...]     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📄 LoginPage                          Elements: 4  [Edit] [❌]│  │
│  │ https://example.com/login                                     │  │
│  │ User login page                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📄 DashboardPage                      Elements: 8  [Edit] [❌]│  │
│  │ https://example.com/dashboard                                 │  │
│  │ Main dashboard page                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📄 ProfilePage                        Elements: 6  [Edit] [❌]│  │
│  │ https://example.com/profile                                   │  │
│  │ User profile page                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Adding a New Page

Click "[+ Add New Page]" button:

```
┌─────────────────────────────────────────────┐
│          ADD NEW PAGE                        │
├─────────────────────────────────────────────┤
│                                              │
│  Page Name: *                                │
│  ┌────────────────────────────────────────┐ │
│  │ LoginPage                              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  URL Pattern: *                              │
│  ┌────────────────────────────────────────┐ │
│  │ https://example.com/login              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Description:                                │
│  ┌────────────────────────────────────────┐ │
│  │ User login page with email/password    │ │
│  └────────────────────────────────────────┘ │
│                                              │
│       [Cancel]          [Create Page]        │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 📝 **Elements Tab Interface**

```
┌─────────────────────────────────────────────────────────────────────┐
│  [📄 Pages]  [📝 Elements] (selected)  [🔧 Code Gen]  ...          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [+ Add New Element]                       [🔍 Search elements...]  │
│                                                                      │
│  Filter by Page: [All Pages ▼]                                     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📝 usernameInput                              [Edit] [❌]      │  │
│  │ Page: LoginPage                                               │  │
│  │ Selector: #username                                           │  │
│  │ Type: input (CSS selector)                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📝 passwordInput                              [Edit] [❌]      │  │
│  │ Page: LoginPage                                               │  │
│  │ Selector: #password                                           │  │
│  │ Type: input (CSS selector)                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📝 loginButton                                [Edit] [❌]      │  │
│  │ Page: LoginPage                                               │  │
│  │ Selector: button[type="submit"]                               │  │
│  │ Type: button (CSS selector)                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Adding a New Element

Click "[+ Add New Element]" button:

```
┌─────────────────────────────────────────────┐
│          ADD NEW ELEMENT                     │
├─────────────────────────────────────────────┤
│                                              │
│  Element Name: *                             │
│  ┌────────────────────────────────────────┐ │
│  │ usernameInput                          │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Page: *                                     │
│  ┌────────────────────────────────────────┐ │
│  │ LoginPage                          ▼   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Selector: *                                 │
│  ┌────────────────────────────────────────┐ │
│  │ #username                              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Locator Strategy: *                         │
│  ┌────────────────────────────────────────┐ │
│  │ CSS                                ▼   │ │
│  └────────────────────────────────────────┘ │
│   Options: CSS, XPath, TestID, Text, ARIA   │
│                                              │
│  Element Type: *                             │
│  ┌────────────────────────────────────────┐ │
│  │ input                              ▼   │ │
│  └────────────────────────────────────────┘ │
│   Options: input, button, link, text, etc.  │
│                                              │
│  Description:                                │
│  ┌────────────────────────────────────────┐ │
│  │ Username input field                   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│       [Cancel]        [Create Element]       │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 🔧 **Code Generation Tab Interface**

```
┌─────────────────────────────────────────────────────────────────────┐
│  [📄 Pages]  [📝 Elements]  [🔧 Code Gen] (selected)  ...          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Select Page: *                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ LoginPage                                               ▼   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Select Language: *                                                 │
│  ┌────────┬────────┬────────┬────────┬────────┐                   │
│  │   TS   │   JS   │  Python│  Java  │   C#   │                   │
│  │ (sel.) │        │        │        │        │                   │
│  └────────┴────────┴────────┴────────┴────────┘                   │
│                                                                      │
│  [Generate Code]                                                    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ // Generated TypeScript Page Object                         │   │
│  │                                                              │   │
│  │ import { Page, Locator } from '@playwright/test';           │   │
│  │                                                              │   │
│  │ export class LoginPage {                                    │   │
│  │   readonly page: Page;                                      │   │
│  │   readonly usernameInput: Locator;                          │   │
│  │   readonly passwordInput: Locator;                          │   │
│  │   readonly loginButton: Locator;                            │   │
│  │                                                              │   │
│  │   constructor(page: Page) {                                 │   │
│  │     this.page = page;                                       │   │
│  │     this.usernameInput = page.locator('#username');         │   │
│  │     this.passwordInput = page.locator('#password');         │   │
│  │     this.loginButton = page.locator('button[type="submit"]');│   │
│  │   }                                                          │   │
│  │                                                              │   │
│  │   async login(username: string, password: string) {         │   │
│  │     await this.usernameInput.fill(username);                │   │
│  │     await this.passwordInput.fill(password);                │   │
│  │     await this.loginButton.click();                         │   │
│  │   }                                                          │   │
│  │ }                                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [Copy to Clipboard]  [Download as File]                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 **Statistics Tab Interface**

```
┌─────────────────────────────────────────────────────────────────────┐
│  [📄 Pages]  [📝 Elements]  [🔧 Code Gen]  [📊 Stats] (selected)   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  REPOSITORY OVERVIEW                                                │
│                                                                      │
│  ┌──────────────────┬──────────────────┬──────────────────┐        │
│  │  Total Pages     │  Total Elements  │  Avg Elements    │        │
│  │      12          │       48         │   per Page: 4    │        │
│  └──────────────────┴──────────────────┴──────────────────┘        │
│                                                                      │
│  ELEMENTS PER PAGE                                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LoginPage              ████████ 8 elements                 │   │
│  │  DashboardPage          ███████████████ 15 elements         │   │
│  │  ProfilePage            ████████ 8 elements                 │   │
│  │  SettingsPage           ███████ 7 elements                  │   │
│  │  HomePage               ██████ 6 elements                   │   │
│  │  CheckoutPage           ████ 4 elements                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  LOCATOR STRATEGY DISTRIBUTION                                      │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  CSS Selector           ████████████████████ 60%            │   │
│  │  XPath                  ████████ 20%                        │   │
│  │  Test ID                ██████ 15%                          │   │
│  │  Text                   ██ 3%                               │   │
│  │  ARIA Label             █ 2%                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ELEMENT TYPE DISTRIBUTION                                          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  button                 ██████████████ 35%                  │   │
│  │  input                  ████████████ 30%                    │   │
│  │  link                   ████████ 20%                        │   │
│  │  text                   ████ 10%                            │   │
│  │  other                  ██ 5%                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📥 **Import/Export Tab Interface**

```
┌─────────────────────────────────────────────────────────────────────┐
│  [📄 Pages]  [📝 Elements]  [🔧 Code Gen]  [📊 Stats]  [📥 I/E]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  IMPORT DATA                                                        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Upload JSON file with pages and elements                   │   │
│  │                                                              │   │
│  │  [Choose File]  No file chosen                              │   │
│  │                                                              │   │
│  │  Format: JSON with structure:                               │   │
│  │  {                                                           │   │
│  │    "pages": [...],                                           │   │
│  │    "elements": [...]                                         │   │
│  │  }                                                           │   │
│  │                                                              │   │
│  │  [Import Data]                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  EXPORT DATA                                                        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Export repository data to JSON                              │   │
│  │                                                              │   │
│  │  Export Options:                                             │   │
│  │  ☑ Include all pages                                        │   │
│  │  ☑ Include all elements                                     │   │
│  │  ☑ Include alternative locators                             │   │
│  │  ☑ Include usage statistics                                 │   │
│  │                                                              │   │
│  │  [Export to JSON]                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  RECENT EXPORTS                                                     │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  repository_backup_2026-02-02.json    [Download]            │   │
│  │  repository_backup_2026-02-01.json    [Download]            │   │
│  │  repository_backup_2026-01-31.json    [Download]            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 **Color Coding & Visual Cues**

### Sidebar Menu Items

```
Active Item (Currently Selected):
┌────────────────┐
│ 🗃️ Object     │ ← Blue/highlighted background
│    Repository  │
└────────────────┘

Inactive Item:
┌────────────────┐
│ 📊 Test Data   │ ← Normal background
│                │
└────────────────┘

Hover State:
┌────────────────┐
│ 🧪 API Testing │ ← Light hover effect
│                │
└────────────────┘
```

### Button States

```
Primary Button:
┌─────────────────┐
│  [Create Page]  │ ← Blue/primary color
└─────────────────┘

Secondary Button:
┌─────────────────┐
│    [Cancel]     │ ← Gray/secondary color
└─────────────────┘

Danger Button:
┌─────────────────┐
│    [Delete]     │ ← Red/warning color
└─────────────────┘
```

### Status Indicators

```
Success:
✅ Page created successfully

Warning:
⚠️  Page name already exists

Error:
❌ Failed to create page

Info:
ℹ️  10 elements found
```

---

## 📱 **Responsive Layout**

### Desktop View (>1200px)
```
┌─────────────────────────────────────────────────────────┐
│  [Sidebar] [            Main Content                   ]│
│    20%              80%                                  │
└─────────────────────────────────────────────────────────┘
```

### Tablet View (768px - 1200px)
```
┌─────────────────────────────────────────────────────────┐
│  [Sidebar] [       Main Content                        ]│
│    25%           75%                                     │
└─────────────────────────────────────────────────────────┘
```

### Mobile View (<768px)
```
┌─────────────────────────────────────────────────────────┐
│  [☰ Menu]                                                │
│                                                          │
│  [          Main Content (Full Width)                  ]│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 **Search & Filter Examples**

### Search Pages
```
Search: "login"

Results:
┌──────────────────────────────────────────────┐
│ 📄 LoginPage                                 │
│ 📄 AdminLoginPage                            │
│ 📄 UserLoginFlow                             │
└──────────────────────────────────────────────┘
```

### Filter Elements by Page
```
Filter: [LoginPage ▼]

Results:
┌──────────────────────────────────────────────┐
│ 📝 usernameInput                             │
│ 📝 passwordInput                             │
│ 📝 loginButton                               │
│ 📝 forgotPasswordLink                        │
└──────────────────────────────────────────────┘
```

---

## 🎯 **Quick Tips**

### ✅ DO

1. **Use the sidebar menu** for primary navigation
2. **Use quick actions** for fast access
3. **Search before creating** to avoid duplicates
4. **Use descriptive names** for pages and elements
5. **Add descriptions** to help team members understand
6. **Export regularly** for backups
7. **Use code generation** to save time

### ❌ DON'T

1. **Don't create duplicate pages** - check existing pages first
2. **Don't use generic names** - be specific (e.g., "loginButton" not "button1")
3. **Don't skip descriptions** - they help maintainability
4. **Don't forget to test selectors** - use the validate feature
5. **Don't ignore alternative locators** - they help with self-healing

---

## 📞 **Need Help?**

### Common Questions

**Q: Where is the Object Repository menu item?**
A: Look in the sidebar under "Data Management" section, the icon is 🗃️

**Q: Can't see the Object Repository option?**
A: Make sure both backend (port 3001) and frontend (port 3000) are running

**Q: Page not loading?**
A: Check browser console for errors, verify API is accessible

**Q: Can I import existing page objects?**
A: Yes! Use the Import/Export tab to upload JSON data

**Q: How do I generate code for all pages?**
A: Go to Code Gen tab, select "All Pages" option, click "Generate All"

---

## ✅ **Success Indicators**

You'll know the Object Repository is working when you see:

1. ✅ **Menu item visible** in sidebar under "Data Management"
2. ✅ **No loading errors** when clicking on menu item
3. ✅ **All tabs visible** (Pages, Elements, Code Gen, Stats, I/E)
4. ✅ **Can create pages** without errors
5. ✅ **Can add elements** to pages
6. ✅ **Code generation works** and produces valid output
7. ✅ **Statistics show** correct counts

---

**Last Updated:** February 2, 2026  
**Dashboard Version:** Latest  
**Object Repository:** Fully Integrated  
**Status:** ✅ Ready to Use
