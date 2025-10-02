import React, { useState } from 'react';
import axios from 'axios';
import './ImageUploader.css';

const ImageUploader = ({ onUploadSuccess, multiple = false, maxFiles = 10 }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (files.length > maxFiles) {
      setError(`Chỉ được chọn tối đa ${maxFiles} ảnh`);
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const newPreviews = [];

    files.forEach(file => {
      // Check if file is image
      if (!file.type.startsWith('image/')) {
        setError('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)');
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 10MB');
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          file: file,
          url: e.target.result,
          name: file.name
        });

        if (newPreviews.length === validFiles.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles(validFiles);
    setError('');
  };

  // Handle upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Vui lòng chọn ảnh để upload');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Vui lòng đăng nhập để upload ảnh');
      }

      const formData = new FormData();

      if (multiple) {
        // Upload multiple files
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });

        const response = await axios.post(
          'http://localhost:5000/api/upload/images',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            }
          }
        );

        // Call success callback with array of URLs
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data);
        }

        alert(`Upload thành công ${response.data.data.length} ảnh!`);
      } else {
        // Upload single file
        formData.append('image', selectedFiles[0]);

        const response = await axios.post(
          'http://localhost:5000/api/upload/image',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            }
          }
        );

        // Call success callback with single URL
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data);
        }

        alert('Upload ảnh thành công!');
      }

      // Reset form
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress(0);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  // Remove file from selection
  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  return (
    <div className="image-uploader">
      <div className="upload-area">
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading}
          id="file-input"
          className="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          <div className="upload-icon">📁</div>
          <div className="upload-text">
            {multiple 
              ? `Chọn ảnh (tối đa ${maxFiles} ảnh)` 
              : 'Chọn ảnh'
            }
          </div>
          <div className="upload-hint">
            JPG, PNG, GIF, WebP - Tối đa 10MB
          </div>
        </label>
      </div>

      {/* Preview selected images */}
      {previews.length > 0 && (
        <div className="preview-container">
          <h4>Ảnh đã chọn:</h4>
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div key={index} className="preview-item">
                <img src={preview.url} alt={preview.name} />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="remove-btn"
                  disabled={uploading}
                >
                  ✕
                </button>
                <div className="preview-name">{preview.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="progress-text">{uploadProgress}%</div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Upload button */}
      {selectedFiles.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="upload-btn"
        >
          {uploading ? 'Đang upload...' : `Upload ${selectedFiles.length} ảnh`}
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
