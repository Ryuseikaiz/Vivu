import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = ({ onShowSubscription, onShowLocationMap }) => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="user-info">
          <span className="welcome-text">Xin chào, {user?.name}!</span>
          <div className="subscription-status">
            {user?.canUseTrial ? (
              <span className="trial-badge">🎉 Dùng thử miễn phí</span>
            ) : user?.isSubscriptionActive ? (
              <span className="active-badge">✅ Subscription đang hoạt động</span>
            ) : (
              <span className="inactive-badge">❌ Subscription hết hạn</span>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="location-button"
            onClick={onShowLocationMap}
          >
            🗺️ Khám phá xung quanh
          </button>
          <button 
            className="subscription-button"
            onClick={onShowSubscription}
          >
            Quản lý Subscription
          </button>
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;