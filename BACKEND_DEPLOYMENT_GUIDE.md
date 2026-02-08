# Backend Deployment Guide - Render.com

## Step 1: Push Backend Code to GitHub

1. Create a new GitHub repository named "portfolio-backend"
2. Copy only the `newsletter-app` folder files
3. Push to GitHub:
   ```bash
   cd "d:\faran website personal v-15\newsletter-app"
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin https://github.com/YOUR-USERNAME/portfolio-backend.git
   git push -u origin main
   ```

## Step 2: Deploy on Render.com

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select "portfolio-backend" repository
5. Configure:
   - **Name**: faran-portfolio-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. Add Environment Variables:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://faranalamportfolio:alam14203faran@tasktrackr.3j7tmok.mongodb.net/newsletter`
   
   - Key: `JWT_SECRET`
   - Value: `your-super-secret-jwt-key-change-this`
   
   - Key: `PORT`
   - Value: `3000`

7. Click "Create Web Service"
8. Wait 5-10 minutes for deployment
9. Copy the live URL (e.g., `https://faran-portfolio-backend.onrender.com`)

## Step 3: Update Frontend Config

1. Open `d:\faran website personal v-15\js\config.js`
2. Replace line 9:
   ```javascript
   PRODUCTION: 'https://faran-portfolio-backend.onrender.com'  // Put your Render URL here
   ```

## Step 4: Push to Netlify

1. Commit changes:
   ```bash
   cd "d:\faran website personal v-15"
   git add .
   git commit -m "Add backend integration with environment config"
   git push origin main
   ```

2. Netlify will auto-deploy your site
3. Your live site will now connect to the backend!

## Step 5: Access Admin Dashboard

Live admin URL will be:
`https://YOUR-NETLIFY-SITE.netlify.app/admin-dashboard.html`

Login credentials:
- Email: admin@admin.local
- Password: admin123

---

## Alternative: Railway.app (Also Free)

1. Sign up at https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select your backend repository
4. Add same environment variables as above
5. Deploy and get your URL
6. Update config.js with Railway URL

---

## Important Notes:

⚠️ **CORS Configuration**: Make sure `server.js` has CORS enabled:
```javascript
app.use(cors({
    origin: ['https://your-netlify-site.netlify.app', 'http://localhost:5500'],
    credentials: true
}));
```

⚠️ **MongoDB Access**: Use mobile/office network to access MongoDB Atlas (as home ISP blocks it)

⚠️ **Free Tier Limitations**: 
- Render free tier sleeps after 15 min inactivity
- First request after sleep takes 30-50 seconds
- Consider keeping a paid plan or using Railway/Vercel
