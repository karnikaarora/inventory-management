# **Render Deployment Steps**

## **Step 1: Go to Render**
1. **Visit**: render.com
2. **Sign up**: Create account or login
3. **Dashboard**: Click "Dashboard"

## **Step 2: Create Web Service**
1. **New**: Click "New" > "Web Service"
2. **Connect Repository**: Click "Connect a repository"
3. **GitHub**: Connect your GitHub account
4. **Select Repository**: Choose `inventory-management`

## **Step 3: Configure Render Service**
1. **Name**: `inventory-api`
2. **Environment**: `Node`
3. **Root Directory**: `server` (important!)
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`

## **Step 4: Environment Variables**
Add these environment variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_secure_123456789
PORT=5000
```

## **Step 5: Deploy**
1. **Create Web Service**: Click "Create Web Service"
2. **Wait**: Render will build and deploy
3. **Get URL**: Copy the backend URL

## **Expected Backend URL:**
```
https://inventory-api.onrender.com
```

---

## **After Both Deployments:**

### **Update Vercel Environment Variable:**
1. Go to Vercel dashboard
2. Settings > Environment Variables
3. Update REACT_APP_API_URL to your Render URL
4. Redeploy Vercel

### **Final URLs:**
```
Frontend: https://inventory-management.vercel.app
Backend:  https://inventory-api.onrender.com
```
