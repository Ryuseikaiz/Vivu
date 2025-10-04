import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FacebookPosts.css';

const FacebookPosts = ({ limit = 3 }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFacebookPosts();
  }, [limit]);

  const fetchFacebookPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/facebook/posts?limit=${limit}`);
      
      if (response.data.success) {
        setPosts(response.data.posts);
      } else {
        setError('Không thể tải bài viết Facebook');
      }
    } catch (err) {
      console.error('Error fetching Facebook posts:', err);
      setError('Lỗi kết nối đến Facebook');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="facebook-posts-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải bài viết từ Facebook...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="facebook-posts-error">
        <p>❌ {error}</p>
        <button onClick={fetchFacebookPosts} className="retry-button">
          Thử lại
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="facebook-posts-empty">
        <p>Chưa có bài viết nào từ Facebook</p>
      </div>
    );
  }

  return (
    <div className="facebook-posts">
      <div className="facebook-posts-header">
        <h3>📘 Tin tức mới nhất từ Vivu</h3>
        <a 
          href="https://www.facebook.com/vivuvivuv1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="facebook-link"
        >
          Xem thêm trên Facebook →
        </a>
      </div>

      <div className="facebook-posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="facebook-post-card">
            {post.image && (
              <div className="post-image">
                <img src={post.image} alt="Facebook post" />
              </div>
            )}
            
            <div className="post-content">
              <div className="post-text">
                <p>{truncateText(post.message, 120)}</p>
              </div>

              {post.attachment && (
                <div className="post-attachment">
                  <h4>{post.attachment.title}</h4>
                  <p>{truncateText(post.attachment.description, 80)}</p>
                </div>
              )}

              <div className="post-engagement">
                <span className="engagement-item">
                  ❤️ {post.engagement.reactions}
                </span>
                <span className="engagement-item">
                  💬 {post.engagement.comments}
                </span>
                <span className="engagement-item">
                  🔄 {post.engagement.shares}
                </span>
              </div>

              <div className="post-footer">
                <span className="post-date">
                  {formatDate(post.createdTime)}
                </span>
                <a 
                  href={post.permalink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-post-link"
                >
                  Xem bài viết
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="facebook-posts-footer">
        <button onClick={fetchFacebookPosts} className="refresh-button">
          🔄 Làm mới
        </button>
      </div>
    </div>
  );
};

export default FacebookPosts;