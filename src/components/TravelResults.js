import React from 'react';
import './TravelResults.css';

const TravelResults = ({ travelInfo }) => {
  if (!travelInfo) {
    return null;
  }

  return (
    <section className="travel-results card">
      <header className="travel-results__header">
        <div>
          <span className="travel-results__eyebrow">Kế hoạch gợi ý bởi AI</span>
          <h2>Hành trình đề xuất dành riêng cho bạn</h2>
          <p>
            Lịch trình chi tiết dưới đây được cá nhân hóa dựa trên ưu tiên của bạn. Hãy xem qua, đánh dấu những phần
            yêu thích và tinh chỉnh trước khi đặt dịch vụ thực tế.
          </p>
        </div>
        <span className="travel-results__badge">Live Preview</span>
      </header>

      <div className="travel-results__content">
        <div
          className="travel-content"
          dangerouslySetInnerHTML={{ __html: travelInfo }}
        />
      </div>
    </section>
  );
};

export default TravelResults;