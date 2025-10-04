import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './CreateBlogModal.css';

const CreateBlogModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .trim()
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/blog', {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });

      if (response.data.success) {
        setFormData({ title: '', content: '', tags: '' });
        onSuccess && onSuccess(response.data.post);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo bài viết');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-blog-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Tạo bài viết</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="modal-user-info">
          <div className="user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="user-details">
            <h4>{user?.name}</h4>
            <div className="privacy-selector">
              <span className="privacy-icon">🌍</span>
              <span>Công khai</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Tiêu đề bài viết..."
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="title-input"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="form-group">
            <textarea
              placeholder={`${user?.name}, bạn đang nghĩ gì về chuyến du lịch?`}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="content-textarea"
              rows={8}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Tags (phân cách bằng dấu phẩy): du lịch, ẩm thực, khám phá..."
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="tags-input"
            />
          </div>

          {/* Add to Post Options */}
          <div className="add-to-post">
            <span className="add-label">Thêm vào bài viết của bạn</span>
            <div className="add-options">
              <button type="button" className="add-option" title="Ảnh/Video">
                📷
              </button>
              <button type="button" className="add-option" title="Check-in">
                📍
              </button>
              <button type="button" className="add-option" title="Cảm xúc">
                😊
              </button>
              <button type="button" className="add-option" title="Hoạt động">
                🎯
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-btn ${!formData.title.trim() || !formData.content.trim() || loading ? 'disabled' : ''}`}
            disabled={!formData.title.trim() || !formData.content.trim() || loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Đang đăng...
              </>
            ) : (
              'Đăng'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogModal;