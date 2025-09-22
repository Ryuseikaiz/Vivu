import React, { useState } from 'react';
import axios from 'axios';
import './EmailForm.css';

const EmailForm = ({ threadId, setTravelInfo }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    senderEmail: '',
    receiverEmail: '',
    subject: 'Thông tin du lịch'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailData.senderEmail || !emailData.receiverEmail || !emailData.subject) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin email.' });
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/travel/send-email', {
        ...emailData,
        threadId
      });

      setMessage({ type: 'success', text: 'Email đã được gửi thành công!' });
      setTravelInfo(null);
      setShowEmailForm(false);
      setEmailData({
        senderEmail: '',
        receiverEmail: '',
        subject: 'Thông tin du lịch'
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Đã xảy ra lỗi khi gửi email.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-form-container">
      <div className="email-option">
        <p>Bạn có muốn gửi thông tin này qua email không?</p>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="sendEmail"
              value="no"
              checked={!showEmailForm}
              onChange={() => setShowEmailForm(false)}
            />
            Không
          </label>
          <label>
            <input
              type="radio"
              name="sendEmail"
              value="yes"
              checked={showEmailForm}
              onChange={() => setShowEmailForm(true)}
            />
            Có
          </label>
        </div>
      </div>

      {showEmailForm && (
        <form onSubmit={handleSubmit} className="email-form">
          <div className="form-group">
            <label htmlFor="senderEmail">Email người gửi:</label>
            <input
              type="email"
              id="senderEmail"
              name="senderEmail"
              value={emailData.senderEmail}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="receiverEmail">Email người nhận:</label>
            <input
              type="email"
              id="receiverEmail"
              name="receiverEmail"
              value={emailData.receiverEmail}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Tiêu đề email:</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={emailData.subject}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="send-button"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi Email'}
          </button>
        </form>
      )}

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default EmailForm;