import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './CreateBlog.css';

const CreateBlog = ({ onBlogCreated, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    destination: '',
    tags: '',
    images: [{ url: '', caption: '', alt: '' }],
    location: {
      coordinates: { lat: '', lng: '' },
      address: '',
      country: '',
      city: ''
    },
    travelDate: {
      startDate: '',
      endDate: ''
    },
    budget: {
      amount: '',
      currency: 'VND'
    },
    rating: 5
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'location') {
        if (child === 'coordinates') {
          const [coord, axis] = value.split(',');
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                ...prev.location.coordinates,
                [axis]: parseFloat(coord) || ''
              }
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              [child]: value
            }
          }));
        }
      } else if (parent === 'travelDate') {
        setFormData(prev => ({
          ...prev,
          travelDate: {
            ...prev.travelDate,
            [child]: value
          }
        }));
      } else if (parent === 'budget') {
        setFormData(prev => ({
          ...prev,
          budget: {
            ...prev.budget,
            [child]: child === 'amount' ? parseFloat(value) || '' : value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'rating' ? parseInt(value) : value
      }));
    }
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', caption: '', alt: '' }]
    }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Trình duyệt không hỗ trợ định vị' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }
        }));
        setMessage({ type: 'success', text: 'Đã lấy vị trí hiện tại' });
      },
      (error) => {
        setMessage({ type: 'error', text: 'Không thể lấy vị trí hiện tại' });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Tiêu đề là bắt buộc');
      }
      if (!formData.content.trim() || formData.content.length < 100) {
        throw new Error('Nội dung phải có ít nhất 100 ký tự');
      }
      if (!formData.destination.trim()) {
        throw new Error('Điểm đến là bắt buộc');
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: formData.images.filter(img => img.url.trim()),
        location: {
          ...formData.location,
          coordinates: formData.location.coordinates.lat && formData.location.coordinates.lng 
            ? formData.location.coordinates 
            : undefined
        }
      };

      // Remove empty fields
      if (!submitData.location.coordinates) {
        delete submitData.location.coordinates;
      }
      if (!submitData.travelDate.startDate) {
        delete submitData.travelDate;
      }
      if (!submitData.budget.amount) {
        delete submitData.budget;
      }

      const response = await axios.post('/api/blog', submitData);
      
      setMessage({ type: 'success', text: response.data.message });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        destination: '',
        tags: '',
        images: [{ url: '', caption: '', alt: '' }],
        location: {
          coordinates: { lat: '', lng: '' },
          address: '',
          country: '',
          city: ''
        },
        travelDate: {
          startDate: '',
          endDate: ''
        },
        budget: {
          amount: '',
          currency: 'VND'
        },
        rating: 5
      });

      // Notify parent component
      if (onBlogCreated) {
        onBlogCreated(response.data.post);
      }

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || error.message || 'Có lỗi xảy ra khi tạo blog' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-blog-container">
      <div className="create-blog-header">
        <h1>✍️ Viết Blog Du lịch</h1>
        <p>Chia sẻ trải nghiệm du lịch của bạn với cộng đồng</p>
      </div>

      <form onSubmit={handleSubmit} className="create-blog-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>📝 Thông tin cơ bản</h3>
          
          <div className="form-group">
            <label htmlFor="title">Tiêu đề *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ví dụ: Khám phá vẻ đẹp Hạ Long Bay trong 3 ngày 2 đêm"
              required
              maxLength={200}
              disabled={loading}
            />
            <small>{formData.title.length}/200 ký tự</small>
          </div>

          <div className="form-group">
            <label htmlFor="destination">Điểm đến *</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="Ví dụ: Hạ Long Bay, Quảng Ninh"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Chia sẻ chi tiết về chuyến du lịch của bạn... (tối thiểu 100 ký tự)"
              required
              rows={10}
              disabled={loading}
            />
            <small>{formData.content.length} ký tự (tối thiểu 100)</small>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Ví dụ: du lịch, biển, gia đình, phiêu lưu (cách nhau bằng dấu phẩy)"
              disabled={loading}
            />
            <small>Cách nhau bằng dấu phẩy</small>
          </div>

          <div className="form-group">
            <label htmlFor="rating">Đánh giá chuyến đi</label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value={5}>⭐⭐⭐⭐⭐ Tuyệt vời (5/5)</option>
              <option value={4}>⭐⭐⭐⭐ Tốt (4/5)</option>
              <option value={3}>⭐⭐⭐ Bình thường (3/5)</option>
              <option value={2}>⭐⭐ Không tốt (2/5)</option>
              <option value={1}>⭐ Tệ (1/5)</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3>📸 Hình ảnh</h3>
          {formData.images.map((image, index) => (
            <div key={index} className="image-group">
              <div className="image-header">
                <span>Hình ảnh {index + 1}</span>
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="remove-image-btn"
                    disabled={loading}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label>URL hình ảnh</label>
                <input
                  type="url"
                  value={image.url}
                  onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={loading}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Chú thích</label>
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                    placeholder="Mô tả hình ảnh"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Alt text</label>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                    placeholder="Văn bản thay thế"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addImageField}
            className="add-image-btn"
            disabled={loading || formData.images.length >= 10}
          >
            + Thêm hình ảnh
          </button>
        </div>

        {/* Location */}
        <div className="form-section">
          <h3>📍 Vị trí</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Thành phố</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                placeholder="Ví dụ: Hạ Long"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Quốc gia</label>
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleInputChange}
                placeholder="Ví dụ: Việt Nam"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <input
              type="text"
              name="location.address"
              value={formData.location.address}
              onChange={handleInputChange}
              placeholder="Địa chỉ chi tiết"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.location.coordinates.lat}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: {
                    ...prev.location,
                    coordinates: {
                      ...prev.location.coordinates,
                      lat: parseFloat(e.target.value) || ''
                    }
                  }
                }))}
                placeholder="20.9101"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.location.coordinates.lng}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: {
                    ...prev.location,
                    coordinates: {
                      ...prev.location.coordinates,
                      lng: parseFloat(e.target.value) || ''
                    }
                  }
                }))}
                placeholder="107.1839"
                disabled={loading}
              />
            </div>
            
            <button
              type="button"
              onClick={getCurrentLocation}
              className="location-btn"
              disabled={loading}
            >
              📍 Lấy vị trí hiện tại
            </button>
          </div>
        </div>

        {/* Travel Details */}
        <div className="form-section">
          <h3>🗓️ Chi tiết chuyến đi</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                name="travelDate.startDate"
                value={formData.travelDate.startDate}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input
                type="date"
                name="travelDate.endDate"
                value={formData.travelDate.endDate}
                onChange={handleInputChange}
                min={formData.travelDate.startDate}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngân sách</label>
              <input
                type="number"
                name="budget.amount"
                value={formData.budget.amount}
                onChange={handleInputChange}
                placeholder="5000000"
                min="0"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Đơn vị tiền tệ</label>
              <select
                name="budget.currency"
                value={formData.budget.currency}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Hủy
          </button>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo Blog'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;