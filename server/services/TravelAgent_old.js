const { GoogleGenerativeAI } = require('@google/generative-ai');
const FlightsFinder = require('./FlightsFinder');
const HotelsFinder = require('./HotelsFinder');

class TravelAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use the most stable model name with explicit configuration
    try {
      this.model = this.genAI.getGenerativeModel({ 
        model: 'models/gemini-1.5-flash-latest'
      });
      console.log('Successfully initialized with model: models/gemini-1.5-flash-latest');
    } catch (error) {
      console.error('Failed to initialize gemini-1.5-flash-latest model:', error.message);
      // Try fallback model
      try {
        this.model = this.genAI.getGenerativeModel({ 
          model: 'models/gemini-pro'
        });
        console.log('Successfully initialized with model: models/gemini-pro');
      } catch (fallbackError) {
        console.error('Failed to initialize any model:', fallbackError.message);
        throw new Error('Failed to initialize AI model');
      }
    }
    
    this.flightsFinder = new FlightsFinder();
    this.hotelsFinder = new HotelsFinder();
    
    this.systemPrompt = `You are a smart travel agency AI assistant. Your task is to help users find travel information including flights, hotels, and local restaurants/eateries.

INSTRUCTIONS:
- You are allowed to make multiple searches (either together or in sequence)
- If the user asks for suggestions nearby, you can ask for their current location to provide better recommendations.
- Based on the user's current location or their travel destination, suggest popular restaurants and eateries.
- Only look up information when you are sure of what you want
- The current year is ${new Date().getFullYear()}
- Always include links to hotels websites, flights websites, and restaurant websites/menus when possible.
- Include logos of hotels, airline companies, and photos of restaurants/food when available.
- Always include prices in the local currency and USD when possible
- Format your response in clean HTML for better presentation

PRICING FORMAT EXAMPLE:
For hotels: Rate: $581 per night, Total: $3,488
For flights: Price: $850 USD
For restaurants: Price range: $10 - $50

RESPONSE FORMAT:
- Use proper HTML structure with headings, lists, and styling
- Include images for airline logos, hotel photos, and restaurant/food photos
- Provide clickable links for booking or viewing menus
- Show clear pricing information
- Use Vietnamese language for user-facing content

Remember to be helpful, accurate, and provide comprehensive travel and dining information.`;
  }

  buildTravelDetailsFromMetadata(metadata = {}) {
    const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : '');
    const details = {};

    const origin = sanitizeString(metadata.origin);
    if (origin) {
      details.origin = origin;
    }

    const destination = sanitizeString(metadata.destination);
    if (destination) {
      details.destination = destination;
    }

    const startDate = sanitizeString(metadata.startDate);
    if (startDate) {
      details.departureDate = startDate;
    }

    const endDate = sanitizeString(metadata.endDate);
    if (endDate) {
      details.returnDate = endDate;
    }

    const passengers = Number(metadata.travelers);
    if (Number.isFinite(passengers) && passengers > 0) {
      details.passengers = passengers;
    }

    const preferences = {};
    const travelStyle = sanitizeString(metadata.travelStyle);
    if (travelStyle) {
      preferences.travelStyle = travelStyle;
    }

    const budgetLevel = sanitizeString(metadata.budgetLevel);
    if (budgetLevel) {
      preferences.budgetLevel = budgetLevel;
    }

    const pace = sanitizeString(metadata.pace);
    if (pace) {
      preferences.pace = pace;
    }

    const transportMode = sanitizeString(metadata.transportMode);
    if (transportMode) {
      preferences.transportMode = transportMode;
    }

    if (Array.isArray(metadata.interests) && metadata.interests.length > 0) {
      preferences.interests = metadata.interests;
    }

    const notes = sanitizeString(metadata.notes);
    if (notes) {
      preferences.notes = notes;
    }

    if (Object.keys(preferences).length > 0) {
      details.preferences = preferences;
    }

    return details;
  }

  mergeTravelDetails(analysisDetails = {}, metadataDetails = {}, query) {
    const merged = {
      ...analysisDetails,
      ...metadataDetails,
      rawQuery: query
    };

    if (analysisDetails.preferences || metadataDetails.preferences) {
      merged.preferences = {
        ...(analysisDetails.preferences || {}),
        ...(metadataDetails.preferences || {})
      };
    }

    return merged;
  }

  async processQuery(query, threadId, metadata = {}) {
    try {
      console.log('Processing query with Gemini API...');
      
      // Build travel details from metadata first
      const metadataDetails = this.buildTravelDetailsFromMetadata(metadata);
      
      // Create the analysis prompt for Gemini
      const analysisPrompt = `Analyze the following travel query and extract key information. Return ONLY a JSON object with the following structure:
{
  "origin": "origin city/airport code",
  "destination": "destination city/airport code",
  "departureDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD",
  "passengers": number,
  "hotelPreferences": "star rating or preferences",
  "rawQuery": "original query"
}

Travel query: ${query}`;

      console.log('Sending analysis request to Gemini API...');
      
      // Add timeout to prevent hanging
      const analysisResult = await Promise.race([
        this.model.generateContent(analysisPrompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout after 15 seconds')), 15000)
        )
      ]);
      
      console.log('Received analysis from Gemini API');
      const analysisText = analysisResult.response.text();

      let travelDetails;
      try {
        // Try to extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          travelDetails = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch (e) {
        // If JSON parsing fails, use default structure
        travelDetails = {};
      }

      const mergedTravelDetails = this.mergeTravelDetails(travelDetails, metadataDetails, query);
      
      // Now create the comprehensive travel research prompt
      console.log('Creating comprehensive travel research prompt...');
      const comprehensivePrompt = `${this.systemPrompt}

Thông tin chuyến đi đã phân tích:
${JSON.stringify(mergedTravelDetails, null, 2)}

Yêu cầu của khách hàng: "${query}"

Hãy tìm kiếm và đưa ra thông tin chi tiết về:
1. Chuyến bay (giá cả, thời gian, hãng hàng không)
2. Khách sạn (giá phòng, đánh giá, vị trí)
3. Nhà hàng và ẩm thực địa phương
4. Địa điểm tham quan
5. Kinh nghiệm du lịch và lời khuyên

Trả lời bằng tiếng Việt với format HTML đẹp và chi tiết.`;

      console.log('Sending comprehensive research request to Gemini API...');
      
      // Add timeout for comprehensive research
      const researchResult = await Promise.race([
        this.model.generateContent(comprehensivePrompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Research timeout after 30 seconds')), 30000)
        )
      ]);
      
      console.log('Received comprehensive research from Gemini API');
      const finalResponse = researchResult.response.text();
      
      console.log('✅ Query processed successfully with real Gemini research');
      return finalResponse;
    } catch (error) {
      console.error('Error in TravelAgent.processQuery:', error);
      
      // Check if it's a quota exceeded error
      if (error.message?.includes('quota') || error.message?.includes('Too Many Requests') || error.message?.includes('timeout')) {
        return `
        <div style="padding: 20px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ Lỗi API hoặc Timeout</h3>
          <p style="color: #856404; margin: 0;">
            ${error.message.includes('timeout') ? 
              'Yêu cầu mất quá nhiều thời gian để xử lý. Vui lòng thử lại với câu hỏi ngắn gọn hơn.' :
              'Đã đạt giới hạn API trong ngày. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.'
            }
          </p>
          <p style="color: #856404; margin: 10px 0 0 0; font-size: 14px;">
            <strong>Lỗi:</strong> ${error.message}
          </p>
        </div>
        `;
      }
      
      // Generic error fallback
      return `
      <div style="padding: 20px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #721c24; margin: 0 0 10px 0;">⚠️ Lỗi Hệ Thống</h3>
        <p style="color: #721c24; margin: 0;">
          Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.
        </p>
        <p style="color: #721c24; margin: 10px 0 0 0; font-size: 14px;">
          <strong>Lỗi:</strong> ${error.message}
        </p>
      </div>
      `;
    }
  }
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          🌟 Kết Quả Tìm Kiếm Du Lịch
        </h2>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; font-size: 18px;">📍 Thông Tin Chuyến Đi</h3>
          <div style="display: grid; gap: 10px;">
            <p style="margin: 5px 0;"><strong>🔍 Truy vấn:</strong> ${query}</p>
            ${metadataDetails.origin ? `<p style="margin: 5px 0;"><strong>🛫 Điểm đi:</strong> ${metadataDetails.origin}</p>` : ''}
            ${metadataDetails.destination ? `<p style="margin: 5px 0;"><strong>🛬 Điểm đến:</strong> ${metadataDetails.destination}</p>` : ''}
            ${metadataDetails.departureDate ? `<p style="margin: 5px 0;"><strong>📅 Ngày đi:</strong> ${metadataDetails.departureDate}</p>` : ''}
            ${metadataDetails.returnDate ? `<p style="margin: 5px 0;"><strong>🔄 Ngày về:</strong> ${metadataDetails.returnDate}</p>` : ''}
            ${metadataDetails.passengers ? `<p style="margin: 5px 0;"><strong>👥 Số hành khách:</strong> ${metadataDetails.passengers}</p>` : ''}
          </div>
        </div>
        
        <div style="display: grid; gap: 20px; margin: 20px 0;">
          <div style="background: #e3f2fd; padding: 20px; border-radius: 12px; border-left: 4px solid #2196f3;">
            <h3 style="color: #1565c0; margin: 0 0 15px 0; display: flex; align-items: center;">
              ✈️ Chuyến Bay Gợi Ý
              <span style="margin-left: 10px; font-size: 12px; background: #4caf50; color: white; padding: 2px 8px; border-radius: 12px;">Sắp có</span>
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #1976d2;">
              <li>Vietnam Airlines - ${metadataDetails.origin || 'HAN'} → ${metadataDetails.destination || 'SGN'} - Từ 2.500.000 VNĐ</li>
              <li>VietJet Air - ${metadataDetails.origin || 'HAN'} → ${metadataDetails.destination || 'SGN'} - Từ 1.800.000 VNĐ</li>
              <li>Bamboo Airways - ${metadataDetails.origin || 'HAN'} → ${metadataDetails.destination || 'SGN'} - Từ 2.200.000 VNĐ</li>
            </ul>
          </div>
          
          <div style="background: #f3e5f5; padding: 20px; border-radius: 12px; border-left: 4px solid #9c27b0;">
            <h3 style="color: #7b1fa2; margin: 0 0 15px 0; display: flex; align-items: center;">
              🏨 Khách Sạn Đề Xuất
              <span style="margin-left: 10px; font-size: 12px; background: #ff9800; color: white; padding: 2px 8px; border-radius: 12px;">Đang cập nhật</span>
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #8e24aa;">
              <li>Khách sạn 5⭐ - Từ 2.000.000 VNĐ/đêm</li>
              <li>Khách sạn 4⭐ - Từ 1.200.000 VNĐ/đêm</li>
              <li>Khách sạn 3⭐ - Từ 600.000 VNĐ/đêm</li>
            </ul>
          </div>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 12px; border-left: 4px solid #ff9800;">
            <h3 style="color: #f57c00; margin: 0 0 15px 0;">🍜 Nhà Hàng & Ẩm Thực</h3>
            <ul style="margin: 0; padding-left: 20px; color: #ff8f00;">
              <li>Nhà hàng địa phương nổi tiếng</li>
              <li>Quán ăn vỉa hè đặc sắc</li>
              <li>Buffet khách sạn cao cấp</li>
            </ul>
          </div>
        </div>
        
        <div style="background: linear-gradient(45deg, #ff6b6b, #ffd93d); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <p style="color: white; margin: 0; font-weight: bold; font-size: 16px;">
            � Hệ thống AI đang được nâng cấp để mang đến trải nghiệm tốt nhất!
          </p>
          <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">
            Chúng tôi sẽ sớm cung cấp thông tin chi tiết và chính xác hơn.
          </p>
        </div>
        
        <div style="text-align: center; margin: 20px 0; color: #666; font-size: 14px;">
          <p>⏰ Thời gian xử lý: ${new Date().toLocaleString('vi-VN')}</p>
        </div>
      </div>
      `;
      
      console.log('✅ Query processed successfully with mock data');
      return mockResponse;
      
      // Temporarily comment out the Gemini API call
      /*
      // First, analyze the query to extract travel details
      const analysisPrompt = `Analyze the following travel query and extract key information. Return ONLY a JSON object with the following structure:
{
  "origin": "origin city/airport code",
  "destination": "destination city/airport code", 
  "departureDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD",
  "passengers": number,
  "hotelPreferences": "star rating or preferences",
  "rawQuery": "original query"
}

