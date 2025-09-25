import React, { useState } from 'react';
import axios from 'axios';
import './EmailForm.css';

const EmailForm = ({ threadId, setTravelInfo }) => {
  const [sendEmail, setSendEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    senderEmail: '',
    receiverEmail: '',
    subject: 'Thông tin du lịch cá nhân hóa'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!emailData.senderEmail || !emailData.receiverEmail || !emailData.subject) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin trước khi gửi.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axios.post('/api/travel/send-email', {
        ...emailData,
        threadId
      });

      setMessage({ type: 'success', text: 'Đã gửi hành trình tới hộp thư người nhận. Kiểm tra email của bạn nhé!' });
      setTravelInfo(null);
      setSendEmail(false);
      setEmailData({
        senderEmail: '',
        receiverEmail: '',
        subject: 'Thông tin du lịch cá nhân hóa'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Không thể gửi email ở thời điểm này. Vui lòng thử lại sau.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="email-wrapper card">
      <header className="email-header">
        <div>
          <span className="email-eyebrow">Chia sẻ hành trình</span>
          <h3>Gửi kế hoạch này tới hộp thư</h3>
          <p>
            Tùy chọn gửi nhanh toàn bộ lịch trình cho bản thân hoặc đồng đội. Email sẽ bao gồm đầy đủ các hạng mục mà AI
            đã gợi ý cho bạn.
          </p>
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={() => setSendEmail((prev) => !prev)}
          />
          <span className="toggle-slider" />
          <span className="toggle-label">{sendEmail ? 'Đang bật' : 'Tắt'}</span>
        </label>
      </header>

      {sendEmail && (
        <form className="email-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-field">
              <span className="field-label">Email người gửi</span>
              <input
                type="email"
                name="senderEmail"
                value={emailData.senderEmail}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </label>

            <label className="form-field">
              <span className="field-label">Email người nhận</span>
              <input
                type="email"
                name="receiverEmail"
                value={emailData.receiverEmail}
                onChange={handleInputChange}
                placeholder="partner@example.com"
                required
                disabled={loading}
              />
            </label>
          </div>

          <label className="form-field">
            <span className="field-label">Tiêu đề email</span>
            <input
              type="text"
              name="subject"
              value={emailData.subject}
              onChange={handleInputChange}
              placeholder="Ví dụ: Kế hoạch khám phá Tokyo tháng 12"
              required
              disabled={loading}
            />
          </label>

          <div className="email-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi email ngay'}
            </button>
          </div>
        </form>
      )}

      {message && <div className={`email-alert ${message.type}`}>{message.text}</div>}
    </section>
  );
};

export default EmailForm;