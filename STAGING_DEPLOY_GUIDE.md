# Render Staging Deployment Guide

This guide walks you through setting up a **staging environment** on Render before going live.

## Why Staging?
- Test backend before updating production
- Avoid breaking live site
- Verify MongoDB Atlas connection works
- Test admin dashboard and blog features

---

## Step 1: Create New GitHub Repository (Backend Only)

1. Go to https://github.com/new
2. Create a new repository:
   - Name: `faran-portfolio-backend-staging`
   - Description: "Node.js backend for Faran portfolio (staging)"
   - **Private** or **Public** (your choice)
   - **Do NOT** initialize with README

3. Copy the commands shown, then run in PowerShell:

```powershell
cd "d:\faran website personal v-15\newsletter-app"
git init
git add .
git commit -m "Initial backend setup for staging"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/faran-portfolio-backend-staging.git
git push -u origin main
```

---

## Step 2: Deploy to Render (Staging)

1. Go to https://dashboard.render.com

2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub account if not already connected

4. Select repository: `faran-portfolio-backend-staging`

5. Configure the service:
   - **Name:** `faran-backend-staging`
   - **Region:** Choose closest to you (e.g., Frankfurt, Singapore)
   - **Branch:** `main`
   - **Root Directory:** Leave blank (or put `newsletter-app` if you push entire repo)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

6. Click **"Advanced"** → Add Environment Variables:

```
PORT=3000
MONGO_URI=mongodb+srv://faranalam14203@admin:faranalam14203@tasktrackr.3j7tmok.mongodb.net/?appName=tasktrackr
JWT_SECRET=8c3f8c4a9bdf4a1ea6bb7c5c5f1e8d1a0c2f4e9b7d6a3c5f9b8e1d2c3a4b5c6d
JWT_EXPIRE=7d
ADMIN_USER=faranalam14203
ADMIN_PASS=faranalam14203
CORS_ORIGIN=*
CONTACT_TO=faran.bsce40@iiu.edu.pk
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=faran.bsce40@iiu.edu.pk
SMTP_PASS=fori vawf zhkk upyu
SMTP_FROM=Faran <faran.bsce40@iiu.edu.pk>
```

7. Click **"Create Web Service"**

8. Wait 5-10 minutes for deployment

9. Once deployed, you'll get URL like:
   - `https://faran-backend-staging.onrender.com`

---

## Step 3: Test Staging Backend

### Test Health Endpoint
Open in browser:
```
https://faran-backend-staging.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  "mongoConnected": true
}
```

### Test Blogs API
```
https://faran-backend-staging.onrender.com/blogs
```

Should return:
```json
{
  "blogs": [],
  "total": 0
}
```

---

## Step 4: Connect Frontend to Staging

Update `js/config.js` temporarily for testing:

```javascript
// API Configuration - Temporarily use STAGING
const CONFIG = {
    isLocalhost: false, // Force production mode
    
    API_URL: {
        LOCAL: 'http://localhost:3000',
        PRODUCTION: 'https://faran-backend-staging.onrender.com' // STAGING URL
    },
    
    getApiUrl: function() {
        return this.API_URL.PRODUCTION; // Always use staging for testing
    }
};

window.API_BASE_URL = CONFIG.getApiUrl();
console.log('🌐 Environment: STAGING TEST');
console.log('🔗 API URL:', window.API_BASE_URL);
```

**Important:** Do NOT push this change to GitHub yet! Just edit locally for testing.

---

## Step 5: Test Full Stack Locally

1. Run staging backend is already deployed on Render
2. Open `admin-dashboard.html` locally
3. Login with staging credentials (faranalam14203 / faranalam14203)
4. Create a test blog post
5. Open `blog.html` locally → verify blog appears
6. Open `blog-detail.html` → verify full post loads

---

## Step 6: When Staging Works → Go Live

### Option A: Update Production Backend
Update your existing Render production service environment variables with staging values.

### Option B: Switch to Staging as Production
1. Update `js/config.js` with final staging URL
2. Push to GitHub:
   ```powershell
   git add js/config.js
   git commit -m "Update backend URL to new stable deployment"
   git push origin main
   ```
3. Netlify auto-deploys in 1-2 minutes

---

## Rollback Plan

If something breaks:
1. Revert `js/config.js` to old production URL
2. Push to GitHub
3. Netlify deploys old working version

---

## Notes

- **Staging URL:** Use for testing only, not for public
- **Free Tier Limits:** Backend sleeps after 15 min inactivity
- **MongoDB:** Same Atlas database for local, staging, production
- **Separate Databases:** If you want, create separate MongoDB databases for staging vs production

---

## Next Steps After Testing

1. If staging works perfectly → update production
2. If issues found → debug locally, fix, redeploy staging
3. Keep staging running for future updates

---

Generated on: 2026-02-09
Contact: Faran Alam
