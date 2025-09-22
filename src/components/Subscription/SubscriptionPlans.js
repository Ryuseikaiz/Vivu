import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/payment/plans');
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSubscribe = async (planType) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/payment/create-payment', {
        planType
      });

      // Redirect to PayOS payment page
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Không thể tạo link thanh toán'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="subscription-container">
      <h2>Gói Subscription</h2>
      
      {user?.subscription && (
        <div className="current-subscription">
          <h3>Gói hiện tại</h3>
          <div className="subscription-info">
            <p><strong>Loại:</strong> {
              user.subscription.type === 'trial' ? 'Dùng thử' :
              user.subscription.type === 'monthly' ? 'Gói tháng' :
              user.subscription.type === 'yearly' ? 'Gói năm' : 'Hết hạn'
            }</p>
            <p><strong>Trạng thái:</strong> 
              <span className={user.isSubscriptionActive ? 'active' : 'inactive'}>
                {user.isSubscriptionActive ? ' Đang hoạt động' : ' Hết hạn'}
              </span>
            </p>
            {user.subscription.endDate && (
              <p><strong>Hết hạn:</strong> {formatDate(user.subscription.endDate)}</p>
            )}
            <p><strong>Số lần tìm kiếm:</strong> {user.usage?.searchCount || 0}</p>
            {user.canUseTrial && (
              <p className="trial-available">🎉 Bạn còn 1 lần dùng thử miễn phí!</p>
            )}
          </div>
        </div>
      )}

      <div className="plans-grid">
        {Object.entries(plans).map(([planType, plan]) => (
          <div key={planType} className="plan-card">
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-price">
                {formatPrice(plan.price)}
                <span className="plan-duration">
                  /{planType === 'yearly' ? 'năm' : 'tháng'}
                </span>
              </div>
            </div>
            
            <div className="plan-description">
              <p>{plan.description}</p>
            </div>

            <div className="plan-features">
              <ul>
                <li>✅ Tìm kiếm chuyến bay không giới hạn</li>
                <li>✅ Tìm kiếm khách sạn không giới hạn</li>
                <li>✅ Gửi email thông tin du lịch</li>
                <li>✅ Hỗ trợ 24/7</li>
                {planType === 'yearly' && (
                  <li>🎉 Tiết kiệm 2 tháng so với gói tháng</li>
                )}
              </ul>
            </div>

            <button
              className={`subscribe-button ${planType}`}
              onClick={() => handleSubscribe(planType)}
              disabled={loading || (user?.subscription?.type === planType && user?.isSubscriptionActive)}
            >
              {user?.subscription?.type === planType && user?.isSubscriptionActive
                ? 'Đang sử dụng'
                : loading
                ? 'Đang xử lý...'
                : 'Đăng ký ngay'
              }
            </button>
          </div>
        ))}
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="payment-info">
        <h4>Thông tin thanh toán</h4>
        <p>💳 Thanh toán an toàn qua PayOS</p>
        <p>🔒 Hỗ trợ các phương thức: ATM, Visa, Mastercard, QR Code</p>
        <p>📧 Hóa đơn sẽ được gửi qua email sau khi thanh toán thành công</p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;