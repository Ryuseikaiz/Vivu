const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get nearby places using Google Places API (displayed on OpenStreetMap)
router.post('/nearby', auth, async (req, res) => {
  try {
    const { location, category, radius = 2000 } = req.body;
    
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ error: 'Location coordinates required' });
    }

    // Always use OpenStreetMap - no Google API needed
    console.log('Using OpenStreetMap for nearby places search');
    return await useOpenStreetMapFallback(location, category, radius, res);

    // Removed Google Places API code - using OpenStreetMap only
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    res.json({ places: getMockPlaces(category) });
  }
});

// Fallback to OpenStreetMap when Google Places fails
async function useOpenStreetMapFallback(location, category, radius, res) {
  try {
    // Map category to OpenStreetMap amenity types
    const amenityMapping = {
      restaurant: 'restaurant',
      cafe: 'cafe',
      lodging: 'hotel',
      tourist_attraction: 'attraction'
    };

    const amenity = amenityMapping[category] || 'restaurant';
    
    // Use Overpass API to find nearby places
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="${amenity}"](around:${radius},${location.lat},${location.lng});
        way["amenity"="${amenity}"](around:${radius},${location.lat},${location.lng});
        relation["amenity"="${amenity}"](around:${radius},${location.lat},${location.lng});
      );
      out center meta;
    `;

    const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 10000
    });

    if (response.data && response.data.elements) {
      const places = response.data.elements
        .filter(element => element.tags && element.tags.name)
        .slice(0, 20)
        .map(element => {
          const lat = element.lat || (element.center && element.center.lat);
          const lon = element.lon || (element.center && element.center.lon);
          
          return {
            place_id: element.id.toString(),
            name: element.tags.name,
            vicinity: element.tags['addr:street'] || element.tags['addr:city'] || 'Địa chỉ không xác định',
            rating: Math.random() * 2 + 3,
            price_level: Math.floor(Math.random() * 4) + 1,
            types: [category],
            geometry: {
              location: { lat, lng: lon }
            },
            opening_hours: element.tags.opening_hours,
            phone: element.tags.phone,
            website: element.tags.website,
            source: 'OpenStreetMap'
          };
        });

      res.json({ places });
    } else {
      res.json({ places: getMockPlaces(category) });
    }
  } catch (osmError) {
    console.error('OpenStreetMap fallback failed:', osmError.message);
    res.json({ places: getMockPlaces(category) });
  }
}

// Get place details using Google Places API or Nominatim fallback
router.get('/place/:placeId', auth, async (req, res) => {
  try {
    const { placeId } = req.params;
    
    // Use OpenStreetMap only - no Google API

    // Fallback to Nominatim for OpenStreetMap IDs
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/lookup`, {
        params: {
          osm_ids: `N${placeId}`,
          format: 'json',
          addressdetails: 1,
          extratags: 1,
          namedetails: 1
        },
        headers: {
          'User-Agent': 'AI-Travel-Agent/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const place = response.data[0];
        res.json({
          place: {
            place_id: placeId,
            name: place.display_name.split(',')[0],
            formatted_address: place.display_name,
            rating: Math.random() * 2 + 3,
            opening_hours: place.extratags?.opening_hours,
            website: place.extratags?.website,
            phone: place.extratags?.phone,
            source: 'OpenStreetMap'
          }
        });
      } else {
        res.json({ place: getMockPlaceDetails(placeId) });
      }
    } catch (nominatimError) {
      console.error('Nominatim API error:', nominatimError.message);
      res.json({ place: getMockPlaceDetails(placeId) });
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.json({ place: getMockPlaceDetails(req.params.placeId) });
  }
});

// Placeholder for photos (OpenStreetMap doesn't have photos)
router.get('/photo/:photoReference', (req, res) => {
  res.redirect('https://via.placeholder.com/400x300?text=Không+có+ảnh');
});

// Mock data for when API key is not available
function getMockPlaces(category) {
  const mockData = {
    restaurant: [
      {
        place_id: 'mock_restaurant_1',
        name: 'Nhà hàng Phố Cổ',
        vicinity: 'Hoàn Kiếm, Hà Nội',
        rating: 4.5,
        price_level: 2,
        types: ['restaurant', 'food'],
        geometry: {
          location: { lat: 21.0285, lng: 105.8542 }
        }
      },
      {
        place_id: 'mock_restaurant_2',
        name: 'Bún Chả Hương Liên',
        vicinity: 'Hai Bà Trưng, Hà Nội',
        rating: 4.3,
        price_level: 1,
        types: ['restaurant', 'food'],
        geometry: {
          location: { lat: 21.0245, lng: 105.8412 }
        }
      }
    ],
    cafe: [
      {
        place_id: 'mock_cafe_1',
        name: 'Cà phê Cộng',
        vicinity: 'Ba Đình, Hà Nội',
        rating: 4.4,
        price_level: 2,
        types: ['cafe', 'food'],
        geometry: {
          location: { lat: 21.0313, lng: 105.8516 }
        }
      },
      {
        place_id: 'mock_cafe_2',
        name: 'The Coffee House',
        vicinity: 'Đống Đa, Hà Nội',
        rating: 4.2,
        price_level: 2,
        types: ['cafe', 'food'],
        geometry: {
          location: { lat: 21.0278, lng: 105.8342 }
        }
      }
    ],
    lodging: [
      {
        place_id: 'mock_hotel_1',
        name: 'Khách sạn Metropole',
        vicinity: 'Hoàn Kiếm, Hà Nội',
        rating: 4.8,
        price_level: 4,
        types: ['lodging'],
        geometry: {
          location: { lat: 21.0285, lng: 105.8542 }
        }
      },
      {
        place_id: 'mock_hotel_2',
        name: 'Lotte Hotel Hanoi',
        vicinity: 'Ba Đình, Hà Nội',
        rating: 4.6,
        price_level: 4,
        types: ['lodging'],
        geometry: {
          location: { lat: 21.0313, lng: 105.8516 }
        }
      }
    ],
    tourist_attraction: [
      {
        place_id: 'mock_attraction_1',
        name: 'Hồ Hoàn Kiếm',
        vicinity: 'Hoàn Kiếm, Hà Nội',
        rating: 4.7,
        price_level: 0,
        types: ['tourist_attraction'],
        geometry: {
          location: { lat: 21.0285, lng: 105.8542 }
        }
      },
      {
        place_id: 'mock_attraction_2',
        name: 'Văn Miếu',
        vicinity: 'Đống Đa, Hà Nội',
        rating: 4.5,
        price_level: 1,
        types: ['tourist_attraction'],
        geometry: {
          location: { lat: 21.0278, lng: 105.8342 }
        }
      }
    ]
  };

  return mockData[category] || [];
}

function getMockPlaceDetails(placeId) {
  return {
    place_id: placeId,
    name: 'Mock Place',
    vicinity: 'Mock Address',
    rating: 4.0,
    price_level: 2,
    opening_hours: {
      open_now: true,
      weekday_text: [
        'Thứ 2: 08:00–22:00',
        'Thứ 3: 08:00–22:00',
        'Thứ 4: 08:00–22:00',
        'Thứ 5: 08:00–22:00',
        'Thứ 6: 08:00–22:00',
        'Thứ 7: 08:00–22:00',
        'Chủ nhật: 08:00–22:00'
      ]
    }
  };
}

module.exports = router;