Travel query: ${query}`;

      console.log('Sending request to Gemini API...');
      const analysisResult = await this.model.generateContent(analysisPrompt);
      console.log('Received response from Gemini API');
      const analysisText = analysisResult.response.text();

      let travelDetails;
      try {
        // Try to extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          travelDetails = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch (e) {
        // If JSON parsing fails, use default structure
        travelDetails = {};
      }

      const metadataDetails2 = this.buildTravelDetailsFromMetadata(metadata);
      const mergedTravelDetails = this.mergeTravelDetails(travelDetails, metadataDetails2, query);
      */

      // Search for flights and hotels
      const [flightResults, hotelResults] = await Promise.all([
        this.searchFlights(mergedTravelDetails),
        this.searchHotels(mergedTravelDetails)
      ]);

      // Generate final response with Gemini
      const finalPrompt = `${this.systemPrompt}

Original user query: ${query}

Structured travel details (combined from client metadata and AI analysis): ${JSON.stringify(mergedTravelDetails, null, 2)}

Flight search results: ${JSON.stringify(flightResults, null, 2)}

Hotel search results: ${JSON.stringify(hotelResults, null, 2)}

Please create a comprehensive travel information response in HTML format. Include:
1. A summary of the user's request
2. Flight options with prices, airlines, and booking links
3. Hotel options with prices, ratings, and booking links
4. All information should be in Vietnamese
5. Use proper HTML structure with styling
6. Include images and links where available

