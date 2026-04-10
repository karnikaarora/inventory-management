# 🚀 Inventory Management System - Deployment Guide

## 📋 Prerequisites
- ✅ GitHub account with project pushed
- ✅ Node.js installed locally
- ✅ MongoDB Atlas database ready
- ✅ Environment variables configured

---

## 🌐 Option 1: Vercel + Render (Recommended)

### 🎨 Frontend (Vercel)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Navigate to frontend
cd frontend

# 3. Build for production
npm run build

# 4. Deploy to Vercel
vercel --prod

# 5. Follow prompts:
# - Link to your Vercel account
# - Import from GitHub (recommended)
# - Deploy settings: default is fine
```

### 🔧 Backend (Render)
```bash
# 1. Create render.yaml in server/
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
        value: your_jwt_secret_here
EOF

# 2. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 3. Deploy on Render.com
# Go to render.com → New → Connect GitHub
# Select your repository
# Auto-deploy will start
```

---

## ⚡ Option 2: Railway (All-in-One)

### 🚀 Quick Deploy
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login to Railway
railway login

# 3. Deploy project
railway up

# 4. Configure environment variables in Railway dashboard:
# - NODE_ENV=production
# - MONGODB_URI=mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db
# - JWT_SECRET=your_jwt_secret_here
```

---

## 🔥 Option 3: Heroku (Classic)

### 📱 Backend (Heroku)
```bash
# 1. Install Heroku CLI
npm i -g heroku

# 2. Login to Heroku
heroku login

# 3. Create Heroku app
heroku create inventory-api

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db
heroku config:set JWT_SECRET=your_jwt_secret_here

# 5. Deploy
git subtree push --prefix server heroku main
```

---

## 🌟 Option 4: Netlify + Vercel Functions

### 🎨 Frontend (Netlify)
```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Deploy to Netlify
npx netlify deploy --prod --dir=build
```

### 🔧 Backend (Vercel Functions)
```bash
# 1. Create api folder in frontend
mkdir frontend/api

# 2. Move server files to api
# Copy your server routes to api folder

# 3. Deploy with Vercel
vercel --prod
```

---

## 🔧 Environment Variables Setup

### 📋 Required Variables
```bash
# Frontend (.env)
REACT_APP_API_URL=https://your-backend-url.com

# Backend (.env)
NODE_ENV=production
MONGODB_URI=mongodb+srv://kransarora:pavini12@cluster0.jth2zse.mongodb.net/inventory_db
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

---

## 🔄 Continuous Deployment

### 🚀 GitHub Actions (Auto-Deploy)
```yaml
# Create .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📱 Post-Deployment Checklist

### ✅ Testing
- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database connection works
- [ ] User authentication works
- [ ] All pages accessible

### 🔒 Security
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Database connection secure
- [ ] CORS configured correctly

### 📊 Performance
- [ ] Images optimized
- [ ] API response times good
- [ ] Mobile responsive
- [ ] Analytics dashboard loads

---

## 🎯 URLs After Deployment

### 📧 Example Structure
```
Frontend: https://inventory-app.vercel.app
Backend API: https://inventory-api.onrender.com
Analytics: https://inventory-app.vercel.app/admin-dashboard/analytics
```

---

## 🆘 Troubleshooting

### 🔧 Common Issues
1. **CORS Errors**: Update backend CORS settings
2. **Database Connection**: Check MongoDB URI
3. **Environment Variables**: Ensure all are set
4. **Build Failures**: Check package.json scripts
5. **API Timeouts**: Optimize database queries

### 📞 Support
- 📧 Email: support@yourdomain.com
- 📱 Phone: +1234567890
- 💬 Chat: Discord/Slack channel

---

## 🚀 Ready to Launch! 🎉

Your inventory management system is production-ready! Choose the deployment option that works best for you.

**Recommended**: Vercel + Render for best performance and scalability.
