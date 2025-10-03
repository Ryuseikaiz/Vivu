import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const {
    user,
    logout,
    isAuthenticated,
    canUseTrial,
    isSubscriptionActive
  } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const navItems = [
    { key: 'blog', label: 'Trang chủ', to: '/', requireAuth: false, end: true },
    { key: 'ai', label: 'AI Du lịch', to: '/ai', requireAuth: true },
    { key: 'location', label: 'Khám phá', to: '/location', requireAuth: true },
    { key: 'create-blog', label: 'Viết blog', to: '/blog/create', requireAuth: true }
  ];

  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
    }
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
    navigate('/auth/login');
  };

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'VI';

  const subscriptionLabel = () => {
    if (isSubscriptionActive) {
      return 'Gói Premium';
    }
    if (canUseTrial) {
      return 'Đang dùng thử';
    }
    return 'Chưa đăng ký';
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <button
          type="button"
          className="navbar-logo"
          onClick={() => handleNavigate('/')}
        >
          <span className="logo-dot" />
          Vivu
        </button>

        <nav className={`navbar-links ${isMobileOpen ? 'open' : ''}`}>
          {navItems
            .filter((item) => !item.requireAuth || isAuthenticated)
            .map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate()}
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div ref={userMenuRef} className={`user-menu ${isUserMenuOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="user-trigger"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsUserMenuOpen((prev) => !prev);
                }}
              >
                <span className="user-avatar">{initials}</span>
                <span className="user-details">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-status">{subscriptionLabel()}</span>
                </span>
                <span className="chevron" aria-hidden="true">
                  {isUserMenuOpen ? '▴' : '▾'}
                </span>
              </button>
              <div className="user-dropdown">
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNavigate('/subscription');
                  }}
                >
                  Quản lý gói dịch vụ
                </button>
                <button
                  type="button"
                  className="dropdown-item logout"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-actions">
              <button
                type="button"
                className="nav-link cta"
                onClick={() => handleNavigate('/auth/login')}
              >
                Đăng nhập
              </button>
            </div>
          )}

          <button
            type="button"
            className={`menu-toggle ${isMobileOpen ? 'open' : ''}`}
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;