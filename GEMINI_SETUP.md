# 🤖 Hướng dẫn lấy Google Gemini API Key

Google Gemini 2.0 Flash là model AI mới nhất của Google, có performance tốt và giá rẻ hơn nhiều so với OpenAI GPT-4. Đây là hướng dẫn chi tiết để lấy API key.

## 🚀 Bước 1: Truy cập Google AI Studio

1. **Mở trình duyệt** và vào [Google AI Studio](https://aistudio.google.com)
2. **Đăng nhập** bằng tài khoản Google của bạn
3. **Chấp nhận** Terms of Service nếu được yêu cầu

## 🔑 Bước 2: Tạo API Key

1. **Nhấn "Get API Key"** ở góc phải trên
2. **Chọn "Create API key"**
3. **Chọn Google Cloud Project:**
   - Nếu chưa có: Chọn "Create new project"
   - Nếu đã có: Chọn project hiện tại
4. **Đặt tên project:** "AI Travel Agent" (nếu tạo mới)
5. **Nhấn "Create"**
6. **Copy API Key** có format: `AIzaSy...`

## 🔧 Bước 3: Enable Gemini API

1. **Vào Google Cloud Console:** [console.cloud.google.com](https://console.cloud.google.com)
2. **Chọn project** vừa tạo
3. **APIs & Services** → **Library**
4. **Tìm "Generative AI"** hoặc "Gemini"
5. **Enable** Generative Language API
6. **Enable** AI Platform API (nếu có)

## 💰 Bước 4: Kiểm tra Billing (Tùy chọn)

### Free Tier (Khuyến nghị cho development)
- **15 requests/minute**
- **1,500 requests/day**
- **1 million tokens/month** (rất nhiều!)
- **Miễn phí hoàn toàn**

### Paid Tier (Cho production)
- **Gemini 2.0 Flash:** $0.075/1M input tokens, $0.30/1M output tokens
- **Rẻ hơn GPT-4 khoảng 10-20 lần**
- **Unlimited requests**

## ⚙️ Bước 5: Cấu hình trong ứng dụng

Cập nhật file `.env`:

```env
# Google Gemini API Key
GEMINI_API_KEY=AIzaSyB5P5XABrXOTVv5vWZEroeKgvKZTcDkKzI
```

## 🧪 Bước 6: Test API Key

Tạo file test đơn giản:

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('YOUR_API_KEY');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

async function test() {
  try {
    const result = await model.generateContent('Hello, how are you?');
    console.log(result.response.text());
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
```

## 🌟 Ưu điểm của Gemini 2.0 Flash

### 💰 **Chi phí**
- **Free tier:** 1M tokens/month miễn phí
- **Paid:** $0.075/1M tokens (rẻ hơn GPT-4 nhiều lần)

### ⚡ **Performance**
- **Tốc độ:** Nhanh hơn GPT-4
- **Context window:** 1M tokens (rất lớn)
- **Multimodal:** Hỗ trợ text, image, audio, video

### 🔧 **Tính năng**
- **Function calling:** Có thể gọi functions
- **JSON mode:** Output structured data
- **Code generation:** Tốt cho coding tasks
- **Multilingual:** Hỗ trợ tiếng Việt tốt

## 🚨 Troubleshooting

### Lỗi "API key not valid"
- Kiểm tra API key đã copy đúng
- Đảm bảo không có space thừa
- Key phải bắt đầu bằng `AIza`

### Lỗi "Quota exceeded"
- Đã vượt quá 15 requests/minute
- Chờ 1 phút rồi thử lại
- Hoặc upgrade lên paid tier

### Lỗi "API not enabled"
- Vào Google Cloud Console
- Enable Generative Language API
- Chờ vài phút để propagate

### Lỗi "Billing not enabled"
- Chỉ cần nếu muốn dùng paid tier
- Free tier không cần billing
- Add payment method trong Cloud Console

## 📊 So sánh với OpenAI

| Feature | Gemini 2.0 Flash | GPT-4 |
|---------|------------------|-------|
| **Free tier** | 1M tokens/month | $5 credit (hết nhanh) |
| **Paid price** | $0.075/1M tokens | $10-30/1M tokens |
| **Speed** | Rất nhanh | Chậm hơn |
| **Context** | 1M tokens | 128K tokens |
| **Multimodal** | Text, image, audio, video | Text, image |
| **Vietnamese** | Rất tốt | Tốt |

## 🔐 Bảo mật

- ❌ Không commit API key vào git
- ✅ Sử dụng environment variables
- ✅ Restrict API key theo domain (production)
- ✅ Monitor usage để phát hiện abuse
- ✅ Rotate key định kỳ

## 📈 Monitoring Usage

1. **Google Cloud Console** → **APIs & Services** → **Credentials**
2. **Nhấn vào API key** để xem usage
3. **Quotas** để xem limits
4. **Billing** để xem costs (nếu có)

## 💡 Tips

1. **Development:** Dùng free tier là đủ
2. **Production:** Consider paid tier cho unlimited
3. **Caching:** Cache responses để tiết kiệm quota
4. **Batch requests:** Gộp nhiều requests lại
5. **Error handling:** Handle rate limits gracefully

## 🔄 Migration từ OpenAI

Nếu đang dùng OpenAI, chỉ cần:

1. **Thay dependency:**
   ```bash
   npm uninstall openai
   npm install @google/generative-ai
   ```

2. **Update code:**
   ```javascript
   // Old OpenAI
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   const response = await openai.chat.completions.create({...});
   
   // New Gemini
   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
   const result = await model.generateContent(prompt);
   ```

3. **Update prompts:** Gemini có thể cần adjust prompts một chút

## 📞 Hỗ trợ

- **Documentation:** [ai.google.dev](https://ai.google.dev)
- **GitHub:** [google-gemini/generative-ai-js](https://github.com/google-gemini/generative-ai-js)
- **Stack Overflow:** Tag `google-gemini`
- **Google Cloud Support:** Cho paid customers

## 🎯 Best Practices

1. **Prompt engineering:** Gemini thích prompts rõ ràng, cụ thể
2. **Temperature:** 0.1-0.3 cho factual, 0.7-0.9 cho creative
3. **Max tokens:** Set reasonable limits
4. **Retry logic:** Handle temporary failures
5. **Fallback:** Have backup plan nếu API down

Chúc bạn thành công với Gemini! 🚀