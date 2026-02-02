# Chrome Extension → Database Save Flow

## 🎯 Complete Data Flow

### 1. **User Records in Chrome Extension**
```
User clicks/types on webpage → Extension captures action
```

### 2. **Extension Captures Element Data**
```javascript
// In crxRecorder.tsx - when element is picked
{
  selector: '#login-button',
  tagName: 'button',
  attributes: { id: 'login-button', class: 'btn-primary' },
  url: 'https://example.com/login',
  xpath: '//*[@id="login-button"]',
  text: 'Login'
}
```

### 3. **Object Repository Service Processes**
```javascript
// objectRepositoryService.ts
saveActionAsElement(action, projectId) {
  // Extract element metadata
  const element = {
    name: 'loginButton',
    displayName: 'Login Button',
    selector: '#login-button',
    type: 'button',
    locatorStrategy: 'css'
  }
  
  // Save to backend API
  POST http://localhost:3001/api/object-repository/elements
}
```

### 4. **Backend API Receives Request**
```typescript
// objectRepository.controller.ts
router.post('/elements', async (req, res) => {
  const elementData = req.body;
  const saved = await objectRepositoryService.createUIElement(elementData);
  res.json(saved);
});
```

### 5. **Backend Service Saves to Database**
```typescript
// objectRepository.service.ts
async createUIElement(data: CreateUIElementDTO) {
  // Insert into ui_elements table
  const query = `
    INSERT INTO ui_elements (
      name, display_name, page_object_id,
      category, tag_name, attributes,
      css_selector, xpath, url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  
  // Save locators to element_locators table
  await this.createElementLocator({
    element_id: result.rows[0].id,
    type: 'css',
    value: data.css_selector,
    is_primary: true
  });
  
  return result.rows[0];
}
```

### 6. **Database Tables Updated**

#### A. `page_objects` Table
```sql
INSERT INTO page_objects (
  id, name, display_name, url, project_id
) VALUES (
  'uuid-123',
  'loginPage',
  'Login Page',
  'https://example.com/login',
  'project-uuid'
);
```

#### B. `ui_elements` Table
```sql
INSERT INTO ui_elements (
  id, name, display_name, page_object_id,
  category, tag_name, css_selector, xpath
) VALUES (
  'element-uuid-456',
  'loginButton',
  'Login Button',
  'uuid-123',
  'button',
  'button',
  '#login-button',
  '//*[@id="login-button"]'
);
```

#### C. `element_locators` Table
```sql
INSERT INTO element_locators (
  id, element_id, type, value, is_primary, confidence
) VALUES (
  'locator-uuid-789',
  'element-uuid-456',
  'css',
  '#login-button',
  true,
  1.00
);

-- Alternative locators
INSERT INTO element_locators VALUES
  ('locator-uuid-790', 'element-uuid-456', 'xpath', '//*[@id="login-button"]', false, 0.95),
  ('locator-uuid-791', 'element-uuid-456', 'text', 'Login', false, 0.85),
  ('locator-uuid-792', 'element-uuid-456', 'testId', 'login-btn', false, 0.90);
```

### 7. **Data Available in Dashboard**
```
User opens Dashboard → Data Management → Object Repository
→ Sees "Login Page" with "Login Button" element
→ Can generate Page Object Model code
→ Can export/import
→ Can view usage statistics
```

---

## 📊 Database Schema Overview

### Tables & Relationships

```
projects (existing)
   ↓
page_objects (1)
   ├── id (UUID, PK)
   ├── name (unique per project)
   ├── url
   ├── project_id (FK → projects)
   └── created_at
   ↓
ui_elements (2)
   ├── id (UUID, PK)
   ├── name (unique per page)
   ├── page_object_id (FK → page_objects)
   ├── category (button, input, link, etc.)
   ├── css_selector
   ├── xpath
   ├── usage_count
   └── is_healthy
   ↓
element_locators (3)
   ├── id (UUID, PK)
   ├── element_id (FK → ui_elements)
   ├── type (css, xpath, testId, text, aria)
   ├── value
   ├── is_primary
   └── confidence

element_usage (4)
   ├── element_id (FK → ui_elements)
   ├── test_run_id (FK → test_runs)
   ├── action
   ├── success
   └── used_at

healing_history (5)
   ├── element_id (FK → ui_elements)
   ├── old_locator_value
   ├── new_locator_value
   ├── reason
   └── timestamp
