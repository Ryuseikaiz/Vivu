# 📧 Hướng dẫn cấu hình SMTP

Ứng dụng AI Travel Agent sử dụng SMTP để gửi email thông tin du lịch. Bạn có thể sử dụng các nhà cung cấp SMTP miễn phí hoặc trả phí.

## 🆓 SMTP Miễn phí

### 1. Gmail SMTP (Khuyến nghị)

**Ưu điểm:**
- Miễn phí
- Ổn định và đáng tin cậy
- Giới hạn: 500 emails/ngày

**Cấu hình:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Cách tạo App Password:**
1. Đăng nhập Gmail → Google Account
2. Security → 2-Step Verification (bật nếu chưa có)
3. Security → App passwords
4. Chọn "Mail" và thiết bị của bạn
5. Copy mật khẩu 16 ký tự và dùng làm SMTP_PASS

### 2. Outlook/Hotmail SMTP

**Cấu hình:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

**Lưu ý:** Có thể cần bật "Less secure app access"

### 3. Yahoo SMTP

**Cấu hình:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
```

**Cách tạo App Password:**
1. Yahoo Account Security
2. Generate app password
3. Chọn "Other app" và nhập tên
4. Sử dụng mật khẩu được tạo

## 💼 SMTP Trả phí (Cho Production)

### 1. Amazon SES
- Giá: $0.10/1000 emails
- Độ tin cậy cao
- Tích hợp AWS

### 2. Mailgun
- Free: 5,000 emails/tháng đầu
- Sau đó: $0.80/1000 emails

### 3. SendinBlue (Brevo)
- Free: 300 emails/ngày
- Paid plans từ $25/tháng

## 🔧 Cấu hình Custom SMTP

Nếu bạn có SMTP server riêng:

```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587  # hoặc 465 cho SSL
SMTP_SECURE=false  # true nếu dùng port 465
SMTP_USER=your_username
SMTP_PASS=your_password
```

## 🛠️ Test SMTP Configuration

Sau khi cấu hình, bạn có thể test bằng cách:

1. Chạy server: `npm run dev`
2. Đăng ký tài khoản mới
3. Thực hiện tìm kiếm du lịch
4. Thử gửi email kết quả

Nếu cấu hình đúng, email sẽ được gửi thành công. Nếu không, check console log để debug.

## 🚨 Troubleshooting

### Lỗi "Authentication failed"
- Kiểm tra username/password
- Đảm bảo đã bật App Password (Gmail/Yahoo)
- Kiểm tra 2FA settings

### Lỗi "Connection timeout"
- Kiểm tra SMTP_HOST và SMTP_PORT
- Kiểm tra firewall/network

### Lỗi "Self signed certificate"
- Thêm `rejectUnauthorized: false` trong config (chỉ development)

### Gmail "Less secure app access"
- Gmail đã ngừng hỗ trợ, phải dùng App Password
- Bật 2-Factor Authentication trước

## 📊 Giới hạn gửi email

| Provider | Free Limit | Paid |
|----------|------------|------|
| Gmail | 500/ngày | N/A |
| Outlook | 300/ngày | N/A |
| Yahoo | 500/ngày | N/A |
| Amazon SES | 200/ngày (free tier) | $0.10/1000 |
| Mailgun | 5,000/tháng | $0.80/1000 |

## 💡 Tips

1. **Development**: Dùng Gmail SMTP
2. **Production**: Chuyển sang service chuyên nghiệp (SES, Mailgun)
3. **Backup**: Cấu hình multiple SMTP providers
4. **Monitoring**: Log email status để debug
5. **Security**: Không commit SMTP credentials vào git

## 🔐 Bảo mật

- Luôn dùng App Password thay vì mật khẩu chính
- Bật 2FA cho email account
- Sử dụng environment variables
- Rotate passwords định kỳ
- Monitor email usage để phát hiện abuse