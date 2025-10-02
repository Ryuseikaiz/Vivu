# Hướng Dẫn Cài Đặt Google Drive API

Tài liệu này hướng dẫn cách cấu hình Google Drive API để upload ảnh lên Google Drive.

## 🔐 Các Phương Thức Xác Thực

### **Phương Thức 1: Service Account (Khuyên Dùng Cho Production)**

Service Account phù hợp cho ứng dụng server-side và không yêu cầu tương tác người dùng.

#### Bước 1: Tạo Service Account

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** → **Enable APIs and Services**
4. Tìm và enable **Google Drive API**
5. Vào **APIs & Services** → **Credentials**
6. Click **Create Credentials** → **Service Account**
7. Điền thông tin:
   - Service account name: `vivu-drive-uploader`
   - Service account ID: tự động generate
   - Click **Create and Continue**
8. Không cần grant permissions, click **Continue**
9. Click **Done**

#### Bước 2: Tạo và Download Key

1. Trong danh sách Service Accounts, click vào service account vừa tạo
2. Vào tab **Keys**
3. Click **Add Key** → **Create new key**
4. Chọn **JSON** format
5. Click **Create** → file JSON sẽ được download

#### Bước 3: Cấu Hình .env

Mở file JSON vừa download, copy các giá trị:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=vivu-drive-uploader@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...your-key-here...\n-----END PRIVATE KEY-----\n"
```

**Lưu ý:** Private key phải giữ nguyên format với `\n` cho line breaks.

#### Bước 4: Share Google Drive Folder

1. Tạo folder trong Google Drive để lưu ảnh
2. Right-click folder → **Share**
3. Thêm email của Service Account (từ JSON file)
4. Cấp quyền **Editor**
5. Copy Folder ID từ URL: `https://drive.google.com/drive/folders/[FOLDER_ID]`
6. Thêm vào `.env`:

```env
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
```

---

### **Phương Thức 2: OAuth2 (Cho Personal Use)**

Phù hợp cho development và testing với tài khoản cá nhân.

#### Bước 1: Tạo OAuth2 Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Drive API** (như phương thức 1)
3. Vào **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Nếu chưa có OAuth consent screen:
   - Click **Configure Consent Screen**
   - Chọn **External**
   - Điền thông tin cơ bản
   - Thêm scope: `../auth/drive.file`
6. Chọn **Application type**: **Web application**
7. Thêm **Authorized redirect URIs**: `http://localhost:5000/oauth2callback`
8. Click **Create**
9. Copy **Client ID** và **Client Secret**

#### Bước 2: Lấy Refresh Token

Tạo file `get-refresh-token.js` trong thư mục `server/`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:5000/oauth2callback'
);

const scopes = ['https://www.googleapis.com/auth/drive.file'];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});

console.log('Authorize this app by visiting this url:', url);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Your refresh token is:', token.refresh_token);
  });
});
```

Chạy: `node get-refresh-token.js`

#### Bước 3: Cấu Hình .env

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_REDIRECT_URI=http://localhost:5000
```

---

### **Phương Thức 3: API Key (Giới Hạn)**

**Lưu ý:** API Key chỉ cho phép đọc file public, không thể upload.

1. Vào **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API key**
3. Copy API key
4. Thêm vào `.env`:

```env
GOOGLE_DRIVE_API_KEY=your-api-key
```

---

## 📝 Cấu Hình Hoàn Chỉnh

File `.env` cuối cùng (chọn 1 trong 3 phương thức):

```env
# Phương thức 1: Service Account (Khuyên dùng)
GOOGLE_SERVICE_ACCOUNT_EMAIL=vivu-drive-uploader@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Hoặc Phương thức 2: OAuth2
# GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=your-client-secret
# GOOGLE_REFRESH_TOKEN=your-refresh-token
# GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Hoặc Phương thức 3: API Key (không khuyên dùng)
# GOOGLE_DRIVE_API_KEY=your-api-key
```

---

## 🧪 Test Upload

### Test với Postman:

**1. Upload Single Image:**
```
POST http://localhost:5000/api/upload/image
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
Body (form-data):
  image: [select file]
```

**2. Upload Multiple Images:**
```
POST http://localhost:5000/api/upload/images
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
Body (form-data):
  images: [select multiple files]
```

**3. Upload Base64:**
```
POST http://localhost:5000/api/upload/base64
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body (raw JSON):
{
  "imageData": "data:image/png;base64,iVBORw0KG...",
  "fileName": "test-image.png"
}
```

---

## 🔍 Troubleshooting

### Lỗi: "Google Drive not configured"
- Kiểm tra xem đã thêm credentials vào `.env` chưa
- Restart server sau khi cập nhật `.env`

### Lỗi: "Permission denied"
- Với Service Account: Kiểm tra đã share folder với service account email chưa
- Với OAuth2: Kiểm tra refresh token còn valid không

### Lỗi: "Invalid credentials"
- Private key phải giữ nguyên format với `\n`
- Đảm bảo không có space thừa trong credentials

### File không hiển thị trên Drive
- Kiểm tra `GOOGLE_DRIVE_FOLDER_ID` có đúng không
- Kiểm tra permissions của folder

---

## 📚 API Endpoints

### Upload Image
- **POST** `/api/upload/image` - Upload 1 ảnh
- **POST** `/api/upload/images` - Upload nhiều ảnh
- **POST** `/api/upload/base64` - Upload ảnh từ base64
- **DELETE** `/api/upload/:fileId` - Xóa ảnh

### Response Format:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://drive.google.com/uc?export=view&id=FILE_ID",
    "fileId": "FILE_ID",
    "fileName": "1234567890-image.jpg",
    "webViewLink": "https://drive.google.com/file/d/FILE_ID/view"
  }
}
```

---

## 🎯 Tích Hợp Vào Blog Component

Xem file `BlogImageUploadExample.js` để tham khảo cách sử dụng trong React component.
