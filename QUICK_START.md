# 🚀 Quick Start Guide

Hướng dẫn nhanh để chạy AI Travel Agent trong 15 phút.

## ✅ Checklist chuẩn bị

- [ ] Node.js v16+ đã cài đặt
- [ ] Internet connection (MongoDB Atlas đã setup sẵn)
- [ ] Tài khoản Google Cloud (có Gemini API key)
- [ ] Tài khoản PayOS (có API keys)
- [ ] Email Gmail (để làm SMTP)

## 🏃‍♂️ Bước 1: Clone và cài đặt (2 phút)

```bash
# Clone repository
git clone <repository-url>
cd ai-travel-agent-react

# Cài đặt dependencies
npm run install-all
```

## 🔑 Bước 2: Lấy API Keys (10 phút)

### Google Gemini API Key (2 phút)
1. Vào [Google AI Studio](https://aistudio.google.com)
2. Đăng nhập với Google account
3. Nhấn "Get API Key" → Create API key
4. Copy key: `AIza...`

### PayOS API Keys (5 phút)
1. Đăng ký tại [payos.vn](https://payos.vn)
2. Tạo cửa hàng "AI Travel Agent"
3. Chờ duyệt (có thể dùng test mode ngay)
4. Lấy 3 keys từ dashboard:
   - CLIENT_ID: `POS_...`
   - API_KEY: `32 ký tự`
   - CHECKSUM_KEY: `64 ký tự`

### Gmail SMTP (3 phút)
1. Bật 2-Factor Authentication
2. Google Account → Security → App passwords
3. Tạo app password cho "Mail"
4. Copy 16-digit password

## ⚙️ Bước 3: Cấu hình .env (1 phút)

```bash
# Copy file mẫu
cp .env.example .env
```

Cập nhật `.env`:
```env
# Required
GEMINI_API_KEY=AIzaSyB5P5XABrXOTVv5vWZEroeKgvKZTcDkKzI
MONGODB_URI=mongodb+srv://Kaikun:Kaikun@tiendat.1rokfhy.mongodb.net/vivu
JWT_SECRET=your_super_secret_jwt_key_here

# PayOS
PAYOS_CLIENT_ID=POS_12345678
PAYOS_API_KEY=your_32_character_api_key
PAYOS_CHECKSUM_KEY=your_64_character_checksum_key
CLIENT_URL=http://localhost:3000

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
```

## 🚀 Bước 4: Chạy ứng dụng (1 phút)

```bash
# Chạy cả frontend và backend
npm run dev
```

Hoặc chạy riêng:
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend  
npm start
```

## 🎉 Bước 5: Test ứng dụng (1 phút)

1. Mở http://localhost:3000
2. Đăng ký tài khoản mới
3. Thử tìm kiếm: "Tôi muốn đi Tokyo từ Hà Nội"
4. Test thanh toán subscription
5. Test gửi email

## 🐛 Troubleshooting

### MongoDB không kết nối được
- MongoDB Atlas đã được setup sẵn
- Kiểm tra internet connection
- Đảm bảo IP được whitelist trong MongoDB Atlas
- Connection string: `mongodb+srv://Kaikun:Kaikun@tiendat.1rokfhy.mongodb.net/vivu`

### Gemini API lỗi
- Kiểm tra API key đúng format `AIza...`
- Đảm bảo đã enable Gemini API trong Google Cloud Console
- Check quota limits (Gemini có free tier rất hào phóng)

### PayOS lỗi
- Dùng test mode nếu chưa được duyệt
- Kiểm tra 3 keys đã copy đúng
- CLIENT_URL phải match với redirect URL

### SMTP lỗi
- Đảm bảo đã bật 2FA cho Gmail
- Dùng App Password, không phải mật khẩu thường
- Check firewall không block port 587

### Frontend không load
```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📱 Test với dữ liệu mẫu

Nếu chưa có SerpAPI key, app sẽ dùng mock data:
- Chuyến bay: Hà Nội → Tokyo
- Khách sạn: Tokyo hotels
- Giá cả: Mẫu VND/USD

## 🔄 Cập nhật production

1. **Domain và SSL:**
   ```env
   CLIENT_URL=https://yourdomain.com
   ```

2. **MongoDB Atlas:**
   ```env
   MONGODB_URI=mongodb+srv://...
   ```

3. **PayOS Live Mode:**
   - Chuyển từ test sang live
   - Update webhook URL

4. **SMTP Production:**
   - Chuyển sang Amazon SES hoặc Mailgun
   - Tăng rate limits

## 📊 Monitoring

Check logs để debug:
```bash
# Backend logs
cd server && npm run dev

# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# PayOS webhook logs
# Check console trong /api/payment/webhook
```

## 🎯 Next Steps

- [ ] Thêm SerpAPI key cho real flight/hotel data
- [ ] Customize UI/branding
- [ ] Add more payment methods
- [ ] Setup monitoring (Sentry, LogRocket)
- [ ] Deploy to production (Vercel, Railway, AWS)

## 💡 Pro Tips

1. **Development:** Dùng test mode cho PayOS
2. **Security:** Đổi JWT_SECRET trong production  
3. **Performance:** Add Redis cho session storage
4. **SEO:** Add meta tags và sitemap
5. **Analytics:** Integrate Google Analytics

Chúc bạn thành công! 🎉