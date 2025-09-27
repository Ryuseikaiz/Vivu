const axios = require('axios');

class HotelsFinder {
  constructor() {
    this.serpApiKey = process.env.SERPAPI_API_KEY;
  }

  async search(travelDetails) {
    // Always try to use real API first
    try {
      if (this.serpApiKey) {
        return await this.searchWithSerpAPI(travelDetails);
      } else {
        return await this.searchWithBookingAPI(travelDetails);
      }
    } catch (error) {
      console.error('Error searching hotels with real APIs:', error);
      throw new Error('Unable to search hotels at the moment. Please try again later.');
    }
  }

  async searchWithSerpAPI(travelDetails) {
    const params = {
      engine: 'google_hotels',
      api_key: this.serpApiKey,
      q: `hotels in ${travelDetails.destination || 'Tokyo'}`,
      check_in_date: travelDetails.departureDate || new Date().toISOString().split('T')[0],
      check_out_date: travelDetails.returnDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'USD',
      hl: 'en',
      adults: travelDetails.passengers || 2
    };

    const response = await axios.get('https://serpapi.com/search', { 
      params,
      timeout: 10000 // 10 second timeout
    });
    
    if (response.data.properties && response.data.properties.length > 0) {
      return this.formatHotelResults(response.data.properties);
    } else {
      throw new Error('No hotels found for the specified criteria');
    }
  }

  async searchWithBookingAPI(travelDetails) {
    // Alternative: Use Booking.com API or other hotel APIs
    // This is a placeholder - you would implement actual API calls here
    const destination = travelDetails.destination || 'Tokyo';
    
    // For now, throw error to indicate no API key available
    throw new Error(`No hotel API key configured. Please add SERPAPI_API_KEY to search hotels in ${destination}`);
  }

  formatHotelResults(hotels) {
    return hotels.slice(0, 3).map(hotel => ({
      name: hotel.name,
      description: hotel.description,
      location: hotel.location,
      rate_per_night: hotel.rate_per_night?.lowest,
      total_rate: hotel.total_rate?.lowest,
      currency: 'USD',
      rating: hotel.overall_rating,
      reviews: hotel.reviews,
      amenities: hotel.amenities,
      images: hotel.images,
      link: hotel.link
    }));
  }

  getMockHotelData(destination = 'Tokyo') {
    const hotelData = {
      'tokyo': [
        {
          name: 'The Tokyo Station Hotel',
          description: 'Khách sạn sang trọng trong tòa nhà lịch sử tại ga Tokyo với dịch vụ 5 sao và vị trí tuyệt vời.',
          location: 'Marunouchi, Tokyo',
          rate_per_night: 450,
          total_rate: 2700,
          currency: 'USD',
          rating: 4.8,
          reviews: 2100,
          amenities: ['Wi-Fi miễn phí', 'Nhà hàng cao cấp', 'Spa', 'Concierge', 'Gym'],
          images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
          link: 'https://www.thetokyostationhotel.jp'
        },
        {
          name: 'Park Hyatt Tokyo',
          description: 'Khách sạn siêu sang nổi tiếng từ bộ phim "Lost in Translation" với tầm nhìn tuyệt đẹp ra thành phố.',
          location: 'Shinjuku, Tokyo',
          rate_per_night: 680,
          total_rate: 4080,
          currency: 'USD',
          rating: 4.9,
          reviews: 1850,
          amenities: ['Wi-Fi miễn phí', 'New York Grill', 'Peak Bar', 'Spa', 'Pool'],
          images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'],
          link: 'https://www.hyatt.com/park-hyatt/tokyo'
        },
        {
          name: 'Sakura Hostel Asakusa',
          description: 'Hostel hiện đại giá rẻ gần chùa Sensoji với không gian trẻ trung và thân thiện.',
          location: 'Asakusa, Tokyo',
          rate_per_night: 45,
          total_rate: 270,
          currency: 'USD',
          rating: 4.3,
          reviews: 890,
          amenities: ['Wi-Fi miễn phí', 'Kitchen chung', 'Lounge', 'Laundry'],
          images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'],
          link: 'https://www.booking.com'
        }
      ],
      'saigon': [
        {
          name: 'Hotel Majestic Saigon',
          description: 'Khách sạn lịch sử sang trọng bên sông Sài Gòn với kiến trúc thuộc địa Pháp đặc trưng.',
          location: 'Quận 1, TP.HCM',
          rate_per_night: 180,
          total_rate: 1080,
          currency: 'USD',
          rating: 4.6,
          reviews: 1500,
          amenities: ['Wi-Fi miễn phí', 'Nhà hàng', 'Rooftop Bar', 'Spa', 'Pool'],
          images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
          link: 'https://www.majesticsaigon.com'
        },
        {
          name: 'The Reverie Saigon',
          description: 'Khách sạn siêu sang với thiết kế nội thất Ý đẳng cấp và dịch vụ 5 sao.',
          location: 'Quận 1, TP.HCM',
          rate_per_night: 380,
          total_rate: 2280,
          currency: 'USD',
          rating: 4.8,
          reviews: 980,
          amenities: ['Wi-Fi miễn phí', 'Fine Dining', 'Spa sang trọng', 'Pool tầng cao', 'Butler'],
          images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'],
          link: 'https://www.thereverie.com'
        },
        {
          name: 'Mai House Saigon',
          description: 'Khách sạn boutique hiện đại với thiết kế Việt Nam đương đại và vị trí trung tâm.',
          location: 'Quận 1, TP.HCM',
          rate_per_night: 120,
          total_rate: 720,
          currency: 'USD',
          rating: 4.4,
          reviews: 760,
          amenities: ['Wi-Fi miễn phí', 'Nhà hàng', 'Coffee Bar', 'Gym', 'Meeting Room'],
          images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'],
          link: 'https://www.maihousesaigon.com'
        }
      ],
      'default': [
        {
          name: 'Grand Plaza Hotel',
          description: 'Khách sạn 4 sao với đầy đủ tiện nghi hiện đại và dịch vụ chuyên nghiệp.',
          location: 'Trung tâm thành phố',
          rate_per_night: 150,
          total_rate: 900,
          currency: 'USD',
          rating: 4.4,
          reviews: 1200,
          amenities: ['Wi-Fi miễn phí', 'Nhà hàng', 'Fitness Center', 'Business Center'],
          images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
          link: 'https://www.booking.com'
        }
      ]
    };

    const cityKey = destination.toLowerCase().includes('tokyo') ? 'tokyo' :
                   destination.toLowerCase().includes('saigon') || destination.toLowerCase().includes('ho chi minh') ? 'saigon' :
                   'default';
    
    return hotelData[cityKey] || hotelData['default'];
  }
}

module.exports = HotelsFinder;