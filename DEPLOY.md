# 🚀 Deployment Guide - Vivu Travel Agent

## Quick Deploy to Vercel

### 1. **Prepare for Deployment**

```bash
# Make sure all dependencies are installed
npm run install-all

# Test build locally
npm run build
```

### 2. **Deploy to Vercel**

#### **Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time will ask configuration)
vercel

# Deploy to production
vercel --prod
```

#### **Option B: GitHub Integration**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Vercel auto-detects React app
6. Click "Deploy"

### 3. **Environment Variables**

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# Backend
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vivu
GEMINI_API_KEY=your_gemini_api_key
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
SERPAPI_API_KEY=your_serpapi_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# Frontend
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. **Domain Setup**

Your app will be available at:
- `https://your-app-name.vercel.app` (auto-generated)
- Custom domain: Add in Vercel Dashboard → Settings → Domains

### 5. **CI/CD Setup**

Auto-deploy on every push to `main` branch:
1. Connect GitHub repo to Vercel
2. Enable auto-deployments
3. Set production branch to `main`

### 6. **Testing Deployment**

```bash
# Test API endpoints
curl https://your-app.vercel.app/api/auth/me

# Test frontend
curl https://your-app.vercel.app
```

### 7. **Common Issues & Solutions**

#### **Build Error: Module not found**
```bash
# Make sure all dependencies are in package.json
npm install --save missing-package
```

#### **API Routes not working**
- Check vercel.json routing
- Verify environment variables
- Check Vercel function logs

#### **MongoDB Connection Issues**
- Use MongoDB Atlas (cloud)
- Check connection string
- Whitelist Vercel IPs (0.0.0.0/0)

#### **Large Bundle Size**
```bash
# Analyze bundle
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### 8. **Production Optimizations**

#### **Enable Analytics**
Add to vercel.json:
```json
{
  "analytics": {
    "enable": true
  }
}
```

#### **Speed Insights**
```bash
npm install @vercel/speed-insights
```

#### **Function Optimization**
```json
{
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### 9. **Monitoring**

- **Vercel Dashboard**: Check deployments, function logs
- **Analytics**: Track page views, performance
- **Error Tracking**: Check function errors

### 10. **Backup Strategy**

- Code: GitHub repository
- Database: MongoDB Atlas backups
- Environment Variables: Store securely offline

## 🎉 Your app is now live!

Access your deployed app at: `https://your-app-name.vercel.app`

Need help? Check [Vercel Documentation](https://vercel.com/docs)