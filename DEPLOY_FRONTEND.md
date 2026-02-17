# Frontend Deployment Instructions

## Current Status
- ✅ Backend: Live at https://refundassistant.onrender.com
- ⏳ Frontend: Needs update at https://refundassistant.mindportal.cloud

## Quick Fix Steps

### 1. Update mindportal.cloud Deployment

#### Option A: If connected to GitHub
1. Go to your mindportal.cloud dashboard
2. Find the deployment settings
3. Click "Redeploy" or "Deploy from GitHub"
4. It should automatically pull from: `https://github.com/adelsaramii/RefundAssistant`
5. Latest commit: `25c1da8` - "Add API connection diagnostic test page"

#### Option B: Manual Upload
1. Build the frontend locally:
   ```bash
   cd frontend
   npm run build
   ```

2. Upload the entire `dist` folder to mindportal.cloud

3. Make sure these files are included:
   - `dist/index.html`
   - `dist/config.js` ⚠️ IMPORTANT!
   - `dist/test-api.html`
   - `dist/assets/` (all files)

### 2. Verify API Configuration

After deployment, check the browser console (F12):
- Should see: `API Base URL: https://refundassistant.onrender.com`
- Should NOT see any CORS errors

### 3. Test Connection

Visit: https://refundassistant.mindportal.cloud/test-api.html

This will show:
- ✅ Backend health status
- ✅ CORS configuration
- ✅ API endpoints working
- ✅ Sample data

### 4. Environment Variables (Optional)

If mindportal.cloud supports environment variables, add:
- **Variable**: `VITE_API_URL`
- **Value**: `https://refundassistant.onrender.com`

## Troubleshooting

### Still getting "Failed to fetch"?

1. **Clear browser cache**: Ctrl + Shift + R (hard refresh)

2. **Check browser console** (F12):
   - What's the exact error?
   - What API URL is being used?
   - Any CORS errors?

3. **Test the backend directly**:
   - https://refundassistant.onrender.com/health
   - Should return: `{"status":"ok","service":"refund-engine"}`

4. **Verify files are deployed**:
   - Check if https://refundassistant.mindportal.cloud/config.js exists
   - Should contain: `window.APP_CONFIG = { API_URL: 'https://refundassistant.onrender.com' };`

### Backend Issues?

Test in browser console:
```javascript
fetch('https://refundassistant.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return: `{status: "ok", service: "refund-engine"}`

## What Changed

### Latest Updates:
1. ✅ Fixed CORS in backend (`allow_origins=["*"]`)
2. ✅ Added runtime config (`config.js`)
3. ✅ Improved API URL detection (tries multiple sources)
4. ✅ Added diagnostic test page (`test-api.html`)
5. ✅ Console logging for API URL debugging

### Files Modified:
- `main.py` - CORS configuration
- `frontend/src/api.js` - Smart API detection
- `frontend/index.html` - Load config.js
- `frontend/public/config.js` - Runtime API config (NEW)
- `frontend/public/test-api.html` - Diagnostic page (NEW)

## Test Locally

To verify everything works locally:

```bash
# Terminal 1: Backend (already running on Render)
# https://refundassistant.onrender.com

# Terminal 2: Frontend
cd frontend
npm run dev
# Open http://localhost:5173/
```

Frontend should successfully connect to backend at https://refundassistant.onrender.com

## Support

If still having issues:
1. Check browser console (F12) for errors
2. Visit test page: /test-api.html
3. Verify backend is live: https://refundassistant.onrender.com/health
4. Check that config.js is deployed

