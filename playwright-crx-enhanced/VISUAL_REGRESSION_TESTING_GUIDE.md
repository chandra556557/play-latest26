# 📸 Visual Regression Testing Guide

## ✅ Quick Start

### 1️⃣ Start the Backend Server
```bash
cd playwright-crx-enhanced\backend
npm run dev
```
Server will start at: **http://localhost:3001**

### 2️⃣ Run API Tests
```bash
cd playwright-crx-enhanced\backend
node test-visual-regression.js
```

Expected output:
```
🎉 ALL TESTS PASSED! Visual Regression API is working correctly.
✅ Passed: 5/5
```

---

## 🖥️ Testing via UI (Frontend)

### Step 1: Start Frontend
```bash
cd playwright-crx-enhanced\frontend
npm run dev
```

### Step 2: Open AI Enhancement Modal
1. Navigate to your test script
2. Click **"AI Enhancement"** button
3. Check **"Visual AI"** checkbox

### Step 3: Upload Screenshots
1. **Baseline Screenshot**: Upload your reference/expected screenshot
2. **Current Screenshot**: Upload the screenshot to compare against baseline
3. Click **"Compare Screenshots"** button

### Step 4: Review Results
The UI will display:
- ✅ **Verdict**: PASS or FAIL
- 📊 **Similarity**: Percentage match (e.g., 98.5%)
- 📋 **Changes Detected**: List of visual differences
- 🎯 **Metrics**: Pixel similarity, dimensions, etc.
- 💡 **Playwright Code**: Auto-generated test assertions

---

## 🔧 API Endpoints

### 1. Compare Screenshots
**POST** `/api/visual-regression/compare`

**Request:**
```json
{
  "before_screenshot": "base64_encoded_image",
  "after_screenshot": "base64_encoded_image",
  "tolerance": 0.95
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verdict": "PASS",
    "similarity": 0.9987,
    "changes": [],
    "similarity_metrics": {
      "pixel_similarity": 0.9987,
      "pixel_difference_percent": 0.13
    },
    "suggested_playwright_code": {
      "assertion": "await expect(page).toHaveScreenshot('baseline.png', { maxDiffPixels: 1 });",
      "options": "{ threshold: 0.05, maxDiffPixels: 1 }"
    }
  }
}
```

### 2. Analyze Screenshot Metadata
**POST** `/api/visual-regression/analyze`

**Request:**
```json
{
  "screenshot": "base64_encoded_image"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "format": "png",
    "width": 1920,
    "height": 1080,
    "channels": 4,
    "size_bytes": 245678,
    "has_alpha": true,
    "color_space": "srgb"
  }
}
```

### 3. Health Check
**GET** `/api/visual-regression/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "visual-regression",
    "features": [
      "Screenshot comparison",
      "Pixel-by-pixel analysis",
      "Metadata extraction",
      "Playwright integration"
    ]
  }
}
```

---

## 📝 Sample Test Scenarios

### Scenario 1: Identical Screenshots (Should PASS)
```javascript
const response = await axios.post('http://localhost:3001/api/visual-regression/compare', {
  before_screenshot: baselineImage,
  after_screenshot: baselineImage, // Same image
  tolerance: 0.95
});

console.log(response.data.data.verdict); // PASS
console.log(response.data.data.similarity); // 1.0 (100%)
```

### Scenario 2: Different Screenshots (Should FAIL)
```javascript
const response = await axios.post('http://localhost:3001/api/visual-regression/compare', {
  before_screenshot: baselineImage,
  after_screenshot: modifiedImage, // Different image
  tolerance: 0.95
});

console.log(response.data.data.verdict); // FAIL
console.log(response.data.data.similarity); // < 0.95
console.log(response.data.data.changes); // Lists detected changes
```

### Scenario 3: Custom Tolerance
```javascript
const response = await axios.post('http://localhost:3001/api/visual-regression/compare', {
  before_screenshot: baselineImage,
  after_screenshot: slightlyModifiedImage,
  tolerance: 0.90 // Accept up to 10% difference
});

console.log(response.data.data.verdict); // Depends on actual difference
```

---

## 🎯 How It Works

### Pixel-by-Pixel Comparison
The backend uses **Sharp library** to:
1. Decode both images to raw pixel data (RGBA)
2. Compare each pixel's RGB values
3. Allow threshold of ±10 per color channel
4. Calculate similarity as: `matching_pixels / total_pixels`

### Verdict Logic
- **PASS**: `similarity >= tolerance`
- **FAIL**: `similarity < tolerance`

### Change Detection
Automatically detects:
- ✅ Pixel differences > 5%
- ✅ File size changes > 5%
- ✅ Dimension mismatches

---

## 🛠️ Troubleshooting

### Backend Not Starting
```bash
# Check if port 3001 is already in use
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <process_id> /F
```

### API Test Failures
1. Ensure backend is running: `npm run dev`
2. Check terminal for error messages
3. Verify axios is installed: `npm list axios`

### UI Upload Not Working
1. Check browser console for errors (F12)
2. Verify backend URL: `http://localhost:3001`
3. Check file size (max recommended: 5MB per screenshot)

---

## 📊 Performance Tips

### Image Size Optimization
- Use PNG or JPEG format
- Recommended dimensions: ≤ 1920x1080
- File size: ≤ 5MB per screenshot

### Tolerance Guidelines
- **Strict** (pixel-perfect): 0.99 - 1.0
- **Normal** (minor differences): 0.95 - 0.98
- **Relaxed** (layout verification): 0.85 - 0.94

---

## 🔐 Authentication

All API endpoints require Bearer token authentication:

```javascript
const response = await axios.post('http://localhost:3001/api/visual-regression/compare', 
  { /* data */ },
  {
    headers: {
      'Authorization': `Bearer ${yourToken}`,
      'Content-Type': 'application/json'
    }
  }
);
```

---

## ✨ Features

✅ **No LLM Required** - Pure image processing  
✅ **Pixel-Perfect Comparison** - RGB channel analysis  
✅ **Metadata Extraction** - Format, dimensions, channels  
✅ **Playwright Integration** - Auto-generated test code  
✅ **Change Detection** - Identifies visual differences  
✅ **Customizable Tolerance** - Flexible threshold settings  

---

## 📂 Related Files

- **Backend Controller**: `backend/src/controllers/visual-regression.controller.ts`
- **Backend Routes**: `backend/src/routes/visual-regression.routes.ts`
- **Frontend UI**: `frontend/src/components/ScriptEnhancementModal.tsx`
- **Test Script**: `backend/test-visual-regression.js`

---

## 🎓 Example Use Cases

1. **UI Regression Testing**: Detect unintended layout changes
2. **Cross-Browser Testing**: Compare screenshots across different browsers
3. **Responsive Design**: Verify layouts at different screen sizes
4. **Theme Validation**: Compare light vs dark mode
5. **A/B Testing**: Visual comparison of different UI variants

---

**Ready to test!** 🚀

Start with the automated test script to verify everything works, then try the UI for real-world screenshot comparison.
