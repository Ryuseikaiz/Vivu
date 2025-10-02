// Ví dụ cách tích hợp ImageUploader vào CreateBlog component

import React, { useState } from 'react';
import ImageUploader from '../ImageUploader/ImageUploader';

const CreateBlogWithImageUpload = () => {
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    destination: '',
    images: [] // Array to store uploaded image URLs
  });

  // Handle successful image upload
  const handleImageUploadSuccess = (uploadedImages) => {
    // uploadedImages is an array of objects with url, fileId, fileName
    const imageUrls = Array.isArray(uploadedImages) 
      ? uploadedImages.map(img => ({
          url: img.url,
          fileId: img.fileId,
          alt: img.fileName
        }))
      : [{
          url: uploadedImages.url,
          fileId: uploadedImages.fileId,
          alt: uploadedImages.fileName
        }];

    setBlogData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData)
      });

      if (response.ok) {
        alert('Blog đã được tạo thành công!');
        // Reset form or redirect
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Lỗi khi tạo blog');
    }
  };

  return (
    <div className="create-blog-container">
      <h2>Tạo Blog Mới</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tiêu đề:</label>
          <input
            type="text"
            value={blogData.title}
            onChange={(e) => setBlogData({...blogData, title: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Địa điểm:</label>
          <input
            type="text"
            value={blogData.destination}
            onChange={(e) => setBlogData({...blogData, destination: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Nội dung:</label>
          <textarea
            value={blogData.content}
            onChange={(e) => setBlogData({...blogData, content: e.target.value})}
            rows={10}
            required
          />
        </div>

        <div className="form-group">
          <label>Hình ảnh:</label>
          <ImageUploader 
            multiple={true}
            maxFiles={10}
            onUploadSuccess={handleImageUploadSuccess}
          />
        </div>

        {/* Display uploaded images */}
        {blogData.images.length > 0 && (
          <div className="uploaded-images-preview">
            <h4>Ảnh đã upload ({blogData.images.length}):</h4>
            <div className="images-grid">
              {blogData.images.map((image, index) => (
                <div key={index} className="uploaded-image-item">
                  <img src={image.url} alt={image.alt} />
                  <button
                    type="button"
                    onClick={() => {
                      setBlogData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn">
          Đăng Blog
        </button>
      </form>
    </div>
  );
};

export default CreateBlogWithImageUpload;
