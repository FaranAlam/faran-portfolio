# Local Development Quick Start

## One-Click Startup

Double-click **`start-local-dev.ps1`** to:
- ✅ Start backend server (http://localhost:3000)
- ✅ Open website in browser (index.html)
- ✅ Open admin dashboard (admin-dashboard.html)

## Login Credentials

**Admin Dashboard:**
- Username: `faranalam14203`
- Password: `faranalam14203`

## Manual Startup (if script fails)

### 1. Start Backend
```powershell
cd "d:\faran website personal v-15\newsletter-app"
npm install
npm run dev
```

### 2. Open Frontend
- Open `index.html` with Live Server extension in VS Code
- Or double-click `index.html` to open in browser

### 3. Test Admin
- Open `admin-dashboard.html`
- Login with credentials above
- Create a test blog post
- Check if it appears on blog.html

## Troubleshooting

**Backend won't start?**
- Check if port 3000 is already in use
- Kill any existing Node processes:
  ```powershell
  Get-Process node | Stop-Process -Force
  ```

**Can't login to admin?**
- Check backend logs for MongoDB connection
- Verify `.env` file exists in `newsletter-app` folder
- Make sure MongoDB Atlas credentials are correct

**Blogs not showing?**
- Open browser console (F12)
- Check for API connection errors
- Verify backend is running at http://localhost:3000/health

**CORS errors?**
- Make sure `CORS_ORIGIN=*` in `.env`
- Try opening with Live Server instead of file://

## Files Modified for Local Setup

- ✅ `newsletter-app/.env` - Updated with MongoDB Atlas + admin credentials
- ✅ `start-local-dev.ps1` - One-click startup script
- ✅ `STAGING_DEPLOY_GUIDE.md` - Deploy to Render guide

## Next Steps

1. **Test Locally** - Use `start-local-dev.ps1`
2. **Deploy Staging** - Follow `STAGING_DEPLOY_GUIDE.md`
3. **Go Live** - Update production after staging tests pass

---

Need help? Check:
- Backend logs in PowerShell window
- Browser console (F12)
- `STAGING_DEPLOY_GUIDE.md` for deployment

Generated: 2026-02-09
