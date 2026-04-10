# 🔧 PowerShell Execution Policy Fix for Railway

## ❌ Problem: PowerShell blocking Railway CLI
```
railway : File cannot be loaded because running scripts is disabled on this system
```

## ✅ Solutions:

### 🔧 Solution 1: Change Execution Policy (Recommended)
```powershell
# Open PowerShell as Administrator
# Run this command:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try Railway again:
railway up
```

### 🌐 Solution 2: Use Railway Web Dashboard (Easiest)
1. **🌐 Go to**: railway.app
2. **📱 Login**: Your account
3. **📁 Upload**: Drag & drop project folder
4. **⚙️ Configure**: Set environment variables
5. **🚀 Deploy**: Click deploy button

### 🔧 Solution 3: Use Command Prompt (Alternative)
```cmd
# Open Command Prompt (not PowerShell)
# Navigate to project:
cd "d:\inventory project"

# Install Railway CLI:
npm install -g @railway/cli

# Deploy:
railway up
```

### 🔧 Solution 4: Temporary Bypass
```powershell
# Temporary bypass for current session:
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Then run Railway:
railway up

# Note: This is temporary, Solution 1 is permanent
```

## 🚀 Quick Web Dashboard Steps:

### 📁 Direct Upload:
1. **🌐 railway.app** → Login
2. **📁 New Project** → Click "Upload"  
3. **📂 Select Folder** → Choose "d:\inventory project"
4. **⚙️ Configure** → Set environment variables
5. **🚀 Deploy** → Click deploy

### 🔧 Environment Variables in Web Dashboard:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_secure
PORT=5000
```

## 🎯 Best Option: Railway Web Dashboard

**Why Web Dashboard is Better:**
- ✅ **No PowerShell issues**
- ✅ **Visual interface**  
- ✅ **Drag & drop upload**
- ✅ **Easy configuration**
- ✅ **Live logs**
- ✅ **One-click deploy**

## 🚀 Deploy Now!

**Recommended**: Use Railway web dashboard - no terminal needed!

**URL will be**: `https://your-app-name.up.railway.app`
