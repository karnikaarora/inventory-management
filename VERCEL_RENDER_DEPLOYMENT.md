# **Vercel + Render Deployment - Copy & Paste Commands**

## **Prerequisites**
- GitHub account with project pushed
- Vercel account (free tier)
- Render account (free tier)
- Node.js installed

---

## **Step 1: Frontend Deployment (Vercel)**

### **Install Vercel CLI**
```bash
npm install -g vercel
```

### **Build Frontend**
```bash
cd frontend
npm run build
```

### **Deploy to Vercel**
```bash
# From frontend folder
vercel --prod

# Vercel will ask:
# - Link to existing project? No
# - Project name? inventory-management
# - Directory? ./ (current)
# - Override settings? No

# Vercel will give you URL like: https://inventory-management.vercel.app
```

---

## **Step 2: Backend Deployment (Render)**

### **Create render.yaml file**
```bash
cd server
cat > render.yaml << EOF
services:
  - type: web
    name: inventory-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        value: mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db
      - key: JWT_SECRET
        value: your_super_secret_jwt_key_make_it_long_and_secure
      - key: PORT
        value: 5000
    healthCheckPath: /
EOF
```

### **Push to GitHub**
```bash
# Go to project root
cd ..

# Add and commit changes
git add .
git commit -m "Ready for Vercel + Render deployment"
git push origin main
```

### **Deploy on Render**
1. **Go to**: render.com
2. **Sign up/login**: Your account
3. **New**: Click "New" button
4. **Web Service**: Select "Web Service"
5. **Connect GitHub**: Connect your repository
6. **Select repo**: Choose your inventory project
7. **Auto-deploy**: Render will automatically detect and deploy

---

## **Step 3: Update Frontend API URL**

### **Update frontend environment**
```bash
cd frontend

# Create production environment file
echo "REACT_APP_API_URL=https://your-app-name.onrender.com" > .env.production

# Rebuild with new API URL
npm run build

# Redeploy to Vercel
vercel --prod
```

---

## **Step 4: Configure CORS**

### **Update server CORS settings**
```bash
cd server

# Update index.js to allow your Vercel domain
# In index.js, update CORS:
app.use(cors({
  origin: ['https://your-app-name.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### **Redeploy backend**
```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

---

## **Final URLs Example**

```
Frontend: https://inventory-management.vercel.app
Backend:  https://inventory-api.onrender.com
API:      https://inventory-api.onrender.com/api/auth/login
Analytics: https://inventory-management.vercel.app/admin-dashboard/analytics
```

---

## **Quick Commands Summary**

### **Frontend (Vercel):**
```bash
cd frontend
npm run build
vercel --prod
```

### **Backend (Render):**
```bash
cd server
# Create render.yaml (see above)
git add .
git commit -m "Add render.yaml"
git push origin main
# Then go to render.com and connect GitHub
```

### **Environment Variables (Render Dashboard):**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_secure
PORT=5000
```

---

## **Troubleshooting**

### **Common Issues:**
1. **CORS Error**: Update CORS settings in backend
2. **API Timeout**: Check Render deployment status
3. **Build Failures**: Check package.json scripts
4. **Environment Variables**: Ensure all set in Render

### **Quick Fixes:**
```bash
# Check Render logs
# Go to render.com > your app > Logs

# Redeploy frontend
vercel --prod

# Restart backend
# Go to render.com > your app > Manual Deploy
```

---

## **Production Checklist**

### **After Deployment:**
- [ ] Frontend loads at Vercel URL
- [ ] Backend API responds at Render URL
- [ ] Admin login works
- [ ] Analytics dashboard loads
- [ ] User registration works
- [ ] Product management works
- [ ] Mobile responsive works

### **Security:**
- [ ] HTTPS enabled (Vercel + Render auto-enable)
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] JWT tokens working

---

## **Ready to Launch!**

**Your inventory management system will be live with:**
- **Frontend**: Vercel (fast, global CDN)
- **Backend**: Render (reliable Node.js hosting)
- **Database**: MongoDB Atlas (cloud database)
- **Analytics**: Real-time business insights

**Production-ready deployment!**
