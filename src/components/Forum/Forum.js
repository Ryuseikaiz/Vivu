import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import CreateBlogModal from '../Blog/CreateBlogModal';
import './Forum.css';

const Forum = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/blog');
      setPosts(response.data.posts || []);
    } catch (err) {
      setError('Không thể tải bài viết');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

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

  if (!isAuthenticated) {
    return (
      <div className="forum-container">
        <div className="forum-auth-required">
          <h2>🔒 Yêu cầu đăng nhập</h2>
          <p>Bạn cần đăng nhập để tham gia Forum du lịch</p>
          <Link to="/auth/login" className="auth-button">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-container">
      {/* Header */}
      <div className="forum-header">
        <div className="forum-header-content">
          <h1>🌍 Forum Du Lịch</h1>
          <p>Chia sẻ trải nghiệm, kết nối cộng đồng yêu du lịch</p>
        </div>
        
        {/* Create Post Button */}
        <button 
          onClick={() => setShowCreateModal(true)}
          className="create-post-btn"
        >
          <span className="create-post-icon">✏️</span>
          Tạo bài viết mới
        </button>
      </div>

      {/* Create Post Quick Access */}
      <div className="forum-create-quick">
        <div className="create-quick-header">
          <div className="user-avatar">
            {getInitials(user?.name)}
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="create-quick-input"
          >
            {user?.name}, bạn đang nghĩ gì về chuyến du lịch tiếp theo?
          </button>
        </div>
        <div className="create-quick-actions">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="quick-action"
          >
            📷 Ảnh/Video
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="quick-action"
          >
            📍 Check-in
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="quick-action"
          >
            💭 Chia sẻ cảm xúc
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="forum-feed">
        {loading ? (
          <div className="forum-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        ) : error ? (
          <div className="forum-error">
            <p>{error}</p>
            <button onClick={fetchPosts} className="retry-btn">
              Thử lại
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="forum-empty">
            <h3>🌟 Chưa có bài viết nào</h3>
            <p>Hãy là người đầu tiên chia sẻ trải nghiệm du lịch!</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="create-first-post"
            >
              Tạo bài viết đầu tiên
            </button>
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="forum-post">
              {/* Post Header */}
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    {getInitials(post.author?.name || 'Anonymous')}
                  </div>
                  <div className="author-info">
                    <h4 className="author-name">
                      {post.author?.name || 'Anonymous'}
                    </h4>
                    <p className="post-time">
                      {formatDate(post.createdAt)} • 🌍 Du lịch
                    </p>
                  </div>
                </div>
                <div className="post-menu">
                  <button className="menu-btn">⋯</button>
                </div>
              </div>

              {/* Post Content */}
              <div className="post-content">
                <h3 className="post-title">
                  <Link to={`/blog/${post._id}`}>
                    {post.title}
                  </Link>
                </h3>
                
                <div className="post-excerpt">
                  {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                  {post.content.length > 200 && '...'}
                </div>

                {post.imageUrl && (
                  <div className="post-image">
                    <img src={post.imageUrl} alt={post.title} />
                  </div>
                )}

                {/* Post Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="post-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="post-actions">
                <button className="action-btn like-btn">
                  <span className="action-icon">👍</span>
                  <span className="action-text">Thích</span>
                </button>
                <button className="action-btn comment-btn">
                  <span className="action-icon">💬</span>
                  <span className="action-text">Bình luận</span>
                </button>
                <button className="action-btn share-btn">
                  <span className="action-icon">📤</span>
                  <span className="action-text">Chia sẻ</span>
                </button>
                <Link to={`/blog/${post._id}`} className="action-btn read-more">
                  <span className="action-icon">📖</span>
                  <span className="action-text">Đọc thêm</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Blog Modal */}
      <CreateBlogModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(newPost) => {
          // Add new post to the beginning of the list
          setPosts(prev => [newPost, ...prev]);
        }}
      />
    </div>
  );
};

export default Forum;