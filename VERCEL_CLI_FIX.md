# **Vercel CLI Fix - PowerShell Issue**

## **Problem:**
```
vercel : The term 'vercel' is not recognized as the name of a cmdlet
```

## **Solutions:**

### **Solution 1: Install Vercel CLI (Command Prompt)**
```cmd
# Open Command Prompt (not PowerShell)
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### **Solution 2: Use Vercel Web Dashboard (Easiest)**
1. **Go to**: vercel.com
2. **Sign up/login**: Your account
3. **New Project**: Click "New Project"
4. **Import Git Repository**: Connect GitHub
5. **Select repo**: Choose your inventory project
6. **Deploy**: Click "Deploy"

### **Solution 3: PowerShell Fix**
```powershell
# Install Vercel CLI
npm install -g vercel

# Check if installed
vercel --version

# If still not recognized, restart PowerShell
# or use Command Prompt instead
```

### **Solution 4: Use npx (No global install)**
```powershell
# Use npx to run vercel without global install
npx vercel --prod
```

## **Recommended: Vercel Web Dashboard**

### **Steps:**
1. **vercel.com** > Sign up
2. **New Project** > Import Git Repository
3. **Connect GitHub** > Select your repo
4. **Framework Preset**: Vite (React)
5. **Build Command**: npm run build
6. **Output Directory**: dist
7. **Deploy**: Click Deploy

### **Environment Variables:**
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## **Current Status:**

### **Frontend Build:**
- **Status**: Build successful
- **Output**: dist folder created
- **Size**: 829KB (optimized)
- **Ready**: Can deploy via web dashboard

### **Next Steps:**
1. **Deploy frontend** via Vercel web
2. **Deploy backend** via Render
3. **Connect** both URLs
4. **Test** production app

## **Quick Deploy Now:**

### **Vercel Web Dashboard:**
1. **vercel.com** > New Project
2. **Import GitHub** > Select repo
3. **Deploy** > Get URL

### **Render Backend:**
1. **render.com** > New
2. **Web Service** > Connect GitHub
3. **Auto-deploy** > Get URL

## **Final URLs:**
```
Frontend: https://inventory-app.vercel.app
Backend:  https://inventory-api.onrender.com
```
