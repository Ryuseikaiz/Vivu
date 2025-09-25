import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

const CATEGORY_OPTIONS = [
  { value: 'restaurant', label: 'Nhà hàng', emoji: '🍽️' },
  { value: 'cafe', label: 'Quán cà phê', emoji: '☕' },
  { value: 'lodging', label: 'Khách sạn', emoji: '🏨' },
  { value: 'tourist_attraction', label: 'Điểm tham quan', emoji: '🎯' }
];

const MAX_RESULTS = 12;

const formatRating = (rating) => {
  const numeric = Number(rating);
  return Number.isFinite(numeric) ? numeric.toFixed(1) : null;
};

const formatPlaceType = (type) => {
  if (!type) return '';
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const LocationMap = ({ onLocationSelect }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_OPTIONS[0].value);

  const buildMapsUrl = useCallback((place) => {
    if (!place) {
      return 'https://www.google.com/maps';
    }

    if (place.place_id) {
      return `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
    }

    const lat = place?.geometry?.location?.lat;
    const lng = place?.geometry?.location?.lng;

    if (lat && lng) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }

    if (place.name) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
    }

    return 'https://www.google.com/maps';
  }, []);

  const fetchNearbyPlaces = useCallback(async (location, category) => {
    if (!location) return;

    setLoading(true);
  setError(null);

    try {
      const response = await axios.post('/api/location/nearby', {
        location,
        category,
        radius: 2000
      });
      setNearbyPlaces(response.data.places || []);
    } catch (fetchError) {
      console.error('Error fetching nearby places:', fetchError);
      setError({ type: 'data', message: 'Không thể tải danh sách địa điểm. Vui lòng thử lại sau.' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError({ type: 'geolocation', message: 'Trình duyệt không hỗ trợ định vị.' });
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
      },
      (geoError) => {
        let errorMessage = 'Không thể lấy vị trí. ';
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMessage += 'Bạn cần cho phép truy cập vị trí.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorMessage += 'Tín hiệu định vị không ổn định.';
            break;
          case geoError.TIMEOUT:
            errorMessage += 'Yêu cầu định vị quá thời gian cho phép.';
            break;
          default:
            errorMessage += 'Đã xảy ra lỗi không xác định.';
            break;
        }
  setError({ type: 'geolocation', message: errorMessage });
        console.error('Geolocation error:', geoError);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [fetchNearbyPlaces, selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (userLocation) {
      fetchNearbyPlaces(userLocation, category);
    }
  };

  const handleOpenInMaps = (place) => {
    const url = buildMapsUrl(place);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSelectPlace = (event, place) => {
    event.stopPropagation();
    handleOpenInMaps(place);
    if (onLocationSelect) {
      onLocationSelect(place);
    }
  };

  const handlePlaceKeyDown = (event, place) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenInMaps(place);
    }
  };

  const placesToDisplay = useMemo(
    () => nearbyPlaces.slice(0, MAX_RESULTS),
    [nearbyPlaces]
  );

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const dismissError = useCallback(() => setError(null), []);


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
      <section className="location-hero card">
        <div className="location-hero__content">
          <span className="location-hero__eyebrow">Khám phá ngay</span>
          <h1 className="location-hero__title">Địa điểm nổi bật quanh bạn</h1>
          <p className="location-hero__description">
            Sử dụng dữ liệu Google Maps để gợi ý những điểm ăn uống, giải trí và lưu trú nổi bật.
            Chọn danh mục bạn quan tâm và bắt đầu hành trình khám phá chỉ với một chạm.
          </p>
        </div>

        <div className="location-hero__actions">
          <div className="category-chips">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`category-chip ${selectedCategory === option.value ? 'active' : ''}`}
                onClick={() => handleCategoryChange(option.value)}
              >
                <span className="chip-emoji" aria-hidden="true">{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="location-button"
            onClick={getCurrentLocation}
            disabled={loading}
          >
            {loading ? 'Đang xác định vị trí...' : '📍 Lấy vị trí hiện tại'}
          </button>

          {error && (
            <div className={`error-message error-message--${error.type || 'general'}`} role="alert">
              <span>{error.message || error}</span>
              <button type="button" className="error-dismiss" onClick={dismissError}>
                Đã hiểu
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="location-body">
        <div className="map-card card">
          <div className="map-card__header">
            <div>
              <h2>Bản đồ tương tác</h2>
              <p>Phóng to, thu nhỏ và chạm vào từng điểm để xem chi tiết nhanh.</p>
            </div>
            {userLocation && (
              <span className="map-status">Đang hiển thị trong bán kính 2km</span>
            )}
          </div>
          <div className="map-wrapper">
            {userLocation ? (
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={15}
                className="map-canvas"
              >
                <TileLayer
                  url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                  subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                />

                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={createUserLocationIcon()}
                >
                  <Popup>
                    <strong>📍 Vị trí của bạn</strong>
                  </Popup>
                </Marker>

                {nearbyPlaces.map((place) => (
                  <Marker
                    key={place.place_id || `${place.geometry.location.lat}-${place.geometry.location.lng}`}
                    position={[place.geometry.location.lat, place.geometry.location.lng]}
                    icon={createPlaceIcon(place.types?.[0])}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h4>{place.name}</h4>
                        <p>{place.vicinity}</p>
                        <button
                          type="button"
                          className="popup-button"
                          onClick={() => onLocationSelect && onLocationSelect(place)}
                        >
                          Sử dụng địa điểm này
                        </button>
                        <button
                          type="button"
                          className="popup-link"
                          onClick={() => handleOpenInMaps(place)}
                        >
                          Mở Google Maps ↗
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="map-loading">
                {loading ? 'Đang xác định vị trí của bạn...' : 'Nhấn "Lấy vị trí hiện tại" để bắt đầu khám phá'}
              </div>
            )}
          </div>
        </div>

        <div className="places-card card">
          <div className="places-header">
            <div>
              <h2>Danh sách đề xuất</h2>
              <p>Chạm để xem đường đi trên Google Maps hoặc chọn để dùng cho hành trình.</p>
            </div>
            <span className="places-count">{placesToDisplay.length} địa điểm</span>
          </div>

          <div className="places-list">
            {placesToDisplay.length === 0 && !loading && (
              <div className="empty-state">
                <h3>Chưa có dữ liệu</h3>
                <p>Hãy thử chuyển sang danh mục khác hoặc lấy lại vị trí của bạn.</p>
              </div>
            )}

            {loading && (
              <div className="loading-state">Đang tải danh sách địa điểm...</div>
            )}

            {placesToDisplay.map((place) => {
              const displayRating = formatRating(place.rating);
              const primaryType = formatPlaceType(place.types?.[0]);
              return (
                <div
                  key={place.place_id || `${place.geometry.location.lat}-${place.geometry.location.lng}`}
                  className="place-card"
                  role="link"
                  tabIndex={0}
                  onClick={() => handleOpenInMaps(place)}
                  onKeyDown={(event) => handlePlaceKeyDown(event, place)}
                >
                  {place.photos && place.photos.length > 0 ? (
                    <div className="place-image">
                      <img
                        src={`/api/location/photo/${place.photos[0].photo_reference}?maxwidth=300`}
                        alt={place.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="place-image placeholder">
                      <span>🌐</span>
                    </div>
                  )}

                  <div className="place-meta">
                    <div className="place-heading">
                      <h3>{place.name}</h3>
                      {displayRating && (
                        <span className="badge rating">⭐ {displayRating}</span>
                      )}
                    </div>
                    <p className="place-address">{place.vicinity || 'Đang cập nhật địa chỉ'}</p>
                    <div className="place-tags">
                      {place.price_level && (
                        <span className="badge price">{Array(place.price_level).fill('💰').join('')}</span>
                      )}
                      {primaryType && (
                        <span className="badge type">{primaryType}</span>
                      )}
                    </div>
                  </div>

                  <div className="place-actions">
                    <span className="open-maps">Mở Google Maps ↗</span>
                    <button
                      type="button"
                      className="select-place-btn"
                      onClick={(event) => handleSelectPlace(event, place)}
                    >
                      Chọn địa điểm này
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};



export default LocationMap;