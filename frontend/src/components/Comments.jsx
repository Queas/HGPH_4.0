import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Comments({ itemId, itemType }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load comments from localStorage
  useEffect(() => {
    const savedComments = localStorage.getItem(`comments_${itemType}_${itemId}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, [itemId, itemType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const comment = {
      id: Date.now(),
      username: user.username,
      role: user.role,
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    
    // Save to localStorage
    localStorage.setItem(`comments_${itemType}_${itemId}`, JSON.stringify(updatedComments));
    
    setNewComment('');
  };

  const handleDelete = (commentId) => {
    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    localStorage.setItem(`comments_${itemType}_${itemId}`, JSON.stringify(updatedComments));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return '#ef4444';
      case 'professional': return '#3b82f6';
      default: return '#22c55e';
    }
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        💬 Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows="3"
            required
            maxLength="500"
          />
          <div className="comment-form-footer">
            <span className="comment-char-count">{newComment.length}/500</span>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!newComment.trim()}>
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>Please log in to leave a comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <span className="comment-username">{comment.username}</span>
                  <span 
                    className="comment-role-badge" 
                    style={{ backgroundColor: getRoleBadgeColor(comment.role) }}
                  >
                    {comment.role}
                  </span>
                </div>
                <div className="comment-actions">
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  {user && (user.username === comment.username || user.role === 'admin') && (
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="comment-delete"
                      title="Delete comment"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Comments;
