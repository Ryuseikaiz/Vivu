# ✈️🌍 AI Travel Agent - React Version 🏨🗺️

Ứng dụng AI Travel Agent được chuyển đổi từ Python/Streamlit sang ReactJS với backend Express.js. Ứng dụng sử dụng AI để tìm kiếm chuyến bay và khách sạn, sau đó có thể gửi thông tin qua email.

## 🚀 Tính năng

- **Giao diện React hiện đại**: UI responsive và thân thiện với người dùng
- **Hệ thống đăng ký/đăng nhập**: JWT authentication với MongoDB
- **Subscription model**: Gói tháng/năm với PayOS payment gateway
- **Dùng thử miễn phí**: 1 lần tìm kiếm miễn phí cho người dùng mới
- **AI Agent thông minh**: Sử dụng Google Gemini 2.0 Flash để xử lý truy vấn du lịch
- **Tìm kiếm chuyến bay**: Tích hợp với Google Flights API qua SerpAPI
- **Tìm kiếm khách sạn**: Tích hợp với Google Hotels API qua SerpAPI
- **Gửi email tự động**: Sử dụng SMTP (Gmail, Outlook, v.v.) để gửi thông tin du lịch
- **Bảo mật**: Rate limiting, helmet security, input validation
- **Mock data**: Hoạt động với dữ liệu mẫu khi không có API keys

## 📋 Yêu cầu

- Node.js (v16 trở lên)
- npm hoặc yarn
- Internet connection (MongoDB Atlas đã setup sẵn)
- Google Gemini API key (bắt buộc)
- PayOS account và API keys (bắt buộc cho payment)
- SerpAPI key (tùy chọn - sẽ dùng dữ liệu mẫu nếu không có)
- SMTP credentials (tùy chọn - sẽ mô phỏng gửi email nếu không có)

## 🚀 Quick Start

Xem file [QUICK_START.md](QUICK_START.md) để setup nhanh trong 15 phút!

## 🛠️ Cài đặt chi tiết

### 1. Clone repository

\`\`\`bash
git clone <repository-url>
cd ai-travel-agent-react
\`\`\`

### 2. Cài đặt dependencies cho frontend

\`\`\`bash
npm install
\`\`\`

### 3. Cài đặt dependencies cho backend

\`\`\`bash
cd server
npm install
cd ..
\`\`\`

### 4. Cấu hình environment variables

\`\`\`bash
cp .env.example .env
\`\`\`

Chỉnh sửa file `.env` và thêm các API keys của bạn:
\`\`\`

# Required

GEMINI_API_KEY=AIzaSyB5P5XABrXOTVv5vWZEroeKgvKZTcDkKzI
MONGODB_URI=mongodb+srv://Kaikun:Kaikun@tiendat.1rokfhy.mongodb.net/vivu
JWT_SECRET=your_super_secret_jwt_key_here

# PayOS (Required for payments)

PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
CLIENT_URL=http://localhost:3000

# Optional

SERPAPI_API_KEY=your_serpapi_key_here

# SMTP for email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
\`\`\`

### 5. MongoDB Atlas (Đã cấu hình sẵn)

MongoDB Atlas cluster đã được setup sẵn. Xem chi tiết trong [MONGODB_INFO.md](MONGODB_INFO.md)

**Thông tin:**
- **Cluster**: tiendat.1rokfhy.mongodb.net
- **Database**: vivu
- **User**: Kaikun
- **Connection string đã có trong .env.example**

### 6. Cấu hình PayOS

Xem hướng dẫn chi tiết trong file [PAYOS_SETUP.md](PAYOS_SETUP.md)

**Tóm tắt:**
1. Đăng ký tài khoản tại [PayOS](https://payos.vn)
2. Tạo cửa hàng và chờ duyệt (1-2 ngày)
3. Lấy API credentials từ dashboard
4. Cập nhật các keys vào file .env

### 7. Cấu hình SMTP (Tùy chọn)

**Gmail SMTP:**
1. Bật 2-Factor Authentication cho Gmail
2. Tạo App Password: Google Account → Security → App passwords
3. Sử dụng App Password thay vì mật khẩu thường

**Outlook SMTP:**
- Host: smtp-mail.outlook.com
- Port: 587
- Secure: false

**Yahoo SMTP:**
- Host: smtp.mail.yahoo.com  
- Port: 587
- Secure: false

**Hoặc sử dụng SMTP server tùy chỉnh của bạn**

## 🚀 Chạy ứng dụng

### Development mode

1. **Chạy backend server:**
   \`\`\`bash
   cd server
   npm run dev
   \`\`\`
   Server sẽ chạy trên http://localhost:5000

2. **Chạy React frontend (terminal mới):**
   \`\`\`bash
   npm start
   \`\`\`
   Frontend sẽ chạy trên http://localhost:3000

### Production mode

1. **Build React app:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Chạy production server:**
   \`\`\`bash
   cd server
   npm start
   \`\`\`

## 📖 Cách sử dụng

1. **Đăng ký tài khoản**: Mở http://localhost:3000 và đăng ký tài khoản mới
2. **Dùng thử miễn phí**: Người dùng mới được 1 lần tìm kiếm miễn phí
3. **Đăng ký subscription**: Chọn gói tháng (99,000 VND) hoặc gói năm (990,000 VND)
4. **Thanh toán**: Thanh toán an toàn qua PayOS (ATM, Visa, Mastercard, QR Code)
5. **Sử dụng dịch vụ**: Nhập truy vấn du lịch, ví dụ:
   > "Tôi muốn đi du lịch từ Hà Nội đến Tokyo từ ngày 1-7 tháng 12. Tìm cho tôi chuyến bay và khách sạn 4 sao."
6. **Xem kết quả**: Thông tin chuyến bay và khách sạn với hình ảnh và links
7. **Gửi email**: Tùy chọn gửi thông tin qua email

## 🏗️ Cấu trúc project

\`\`\`
ai-travel-agent-react/
├── public/ # Static files
├── src/ # React source code
│ ├── components/ # React components
│ ├── App.js # Main App component
│ └── index.js # Entry point
├── server/ # Backend Express.js
│ ├── services/ # Business logic services
│ │ ├── TravelAgent.js # Main AI agent
│ │ ├── FlightsFinder.js # Flight search service
│ │ ├── HotelsFinder.js # Hotel search service
│ │ └── EmailService.js # Email service
│ └── server.js # Express server
├── package.json # Frontend dependencies
└── README.md
\`\`\`

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/refresh` - Refresh token

