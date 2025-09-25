import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './TravelForm.css';

const TRAVEL_STYLES = [
  {
    value: 'independent',
    label: 'Du lịch tự do',
    helper: 'Tự do khám phá với lịch trình linh hoạt, ưu tiên trải nghiệm địa phương.',
    prompt: 'Phong cách du lịch tự do, linh hoạt khám phá, đề xuất địa điểm địa phương độc đáo'
  },
  {
    value: 'guided',
    label: 'Tour trọn gói',
    helper: 'Ưu tiên dịch vụ trọn gói, lịch trình rõ ràng, hỗ trợ xuyên suốt chuyến đi.',
    prompt: 'Phong cách tour trọn gói với lịch trình chi tiết, dịch vụ dẫn đoàn và hỗ trợ 24/7'
  },
  {
    value: 'luxury',
    label: 'Nghỉ dưỡng cao cấp',
    helper: 'Tập trung vào nghỉ dưỡng, spa, resort cao cấp và trải nghiệm sang trọng.',
    prompt: 'Phong cách nghỉ dưỡng cao cấp, ưu tiên resort 5 sao, spa và trải nghiệm thượng lưu'
  },
  {
    value: 'adventure',
    label: 'Phiêu lưu khám phá',
    helper: 'Ưa thích hoạt động ngoài trời, trekking, khám phá thiên nhiên và mạo hiểm.',
    prompt: 'Phong cách phiêu lưu khám phá với hoạt động ngoài trời, trekking và trải nghiệm mạo hiểm an toàn'
  },
  {
    value: 'family',
    label: 'Gia đình',
    helper: 'Lịch trình thư thả, điểm đến phù hợp cho trẻ nhỏ và người lớn tuổi.',
    prompt: 'Phong cách du lịch gia đình, lịch trình nhẹ nhàng, phù hợp cho trẻ em và người lớn tuổi'
  },
  {
    value: 'business',
    label: 'Công tác kết hợp du lịch',
    helper: 'Kết hợp công việc và thư giãn, cần thời gian linh hoạt và không gian làm việc.',
    prompt: 'Phong cách công tác kết hợp nghỉ dưỡng, cần thời gian làm việc linh hoạt và tiện ích hỗ trợ'
  }
];

const BUDGET_OPTIONS = [
  { value: 'tiết kiệm', label: 'Tiết kiệm', helper: 'Ưu tiên giải pháp chi phí hợp lý.' },
  { value: 'cân bằng', label: 'Cân bằng', helper: 'Kết hợp tiết kiệm và trải nghiệm thoải mái.' },
  { value: 'cao cấp', label: 'Cao cấp', helper: 'Trải nghiệm dịch vụ cao cấp, sẵn sàng chi trả.' }
];

const PACE_OPTIONS = [
  { value: 'chill', label: 'Thảnh thơi', helper: 'Lịch trình nhẹ nhàng, nhiều thời gian thư giãn.' },
  { value: 'balanced', label: 'Cân bằng', helper: 'Kết hợp tham quan và nghỉ ngơi hợp lý.' },
  { value: 'dynamic', label: 'Năng động', helper: 'Lịch trình dày đặc, khám phá tối đa địa điểm.' }
];

const TRANSPORT_OPTIONS = [
  { value: 'plane', label: 'Máy bay', helper: 'Ưu tiên chuyến bay thẳng hoặc transit tối ưu.' },
  { value: 'hybrid', label: 'Kết hợp', helper: 'Kết hợp máy bay, tàu hỏa và phương tiện địa phương.' },
  { value: 'roadtrip', label: 'Roadtrip', helper: 'Tập trung di chuyển bằng ô tô/tàu, trải nghiệm đường bộ.' }
];

const INTEREST_OPTIONS = [
  { value: 'ẩm thực', label: 'Ẩm thực địa phương', emoji: '🍣' },
  { value: 'văn hóa', label: 'Văn hóa & lịch sử', emoji: '🏛️' },
  { value: 'thiên nhiên', label: 'Thiên nhiên - cảnh quan', emoji: '🌿' },
  { value: 'mua sắm', label: 'Mua sắm', emoji: '🛍️' },
  { value: 'giải trí', label: 'Giải trí đêm', emoji: '🎶' },
  { value: 'wellness', label: 'Wellness & spa', emoji: '💆' }
];

