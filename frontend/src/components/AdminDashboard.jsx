import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <section className="section">
        <div className="container">
          <div className="admin-access-denied">
            <h2>⛔ Access Denied</h2>
            <p>You need administrator privileges to access this page.</p>
          </div>
        </div>
      </section>
    );
  }

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8002/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  const handleDeleteUser = (username) => {
    if (!window.confirm(`Are you sure you want to delete all comments from ${username}?`)) return;
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('comments_')) {
        try {
          const comments = JSON.parse(localStorage.getItem(key));
          const filtered = comments.filter(c => c.username !== username);
          localStorage.setItem(key, JSON.stringify(filtered));
        } catch (e) {}
      }
    });
    loadUsers();
    alert(`All comments from ${username} have been deleted.`);
  };

  const getCommentCount = (username) => {
    let count = 0;
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('comments_')) {
        try {
          const comments = JSON.parse(localStorage.getItem(key));
          count += comments.filter(c => c.username === username).length;
        } catch (e) {}
      }
    });
    return count;
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return '#ef4444';
      case 'professional': return '#3b82f6';
      default: return '#22c55e';
    }
  };

  const getUserComments = (username) => {
    const allComments = [];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('comments_')) {
        try {
          const comments = JSON.parse(localStorage.getItem(key));
          const itemId = key.replace('comments_', '');
          comments.forEach(comment => {
            if (comment.username === username) {
              allComments.push({ ...comment, itemId, key });
            }
          });
        } catch (e) {}
      }
    });
    return allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const handleViewComments = (username) => {
    setSelectedUser(username);
    setUserComments(getUserComments(username));
  };

  const handleDeleteComment = (commentKey, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const comments = JSON.parse(localStorage.getItem(commentKey));
      const filtered = comments.filter(c => c.id !== commentId);
      localStorage.setItem(commentKey, JSON.stringify(filtered));
      if (selectedUser) setUserComments(getUserComments(selectedUser));
      loadUsers();
      alert('Comment deleted successfully');
    } catch (e) {
      alert('Error deleting comment');
    }
  };

  const filteredUsers = users.filter(u => {
    if (activeTab === 'all') return true;
    if (activeTab === 'users') return u.role === 'user';
    if (activeTab === 'professionals') return u.role === 'professional';
    return true;
  });

  const getAllComments = () => {
    const allComments = [];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('comments_')) {
        try {
          const comments = JSON.parse(localStorage.getItem(key));
          const itemId = key.replace('comments_', '');
          comments.forEach(comment => {
            allComments.push({ ...comment, itemId, key });
          });
        } catch (e) {}
      }
    });
    return allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  return (
    <section className="section admin-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Admin Panel</span>
          <h2 className="section-title">User Management</h2>
          <p className="section-subtitle">Manage user accounts and monitor activity</p>
        </div>
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">👥</div>
            <div className="admin-stat-content">
              <h3>{users.length}</h3>
              <p>Active Users</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">💬</div>
            <div className="admin-stat-content">
              <h3>{users.reduce((sum, u) => sum + getCommentCount(u.username), 0)}</h3>
              <p>Total Comments</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">⭐</div>
            <div className="admin-stat-content">
              <h3>{users.filter(u => u.role === 'professional').length}</h3>
              <p>Professionals</p>
            </div>
          </div>
        </div>
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'all' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('all'); setSelectedUser(null); }}
          >
            All Users ({users.length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('users'); setSelectedUser(null); }}
          >
            Regular Users ({users.filter(u => u.role === 'user').length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'professionals' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('professionals'); setSelectedUser(null); }}
          >
            Professionals ({users.filter(u => u.role === 'professional').length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'comments' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('comments'); setSelectedUser(null); }}
          >
            All Comments ({users.reduce((sum, u) => sum + getCommentCount(u.username), 0)})
          </button>
        </div>
        {selectedUser && (
          <div className="admin-comments-modal">
            <div className="admin-comments-header">
              <h3>Comments by {selectedUser}</h3>
              <button onClick={() => setSelectedUser(null)} className="btn-close">✕</button>
            </div>
            <div className="admin-comments-list">
              {userComments.length === 0 ? (
                <p>No comments found</p>
              ) : (
                userComments.map(comment => (
                  <div key={comment.id} className="admin-comment-item">
                    <div className="admin-comment-content">
                      <p>{comment.text}</p>
                      <small>{new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                    <button 
                      onClick={() => handleDeleteComment(comment.key, comment.id)} 
                      className="btn-danger btn-sm"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {activeTab === 'comments' ? (
          <div className="admin-users-table">
            <h3>All Comments</h3>
            <div className="admin-comments-list">
              {getAllComments().map(comment => (
                <div key={`${comment.key}-${comment.id}`} className="admin-comment-item">
                  <div className="admin-comment-content">
                    <strong>{comment.username}</strong>
                    <span 
                      className="role-badge" 
                      style={{ backgroundColor: getRoleBadgeColor(comment.role) }}
                    >
                      {comment.role}
                    </span>
                    <p>{comment.text}</p>
                    <small>{new Date(comment.createdAt).toLocaleString()}</small>
                  </div>
                  <button 
                    onClick={() => handleDeleteComment(comment.key, comment.id)} 
                    className="btn-danger btn-sm"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="admin-users-table">
            <h3>Users & Activity</h3>
            {loading ? (
              <div className="admin-loading">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="admin-empty">
                <p>No users found in this category.</p>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Comments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((userItem, index) => (
                    <tr key={index}>
                      <td>
                        <div className="user-info">
                          <span className="user-avatar">
                            {userItem.username.charAt(0).toUpperCase()}
                          </span>
                          <span className="user-name">{userItem.username}</span>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="role-badge" 
                          style={{ backgroundColor: getRoleBadgeColor(userItem.role) }}
                        >
                          {userItem.role}
                        </span>
                      </td>
                      <td>{getCommentCount(userItem.username)}</td>
                      <td>
                        <div className="admin-actions">
                          <button 
                            onClick={() => handleViewComments(userItem.username)} 
                            className="btn-primary btn-sm" 
                            title="View comments from this user"
                          >
                            👁️ View
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(userItem.username)} 
                            className="btn-danger btn-sm" 
                            title="Delete all comments from this user"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <div className="admin-info">
          <h3>ℹ️ Admin Information</h3>
          <ul>
            <li><strong>Comments Storage:</strong> Browser localStorage</li>
            <li><strong>Admin Account:</strong> Email: admin@halamanggaling.ph</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
