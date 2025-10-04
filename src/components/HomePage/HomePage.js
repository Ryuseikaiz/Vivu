import React from 'react';
import FacebookPosts from '../FacebookPosts/FacebookPosts';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            🌟 Khám phá thế giới cùng <span className="brand-highlight">Vivu</span>
          </h1>
          <p className="hero-subtitle">
            Trí tuệ nhân tạo giúp bạn lên kế hoạch du lịch hoàn hảo, 
            từ chuyến bay đến khách sạn, từ ẩm thực đến trải nghiệm địa phương.
          </p>
        </div>
      </section>

      {/* Facebook Posts Section */}
      <section className="facebook-section">
        <div className="container">
          <h2 className="section-title">📱 Bài viết mới từ Vivu</h2>
          <FacebookPosts limit={3} />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">🎯 Tại sao chọn Vivu?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI Thông minh</h3>
              <p className="feature-description">
                Trí tuệ nhân tạo hiểu sở thích của bạn và đưa ra gợi ý cá nhân hóa hoàn hảo.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Tiết kiệm chi phí</h3>
              <p className="feature-description">
                Tìm kiếm và so sánh giá tốt nhất cho chuyến bay, khách sạn và hoạt động.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Cộng đồng sôi động</h3>
              <p className="feature-description">
                Kết nối với cộng đồng du lịch, chia sẻ kinh nghiệm và học hỏi từ người khác.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>🌟 Sẵn sàng cho chuyến phiêu lưu tiếp theo?</h2>
            <p>Hãy để Vivu giúp bạn tạo ra những kỷ niệm đáng nhớ</p>
            <a href="/ai" className="cta-button">
              Lên kế hoạch ngay
              <span className="cta-arrow">→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;