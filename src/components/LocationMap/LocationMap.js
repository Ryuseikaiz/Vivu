import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './LocationMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMap = ({ onLocationSelect }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('restaurant');

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        fetchNearbyPlaces(location, selectedCategory);
        setLoading(false);
      },
      (error) => {
        setError('Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [selectedCategory]);

  // Fetch nearby places
  const fetchNearbyPlaces = async (location, category) => {
    try {
      const response = await axios.post('/api/location/nearby', {
        location,
        category,
        radius: 2000 // 2km radius
      });
      setNearbyPlaces(response.data.places || []);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      setError('Không thể tải địa điểm xung quanh');
    }
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (userLocation) {
      fetchNearbyPlaces(userLocation, category);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Create custom icons
  const createUserLocationIcon = () => {
    return L.divIcon({
      html: `<div style="
        background: #4285F4;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      className: 'custom-user-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const createPlaceIcon = (type) => {
    const icons = {
      restaurant: '🍽️',
      cafe: '☕',
      lodging: '🏨',
      tourist_attraction: '🎯',
      default: '📍'
    };

    const emoji = icons[type] || icons.default;
    
    return L.divIcon({
      html: `<div style="
        background: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid #333;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${emoji}</div>`,
      className: 'custom-place-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <div className="location-map-container">
      <div className="location-controls">
        <h3>🗺️ Khám phá địa điểm xung quanh</h3>
        
        <div className="category-buttons">
          <button
            className={selectedCategory === 'restaurant' ? 'active' : ''}
            onClick={() => handleCategoryChange('restaurant')}
          >
            🍽️ Nhà hàng
          </button>
          <button
            className={selectedCategory === 'cafe' ? 'active' : ''}
            onClick={() => handleCategoryChange('cafe')}
          >
            ☕ Cà phê
          </button>
          <button
            className={selectedCategory === 'lodging' ? 'active' : ''}
            onClick={() => handleCategoryChange('lodging')}
          >
            🏨 Khách sạn
          </button>
          <button
            className={selectedCategory === 'tourist_attraction' ? 'active' : ''}
            onClick={() => handleCategoryChange('tourist_attraction')}
          >
            🎯 Điểm tham quan
          </button>
        </div>

        <button 
          className="location-button"
          onClick={getCurrentLocation}
          disabled={loading}
        >
          {loading ? 'Đang định vị...' : '📍 Lấy vị trí hiện tại'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="map-wrapper">
        {userLocation ? (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User location marker */}
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon()}
            >
              <Popup>
                <div>
                  <strong>📍 Vị trí của bạn</strong>
                </div>
              </Popup>
            </Marker>

            {/* Nearby places markers */}
            {nearbyPlaces.map((place, index) => (
              <Marker
                key={index}
                position={[place.geometry.location.lat, place.geometry.location.lng]}
                icon={createPlaceIcon(place.types[0])}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>{place.name}</h4>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>{place.vicinity}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>⭐ {place.rating || 'N/A'}</span>
                      <button
                        onClick={() => onLocationSelect && onLocationSelect(place)}
                        style={{
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Chọn
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="map-loading">
            {loading ? 'Đang lấy vị trí...' : 'Nhấn "Lấy vị trí hiện tại" để bắt đầu'}
          </div>
        )}
      </div>

      {nearbyPlaces.length > 0 && (
        <div className="places-list">
          <h4>Địa điểm gần bạn ({nearbyPlaces.length})</h4>
          <div className="places-grid">
            {nearbyPlaces.slice(0, 6).map((place, index) => (
              <div key={index} className="place-card">
                {place.photos && place.photos.length > 0 && (
                  <div className="place-image">
                    <img
                      src={`/api/location/photo/${place.photos[0].photo_reference}?maxwidth=200`}
                      alt={place.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="place-info">
                  <h5>{place.name}</h5>
                  <p className="place-address">{place.vicinity}</p>
                  <div className="place-details">
                    <span className="rating">
                      ⭐ {place.rating ? place.rating.toFixed(1) : 'N/A'}
                    </span>
                    <span className="price-level">
                      {place.price_level ? '💰'.repeat(place.price_level) : ''}
                    </span>
                    {place.source && (
                      <span className="source">
                        📍 {place.source === 'OpenStreetMap' ? 'OSM' : 'Google'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="select-place-btn"
                  onClick={() => onLocationSelect && onLocationSelect(place)}
                >
                  Chọn
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



export default LocationMap;