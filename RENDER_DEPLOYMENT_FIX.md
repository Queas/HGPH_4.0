# Render Deployment Fix Guide

## 🔴 Error: ECONNREFUSED ::1:27017

This error means MongoDB is trying to connect to localhost instead of MongoDB Atlas.

## ✅ **Solution: Set Environment Variables on Render**

### **Step 1: Go to Render Dashboard**
1. Log in to [Render.com](https://render.com)
2. Find your `hgph-fullstack` service
3. Click on your service name

### **Step 2: Add Environment Variables**
1. Click **"Environment"** in the left sidebar
2. Add the following variables:

**Required Variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `MONGO_URL` | `mongodb://atlas-sql-695a94336003843029be2576-1wweq6.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | (Render will auto-generate) | Or copy from your local `.env` |
| `NODE_ENV` | `production` | Already set in render.yaml |
| `PORT` | `10000` | Already set in render.yaml |

**Optional (if using email):**

| Key | Value |
|-----|-------|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `jeremiahmagdael@gmail.com` |
| `EMAIL_PASS` | Your email password |
| `EMAIL_FROM` | `jeremiahmagdael@gmail.com` |
| `ADMIN_EMAIL` | `jeremiahmagdael@gmail.com` |

### **Step 3: Save and Redeploy**
1. Click **"Save Changes"**
2. Render will automatically redeploy your service
3. Wait 2-3 minutes for deployment to complete

### **Step 4: Verify Connection**
Check your deployment logs for:
```
✅ MongoDB Connected: atlas-sql-695a94336003843029be2576-1wweq6.a.query.mongodb.net
📊 Database: sample_mflix
```

If you see this, your connection is working! ✅

---

## 🔧 **Alternative: Use Render Dashboard UI**

### **Quick Steps:**
1. **Render Dashboard** → **Your Service** → **Environment**
2. Click **"Add Environment Variable"**
3. For `MONGO_URL`:
   - Key: `MONGO_URL`
   - Value: Paste your MongoDB connection string
   - Click **Add**
4. For `JWT_SECRET`:
   - Key: `JWT_SECRET`
   - Value: Click **"Generate"** (or paste from local .env)
   - Click **Add**
5. Click **"Save Changes"** at the bottom

---

## 🧪 **Testing Locally First**

Before deploying, test locally to ensure it works:

```powershell
# Start your local server
cd backend
node server.js
```

You should see:
```
✅ MongoDB Connected: atlas-sql-695a94336003843029be2576-1wweq6.a.query.mongodb.net
🚀 Server: http://localhost:8002
```

Then test registration:
```powershell
# Using PowerShell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8002/api/auth/register `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

If this works locally, it will work on Render once you set the environment variables!

---

## 🐛 **Troubleshooting**

### **Error: "MONGO_URL environment variable is not defined"**
- ✅ Solution: Set MONGO_URL in Render dashboard

### **Error: "connect ECONNREFUSED ::1:27017"**
- ✅ Solution: MONGO_URL not set properly - check Render environment variables

### **Error: "MongoServerError: Authentication failed"**
- Check your MongoDB Atlas username/password
- Verify the connection string is complete

### **Error: "MongooseServerSelectionError: connection timed out"**
- Add `0.0.0.0/0` to MongoDB Atlas IP Whitelist:
  1. MongoDB Atlas → Network Access
  2. Add IP Address → Allow Access from Anywhere
  3. Or add Render's IP addresses

### **Error: "JWT malformed" or "invalid token"**
- JWT_SECRET is different between local and Render
- Set the same JWT_SECRET on Render or use Render's generated value

---

## 📋 **Checklist Before Deploying**

- [ ] MongoDB Atlas connection string ready
- [ ] MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- [ ] `MONGO_URL` set in Render environment variables
- [ ] `JWT_SECRET` set in Render environment variables
- [ ] Tested locally first
- [ ] `.env` file NOT committed to git (should be in .gitignore)
- [ ] render.yaml updated with environment variable declarations

---

## 🎉 **After Successful Deployment**

Your app will be available at:
```
https://hgph-fullstack.onrender.com
```

Test the health endpoint:
```
https://hgph-fullstack.onrender.com/api/health
```

Should return:
```json
{
  "success": true,
  "message": "HalamangGaling TKDL-PH API is running",
  "database": "MongoDB Atlas",
  "timestamp": "2026-01-05T...",
  "environment": "production"
}
```

---

## 🔐 **Security Note**

Never commit these to git:
- ❌ MONGO_URL (contains credentials)
- ❌ JWT_SECRET (security risk)
- ❌ EMAIL_PASS (password)

Always use:
- ✅ `.env` file for local development (in .gitignore)
- ✅ Render environment variables for production
- ✅ Different JWT_SECRET for dev vs production

---

**Need help?** Check Render logs:
- Dashboard → Your Service → Logs
- Look for MongoDB connection messages
