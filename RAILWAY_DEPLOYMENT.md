# 🚀 Railway Deployment - Copy & Paste Commands

## 📋 Prerequisites
- ✅ GitHub account with project pushed
- ✅ Railway account (free tier works)
- ✅ Node.js installed

---

## 🚀 Step 1: Install Railway CLI

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login
```

---

## 🚀 Step 2: Deploy Project

```bash
# Navigate to project root
cd "d:/inventory project"

# Deploy to Railway (this will upload everything)
railway up

# Railway will:
# - Upload your project
# - Detect Node.js app
# - Set default settings
# - Give you a project URL
```

---

## 🔧 Step 3: Configure Environment Variables

### Go to Railway Dashboard:
1. **🌐 Open**: railway.app
2. **📱 Login**: Your account
3. **🎯 Select**: Your project
4. **⚙️ Settings**: Environment Variables

### Add these variables:
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_secure
PORT=5000
```

---

## 🔄 Step 4: Update Server for Railway

```bash
# Create railway-specific start script
cd server

# Update package.json start script
npm pkg set scripts.start="node index.js"

# Ensure server listens on Railway port
# Railway automatically sets PORT env var
```

---

## 🚀 Step 5: Redeploy with Environment

```bash
# Go back to project root
cd "d:/inventory project"

# Redeploy to apply environment variables
railway up

# Or restart if already deployed
railway restart
```

---

## 🌐 Step 6: Get Your URLs

### Railway will provide:
- **🔧 Backend URL**: `https://your-app-name.up.railway.app`
- **📊 API Endpoints**: `https://your-app-name.up.railway.app/api/*`
- **🎯 Analytics**: `https://your-app-name.up.railway.app/admin-dashboard/analytics`

---

## 📱 Step 7: Update Frontend API URL

```bash
# Update frontend environment
cd frontend

# Create production .env
echo "REACT_APP_API_URL=https://your-app-name.up.railway.app" > .env.production

# Build with production API URL
npm run build

# Redeploy frontend
railway up
```

---

## ⚡ Quick Commands Summary

### 🚀 One-Command Deployment:
```bash
# From project root
railway up
```

### 🔧 Environment Setup:
```bash
# Set variables in Railway dashboard (not terminal)
NODE_ENV=production
MONGODB_URI=mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db
JWT_SECRET=your_jwt_secret_here
```

### 🔄 Redeploy:
```bash
# Restart with new settings
railway restart

# Or redeploy everything
railway up
```

---

## 🎯 Final URLs Example

```
Frontend: https://inventory-app.up.railway.app
Backend:  https://inventory-app.up.railway.app
API:      https://inventory-app.up.railway.app/api/auth/login
Analytics: https://inventory-app.up.railway.app/admin-dashboard/analytics
```

---

## 🆘 Troubleshooting

### ❌ Common Issues:
1. **Database Connection**: Check MONGODB_URI in Railway dashboard
2. **CORS Errors**: Ensure frontend URL is correct
3. **Build Failures**: Check package.json scripts
4. **Port Issues**: Railway auto-sets PORT, don't hardcode

### 🔧 Quick Fixes:
```bash
# Check logs
railway logs

# Restart service
railway restart

# Check environment
railway variables
```

---

## 🎉 Ready to Launch! 🚀

**Your inventory management system will be live at Railway URL!**

### ✅ After Deployment:
- [ ] Test admin login
- [ ] Check analytics dashboard
- [ ] Verify user registration
- [ ] Test product management
- [ ] Confirm mobile responsive

**Production-ready inventory system! 🎊**