### Payment

- `GET /api/payment/plans` - Lấy danh sách gói subscription
- `POST /api/payment/create-payment` - Tạo link thanh toán
- `POST /api/payment/verify-payment` - Xác minh thanh toán
- `POST /api/payment/webhook` - PayOS webhook
- `GET /api/payment/history` - Lịch sử thanh toán

### Travel (Protected)

- `POST /api/travel/search` - Tìm kiếm thông tin du lịch
- `POST /api/travel/send-email` - Gửi email thông tin du lịch

### System

- `GET /api/health` - Health check

## 🌟 Tính năng nổi bật

- **Authentication System**: JWT-based với MongoDB storage
- **Subscription Model**: Freemium với trial + paid plans
- **Payment Integration**: PayOS gateway hỗ trợ nhiều phương thức
- **Security**: Rate limiting, input validation, helmet protection
- **Responsive Design**: Giao diện thích ứng với mọi thiết bị
- **Loading States**: Hiển thị trạng thái loading khi xử lý
- **Error Handling**: Xử lý lỗi một cách graceful
- **Mock Data**: Hoạt động ngay cả khi không có API keys
- **Session Management**: Quản lý session cho việc gửi email
- **Clean Architecture**: Code được tổ chức rõ ràng và dễ maintain

## 💰 Pricing

- **Dùng thử**: 1 lần tìm kiếm miễn phí cho người dùng mới
- **Gói tháng**: 99,000 VND/tháng - Truy cập không giới hạn
- **Gói năm**: 990,000 VND/năm - Tiết kiệm 2 tháng (16.7% discount)

## 📝 Ghi chú

- **Bắt buộc**: Google Gemini API key, MongoDB, PayOS credentials, JWT secret
- **Tùy chọn**: SerpAPI key (dùng mock data nếu không có), SMTP credentials (simulate email nếu không có)
- **Database**: Tự động tạo collections khi chạy lần đầu
- **Payment**: Test mode có sẵn trong PayOS dashboard
- **Security**: Đổi JWT_SECRET trong production
- **Scaling**: Sử dụng Redis cho session storage trong production

## 🔒 Bảo mật

- JWT authentication với expiry
- Password hashing với bcrypt
- Rate limiting cho API calls
- Input validation với Joi
- Helmet.js cho HTTP security headers
- CORS configuration
- Environment variables cho sensitive data

## 🤖 Cấu hình Google Gemini

Xem file [GEMINI_SETUP.md](GEMINI_SETUP.md) để biết chi tiết cách lấy API key từ Google AI Studio.

**Quick setup:**
1. Vào [Google AI Studio](https://aistudio.google.com)
2. Đăng nhập và tạo API key
3. Enable Generative AI API
4. Cập nhật .env với Gemini API key

## 💳 Cấu hình PayOS

Xem file [PAYOS_SETUP.md](PAYOS_SETUP.md) để biết chi tiết cách lấy API keys từ PayOS.

**Quick setup:**
1. Đăng ký tài khoản tại [PayOS.vn](https://payos.vn)
2. Tạo cửa hàng và chờ duyệt
3. Lấy API keys từ dashboard
4. Cập nhật .env với thông tin PayOS

## 📧 Cấu hình Email

Xem file [SMTP_SETUP.md](SMTP_SETUP.md) để biết chi tiết cách cấu hình SMTP với các nhà cung cấp khác nhau (Gmail, Outlook, Yahoo, v.v.)

**Quick setup với Gmail:**
1. Bật 2-Factor Authentication
2. Tạo App Password
3. Cập nhật .env với thông tin SMTP

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.