Make it visually appealing and informative.`;

      const finalResult = await this.model.generateContent(finalPrompt);
      return finalResult.response.text();
    } catch (error) {
      console.error('Error in TravelAgent.processQuery:', error);
      
      // Check if it's a quota exceeded error
      if (error.message?.includes('quota') || error.message?.includes('Too Many Requests')) {
        return `
        <div style="padding: 20px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">🚫 Quota Limit Reached</h3>
          <p style="color: #856404; margin: 0;">
            Xin lỗi, chúng tôi đã đạt đến giới hạn API hôm nay. Vui lòng thử lại sau hoặc liên hệ với chúng tôi để được hỗ trợ.
          </p>
          <p style="color: #856404; margin: 10px 0 0 0; font-size: 14px;">
            Sorry, we've reached our API limit for today. Please try again later or contact us for support.
          </p>
        </div>
        `;
      }
      
      // Generic error fallback
      return `
      <div style="padding: 20px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #721c24; margin: 0 0 10px 0;">⚠️ Lỗi Hệ Thống</h3>
        <p style="color: #721c24; margin: 0;">
          Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.
        </p>
        <p style="color: #721c24; margin: 10px 0 0 0; font-size: 14px;">
          Sorry, an error occurred while processing your request. Please try again later.
        </p>
      </div>
      `;
    }
  }

  async searchFlights(travelDetails) {
    try {
      return await this.flightsFinder.search(travelDetails);
    } catch (error) {
      console.error('Error searching flights:', error);
      return { error: 'Failed to search flights' };
    }
  }

  async searchHotels(travelDetails) {
    try {
      return await this.hotelsFinder.search(travelDetails);
    } catch (error) {
      console.error('Error searching hotels:', error);
      return { error: 'Failed to search hotels' };
    }
  }
}

module.exports = TravelAgent;