```

---

## 🔄 Step-by-Step Save Flow

### Step 1: Extension Captures Recording
```typescript
// In crxRecorder.tsx
const recordedActions = [
  {
    action: 'click',
    selector: '#login-button',
    url: 'https://example.com/login',
    tagName: 'button',
    text: 'Login'
  },
  {
    action: 'fill',
    selector: '#username',
    url: 'https://example.com/login',
    tagName: 'input',
    value: 'testuser'
  }
];
```

### Step 2: User Clicks "Save to Object Repository"
```typescript
// ObjectRepositoryUI.tsx
const handleSave = async () => {
  await objectRepositoryService.saveActionsToRepository(
    recordedActions,
    currentProjectId
  );
};
```

### Step 3: Service Creates/Gets Page
```typescript
// objectRepositoryService.ts
async saveActionsToRepository(actions, projectId) {
  // 1. Ensure page exists
  const pageUrl = actions[0].url;
  const page = await this.ensurePage(pageUrl, projectId);
  
  // API call: POST /api/object-repository/pages
  // Database: INSERT INTO page_objects (...)
  
  // 2. Save each element
  for (const action of actions) {
    await this.saveActionAsElement(action, projectId);
  }
}
```

### Step 4: Save Each Element
```typescript
async saveActionAsElement(action, projectId) {
  const elementData = {
    name: this.extractElementName(action),        // 'loginButton'
    displayName: this.extractDisplayName(action), // 'Login Button'
    pageObjectId: pageId,                         // UUID of page
    category: this.determineElementType(action),  // 'button'
    tagName: action.tagName,                      // 'button'
    cssSelector: action.selector,                 // '#login-button'
    xpath: action.xpath,                          // '//*[@id="login-button"]'
    url: action.url                               // 'https://example.com/login'
  };
  
  // API call: POST /api/object-repository/elements
  const response = await fetch(`${baseUrl}/elements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(elementData)
  });
  
  return response.json();
}
```

### Step 5: Backend Controller Handles Request
```typescript
// objectRepository.controller.ts
router.post('/elements', async (req, res) => {
  try {
    const elementData: CreateUIElementDTO = req.body;
    
    // Call service to save to database
    const element = await objectRepositoryService.createUIElement(elementData);
    
    res.status(201).json(element);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 6: Service Writes to PostgreSQL
```typescript
// objectRepository.service.ts
async createUIElement(data: CreateUIElementDTO): Promise<UIElement> {
  const client = await this.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Insert into ui_elements table
    const elementQuery = `
      INSERT INTO ui_elements (
        name, display_name, description,
        page_object_id, category, tag_name, attributes,
        css_selector, xpath, url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const elementResult = await client.query(elementQuery, [
      data.name,
      data.displayName,
      data.description || null,
      data.pageObjectId,
      data.category || 'custom',
      data.tagName || null,
      JSON.stringify(data.attributes || {}),
      data.cssSelector || null,
      data.xpath || null,
      data.url || null
    ]);
    
    const element = elementResult.rows[0];
    
    // 2. Insert primary locator into element_locators table
    if (data.cssSelector) {
      const locatorQuery = `
        INSERT INTO element_locators (
          element_id, type, value, is_primary, confidence
        ) VALUES ($1, $2, $3, $4, $5)
      `;
      
      await client.query(locatorQuery, [
        element.id,
        'css',
        data.cssSelector,
        true,
        1.00
      ]);
    }
    
    // 3. Insert alternative locators
    if (data.xpath) {
      await client.query(locatorQuery, [
        element.id,
        'xpath',
        data.xpath,
        false,
        0.95
      ]);
    }
    
    await client.query('COMMIT');
    
    return this.mapUIElement(element);
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### Step 7: Data Now in Database!
```sql
-- Query to verify
SELECT 
  po.name as page_name,
  ue.name as element_name,
  ue.display_name,
  ue.category,
  ue.css_selector,
  el.type as locator_type,
  el.value as locator_value,
  el.is_primary
FROM page_objects po
JOIN ui_elements ue ON ue.page_object_id = po.id
LEFT JOIN element_locators el ON el.element_id = ue.id
WHERE po.name = 'loginPage';

-- Result:
-- page_name  | element_name  | display_name | category | css_selector   | locator_type | locator_value      | is_primary
-- -----------|---------------|--------------|----------|----------------|--------------|--------------------|-----------
-- loginPage  | loginButton   | Login Button | button   | #login-button  | css          | #login-button      | true
-- loginPage  | loginButton   | Login Button | button   | #login-button  | xpath        | //*[@id="login-.."]| false
-- loginPage  | usernameInput | Username     | input    | #username      | css          | #username          | true
```

---

## 🎨 Visual Flow Diagram

```
┌─────────────────────┐
│  Chrome Extension   │
│   User Records      │
└──────────┬──────────┘
           │
           │ Capture Actions
           ▼
┌─────────────────────┐
│ objectRepository    │
│    Service.ts       │
│ (Frontend Service)  │
└──────────┬──────────┘
           │
           │ HTTP POST
           │ /api/object-repository/elements
           ▼
┌─────────────────────┐
│  Backend API        │
│  Controller.ts      │
└──────────┬──────────┘
           │
           │ Call Service
           ▼
┌─────────────────────┐
│  Backend Service    │
│  service.ts         │
└──────────┬──────────┘
           │
           │ SQL INSERT
           ▼
┌─────────────────────────────────────┐
│         PostgreSQL Database         │
├─────────────────────────────────────┤
│  ✅ page_objects                    │
│  ✅ ui_elements                     │
│  ✅ element_locators                │
│  ✅ element_usage                   │
│  ✅ healing_history                 │
└─────────────────────────────────────┘
           │
           │ Data Saved!
           ▼
┌─────────────────────┐
│   Dashboard UI      │
│  View/Edit/Export   │
└─────────────────────┘
```

---

## ✅ Verification Steps

### 1. Check if Migration Ran
```bash
cd /home/user/play-latest26-repo/playwright-crx-enhanced/backend

# Check if tables exist
psql $DATABASE_URL -c "\dt page_objects ui_elements element_locators"
```

### 2. Run Migration if Not Applied
```bash
psql $DATABASE_URL -f migrations/006_create_object_repository.sql
```

### 3. Test Backend API
```bash
# Test creating a page
curl -X POST http://localhost:3001/api/object-repository/pages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "loginPage",
    "displayName": "Login Page",
    "url": "https://example.com/login",
    "projectId": "your-project-uuid"
  }'

# Test creating an element
curl -X POST http://localhost:3001/api/object-repository/elements \
  -H "Content-Type: application/json" \
  -d '{
    "name": "loginButton",
    "displayName": "Login Button",
    "pageObjectId": "page-uuid-from-above",
    "category": "button",
    "tagName": "button",
    "cssSelector": "#login-button",
    "xpath": "//*[@id=\"login-button\"]"
  }'
```

### 4. Verify in Database
```sql
-- Check saved pages
SELECT * FROM page_objects;

-- Check saved elements
SELECT * FROM ui_elements;

-- Check locators
SELECT * FROM element_locators;

-- Full view with relationships
SELECT 
  po.name as page,
  ue.name as element,
  ue.category,
  el.type as locator_type,
  el.value
FROM page_objects po
JOIN ui_elements ue ON ue.page_object_id = po.id
JOIN element_locators el ON el.element_id = ue.id;
```

### 5. View in Dashboard
```
1. Open http://localhost:3000
2. Go to Data Management → Object Repository
3. You should see saved pages and elements!
```

---

## 🚀 Quick Test

### Complete End-to-End Test
```bash
# 1. Start backend
cd /home/user/play-latest26-repo/playwright-crx-enhanced/backend
npm run dev

# 2. Start frontend
cd /home/user/play-latest26-repo/frontend
npm run dev

# 3. Load Chrome Extension
- Open chrome://extensions/
- Enable Developer Mode
- Load unpacked: /home/user/play-latest26-repo/examples/recorder-crx/dist

# 4. Record Actions
- Click extension icon
- Click "Record"
- Navigate to a webpage
- Click buttons, fill inputs
- Click "Stop"

# 5. Save to Object Repository
- Click "🗃️ Object Repository" button
- Review captured elements
- Click "Save to Object Repository"
- Check console for success message

# 6. View in Dashboard
- Open http://localhost:3000
- Go to Object Repository
- See your saved elements!
```

---

## 💾 Database Backup/Export

### Export Object Repository Data
```bash
# Export all pages and elements
pg_dump $DATABASE_URL \
  --table=page_objects \
  --table=ui_elements \
  --table=element_locators \
  --data-only \
  > object_repository_backup.sql

# Or use the API
curl http://localhost:3001/api/object-repository/export \
  > object_repository.json
```

### Import Data
```bash
# SQL import
psql $DATABASE_URL < object_repository_backup.sql

# Or use the API
curl -X POST http://localhost:3001/api/object-repository/import \
  -H "Content-Type: application/json" \
  -d @object_repository.json
```

---

## 📝 Summary

✅ **Database Schema**: 8 tables (page_objects, ui_elements, element_locators, etc.)
✅ **API Endpoints**: 20+ REST endpoints for CRUD operations
✅ **Service Layer**: Complete business logic for saving elements
✅ **Chrome Extension Integration**: Ready to capture and save
✅ **Dashboard UI**: View, edit, export saved elements
✅ **Code Generation**: Generate Page Object Models from saved data

**Result**: Every action recorded in Chrome Extension → Saved to PostgreSQL → Available in Dashboard!

