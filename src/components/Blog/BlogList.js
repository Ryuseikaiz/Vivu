import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BlogList.css';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    destination: '',
    tag: '',
    featured: false
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [filters, pagination.current]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: 9,
        ...filters
      };

      const response = await axios.get('/api/blog', { params });
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Không thể tải danh sách blog');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && posts.length === 0) {
    return (
      <div className="blog-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-list-container">
      {/* Header */}
      <div className="blog-header">
        <h1>🌍 Blog Du lịch</h1>
        <p>Khám phá những câu chuyện du lịch thú vị từ cộng đồng</p>
      </div>

      {/* Filters */}
      <div className="blog-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Tìm theo điểm đến..."
            value={filters.destination}
            onChange={(e) => handleFilterChange('destination', e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <input
            type="text"
            placeholder="🏷️ Tìm theo tag..."
            value={filters.tag}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <label className="featured-filter">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.checked)}
            />
            ⭐ Nổi bật
          </label>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Posts Grid */}
      <div className="posts-grid">
        {posts.map((post) => (
          <article key={post._id} className="post-card">
            {post.featured && <div className="featured-badge">⭐ Nổi bật</div>}
            
            {post.images && post.images.length > 0 && (
              <div className="post-image">
                <img
                  src={post.images[0].url}
                  alt={post.images[0].alt || post.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x250?text=Không+có+ảnh';
                  }}
                />
              </div>
            )}
            
            <div className="post-content">
              <div className="post-meta">
                <span className="destination">📍 {post.destination}</span>
                <span className="date">{formatDate(post.createdAt)}</span>
              </div>
              
              <h3 className="post-title">{post.title}</h3>
              
              <p className="post-excerpt">
                {truncateText(post.excerpt || post.content)}
              </p>
              
              <div className="post-tags">
                {post.tags && post.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
              
              <div className="post-stats">
                <div className="stats-left">
                  <span className="author">👤 {post.author?.name}</span>
                  {post.rating && (
                    <span className="rating">⭐ {post.rating}/5</span>
                  )}
                </div>
                
                <div className="stats-right">
                  <span className="likes">❤️ {post.likes?.length || 0}</span>
                  <span className="views">👁️ {post.viewCount || 0}</span>
                </div>
              </div>
              
              <button
                className="read-more-btn"
                onClick={() => navigate(`/blog/${post._id}`)}
              >
                Đọc tiếp →
              </button>
            </div>
          </article>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="no-posts">
          <h3>Không tìm thấy blog nào</h3>
          <p>Thử thay đổi bộ lọc hoặc tạo blog mới</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={pagination.current === 1}
            onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
          >
            ← Trước
          </button>
          
          <span className="page-info">
            Trang {pagination.current} / {pagination.pages}
          </span>
          
          <button
            className="page-btn"
            disabled={pagination.current === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList;