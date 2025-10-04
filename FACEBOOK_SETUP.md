# 📘 Facebook Integration Setup

## 1. Create Facebook App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create New App → "Business" type
3. Add **Facebook Login** and **Webhooks** products

## 2. Get Access Tokens

### Page Access Token:
1. Go to Graph API Explorer
2. Select your app
3. Get User Access Token with permissions:
   - `pages_show_list`
   - `pages_read_engagement` 
   - `pages_read_user_content`
4. Get Page Access Token for your page
5. Convert to Long-lived token

### Webhook Setup:
1. App Dashboard → Webhooks
2. Create webhook for **Page**
3. Callback URL: `https://your-app.vercel.app/api/facebook/webhook`
4. Verify Token: `your_verify_token`
5. Subscribe to: `feed` (page posts)

## 3. Environment Variables

Add to `.env` and Vercel:
```bash
FACEBOOK_APP_ID=1839485089970235
FACEBOOK_APP_SECRET=5095821c5c2f3c67846bfbc80d9308b0
FACEBOOK_PAGE_ACCESS_TOKEN=EAAJJ25tGL3IBPgkgbrZCnLjni7PmLdHLaPQpoHef3ugq9Nw4JbfLsqEOKatuwQvGtMRszzi7EPG6l9InPMoYLT9jKE7aIbzRlkPUd5jduLacIN3lG3iCsbHRaHxsNTWqdOFCFTS2XOISZCvhqNa0mIU0FOPZAhE99uzrSNGhZAY7MMFQLxA5Q1UAQ75PRFi6vZApDJ7LfWMqZBUeoi8vByHZAalZB5ZBpnIjt4cnMSCbbKMzOdAlpHdWYFf0ZD
FACEBOOK_PAGE_ID=132238093306705
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_verify_token
```

## 4. Required Permissions

- `pages_show_list` - List pages
- `pages_read_engagement` - Read post engagement
- `pages_read_user_content` - Read page posts
- `public_profile` - Basic info

## 5. API Endpoints

- **GET /api/facebook/posts** - Fetch latest posts
- **POST /api/facebook/webhook** - Webhook receiver
- **GET /api/facebook/webhook** - Webhook verification

## 6. Testing

Use Graph API Explorer to test:
```
GET /{page-id}/posts?fields=id,message,created_time,permalink_url,full_picture
```