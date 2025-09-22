import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <img 
          src="/ai-travel.png" 
          alt="AI Travel Assistant" 
          className="sidebar-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="sidebar-text">
          <h3>AI Travel Assistant</h3>
          <p>Trợ lý du lịch thông minh giúp bạn tìm kiếm chuyến bay và khách sạn tốt nhất.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;