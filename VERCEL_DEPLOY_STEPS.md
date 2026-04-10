# **Vercel Deployment Steps**

## **Step 1: Go to Vercel**
1. **Visit**: vercel.com
2. **Sign up**: Create account or login
3. **Dashboard**: Click "Dashboard"

## **Step 2: Import GitHub Repository**
1. **New Project**: Click "Add New..." > "Project"
2. **Import Git Repository**: Click "Import"
3. **Select Repository**: Choose `inventory-management` from your GitHub
4. **Continue**: Click "Import"

## **Step 3: Configure Vercel Project**
1. **Framework Preset**: Vite (should auto-detect)
2. **Root Directory**: `frontend` (important!)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

## **Step 4: Environment Variables**
Add this environment variable:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```
*(We'll update this after backend deployment)*

## **Step 5: Deploy**
1. **Review Settings**: Check all settings
2. **Deploy**: Click "Deploy"
3. **Wait**: Vercel will build and deploy
4. **Get URL**: Copy the frontend URL

## **Expected Frontend URL:**
```
https://inventory-management.vercel.app
```

---

## **Next: Backend Deployment (Render)**

After Vercel deployment, we'll deploy backend to Render and then update the API URL.
