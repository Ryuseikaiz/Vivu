# Hướng Dẫn Cài Đặt OAuth (Google & Facebook Login)

## 📋 Tổng Quan

Tài liệu này hướng dẫn cách cấu hình đăng nhập qua Google và Facebook cho ứng dụng Vivu.

---

## 🔵 Google OAuth Setup

### **Bước 1: Tạo Project trên Google Cloud Console**

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** → **OAuth consent screen**

### **Bước 2: Cấu Hình OAuth Consent Screen**

1. Chọn **External** user type
2. Điền thông tin cơ bản:
   - **App name**: Vivu Travel
   - **User support email**: your-email@gmail.com
   - **Developer contact**: your-email@gmail.com
3. Thêm scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
4. Thêm test users (nếu đang development)

### **Bước 3: Tạo OAuth Client ID**

1. Vào **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Chọn **Application type**: **Web application**
4. Điền thông tin:
   - **Name**: Vivu Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost:5000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
5. Click **Create**
6. Copy **Client ID** và **Client Secret**

### **Bước 4: Cập Nhật .env**

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 🔴 Facebook OAuth Setup

### **Bước 1: Tạo Facebook App**

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Chọn **Consumer** as app type
4. Điền thông tin:
   - **App Display Name**: Vivu Travel
   - **App Contact Email**: your-email@gmail.com
5. Click **Create App**

### **Bước 2: Thêm Facebook Login Product**

1. Trong dashboard, vào **Add a Product**
2. Tìm **Facebook Login** và click **Set Up**
3. Chọn **Web** platform
4. Điền **Site URL**: `http://localhost:3000`

### **Bước 3: Cấu Hình Facebook Login Settings**

1. Vào **Facebook Login** → **Settings**
2. Thêm **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5000/api/auth/facebook/callback
   ```
3. Save changes

### **Bước 4: Lấy App ID và App Secret**

1. Vào **Settings** → **Basic**
2. Copy **App ID**
3. Click **Show** để xem **App Secret** và copy

### **Bước 5: Cập Nhật .env**

```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

---

## 🚀 Tích Hợp Vào Frontend

### **1. Thêm SocialLogin Component**

Trong LoginForm.js hoặc RegisterForm.js:

```javascript
import SocialLogin from './SocialLogin';

// Thêm vào form
<SocialLogin mode="login" />
```

### **2. Thêm Route cho OAuth Callback**

Trong App.js:

```javascript
import AuthCallback from './components/Auth/AuthCallback';

// Thêm route
<Route path="/auth/callback" element={<AuthCallback />} />
```

---

## 🧪 Test OAuth Flow

### **Test Google Login:**

1. Click button "Google" trên login form
2. Chọn tài khoản Google
3. Cho phép quyền truy cập
4. Được redirect về app với token
5. Tự động đăng nhập

### **Test Facebook Login:**

1. Click button "Facebook" trên login form
2. Đăng nhập Facebook (nếu chưa)
3. Cho phép quyền truy cập
4. Được redirect về app với token
5. Tự động đăng nhập

---

## 🔧 Troubleshooting

### **Lỗi: "redirect_uri_mismatch"**

**Nguyên nhân:** Redirect URI không khớp với cấu hình

**Giải pháp:**
- Kiểm tra lại redirect URIs trong Google/Facebook console
- Đảm bảo URL chính xác (có/không có trailing slash)
- Restart server sau khi thay đổi

### **Lỗi: "Can't Load URL"**

**Nguyên nhân:** App không ở chế độ production

**Giải pháp:**
- Với Facebook: Thêm email vào Test Users
- Hoặc chuyển app sang Live mode (Settings → Basic → App Mode)

### **Lỗi: "Invalid scopes"**

**Nguyên nhân:** Scope không được phê duyệt

**Giải pháp:**
- Kiểm tra lại OAuth consent screen
- Đảm bảo các scope đã được thêm vào

---

## 📝 Production Checklist

Trước khi deploy lên production:

### Google OAuth:
- [ ] Update Authorized JavaScript origins với domain thực
- [ ] Update Authorized redirect URIs với domain thực
- [ ] Submit app để Google review (nếu cần)
- [ ] Update `.env` với credentials mới

### Facebook OAuth:
- [ ] Update Valid OAuth Redirect URIs với domain thực
- [ ] Update Site URL với domain thực
- [ ] Chuyển app sang **Live mode**
- [ ] Thêm Privacy Policy URL (required)
- [ ] Thêm Terms of Service URL (required)
- [ ] Update `.env` với credentials mới

### Server:
- [ ] Update `SERVER_URL` in `.env`
- [ ] Update `CLIENT_URL` in `.env`
- [ ] Đảm bảo `SESSION_SECRET` là một secret key mạnh
- [ ] Enable HTTPS

---

## 🔐 Security Best Practices

1. **Không commit credentials vào Git**
   - Thêm `.env` vào `.gitignore`
   - Sử dụng environment variables

2. **Sử dụng HTTPS trong production**
   - Google và Facebook yêu cầu HTTPS
   - Không cho phép HTTP redirects

3. **Validate tokens**
   - Backend phải verify token trước khi cấp JWT
   - Set expiration time cho sessions

4. **Secure session management**
   - Sử dụng strong SESSION_SECRET
   - Enable httpOnly cookies
   - Enable secure cookies in production

---

## 📚 Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Passport.js Documentation](http://www.passportjs.org/)

---

## 🎉 Hoàn Tất!

Sau khi cấu hình xong, users có thể:
- Đăng nhập nhanh bằng Google
- Đăng nhập nhanh bằng Facebook
- Không cần nhớ password
- Profile được tự động điền từ social accounts
