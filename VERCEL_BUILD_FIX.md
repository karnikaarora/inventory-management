# **Vercel Build Fix - vite command not found**

## **Problem:**
```
sh: line 1: vite: command not found
Error: Command "vite build" exited with 127
```

## **Solution: Update Vercel Settings**

### **Step 1: Go to Vercel Dashboard**
1. **Visit**: vercel.com
2. **Dashboard**: Your projects
3. **Select**: `inventory-management` project

### **Step 2: Update Build Settings**
1. **Settings**: Click "Settings" tab
2. **Build & Development Settings**: Click "Build & Development Settings"
3. **Update these settings**:

#### **Build Configuration:**
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `dist`

### **Step 3: Add Package.json Scripts**
The issue is that Vercel needs to install dependencies first. Let's verify the frontend package.json has the build script.

### **Step 4: Manual Redeploy**
1. **Deployments**: Click "Deployments" tab
2. **Redeploy**: Click the three dots next to latest deployment
3. **Redeploy**: Click "Redeploy"

---

## **Alternative: Use npx**

If the issue persists, change the build command to:
```
npx vite build
```

---

## **Quick Fix Steps:**

1. **Go to Vercel dashboard**
2. **Settings > Build & Development Settings**
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Install Command**: `npm install`
6. **Output Directory**: `dist`
7. **Save settings**
8. **Redeploy**

---

## **If Still Not Working:**

### **Check frontend/package.json:**
Make sure it has:
```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  }
}
```

### **Add Vite to Dependencies:**
If vite is not in dependencies, add it:
```json
{
  "dependencies": {
    "vite": "^5.0.0"
  }
}
```
