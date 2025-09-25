import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar card">
      <div className="sidebar__badge">AI Travel Copilot</div>
      <div className="sidebar__hero">
        <img
          src="/ai-travel.png"
          alt="AI Travel Assistant"
          className="sidebar__image"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <div>
          <h3>Tạo hành trình thông minh</h3>
          <p>
            Kết hợp sức mạnh AI và dữ liệu thực tế để đưa ra gợi ý bay, lưu trú, ẩm thực và trải nghiệm phù hợp với phong
            cách của bạn.
          </p>
        </div>
      </div>

      <ul className="sidebar__highlights">
        <li>
          <span className="emoji" aria-hidden="true">🧭</span>
          Lịch trình chi tiết mỗi ngày, tối ưu di chuyển và thời gian khám phá.
        </li>
        <li>
          <span className="emoji" aria-hidden="true">💡</span>
          Gợi ý địa điểm độc đáo, nhà hàng bản địa và hoạt động đặc sắc.
        </li>
        <li>
          <span className="emoji" aria-hidden="true">🛎️</span>
          Lựa chọn khách sạn phù hợp ngân sách, kèm mẹo săn ưu đãi nhanh.
        </li>
      </ul>

      <div className="sidebar__cta">
        <h4>Tip nhanh</h4>
        <p>Thử đổi phong cách du lịch hoặc sở thích để xem AI tái thiết kế hành trình như thế nào.</p>
      </div>
    </aside>
  );
};

export default Sidebar;