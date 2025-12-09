# Playwright CRX Enhanced - Quick Start Guide

## 🚀 Quick Start (3 Simple Steps)

### Step 1: Check Prerequisites
```powershell
.\setup-prerequisites.ps1
```
This will verify that you have:
- Node.js (v18.x or higher)
- npm
- PostgreSQL
- Git

### Step 2: Install Dependencies
```powershell
.\install-dependencies.ps1
```
This will:
- Install all backend npm packages
- Install all frontend npm packages
- Install Playwright browsers

### Step 3: Start Services
```powershell
.\start-services.ps1
```
This will:
- Start Backend on http://localhost:3001
- Start Frontend on http://localhost:5173
- Open services in separate PowerShell windows

## 🛑 Stop Services
```powershell
.\stop-services.ps1
```

## 📋 Manual Setup (If Scripts Don't Work)

### Backend Setup
```powershell
cd playwright-crx-enhanced\backend
npm install
npx playwright install
npm run dev
```

### Frontend Setup (in a new terminal)
```powershell
cd playwright-crx-enhanced\frontend
npm install
npm run dev
```

## ⚙️ Configuration

### Backend Environment Variables
Edit `playwright-crx-enhanced\backend\.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/playwrightcrx1

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-secret-key-here

# External API Configuration (Optional)
EXTERNAL_GENIE_API_URL=http://34.46.36.105:3000/genieapi
EXTERNAL_GENIE_API_TOKEN=your-token-here
```

### PostgreSQL Setup
Make sure PostgreSQL is running with:
- Host: localhost
- Port: 5433
- Database: playwrightcrx1
- User: postgres
- Password: postgres

## 🌐 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## 📦 Project Structure

```
chandra-1212-main/
├── playwright-crx-enhanced/
│   ├── backend/          # Node.js/TypeScript Backend (Port 3001)
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env
│   └── frontend/         # React/Vite Frontend (Port 5173)
│       ├── src/
│       └── package.json
├── setup-prerequisites.ps1    # Check prerequisites
├── install-dependencies.ps1   # Install all dependencies
├── start-services.ps1         # Start all services
└── stop-services.ps1          # Stop all services
```

## 🔧 Troubleshooting

### Port Already in Use
Run the stop services script first:
```powershell
.\stop-services.ps1
```
Then start services again.

### Database Connection Error
1. Check if PostgreSQL is running
2. Verify connection details in `.env` file
3. Test connection:
```powershell
psql -h localhost -p 5433 -U postgres -d playwrightcrx1
```

### Dependencies Installation Failed
Try clearing npm cache and reinstalling:
```powershell
cd playwright-crx-enhanced\backend
npm cache clean --force
npm install

cd ..\frontend
npm cache clean --force
npm install
```

## 📝 Common Commands

### Backend
```powershell
cd playwright-crx-enhanced\backend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

### Frontend
```powershell
cd playwright-crx-enhanced\frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🎯 Features

- **AI-Powered Script Enhancement**: Intelligent test script improvements
- **Visual Regression Testing**: Screenshot-based testing with Playwright
- **Test Data Generation**: Security, boundary, and equivalence partitioning tests
- **Human Validation Workflow**: Simple approval process
- **Allure Reports**: Comprehensive test reporting
- **XPath Analysis**: Deep analysis with external Genie API integration

## 🔐 Security Notes

- Never commit `.env` files to version control
- Keep your JWT_SECRET secure
- Update default PostgreSQL password in production
- Use environment-specific configurations

## 📚 Additional Resources

- Playwright Documentation: https://playwright.dev/
- React Documentation: https://react.dev/
- TypeScript Documentation: https://www.typescriptlang.org/

## 💡 Tips

1. Always run scripts from the root directory (`c:\chandra-1212-main`)
2. Use PowerShell (not CMD) for running scripts
3. Keep both backend and frontend running during development
4. Check service windows for detailed logs and error messages
5. Use `.\stop-services.ps1` before shutting down to clean up properly
