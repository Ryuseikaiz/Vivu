# 💳 Hướng dẫn lấy API Keys PayOS

PayOS là cổng thanh toán của Việt Nam hỗ trợ nhiều phương thức thanh toán như ATM, Visa, Mastercard, QR Code. Đây là hướng dẫn chi tiết để lấy API keys.

## 🚀 Bước 1: Đăng ký tài khoản PayOS

1. **Truy cập website:** [https://payos.vn](https://payos.vn)
2. **Nhấn "Đăng ký"** ở góc phải trên
3. **Điền thông tin:**
   - Email
   - Số điện thoại
   - Mật khẩu
   - Xác nhận mật khẩu
4. **Xác thực email** qua link được gửi đến hộp thư
5. **Đăng nhập** vào tài khoản

## 🏢 Bước 2: Tạo doanh nghiệp/cửa hàng

1. **Vào Dashboard** sau khi đăng nhập
2. **Nhấn "Tạo cửa hàng"** hoặc "Thêm doanh nghiệp"
3. **Điền thông tin cửa hàng:**
   - Tên cửa hàng: "AI Travel Agent"
   - Loại hình kinh doanh: "Dịch vụ du lịch" hoặc "Công nghệ thông tin"
   - Địa chỉ
   - Mã số thuế (nếu có)
   - Website: http://localhost:3000 (development)
4. **Upload giấy tờ** (nếu yêu cầu):
   - CMND/CCCD
   - Giấy phép kinh doanh (nếu có)
5. **Chờ duyệt** (thường 1-2 ngày làm việc)

## 🔑 Bước 3: Lấy API Keys

### Sau khi tài khoản được duyệt:

1. **Đăng nhập PayOS Dashboard**
2. **Vào mục "Cài đặt"** hoặc "Settings"
3. **Chọn "API Keys"** hoặc "Tích hợp"
4. **Tạo API Key mới:**
   - Nhấn "Tạo API Key"
   - Đặt tên: "AI Travel Agent API"
   - Chọn quyền: "Thanh toán" và "Webhook"
5. **Copy các thông tin sau:**

```env
PAYOS_CLIENT_ID=your_client_id_here
PAYOS_API_KEY=your_api_key_here
PAYOS_CHECKSUM_KEY=your_checksum_key_here
```

## 🧪 Bước 4: Test Mode vs Live Mode

### Test Mode (Development)

- Sử dụng cho development và testing
- Không có giao dịch thật
- Có thể test với thẻ demo

### Live Mode (Production)

- Sử dụng cho production
- Giao dịch thật với tiền thật
- Cần tài khoản đã được verify đầy đủ

## 📱 Bước 5: Cấu hình Webhook (Tùy chọn)

1. **Vào "Webhook Settings"**
2. **Thêm Webhook URL:**
   - Development: `http://localhost:5000/api/payment/webhook`
   - Production: `https://yourdomain.com/api/payment/webhook`
3. **Chọn events:**
   - Payment Success
   - Payment Failed
   - Payment Cancelled
4. **Lưu cấu hình**

## 🔧 Bước 6: Cấu hình trong ứng dụng

Cập nhật file `.env`:

```env
# PayOS Configuration
PAYOS_CLIENT_ID=POS_12345678
PAYOS_API_KEY=your_32_character_api_key
PAYOS_CHECKSUM_KEY=your_64_character_checksum_key
CLIENT_URL=http://localhost:3000
```

## 🧪 Bước 7: Test thanh toán

1. **Chạy ứng dụng:**

   ```bash
   npm run dev
   ```

2. **Đăng ký tài khoản test**

3. **Thử mua subscription:**

   - Chọn gói tháng/năm
   - Nhấn "Đăng ký ngay"
   - Sẽ redirect đến PayOS

4. **Test với thẻ demo** (Test mode):
   - Số thẻ: 4111111111111111
   - CVV: 123
   - Expiry: 12/25

## 📋 Thông tin cần thiết

### Để lấy được API Keys, bạn cần:

✅ **Thông tin cá nhân:**

- CMND/CCCD
- Số điện thoại
- Email

✅ **Thông tin doanh nghiệp:**

- Tên cửa hàng
- Địa chỉ kinh doanh
- Mã số thuế (nếu có)
- Website/app

✅ **Tài liệu (có thể yêu cầu):**

- Giấy phép kinh doanh
- Hợp đồng thuê mặt bằng
- Ảnh cửa hàng

## 💰 Phí giao dịch PayOS

| Phương thức     | Phí giao dịch    |
| --------------- | ---------------- |
| ATM nội địa     | 1.1% + 1,100 VND |
| Visa/Mastercard | 2.9% + 2,200 VND |
| QR Code         | 0.8% + 800 VND   |
| Ví điện tử      | 1.5% + 1,500 VND |

## 🚨 Troubleshooting

### Lỗi "Invalid API Key"

- Kiểm tra CLIENT_ID, API_KEY, CHECKSUM_KEY
- Đảm bảo copy đúng từ PayOS dashboard
- Kiểm tra mode (test vs live)

### Lỗi "Merchant not found"

- Tài khoản chưa được duyệt
- Liên hệ support PayOS

### Lỗi "Invalid signature"

- Sai CHECKSUM_KEY
- Kiểm tra format dữ liệu gửi lên

### Webhook không hoạt động

- Kiểm tra URL webhook
- Đảm bảo server accessible từ internet
- Check firewall settings

## 📞 Hỗ trợ PayOS

- **Website:** [https://payos.vn](https://payos.vn)
- **Email:** support@payos.vn
- **Hotline:** 1900 6173
- **Telegram:** @payos_support
- **Documentation:** [https://payos.vn/docs](https://payos.vn/docs)

## 🔐 Bảo mật

- ❌ Không commit API keys vào git
- ✅ Sử dụng environment variables
- ✅ Rotate keys định kỳ
- ✅ Monitor giao dịch bất thường
- ✅ Sử dụng HTTPS cho webhook
- ✅ Validate signature từ PayOS

## 📈 Nâng cấp tài khoản

### Tài khoản cá nhân

- Giới hạn: 50 triệu VND/tháng
- Phí rút tiền: 11,000 VND/lần

### Tài khoản doanh nghiệp

- Không giới hạn giao dịch
- Phí rút tiền thấp hơn
- Hỗ trợ ưu tiên

## 💡 Tips

1. **Development:** Dùng test mode trước
2. **Production:** Verify đầy đủ thông tin
3. **Security:** Luôn validate webhook signature
4. **UX:** Handle các trường hợp thanh toán failed/cancelled
5. **Monitoring:** Log tất cả giao dịch để debug