const TravelForm = ({
  setTravelInfo,
  setLoading,
  loading,
  setThreadId,
  disabled,
  selectedLocation,
  onClearSelectedLocation
}) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState(TRAVEL_STYLES[0].value);
  const [budgetLevel, setBudgetLevel] = useState(BUDGET_OPTIONS[1].value);
  const [pace, setPace] = useState(PACE_OPTIONS[1].value);
  const [transportMode, setTransportMode] = useState(TRANSPORT_OPTIONS[0].value);
  const [interests, setInterests] = useState([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const selectedStyle = useMemo(
    () => TRAVEL_STYLES.find((style) => style.value === travelStyle),
    [travelStyle]
  );

  const tripPreview = useMemo(() => {
    if (!origin || !destination) return '';

    const parts = [
      `Từ ${origin.trim()}`,
      `đến ${destination.trim()}`,
      startDate && endDate ? `(${startDate} → ${endDate})` : startDate ? `bắt đầu ${startDate}` : endDate ? `kết thúc ${endDate}` : '',
      `${travelers} khách`,
      selectedStyle ? selectedStyle.label.toLowerCase() : '',
      `ngân sách ${budgetLevel}`
    ].filter(Boolean);

    return parts.join(' • ');
  }, [origin, destination, startDate, endDate, travelers, budgetLevel, selectedStyle]);

  useEffect(() => {
    if (selectedLocation) {
      const formatted = [selectedLocation.name, selectedLocation.vicinity]
        .filter(Boolean)
        .join(', ');
      setDestination(formatted);
      setLocationStatus({ type: 'success', message: 'Đã điền điểm đến từ bản đồ tương tác.' });
      if (onClearSelectedLocation) {
        onClearSelectedLocation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);

  const toggleInterest = (value) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({ type: 'error', message: 'Trình duyệt không hỗ trợ định vị.' });
      return;
    }

    setDetectingLocation(true);
    setLocationStatus({ type: 'info', message: 'Đang xác định vị trí của bạn...' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await axios.post('/api/location/reverse-geocode', {
            lat: latitude,
            lng: longitude
          });

          if (response.data?.address) {
            setOrigin(response.data.address);
            setLocationStatus({ type: 'success', message: 'Đã cập nhật điểm khởi hành từ vị trí hiện tại.' });
          } else {
            setLocationStatus({ type: 'error', message: 'Không thể nhận diện địa chỉ. Bạn hãy nhập thủ công nhé.' });
          }
        } catch (geoError) {
          console.error('Reverse geocode error:', geoError);
          setLocationStatus({ type: 'error', message: 'Không thể lấy địa chỉ từ vị trí hiện tại.' });
        } finally {
          setDetectingLocation(false);
        }
      },
      (geoError) => {
        let message = 'Không thể lấy vị trí của bạn.';
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            message = 'Bạn cần cho phép quyền truy cập vị trí để sử dụng tính năng này.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            message = 'Tín hiệu định vị đang không ổn định, vui lòng thử lại sau.';
            break;
          case geoError.TIMEOUT:
            message = 'Định vị mất quá nhiều thời gian. Bạn vui lòng thử lại nhé.';
            break;
          default:
            message = 'Đã xảy ra lỗi khi định vị.';
        }
        setLocationStatus({ type: 'error', message });
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (disabled) {
      setError('Bạn cần đăng ký gói subscription để sử dụng tính năng này.');
      return;
    }

    if (!origin.trim() || !destination.trim()) {
      setError('Vui lòng nhập đầy đủ điểm đi và điểm đến.');
      return;
    }

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && end && start > end) {
      setError('Ngày kết thúc phải sau ngày bắt đầu hành trình.');
      return;
    }

    setLoading(true);
    setError('');
    setTravelInfo(null);

    const interestText = interests.length
      ? `Sở thích chính: ${interests.map((interest) => interest).join(', ')}`
      : 'Ưu tiên lịch trình đa dạng.';

    const dateText = startDate && endDate
      ? `Thời gian dự kiến từ ${startDate} đến ${endDate}`
      : startDate
      ? `Thời gian khởi hành dự kiến: ${startDate}`
      : endDate
      ? `Ngày kết thúc mong muốn: ${endDate}`
      : 'Thời gian linh hoạt.';

    const promptSegments = [
      'Bạn là chuyên gia thiết kế hành trình du lịch cá nhân hóa cho khách hàng Việt Nam.',
      `Hãy xây dựng lịch trình chi tiết theo phong cách ${selectedStyle?.label?.toLowerCase()}.`,
      selectedStyle?.prompt,
      `Điểm khởi hành: ${origin}.`,
      `Điểm đến chính: ${destination}.`,
      `${dateText}.`,
      `${travelers} hành khách trưởng thành.`,
      `Ngân sách mong muốn: ${budgetLevel}.`,
      `Nhịp độ chuyến đi: ${PACE_OPTIONS.find((item) => item.value === pace)?.label.toLowerCase()}.`,
      `Hình thức di chuyển ưu tiên: ${TRANSPORT_OPTIONS.find((item) => item.value === transportMode)?.label.toLowerCase()}.`,
      `${interestText}.`,
      notes ? `Ghi chú đặc biệt: ${notes}.` : null,
      'Trả kết quả dạng HTML với tiêu đề rõ ràng, bảng lịch trình theo ngày, gợi ý khách sạn, ẩm thực và chi phí ước tính.'
    ].filter(Boolean);

    try {
      const response = await axios.post('/api/travel/search', {
        query: promptSegments.join(' '),
        metadata: {
          origin,
          destination,
          startDate,
          endDate,
          travelers,
          travelStyle,
          budgetLevel,
          pace,
          transportMode,
          interests,
          notes
        }
      });

      setTravelInfo(response.data.travelInfo);
      setThreadId(response.data.threadId);

      if (response.data.usage) {
        const { trialUsed, searchCount } = response.data.usage;
        if (trialUsed && searchCount === 1) {
          setError('Bạn đã sử dụng lần dùng thử miễn phí. Đăng ký gói subscription để tiếp tục sử dụng.');
        }
      }
    } catch (submitError) {
      if (submitError.response?.status === 403) {
        setError(
          submitError.response.data.message ||
            'Bạn cần đăng ký gói subscription để sử dụng tính năng này.'
        );
      } else {
        setError(submitError.response?.data?.error || 'Đã xảy ra lỗi khi tìm kiếm thông tin du lịch.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading;
  const isFormDisabled = disabled || isSubmitting;

  return (
    <section className="travel-form-wrapper">
      <div className="travel-form-hero card">
        <div className="travel-form-hero__content">
          <span className="travel-form-hero__eyebrow">AI Travel Planner</span>
          <h1 className="travel-form-hero__title">Tùy biến hành trình theo phong cách của bạn</h1>
          <p className="travel-form-hero__description">
            Hãy cho AI biết bạn muốn đi đâu, khi nào và điều gì khiến chuyến đi trở nên đáng nhớ. Chúng tôi sẽ đề xuất
            lịch trình thông minh, cân bằng giữa trải nghiệm, ngân sách và sở thích của bạn.
          </p>
        </div>
        <div className="travel-form-hero__sidebar">
          <p className="style-helper">{selectedStyle?.helper}</p>
          {tripPreview && (
            <div className="trip-preview">
              <span className="trip-preview__label">Tổng quan hành trình</span>
              <p>{tripPreview}</p>
            </div>
          )}
        </div>
      </div>

      <form className="travel-form card" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="section-header">
            <div>
              <h2>Thông tin chuyến đi</h2>
              <p>Điền điểm đi, điểm đến và thời gian để AI nắm được khung chuyến đi của bạn.</p>
            </div>
            <div className="style-picker">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  className={`style-pill ${travelStyle === style.value ? 'active' : ''}`}
                  onClick={() => setTravelStyle(style.value)}
                  disabled={isFormDisabled}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field-grid">
            <label className="form-field">
              <span className="field-label">Điểm khởi hành *</span>
              <div className="field-with-action">
                <input
                  type="text"
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                  placeholder="Ví dụ: Hà Nội, Việt Nam"
                  disabled={isFormDisabled}
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleUseMyLocation}
                  disabled={isFormDisabled || detectingLocation}
                >
                  {detectingLocation ? 'Đang định vị...' : 'Lấy vị trí của tôi'}
                </button>
              </div>
            </label>

            <label className="form-field">
              <span className="field-label">Điểm đến *</span>
              <input
                type="text"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Ví dụ: Tokyo, Nhật Bản"
                disabled={isFormDisabled}
              />
            </label>

            <label className="form-field">
              <span className="field-label">Ngày khởi hành</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={isFormDisabled}
              />
            </label>

            <label className="form-field">
              <span className="field-label">Ngày kết thúc</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={isFormDisabled}
              />
            </label>

            <label className="form-field">
              <span className="field-label">Số du khách</span>
              <input
                type="number"
                min={1}
                max={16}
                value={travelers}
                onChange={(event) => setTravelers(Math.max(1, Number(event.target.value) || 1))}
                disabled={isFormDisabled}
              />
            </label>
          </div>

          {locationStatus && (
            <div className={`location-status ${locationStatus.type}`}>
              {locationStatus.message}
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="section-header">
            <div>
              <h2>Tùy chỉnh trải nghiệm</h2>
              <p>Lựa chọn phong cách chi tiêu, tốc độ hành trình và hình thức di chuyển yêu thích.</p>
            </div>
          </div>

          <div className="option-group">
            <h3>Ngân sách dự kiến</h3>
            <div className="option-grid">
              {BUDGET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`option-card ${budgetLevel === option.value ? 'selected' : ''}`}
                  onClick={() => setBudgetLevel(option.value)}
                  disabled={isFormDisabled}
                >
                  <span className="option-title">{option.label}</span>
                  <span className="option-helper">{option.helper}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <h3>Nhịp độ chuyến đi</h3>
            <div className="option-grid">
              {PACE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`option-card ${pace === option.value ? 'selected' : ''}`}
                  onClick={() => setPace(option.value)}
                  disabled={isFormDisabled}
                >
                  <span className="option-title">{option.label}</span>
                  <span className="option-helper">{option.helper}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <h3>Hình thức di chuyển chính</h3>
            <div className="option-grid">
              {TRANSPORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`option-card ${transportMode === option.value ? 'selected' : ''}`}
                  onClick={() => setTransportMode(option.value)}
                  disabled={isFormDisabled}
                >
                  <span className="option-title">{option.label}</span>
                  <span className="option-helper">{option.helper}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <div>
              <h2>Sở thích & ghi chú</h2>
              <p>Đánh dấu những điều bạn muốn AI ưu tiên khi thiết kế lịch trình.</p>
            </div>
          </div>

          <div className="interest-grid">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest.value}
                type="button"
                className={`interest-chip ${interests.includes(interest.value) ? 'active' : ''}`}
                onClick={() => toggleInterest(interest.value)}
                disabled={isFormDisabled}
              >
                <span className="chip-emoji" aria-hidden="true">{interest.emoji}</span>
                {interest.label}
              </button>
            ))}
          </div>

          <label className="form-field">
            <span className="field-label">Ghi chú thêm cho AI</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ví dụ: muốn tham gia lớp học nấu ăn địa phương, cần phòng khách sạn có phòng gym, tránh nơi quá đông đúc..."
              disabled={isFormDisabled}
            />
          </label>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={isFormDisabled}>
            {isSubmitting ? 'Đang tạo hành trình...' : disabled ? 'Cần subscription' : 'Tạo hành trình cá nhân hóa'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default TravelForm;