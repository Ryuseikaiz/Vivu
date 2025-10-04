# 🔧 Facebook Page Access Token Setup

## ⚠️ Current Issue
Facebook Page Access Token đã expired. Cần generate token mới với đúng permissions.

## 📋 Required Permissions
- `manage_pages` - Quản lý pages
- `pages_show_list` - Hiển thị danh sách pages
- `pages_read_engagement` - Đọc engagement metrics

## 🔗 Step by Step Guide

### 1. Tại Facebook Graph API Explorer
🌐 **URL**: https://developers.facebook.com/tools/explorer/

### 2. Setup Application
- **Application**: Chọn app "Vivu" của bạn
- **Graph API Version**: v23.0 hoặc latest
- **HTTP Method**: GET

### 3. Get User Access Token
1. Click **"Generate Access Token"**
2. Login Facebook nếu cần
3. Chọn permissions:
   - ✅ `manage_pages`
   - ✅ `pages_show_list` 
   - ✅ `pages_read_engagement`
4. Click **"Generate Access Token"**

### 4. Get Page Access Token
1. Với User Access Token vừa có, call API:
   ```
   GET /me/accounts
   ```
2. Response sẽ có list các pages, tìm page "Vivu":
   ```json
   {
     "data": [
       {
         "access_token": "EAAG...xyz", // <-- Đây là Page Access Token
         "name": "Vivu",
         "id": "123456789"
       }
     ]
   }
   ```

### 5. Update Environment Variables
📝 **File**: `server/.env`
```env
FACEBOOK_PAGE_ACCESS_TOKEN=EAAG...xyz
FACEBOOK_PAGE_ID=123456789
```

### 6. Extend Token (Optional)
Để token không expired nhanh:
```
GET /oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN
```

## 🚀 Alternative: Use Demo Data
Hiện tại app đang dùng dummy data để development. Khi nào có token mới thì sẽ load posts thật.

## 📞 Support
Nếu gặp khó khăn, check:
- App permissions trong Facebook Developers Console
- Page settings → Page Transparency → Page and ad posts