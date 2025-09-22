import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = ({ 
  onShowLocationMap, 
  onShowSubscription, 
  onShowAI, 
  onShowBlog,
  onShowCreateBlog,
  currentView 
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowMobileMenu(false);
  };

  const handleNavClick = (action) => {
    action();
    setShowMobileMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand" onClick={() => handleNavClick(onShowBlog)}>
          <span className="brand-icon">✈️🌍</span>
          <span className="brand-text">AI Travel Agent</span>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          <button 
            className={`nav-item ${currentView === 'blog' ? 'active' : ''}`}
            onClick={() => handleNavClick(onShowBlog)}
          >
            🏠 Trang chủ
          </button>
          
          {isAuthenticated && (
            <>
              <button 
                className={`nav-item ${currentView === 'ai' ? 'active' : ''}`}
                onClick={() => handleNavClick(onShowAI)}
              >
                🤖 AI Du lịch
              </button>
              
              <button 
                className={`nav-item ${currentView === 'location' ? 'active' : ''}`}
                onClick={() => handleNavClick(onShowLocationMap)}
              >
                🗺️ Khám phá xung quanh
              </button>
              
              <button 
                className={`nav-item ${currentView === 'create-blog' ? 'active' : ''}`}
                onClick={() => handleNavClick(onShowCreateBlog)}
              >
                ✍️ Viết blog
              </button>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <span className="user-name">Xin chào, {user?.name}!</span>
                <div className="subscription-status">
                  {user?.canUseTrial ? (
                    <span className="trial-badge">🎉 Dùng thử miễn phí</span>
                  ) : user?.isSubscriptionActive ? (
                    <span className="active-badge">✅ Premium</span>
                  ) : (
                    <span className="inactive-badge">❌ Hết hạn</span>
                  )}
                </div>
              </div>
              
              <div className="user-actions">
                <button 
                  className="nav-button subscription-btn"
                  onClick={() => handleNavClick(onShowSubscription)}
                >
                  💳 Subscription
                </button>
                <button 
                  className="nav-button logout-btn"
                  onClick={handleLogout}
                >
                  🚪 Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <button 
              className="nav-button login-btn"
              onClick={() => handleNavClick(onShowAI)}
            >
              🔑 Đăng nhập
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <button 
            className={`mobile-nav-item ${currentView === 'blog' ? 'active' : ''}`}
            onClick={() => handleNavClick(onShowBlog)}
          >
            🏠 Trang chủ
          </button>
          
          {isAuthenticated ? (
            <>
              <button 
                className={`mobile-nav-item ${currentView === 'ai' ? 'active' : ''}`}
                onClick={() => handleNavClick(onShowAI)}
              >
                🤖 AI Du lịch
              </button>
              
              <button 
                className={`mobile-nav-item ${currentView === 'location' ? 'active' : ''}`}
                onClick={() => handleNavClick(onShowLocationMap)}
              >
                🗺️ Khám phá xung quanh
              </button>
              
              <button 
                className={`mobile-nav-item ${currentView === 'create-blog' ? 'active' : ''}`}
                onClick={() => handleNavClick(onShowCreateBlog)}
              >
                ✍️ Viết blog
              </button>
              
              <button 
                className="mobile-nav-item"
                onClick={() => handleNavClick(onShowSubscription)}
              >
                💳 Subscription
              </button>
              
              <button 
                className="mobile-nav-item logout"
                onClick={handleLogout}
              >
                🚪 Đăng xuất
              </button>
            </>
          ) : (
            <button 
              className="mobile-nav-item"
              onClick={() => handleNavClick(onShowAI)}
            >
              🔑 Đăng nhập
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;