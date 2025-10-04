# 🔗 GitHub → Vercel CI/CD Setup

## Step-by-Step Guide

### 1. **Go to Vercel Dashboard**
👉 [vercel.com/dashboard](https://vercel.com/dashboard)

### 2. **Import Project from GitHub**
1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Choose **GitHub** as provider
4. Find repo: **`Ryuseikaiz/Vivu`**
5. Click **"Import"**

### 3. **Configure Project Settings**
```
Project Name: vivu-travel-agent
Framework Preset: Create React App
Root Directory: ./
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### 4. **Environment Variables** 
Click **"Environment Variables"** and add:

```bash
# 🔐 Backend Variables
MONGODB_URI=mongodb+srv://...your_mongodb_connection
GEMINI_API_KEY=AIza...your_gemini_key
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
GOOGLE_CLIENT_ID=1019363317955-5e9ho3m5a66kdghhr7u5g55okd0dne2k.apps.googleusercontent.com
SERPAPI_API_KEY=207b72f8e370b33306855fdbd68130531efa2a5b4133cabd23043373e131974d
EMAIL_USER=dattntde180651@fpt.edu.vn
EMAIL_PASS=your_gmail_app_password
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# 🌐 Frontend Variables  
REACT_APP_GOOGLE_CLIENT_ID=1019363317955-5e9ho3m5a66kdghhr7u5g55okd0dne2k.apps.googleusercontent.com
```

### 5. **Deploy**
1. Click **"Deploy"**
2. Wait for build process (~2-3 minutes)
3. Get your live URL: `https://vivu-travel-agent.vercel.app`

### 6. **Setup Auto-Deploy**
✅ **Already configured!** Every push to `main` branch will auto-deploy

### 7. **Test Your Deployment**

#### **Frontend Test:**
```bash
curl https://vivu-travel-agent.vercel.app
```

#### **API Test:**
```bash
curl https://vivu-travel-agent.vercel.app/api/auth/me
```

### 8. **Custom Domain (Optional)**
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain: `vivu.com`
3. Configure DNS records

### 9. **Monitor Deployments**
- **Deployments Tab**: See all builds
- **Functions Tab**: Monitor API performance  
- **Analytics**: Track usage (if enabled)

## 🎉 CI/CD Workflow Active!

```
GitHub Push → Vercel Auto-Deploy → Live Site Updated
```

### Git Workflow:
```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
# 🚀 Auto-deploys to production!
```

## 📱 Share Your Live App:
**Production URL:** `https://vivu-travel-agent.vercel.app`

---

### 🛠️ Troubleshooting

#### Build Fails?
- Check Vercel build logs
- Verify all dependencies in package.json

#### API 500 Errors?
- Check environment variables
- Monitor function logs in Vercel dashboard

#### Need Help?
- Vercel Support: support@vercel.com
- Docs: vercel.com/docs