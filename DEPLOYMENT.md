# Vivu AI Travel Agent - CI/CD Setup

## 🚀 Vercel Deployment Guide

### 1. **Project Structure**
```
/
├── src/          # React Frontend
├── server/       # Node.js Backend  
├── package.json  # Frontend dependencies
├── vercel.json   # Vercel config
└── server/package.json # Backend dependencies
```

### 2. **Environment Variables (Vercel Dashboard)**
```bash
# Backend Environment Variables
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=your_gemini_key
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
SERPAPI_API_KEY=your_serpapi_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# Frontend Environment Variables
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. **Package.json Scripts Update**
Thêm vào root package.json:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "vercel-build": "npm run build",
    "dev": "react-scripts start",
    "server": "cd server && npm start"
  }
}
```

### 4. **Deploy Steps**

#### **Manual Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### **Auto Deploy (CI/CD):**
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Auto deploy on git push

### 5. **API Routes**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.vercel.app/api/*`

### 6. **Common Issues & Solutions**

#### **Issue: Backend timeout**
```json
// vercel.json
{
  "functions": {
    "server/server.js": {
      "maxDuration": 60
    }
  }
}
```

#### **Issue: File uploads**
Use cloud storage (AWS S3, Cloudinary) instead of local storage

#### **Issue: MongoDB connection**
Use connection pooling and timeout settings

### 7. **Alternative: Separate Deployments**

#### **Frontend Only → Vercel**
```json
// vercel.json (frontend only)
{
  "version": 2,
  "builds": [
    {
      "src": "package.json", 
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ]
}
```

#### **Backend → Railway/Render/Heroku**
```bash
# Deploy backend separately to Railway
railway login
railway link
railway up
```

### 8. **Recommended Setup**

For your project, I recommend:
- **Frontend**: Vercel (auto-deploy from main branch)
- **Backend**: Vercel Functions (same domain, no CORS issues)
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary/AWS S3

This gives you:
- ✅ Single domain (no CORS)
- ✅ Automatic SSL
- ✅ CDN for frontend
- ✅ Serverless scaling
- ✅ Git-based deployments