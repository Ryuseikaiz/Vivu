import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './BlogDetail.css';

const BlogDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (postId) {
      fetchPostDetails(postId);
    }
  }, [postId]);

  const fetchPostDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/blog/${id}`);
      setBlogPost(response.data.post);
    } catch (error) {
      console.error('Error fetching post details:', error);
      setMessage({ type: 'error', text: 'Không thể tải bài viết.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!blogPost) return;
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Vui lòng đăng nhập để thích bài viết' });
      return;
    }

    try {
      const response = await axios.post(`/api/blog/${blogPost._id}/like`);
      
      // Update local state
      setBlogPost(prev => ({
        ...prev,
        likes: response.data.isLiked 
          ? [...(prev.likes || []), { user: user._id }]
          : (prev.likes || []).filter(like => like.user !== user._id)
      }));

      setMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Không thể thích bài viết' 
      });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!blogPost) return;
    
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Vui lòng đăng nhập để bình luận' });
      return;
    }

    if (!newComment.trim() || newComment.trim().length < 5) {
      setMessage({ type: 'error', text: 'Bình luận phải có ít nhất 5 ký tự' });
      return;
    }

    try {
      setCommentLoading(true);
      const response = await axios.post(`/api/blog/${blogPost._id}/comments`, {
        content: newComment.trim()
      });

      // Update local state
      setBlogPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data.comment]
      }));

      setNewComment('');
      setMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Không thể thêm bình luận' 
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudget = (budget) => {
    if (!budget || !budget.amount) return null;
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: budget.currency || 'VND'
    }).format(budget.amount);
  };

  const isLiked = blogPost?.likes?.some(like => like.user === user?._id);

  if (loading) {
    return (
      <div className="blog-detail-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="blog-detail-container">
        <div className="error">Không tìm thấy bài viết</div>
      </div>
    );
  }

  return (
    <div className="blog-detail-container">
      {/* Header */}
      <div className="blog-detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Quay lại
        </button>
      </div>

      {/* Main Content */}
      <article className="blog-detail-content">
        {/* Featured Badge */}
        {blogPost.featured && (
          <div className="featured-badge">⭐ Bài viết nổi bật</div>
        )}

        {/* Title and Meta */}
        <header className="post-header">
          <h1 className="post-title">{blogPost.title}</h1>
          
          <div className="post-meta">
            <div className="meta-left">
              <span className="destination">📍 {blogPost.destination}</span>
              <span className="author">👤 {blogPost.author?.name}</span>
              <span className="date">🕒 {formatDate(blogPost.createdAt)}</span>
            </div>
            
            <div className="meta-right">
              {blogPost.rating && (
                <span className="rating">⭐ {blogPost.rating}/5</span>
              )}
              <span className="views">👁️ {blogPost.viewCount || 0}</span>
            </div>
          </div>
        </header>

        {/* Images */}
        {blogPost.images && blogPost.images.length > 0 && (
          <div className="post-images">
            {blogPost.images.map((image, index) => (
              <div key={index} className="image-container">
                <img
                  src={image.url}
                  alt={image.alt || blogPost.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400?text=Không+thể+tải+ảnh';
                  }}
                />
                {image.caption && (
                  <p className="image-caption">{image.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="post-content">
          {blogPost.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Travel Details */}
        <div className="travel-details">
          <h3>📋 Chi tiết chuyến đi</h3>
          
          <div className="details-grid">
            {blogPost.travelDate && (
              <div className="detail-item">
                <strong>🗓️ Thời gian:</strong>
                <span>
                  {new Date(blogPost.travelDate.startDate).toLocaleDateString('vi-VN')}
                  {blogPost.travelDate.endDate && (
                    <> - {new Date(blogPost.travelDate.endDate).toLocaleDateString('vi-VN')}</>
                  )}
                </span>
              </div>
            )}
            
            {blogPost.budget && blogPost.budget.amount && (
              <div className="detail-item">
                <strong>💰 Ngân sách:</strong>
                <span>{formatBudget(blogPost.budget)}</span>
              </div>
            )}
            
            {blogPost.location && (blogPost.location.city || blogPost.location.country) && (
              <div className="detail-item">
                <strong>🌍 Vị trí:</strong>
                <span>
                  {[blogPost.location.city, blogPost.location.country]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {blogPost.tags && blogPost.tags.length > 0 && (
          <div className="post-tags">
            <h4>🏷️ Tags:</h4>
            <div className="tags-list">
              {blogPost.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="post-actions">
          <button
            onClick={handleLike}
            className={`like-btn ${isLiked ? 'liked' : ''}`}
            disabled={!isAuthenticated}
          >
            {isLiked ? '❤️' : '🤍'} {blogPost.likes?.length || 0}
          </button>
          
          <span className="comments-count">
            💬 {blogPost.comments?.length || 0} bình luận
          </span>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Comments Section */}
        <div className="comments-section">
          <h3>💬 Bình luận ({blogPost.comments?.length || 0})</h3>
          
          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ cảm nghĩ của bạn về chuyến đi này..."
                rows={3}
                disabled={commentLoading}
              />
              <button
                type="submit"
                disabled={commentLoading || newComment.trim().length < 5}
                className="submit-comment-btn"
              >
                {commentLoading ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </form>
          ) : (
            <p className="login-prompt">
              Vui lòng đăng nhập để bình luận
            </p>
          )}

          {/* Comments List */}
          <div className="comments-list">
            {blogPost.comments && blogPost.comments.length > 0 ? (
              blogPost.comments.map((comment, index) => (
                <div key={index} className="comment">
                  <div className="comment-header">
                    <span className="comment-author">👤 {comment.user?.name}</span>
                    <span className="comment-date">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;