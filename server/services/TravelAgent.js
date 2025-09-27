const { GoogleGenerativeAI } = require('@google/generative-ai');
const FlightsFinder = require('./FlightsFinder');
const HotelsFinder = require('./HotelsFinder');

class TravelAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const modelNames = ['gemini-2.5-pro'];
    
    let modelInitialized = false;
    for (const modelName of modelNames) {
      try {
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        console.log(`Successfully initialized with model: ${modelName}`);
        modelInitialized = true;
        break;
      } catch (error) {
        console.log(`Failed to initialize model ${modelName}:`, error.message);
      }
    }
    
    if (!modelInitialized) {
      console.error('Failed to initialize any AI model - will use fallback responses');
      this.model = null;
    }
    
    this.flightsFinder = new FlightsFinder();
    this.hotelsFinder = new HotelsFinder();
    
    this.systemPrompt = `Bạn là trợ lý du lịch AI thông minh. Tạo lịch trình du lịch chi tiết bằng tiếng Việt với HTML format đẹp.`;
  }

  buildTravelDetailsFromMetadata(metadata = {}) {
    const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : '');
    const details = {};

    const origin = sanitizeString(metadata.origin);
    if (origin) details.origin = origin;

    const destination = sanitizeString(metadata.destination);
    if (destination) details.destination = destination;

    const startDate = sanitizeString(metadata.startDate);
    if (startDate) details.departureDate = startDate;

    const endDate = sanitizeString(metadata.endDate);
    if (endDate) details.returnDate = endDate;

    const passengers = Number(metadata.travelers);
    if (Number.isFinite(passengers) && passengers > 0) {
      details.passengers = passengers;
    }

    return details;
  }

  async searchFlights(travelDetails) {
    try {
      return await this.flightsFinder.search(travelDetails);
    } catch (error) {
      console.error('Error searching flights:', error);
      return { error: error.message };
    }
  }

  async searchHotels(travelDetails) {
    try {
      return await this.hotelsFinder.search(travelDetails);
    } catch (error) {
      console.error('Error searching hotels:', error);
      return { error: error.message };
    }
  }

  async processQuery(query, threadId, metadata = {}) {
    try {
      console.log('Processing query...');
      
      const metadataDetails = this.buildTravelDetailsFromMetadata(metadata);
      
      if (!this.model) {
        console.log('AI model not available - providing fallback response');
        return this.createFallbackResponse(query, metadataDetails);
      }
      
      // Search for real data
      let hotelResults = null;
      try {
        hotelResults = await this.searchHotels(metadataDetails);
        console.log('Kết quả khách sạn:', hotelResults ? hotelResults.slice(0, 2) : 'Không có');
      } catch (error) {
        console.log('Lỗi tìm khách sạn:', error.message);
      }

      // Create simple prompt
      const simplePrompt = `Tạo lịch trình du lịch cho: "${query}"

${hotelResults && hotelResults.length > 0 ? 
`KHÁCH SẠN GỢI Ý:
${hotelResults.slice(0, 2).map(h => `- ${h.name}: ${h.rate_per_night || 'N/A'}/đêm, Rating: ${h.rating}/5`).join('\n')}` : ''}

Yêu cầu:
- Trả lời bằng tiếng Việt
- Sử dụng HTML format đơn giản
- Tối đa 500 từ để tránh timeout
- Bao gồm thông tin khách sạn thực tế nếu có`;

      console.log('Sending simple request to Gemini API...');
      
      const result = await Promise.race([
        this.model.generateContent(simplePrompt, {
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout after 20 seconds')), 20000)
        )
      ]);
      
      console.log('Received response from Gemini API');
      const response = result.response.text();
      
      console.log('Response length:', response.length);
      console.log('Response preview:', response.substring(0, 200));
      
      if (!response || response.trim().length === 0) {
        console.log('Empty response, using fallback');
        return this.createFallbackResponse(query, metadataDetails);
      }
      
      console.log('✅ Query processed successfully');
      return response;

    } catch (error) {
      console.error('Error in TravelAgent.processQuery:', error);
      
      if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        return `
        <div style="padding: 20px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
          <h3 style="color: #856404;">⏱️ Yêu cầu xử lý quá lâu</h3>
          <p style="color: #856404;">
            Xin lỗi, yêu cầu của bạn mất quá nhiều thời gian để xử lý. Vui lòng thử lại với câu hỏi ngắn gọn hơn.
          </p>
        </div>
        `;
      }
      
      if (error.message?.includes('quota') || error.message?.includes('Too Many Requests')) {
        return `
        <div style="padding: 20px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
          <h3 style="color: #856404;">🚫 Đã đạt giới hạn API</h3>
          <p style="color: #856404;">
            Đã đạt giới hạn API trong ngày. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
          </p>
        </div>
        `;
      }
      
      return `
      <div style="padding: 20px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px;">
        <h3 style="color: #721c24;">⚠️ Lỗi Hệ Thống</h3>
        <p style="color: #721c24;">
          Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.
        </p>
        <p style="color: #721c24; font-size: 14px;">
          <strong>Lỗi:</strong> ${error.message}
        </p>
      </div>
      `;
    }
  }

  createFallbackResponse(query, metadataDetails) {
    return `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #2c3e50;">🌟 Kế Hoạch Du Lịch</h2>
      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #1565c0;">📍 Yêu cầu của bạn</h3>
        <p><strong>Truy vấn:</strong> ${query}</p>
        ${metadataDetails.origin ? `<p><strong>Điểm đi:</strong> ${metadataDetails.origin}</p>` : ''}
        ${metadataDetails.destination ? `<p><strong>Điểm đến:</strong> ${metadataDetails.destination}</p>` : ''}
      </div>
      <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
        <p style="color: #ef6c00; margin: 0;">
          🔧 AI đang được cập nhật. Vui lòng thử lại sau!
        </p>
      </div>
    </div>
    `;
  }
}

module.exports = TravelAgent;