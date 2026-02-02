# 🔧 Port Configuration - Corrected

## ✅ Correct Port Configuration

### Backend API
- **Port**: `3001`
- **URL**: `http://localhost:3001`
- **API Base**: `http://localhost:3001/api`
- **Object Repository API**: `http://localhost:3001/api/object-repository`

### Frontend Dashboard
- **Port**: `5174` (NOT 3000!)
- **URL**: `http://localhost:5174`
- **Framework**: Vite + React
- **Location**: `/home/user/play-latest26-repo/playwright-crx-enhanced/frontend`

---

## 📊 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND DASHBOARD                         │
│              http://localhost:5174                            │
│         (playwright-crx-enhanced/frontend)                    │
│                                                               │
│  - Main UI                                                    │
│  - Object Repository UI                                       │
│  - Dashboard Components                                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     │ Proxy: /api → http://localhost:3001
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND API                                │
│              http://localhost:3001                            │
│         (playwright-crx-enhanced/backend)                     │
│                                                               │
│  - Express Server                                             │
│  - REST API Endpoints                                         │
│  - /api/object-repository/*                                   │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ SQL Queries
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                        │
│              (Connection via DATABASE_URL)                    │
│                                                               │
│  - page_objects                                               │
│  - ui_elements                                                │
│  - element_locators                                           │
│  - 5+ more tables                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Starting Services

### Step 1: Start Backend (Port 3001)
```bash
cd /home/user/play-latest26-repo/playwright-crx-enhanced/backend
npm run dev

# Expected output:
# ✓ Server running on http://localhost:3001
# ✓ Database connected
# ✓ Object Repository routes: /api/object-repository
```

### Step 2: Start Frontend (Port 5174)
```bash
cd /home/user/play-latest26-repo/playwright-crx-enhanced/frontend
npm run dev

# Expected output:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5174/
# ➜  Network: use --host to expose
```

---

## 🌐 Access URLs

### Frontend Dashboard
```
Main Dashboard:        http://localhost:5174
Object Repository:     http://localhost:5174 → Navigate to Object Repository
Login Page:           http://localhost:5174/login
```

### Backend API Endpoints
```
Health Check:         http://localhost:3001/health
API Base:             http://localhost:3001/api
Object Repository:    http://localhost:3001/api/object-repository

Specific Endpoints:
- GET  /api/object-repository/pages
- POST /api/object-repository/pages
- GET  /api/object-repository/elements
- POST /api/object-repository/elements
- GET  /api/object-repository/statistics
- GET  /api/object-repository/export
- POST /api/object-repository/import
```

---

## 🔌 Vite Configuration

**File**: `playwright-crx-enhanced/frontend/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,  // ← Frontend runs on 5174
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // ← Backend API on 3001
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
})
```

**Key Points**:
- Frontend runs on port **5174**
- All `/api/*` requests are proxied to backend at `http://localhost:3001`
- WebSocket connections go to `ws://localhost:3001`

---

## 🧪 Testing Configuration

### Test Backend API
```bash
# Health check
curl http://localhost:3001/health

# Test Object Repository
curl http://localhost:3001/api/object-repository/pages
```

### Test Frontend
```bash
# Open in browser
open http://localhost:5174

# Or using curl
curl http://localhost:5174
```

### Test API from Frontend
```bash
# Frontend makes API calls via proxy
# When frontend code does: fetch('/api/object-repository/pages')
# Vite proxies it to: http://localhost:3001/api/object-repository/pages
```

---

## 📝 Object Repository Service Configuration

**Extension Service**: `examples/recorder-crx/src/objectRepositoryService.ts`

```typescript
class ObjectRepositoryService {
  private baseUrl = 'http://localhost:3001/api/object-repository';
  // ↑ Extension directly calls backend API on port 3001
  
  async saveElement(data) {
    const response = await fetch(`${this.baseUrl}/elements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
```

**Frontend Component**: `playwright-crx-enhanced/frontend/src/components/ObjectRepository.tsx`

```typescript
const API_BASE_URL = 'http://localhost:3001/api/object-repository';
// ↑ Frontend also references backend API on port 3001

// But when running through Vite dev server, requests go through proxy:
// fetch('/api/object-repository/pages') 
// → Proxied to: http://localhost:3001/api/object-repository/pages
```

---

## 🛠️ Common Issues & Solutions

### Issue 1: "Cannot connect to backend"
**Problem**: Frontend can't reach backend API

**Solution**:
```bash
# 1. Check if backend is running
curl http://localhost:3001/health

# 2. Check backend logs
cd /home/user/play-latest26-repo/playwright-crx-enhanced/backend
npm run dev

# 3. Verify port 3001 is not in use
lsof -i :3001
netstat -an | grep 3001
```

### Issue 2: "Port 5174 already in use"
**Problem**: Another service is using port 5174

**Solution**:
```bash
# Option 1: Kill existing process
lsof -i :5174
kill -9 <PID>

# Option 2: Change port in vite.config.ts
# Edit: playwright-crx-enhanced/frontend/vite.config.ts
server: {
  port: 5175,  // Use different port
  ...
}
```

### Issue 3: "CORS errors"
**Problem**: Cross-origin requests blocked

**Solution**: Backend is already configured with CORS:
```typescript
// backend/src/index.ts
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:3001'],
  credentials: true
}));
```

---

## 📋 Quick Reference

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Frontend** | 5174 | http://localhost:5174 | Dashboard UI, Object Repository UI |
| **Backend** | 3001 | http://localhost:3001 | REST API, Database operations |
| **Database** | 5432 | postgresql://... | PostgreSQL data storage |

---

## 🎯 Complete Startup Sequence

### 1. Start PostgreSQL
```bash
# Check if running
pg_isready

# Start if needed (Linux)
sudo systemctl start postgresql

# Or Docker
docker start postgres-container
```

### 2. Apply Database Migration
```bash
cd /home/user/play-latest26-repo/playwright-crx-enhanced/backend
psql $DATABASE_URL -f migrations/006_create_object_repository.sql
```

### 3. Start Backend (3001)
```bash
cd /home/user/play-latest26-repo/playwright-crx-enhanced/backend
npm install  # First time only
npm run dev
```

**Wait for**: `✓ Server running on http://localhost:3001`

### 4. Start Frontend (5174)
```bash
cd /home/user/play-latest26-repo/playwright-crx-enhanced/frontend
npm install  # First time only
npm run dev
```

**Wait for**: `➜ Local: http://localhost:5174/`

### 5. Access Application
```bash
# Open in browser
open http://localhost:5174

# Navigate to Object Repository:
# Sidebar → Data Management → 🗃️ Object Repository
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5174
- [ ] Database connected (check backend logs)
- [ ] Can access http://localhost:5174
- [ ] Can access http://localhost:3001/health
- [ ] Object Repository accessible in dashboard
- [ ] API calls working (check browser Network tab)

---

## 🔗 Related Files

**Frontend Configuration**:
- `playwright-crx-enhanced/frontend/vite.config.ts` - Port 5174
- `playwright-crx-enhanced/frontend/package.json` - Scripts
- `playwright-crx-enhanced/frontend/src/components/ObjectRepository.tsx` - UI

**Backend Configuration**:
- `playwright-crx-enhanced/backend/src/index.ts` - Port 3001
- `playwright-crx-enhanced/backend/package.json` - Scripts
- `playwright-crx-enhanced/backend/src/routes/objectRepository.routes.ts` - API routes

**Extension**:
- `examples/recorder-crx/src/objectRepositoryService.ts` - Calls port 3001 directly

---

## 📝 Summary

✅ **Frontend**: `http://localhost:5174` (Vite React App)
✅ **Backend**: `http://localhost:3001` (Express API)
✅ **Proxy**: Frontend proxies `/api/*` to backend
✅ **Extension**: Calls backend directly on port 3001
✅ **Database**: PostgreSQL via DATABASE_URL

**Remember**: 
- Users access **frontend at 5174**
- Frontend makes API calls to **backend at 3001** (via proxy)
- Chrome Extension makes API calls to **backend at 3001** (directly)

