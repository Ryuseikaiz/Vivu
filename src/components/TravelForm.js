import React, { useState } from 'react';
import axios from 'axios';
import './TravelForm.css';

const TravelForm = ({ setTravelInfo, setLoading, loading, setThreadId, disabled }) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (disabled) {
      setError('Bạn cần đăng ký gói subscription để sử dụng tính năng này.');
      return;
    }
    
    if (!query.trim()) {
      setError('Vui lòng nhập truy vấn du lịch của bạn.');
      return;
    }

    setLoading(true);
    setError('');
    setTravelInfo(null);

    try {
      const response = await axios.post('/api/travel/search', {
        query: query.trim()
      });

      setTravelInfo(response.data.travelInfo);
      setThreadId(response.data.threadId);
      
      // Show usage info if available
      if (response.data.usage) {
        const { trialUsed, searchCount } = response.data.usage;
        if (trialUsed && searchCount === 1) {
          setError('Bạn đã sử dụng lần dùng thử miễn phí. Đăng ký gói subscription để tiếp tục sử dụng.');
        }
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data.message || 'Bạn cần đăng ký gói subscription để sử dụng tính năng này.');
      } else {
        setError(err.response?.data?.error || 'Đã xảy ra lỗi khi tìm kiếm thông tin du lịch.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="travel-form-container">
      <div className="sub-title">Nhập truy vấn du lịch của bạn và nhận thông tin về chuyến bay và khách sạn:</div>
      <form onSubmit={handleSubmit} className="travel-form">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập truy vấn du lịch của bạn ở đây... Ví dụ: Tôi muốn đi du lịch từ Hà Nội đến Tokyo từ ngày 1-7 tháng 12. Tìm cho tôi chuyến bay và khách sạn 4 sao."
          rows={6}
          className="query-textarea"
          disabled={loading || disabled}
        />
        {error && <div className="error">{error}</div>}
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading || disabled}
        >
          {loading ? 'Đang tìm kiếm...' : disabled ? 'Cần subscription' : 'Lấy thông tin du lịch'}
        </button>
      </form>
    </div>
  );
};

export default TravelForm;