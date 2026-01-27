# 🚀 Admin Dashboard & Contact Management System - Setup Guide

## ✅ Phase 2 Complete - Admin Dashboard Ready!

Aapka **Professional Admin Dashboard** with complete authentication and management features ready hai!

---

## 📋 What's Included:

### 🔐 **Authentication System**
- Secure JWT-based login
- Password hashing with bcryptjs
- Token expiration (7 days default)
- Auto-logout on token expiry

### 📊 **Admin Dashboard Features**
- **Statistics Cards**: Total contacts, unread messages, subscribers count
- **Contact Management**: View, update status, delete messages
- **Subscriber Management**: View and manage newsletter subscribers
- **Real-time Updates**: Live data refresh
- **Responsive Design**: Works on all devices

### 🛡️ **Security Features**
- Rate limiting on all endpoints
- JWT authentication middleware
- CORS protection
- Helmet security headers
- Input sanitization
- SQL injection protection

---

## 🔧 Setup Instructions:

### **Step 1: Install Dependencies**
```powershell
cd newsletter-app
npm install
```

### **Step 2: Configure Environment**

1. Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

2. Edit `.env` file with your settings:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/newsletter
CORS_ORIGIN=http://127.0.0.1:5500,http://localhost:5500

# JWT Secret (Generate strong key)
JWT_SECRET=your-64-character-random-string-here

# Gmail SMTP (Get App Password from Google)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
CONTACT_TO=faranalam14203@gmail.com
```

### **Step 3: Create Admin Account**

MongoDB mein manually admin account create karna hoga (pehli baar):

```powershell
# MongoDB shell open karo
mongosh

# Use your database
use newsletter

# Admin account create karo
db.admins.insertOne({
  username: "admin",
  email: "faranalam14203@gmail.com",
  password: "$2a$10$YourHashedPasswordHere",
  name: "Faran Alam",
  role: "super-admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**OR** Use this Node.js script to create admin:

```javascript
// create-admin.js (newsletter-app folder mein banao)
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/newsletter')
  .then(async () => {
    console.log('MongoDB connected');
    
    // Check if admin already exists
    const existing = await Admin.findOne({ email: 'faranalam14203@gmail.com' });
    if (existing) {
      console.log('Admin already exists!');
      process.exit(0);
    }
    
    // Create new admin
    const admin = await Admin.create({
      username: 'faranalam',
      email: 'faranalam14203@gmail.com',
      password: 'Admin@123',  // Change this password!
      name: 'Faran Alam',
      role: 'super-admin',
      isActive: true
    });
    
    console.log('✅ Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: Admin@123 (Please change after first login)');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

Run it:
```powershell
node create-admin.js
```

### **Step 4: Start Server**
```powershell
npm start
```

Server will run on: `http://localhost:5000`

---

## 🌐 Access Admin Dashboard:

### **Local Development:**
Open in browser: `file:///D:/faran%20website%20personal%20v-12/admin-dashboard.html`

**OR** use Live Server:
```
http://127.0.0.1:5500/admin-dashboard.html
```

### **Default Login:**
- **Email**: faranalam14203@gmail.com
- **Password**: Admin@123 (change after first login)

---

## 📁 File Structure:

```
faran-website-personal-v-12/
│
├── admin-dashboard.html       ← Admin Dashboard UI
├── admin-dashboard.js         ← Dashboard JavaScript
├── index.html                 ← Main website
│
└── newsletter-app/
    ├── server.js              ← Backend server
    ├── package.json           ← Dependencies
    ├── .env                   ← Environment variables
    │
    └── models/
        ├── Admin.js           ← Admin model
        ├── Contact.js         ← Contact model
        └── Subscriber.js      ← Subscriber model
```

---

## 🔑 API Endpoints:

### **Public Endpoints:**
- `POST /contact` - Submit contact form
- `POST /subscribe` - Subscribe to newsletter

### **Admin Endpoints (Require JWT):**
- `POST /admin/login` - Admin login
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/contacts` - Get all contacts
- `PATCH /admin/contacts/:id` - Update contact status
- `DELETE /admin/contacts/:id` - Delete contact
- `GET /admin/subscribers` - Get all subscribers
- `DELETE /admin/subscribers/:id` - Delete subscriber

---

## 🛠️ Testing:

### **1. Test Contact Form:**
Fill form on your website → Check admin dashboard

### **2. Test Admin Login:**
Go to admin-dashboard.html → Login with credentials

### **3. Test API:**
```powershell
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/admin/login `
  -H "Content-Type: application/json" `
  -d '{"email":"faranalam14203@gmail.com","password":"Admin@123"}'
```

---

## 🚀 Deployment Notes:

### **For Netlify:**
1. Update CORS_ORIGIN in `.env` with your Netlify URL
2. Deploy backend on separate service (Heroku, Railway, Render)
3. Update API_BASE_URL in `admin-dashboard.js`

### **For SEO (Important):**
✅ Contact form ab SEO-friendly hai:
- Forms use POST requests (no URL changes)
- No impact on existing SEO
- Clean URLs maintained
- Sitemap unchanged

---

## 📧 Gmail App Password Setup:

1. Go to: https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Go to: https://myaccount.google.com/apppasswords
4. Generate new App Password for "Mail"
5. Copy 16-character password
6. Paste in .env file as SMTP_PASS

---

## 🔒 Security Checklist:

- ✅ JWT authentication implemented
- ✅ Password hashing (bcryptjs)
- ✅ Rate limiting enabled
- ✅ CORS protection
- ✅ Input sanitization
- ✅ Helmet security headers
- ✅ Environment variables
- ✅ Token expiration

---

## 🐛 Troubleshooting:

### **MongoDB Connection Error:**
```powershell
# Start MongoDB service
net start MongoDB
```

### **SMTP Error:**
- Use Gmail App Password (not regular password)
- Check if 2FA is enabled
- Verify SMTP_HOST and SMTP_PORT

### **JWT Error:**
- Check JWT_SECRET is set in .env
- Verify token hasn't expired
- Clear browser localStorage and re-login

---

## 📞 Support:

Koi problem ho to check karo:
1. MongoDB running hai?
2. .env file properly configured hai?
3. Admin account created hai?
4. Server running hai?

---

## ✨ Next Phase - Blog Management:

Agle phase mein hum add karenge:
- ✅ Blog creation from dashboard
- ✅ Image upload system
- ✅ Blog editing/deletion
- ✅ Auto-update blog page
- ✅ Latest blogs on top

**Ready for Phase 3?** 🚀
