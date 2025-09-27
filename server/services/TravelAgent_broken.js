const { GoogleGenerativeAI } = require('@google/generative-ai');
const FlightsFinder = require('./FlightsFinder'); // Đảm bảo file này đã được triển khai
const HotelsFinder = require('./HotelsFinder');   // Đảm bảo file này đã được triển khai

class TravelAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const modelNames = [
      'gemini-2.5-pro',
    ];
    
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
    
    // Cập nhật systemPrompt để bao gồm việc sử dụng dữ liệu chuyến bay/khách sạn
    this.systemPrompt = `Bạn là trợ lý du lịch AI thông minh. Nhiệm vụ của bạn là giúp người dùng tìm kiếm thông tin du lịch bao gồm chuyến bay, khách sạn và nhà hàng/địa điểm ăn uống địa phương.

HƯỚNG DẪN:
- Bạn được phép thực hiện nhiều tìm kiếm (cùng lúc hoặc tuần tự).
- Nếu người dùng hỏi các gợi ý gần đó, bạn có thể hỏi vị trí hiện tại của họ để đưa ra các đề xuất tốt hơn.
- Dựa trên vị trí hiện tại của người dùng hoặc điểm đến của họ, đề xuất các nhà hàng và quán ăn nổi tiếng.
- Chỉ tra cứu thông tin khi bạn chắc chắn về những gì bạn muốn.
- Năm hiện tại là ${new Date().getFullYear()}.
- LUÔN LUÔN bao gồm các liên kết đến các trang web của khách sạn, chuyến bay và trang web/menu nhà hàng khi có thể.
- Bao gồm logo của các hãng hàng không, khách sạn và hình ảnh nhà hàng/món ăn khi có sẵn.
- LUÔN LUÔN bao gồm giá bằng nội tệ và USD khi có thể.
- Định dạng phản hồi của bạn bằng HTML rõ ràng để trình bày tốt hơn.
- SỬ DỤNG DỮ LIỆU CHUYẾN BAY VÀ KHÁCH SẠN THỰC TẾ ĐƯỢC CUNG CẤP trong prompt, nếu có. Tổng hợp thông tin này vào lịch trình.

VÍ DỤ ĐỊNH DẠNG GIÁ:
Đối với khách sạn: Giá: $581 mỗi đêm, Tổng cộng: $3,488
Đối với chuyến bay: Giá: $850 USD
Đối với nhà hàng: Khoảng giá: $10 - $50

ĐỊNH DẠNG PHẢN HỒI:
- Sử dụng cấu trúc HTML phù hợp với các tiêu đề, danh sách và kiểu dáng.
- Bao gồm hình ảnh cho logo hãng hàng không, ảnh khách sạn và ảnh nhà hàng/món ăn.
- Cung cấp các liên kết có thể nhấp để đặt chỗ hoặc xem menu.
- Hiển thị thông tin giá rõ ràng.
- Sử dụng tiếng Việt cho nội dung hướng tới người dùng.

Hãy nhớ rằng bạn phải hữu ích, chính xác và cung cấp thông tin du lịch và ăn uống toàn diện.`;
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

    // Thêm các trường khác từ metadata vào details để sử dụng cho tìm kiếm khách sạn/chuyến bay
    details.travelStyle = sanitizeString(metadata.travelStyle);
    details.budgetLevel = sanitizeString(metadata.budgetLevel);
    details.pace = sanitizeString(metadata.pace);
    details.transportMode = sanitizeString(metadata.transportMode);
    details.interests = metadata.interests || [];
    details.notes = sanitizeString(metadata.notes);

    return details;
  }

  mergeTravelDetails(analysisDetails = {}, metadataDetails = {}, query) {
    return {
      ...metadataDetails,
      ...analysisDetails,
      rawQuery: query
    };
  }

  async processQuery(query, threadId, metadata = {}) {
    try {
      console.log('Processing query...');
      
      const metadataDetails = this.buildTravelDetailsFromMetadata(metadata);
      
      if (!this.model) {
        console.log('AI model not available - providing fallback response');
        return this.createFallbackResponse(query, metadataDetails);
      }
      
      console.log('Bắt đầu tìm kiếm chuyến bay và khách sạn thực tế...');
      let flightResults = null;
      let hotelResults = null;

      // Chỉ tìm kiếm chuyến bay nếu có đủ thông tin
      if (metadataDetails.origin && metadataDetails.destination && metadataDetails.departureDate) {
        flightResults = await this.searchFlights(metadataDetails);
        console.log('Kết quả chuyến bay:', flightResults);
      } else {
        console.log('Không đủ thông tin để tìm kiếm chuyến bay.');
      }

      // Chỉ tìm kiếm khách sạn nếu có điểm đến
      if (metadataDetails.destination) {
        hotelResults = await this.searchHotels(metadataDetails); // Truyền đầy đủ metadataDetails để Finder có thêm ngữ cảnh
        console.log('Kết quả khách sạn:', hotelResults);
      } else {
        console.log('Không có điểm đến, bỏ qua tìm kiếm khách sạn.');
      }

      console.log('Tạo prompt nghiên cứu du lịch tối ưu...');

      // Xây dựng chuỗi thông tin chuyến bay và khách sạn để đưa vào prompt
      let flightInfoForPrompt = '';
      if (flightResults && !flightResults.error && flightResults.length > 0) {
          const topFlights = flightResults.slice(0, 3).map(flight => 
              `- Chuyến bay từ ${flight.origin} đi ${flight.destination} vào ngày ${flight.departureDate} (có thể cả ngày về ${flight.returnDate || 'N/A'}), Hãng: ${flight.airline}, Giá: ${flight.price} USD, Link: ${flight.bookingLink}`
          ).join('\n');
          flightInfoForPrompt = `\n\nDỮ LIỆU CHUYẾN BAY THỰC TẾ (top 3): \n${topFlights}\n(Lưu ý: Giá có thể thay đổi, kiểm tra link để biết thông tin mới nhất)\n`;
      } else if (flightResults && flightResults.error) {
          flightInfoForPrompt = `\n\nKhông thể tìm thấy chuyến bay do lỗi: ${flightResults.error}\n`;
      } else {
          flightInfoForPrompt = `\n\nKhông tìm thấy chuyến bay nào phù hợp với yêu cầu của bạn.\n`;
      }

      let hotelInfoForPrompt = '';
      if (hotelResults && !hotelResults.error && hotelResults.length > 0) {
          const topHotels = hotelResults.slice(0, 3).map(hotel =>
              `- Khách sạn: ${hotel.name}, Vị trí: ${hotel.address}, Đánh giá: ${hotel.rating}/5, Giá trung bình: ${hotel.pricePerNight} USD/đêm, Link: ${hotel.bookingLink}`
          ).join('\n');
          hotelInfoForPrompt = `\n\nDỮ LIỆU KHÁCH SẠN THỰC TẾ (top 3): \n${topHotels}\n(Lưu ý: Giá có thể thay đổi, kiểm tra link để biết thông tin mới nhất)\n`;
      } else if (hotelResults && hotelResults.error) {
          hotelInfoForPrompt = `\n\nKhông thể tìm thấy khách sạn do lỗi: ${hotelResults.error}\n`;
      } else {
          hotelInfoForPrompt = `\n\nKhông tìm thấy khách sạn nào phù hợp với yêu cầu của bạn.\n`;
      }


      const simplePrompt = `Trợ lý du lịch AI: Tạo lịch trình ngắn gọn cho "${query}"

${hotelResults && hotelResults.length > 0 ? 
`KHÁCH SẠN GỢI Ý:
${hotelResults.slice(0, 2).map(h => `- ${h.name}: ${h.rate_per_night || 'N/A'}/đêm`).join('\n')}` : ''}

Yêu cầu:
- Ngắn gọn (tối đa 300 từ)
- HTML đơn giản
- Bao gồm giá cả thực tế
- Tiếng Việt`;
1. Sử dụng format HTML hoàn chỉnh với <html>, <head>, <body>
2. Bao gồm CSS inline đẹp mắt 
3. Tích hợp thông tin chuyến bay và khách sạn thực tế vào lịch trình
4. Thêm các địa điểm tham quan, nhà hàng, hoạt động cụ thể
5. Cung cấp lời khuyên thực tế (giao thông, tiền tệ, thời tiết)
6. Tổng hợp chi phí dự kiến
7. Đảm bảo response hoàn chỉnh, không bị cắt giữa chừng

Hãy tạo một response dài, chi tiết và hoàn chỉnh (minimum 2000 từ).`;

      console.log('Tạo prompt nghiên cứu du lịch tối ưu...');

      console.log('Sending optimized research request to Gemini API...');
      
      const researchResult = await Promise.race([
        this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: comprehensivePrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3000, // Giảm xuống 3000 tokens để nhanh hơn
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Research timeout after 30 seconds')), 30000)
        )
      ]);
      
      console.log('Received comprehensive research from Gemini API');
      let finalResponse = researchResult.response.text();
      
      // Clean and validate the response
      console.log('=== RESPONSE DEBUG ===');
      console.log('Raw response length:', finalResponse.length);
      console.log('Raw response type:', typeof finalResponse);
      console.log('Is empty?', !finalResponse || finalResponse.trim().length === 0);
      console.log('First 300 chars:', finalResponse.substring(0, 300));
      console.log('Last 300 chars:', finalResponse.substring(finalResponse.length - 300));
      
      // Check if response is complete HTML
      const hasHtmlStart = finalResponse.includes('<html') || finalResponse.includes('<!DOCTYPE');
      const hasHtmlEnd = finalResponse.includes('</html>') || finalResponse.includes('</body>');
      console.log('Has HTML start:', hasHtmlStart);
      console.log('Has HTML end:', hasHtmlEnd);
      console.log('=== END DEBUG ===');
      
      // If response seems incomplete, try to fix it
      if (!finalResponse || finalResponse.trim().length === 0) {
        console.log('Empty response from Gemini, using fallback');
        return this.createFallbackResponse(query, metadataDetails);
      }
      
      // If HTML is incomplete, wrap it properly
      if (hasHtmlStart && !hasHtmlEnd) {
        console.log('Fixing incomplete HTML response...');
        finalResponse += `
        </div>
      </body>
      </html>`;
      }
      
      // If it's not HTML at all, wrap it
      if (!hasHtmlStart) {
        console.log('Converting plain text to HTML...');
        finalResponse = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Kế Hoạch Du Lịch</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            .container { max-width: 900px; margin: auto; padding: 20px; }
            h1, h2, h3 { color: #0056b3; }
            .section { margin: 20px 0; padding: 15px; border-radius: 8px; }
            .flight-info { background: #e3f2fd; }
            .hotel-info { background: #f3e5f5; }
            .itinerary { background: #fff3e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🌟 Kế Hoạch Du Lịch Của Bạn</h1>
            <div class="section">
              ${finalResponse.replace(/\n/g, '<br>')}
            </div>
          </div>
        </body>
        </html>`;
      }
      
      // Clean and validate the response
      const cleanedResponse = finalResponse.trim();
      
      if (!cleanedResponse || cleanedResponse.length === 0) {
        console.log('Empty response from Gemini, using fallback');
        return this.createFallbackResponse(query, metadataDetails);
      }
      
      // Ensure the response is properly formatted HTML
      let formattedResponse = cleanedResponse;
      if (!cleanedResponse.includes('<html') && !cleanedResponse.includes('<div')) {
        // Wrap plain text in HTML div
        formattedResponse = `
        <div style="padding: 20px; font-family: Arial, sans-serif; line-height: 1.6;">
          ${cleanedResponse.replace(/\n/g, '<br>')}
        </div>
        `;
      }
      
      console.log('Final formatted response length:', formattedResponse.length);
      console.log('✅ Query processed successfully with real Gemini research');
      return formattedResponse;

    } catch (error) {
      console.error('Error in TravelAgent.processQuery:', error);
      // ... (Phần xử lý lỗi giữ nguyên)
      if (error.message?.includes('quota') || error.message?.includes('Too Many Requests')) {
        return `
        <div style="padding: 20px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">🚫 Đã Đạt Giới Hạn API</h3>
          <p style="color: #856404; margin: 0;">
            Xin lỗi, chúng tôi đã đạt giới hạn API hôm nay. Vui lòng thử lại sau hoặc liên hệ với chúng tôi để được hỗ trợ.
          </p>
          <p style="color: #856404; margin: 10px 0 0 0; font-size: 14px;">
            Sorry, we've reached our API limit for today. Please try again later.
          </p>
        </div>
        `;
      }
      
      if (error.message?.includes('Service Unavailable') || error.status === 503) {
        return `
        <div style="padding: 20px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #721c24; margin: 0 0 10px 0;">🔧 Dịch Vụ Tạm Thời Không Khả Dụng</h3>
          <p style="color: #721c24; margin: 0;">
            Dịch vụ AI hiện đang quá tải hoặc bảo trì. Vui lòng thử lại sau vài phút.
          </p>
          <p style="color: #721c24; margin: 10px 0 0 0; font-size: 14px;">
            The AI service is currently overloaded or under maintenance. Please try again in a few minutes.
          </p>
          <div style="margin: 15px 0; padding: 10px; background-color: rgba(114, 28, 36, 0.1); border-radius: 4px;">
            <p style="color: #721c24; margin: 0; font-size: 12px;">
              <strong>Mẹo:</strong> Hãy thử lại sau 2-3 phút hoặc đặt câu hỏi ngắn gọn hơn.
            </p>
          </div>
        </div>
        `;
      }
      
      if (error.message?.includes('timeout')) {
        return `
        <div style="padding: 20px; background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0c5460; margin: 0 0 10px 0;">⏱️ Yêu Cầu Quá Lâu</h3>
          <p style="color: #0c5460; margin: 0;">
            Yêu cầu mất quá nhiều thời gian để xử lý. Vui lòng thử lại với câu hỏi ngắn gọn hơn.
          </p>
          <p style="color: #0c5460; margin: 10px 0 0 0; font-size: 14px;">
            Request took too long to process. Please try again with a shorter question.
          </p>
        </div>
        `;
      }
      
      return `
      <div style="padding: 20px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #721c24; margin: 0 0 10px 0;">⚠️ Lỗi Hệ Thống</h3>
        <p style="color: #721c24; margin: 0;">
          Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.
        </p>
        <p style="color: #721c24; margin: 10px 0 0 0; font-size: 14px;">
          Sorry, an error occurred while processing your request. Please try again later.
        </p>
        <p style="color: #721c24; margin: 10px 0 0 0; font-size: 14px;">
          <strong>Lỗi:</strong> ${error.message}
        </p>
      </div>
      `;
    }
  }

  createFallbackResponse(query, metadataDetails) {
    // ... (Phần tạo phản hồi dự phòng giữ nguyên)
    return `
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
      
      <div style="background: #fff3e0; padding: 20px; border-radius: 12px; border-left: 4px solid #ff9800; margin: 20px 0;">
        <h3 style="color: #f57c00; margin: 0 0 15px 0;">⚠️ Thông Báo</h3>
        <p style="color: #f57c00; margin: 0;">
          Dịch vụ AI hiện tại đang bảo trì hoặc không tìm thấy dữ liệu chuyến bay/khách sạn. Chúng tôi sẽ sớm cung cấp thông tin chi tiết về chuyến đi của bạn.
        </p>
        <p style="color: #f57c00; margin: 10px 0 0 0; font-style: italic;">
          Vui lòng thử lại sau vài phút hoặc liên hệ hỗ trợ khách hàng.
        </p>
      </div>
      
      <div style="text-align: center; margin: 20px 0; color: #666; font-size: 14px;">
        <p>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}</p>
      </div>
    </div>
    `;
  }

  // Phương thức này giờ đây sẽ gọi đến các Finder thực tế
  async searchFlights(travelDetails) {
    try {
      // Logic để chuyển đổi travelDetails thành định dạng mà FlightsFinder cần
      // Ví dụ: FlightsFinder.search({ from: 'HAN', to: 'SGN', date: '2024-12-01', passengers: 2 })
      return await this.flightsFinder.search(travelDetails);
    } catch (error) {
      console.error('Error searching flights:', error);
      return { error: 'Failed to search flights. Please check the details and try again.' };
    }
  }

  // Phương thức này giờ đây sẽ gọi đến các Finder thực tế
  async searchHotels(travelDetails) {
    try {
      // Logic để chuyển đổi travelDetails thành định dạng mà HotelsFinder cần
      // Ví dụ: HotelsFinder.search({ destination: 'Tokyo', checkIn: '2024-12-01', checkOut: '2024-12-05', guests: 2, budget: 'cao cấp' })
      return await this.hotelsFinder.search(travelDetails);
    } catch (error) {
      console.error('Error searching hotels:', error);
      return { error: 'Failed to search hotels. Please check the details and try again.' };
    }
  }
}

module.exports = TravelAgent;