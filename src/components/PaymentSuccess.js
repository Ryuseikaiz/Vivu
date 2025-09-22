import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [verifying, setVerifying] = useState(true);
  const [message, setMessage] = useState('');
  const { refreshUser } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderCode = urlParams.get('orderCode');
        const orderId = urlParams.get('orderId');

        if (orderCode && orderId) {
          const response = await axios.post('/api/payment/verify-payment', {
            orderCode,
            orderId
          });

          setMessage({
            type: 'success',
            text: response.data.message
          });

          // Refresh user data
          await refreshUser();
        } else {
          setMessage({
            type: 'error',
            text: 'Thông tin thanh toán không hợp lệ'
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.response?.data?.error || 'Không thể xác minh thanh toán'
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [refreshUser]);

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        {verifying ? (
          <div className="verifying">
            <div className="spinner"></div>
            <h2>Đang xác minh thanh toán...</h2>
            <p>Vui lòng đợi trong giây lát</p>
          </div>
        ) : (
          <div className="payment-result">
            {message.type === 'success' ? (
              <div className="success-content">
                <div className="success-icon">✅</div>
                <h2>Thanh toán thành công!</h2>
                <p>{message.text}</p>
                <button 
                  className="back-home-button"
                  onClick={handleBackToHome}
                >
                  Quay về trang chính
                </button>
              </div>
            ) : (
              <div className="error-content">
                <div className="error-icon">❌</div>
                <h2>Thanh toán thất bại</h2>
                <p>{message.text}</p>
                <button 
                  className="back-home-button"
                  onClick={handleBackToHome}
                >
                  Quay về trang chính
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;