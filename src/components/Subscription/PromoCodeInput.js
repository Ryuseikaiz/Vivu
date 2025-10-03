import React, { useState } from 'react';
import axios from 'axios';
import './PromoCodeInput.css';

const PromoCodeInput = ({ onSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleApplyPromoCode = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mã khuyến mãi.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/promo/apply',
        { code: code.trim().toUpperCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage({ 
        type: 'success', 
        text: `${response.data.message} Bạn đã được kích hoạt ${response.data.duration}.` 
      });
      setCode('');
      
      // Notify parent component to refresh subscription data
      if (onSuccess) {
        onSuccess(response.data.subscription);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="promo-code-container">
      <h3>Có mã khuyến mãi?</h3>
      <p>Nhập mã để kích hoạt Premium ngay!</p>
      
      <form onSubmit={handleApplyPromoCode} className="promo-code-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Nhập mã khuyến mãi"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={loading}
            maxLength={20}
          />
          <button type="submit" disabled={loading || !code.trim()}>
            {loading ? 'Đang xử lý...' : 'Áp dụng'}
          </button>
        </div>
      </form>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
