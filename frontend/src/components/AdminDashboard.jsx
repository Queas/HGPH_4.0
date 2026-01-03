import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  // Check if user is admin
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

  const loadUsers = () => {
    // Load all user accounts from localStorage comments
    // This is a simple implementation - in production, you'd fetch from API
    const allKeys = Object.keys(localStorage);
    const userEmails = new Set();
    
    // Get unique users from comments
    allKeys.forEach(key => {
      if (key.startsWith('comments_')) {
        try {
          const comments = JSON.parse(localStorage.getItem(key));
          comments.forEach(comment => {
            if (comment.username) {
              userEmails.add(JSON.stringify({
                username: comment.username,
                role: comment.role
              }));
            }
          });
        } catch (e) {}
      }
    });

    const uniqueUsers = Array.from(userEmails).map(u => JSON.parse(u));
    setUsers(uniqueUsers);
    setLoading(false);
  };

  const handleDeleteUser = (username) => {
    if (!window.confirm(`Are you sure you want to delete all comments from ${username}?`)) {
      return;
    }

    // Delete all comments from this user
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

  return (
    <section className="section admin-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Admin Panel</span>
          <h2 className="section-title">User Management</h2>
          <p className="section-subtitle">
            Manage user accounts and monitor activity
          </p>
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

        <div className="admin-users-table">
          <h3>Users & Activity</h3>
          {loading ? (
            <div className="admin-loading">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="admin-empty">
              <p>No users found. Users will appear here once they post comments.</p>
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
                {users.map((userItem, index) => (
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
                      <button
                        onClick={() => handleDeleteUser(userItem.username)}
                        className="btn-danger btn-sm"
                        title="Delete all comments from this user"
                      >
                        🗑️ Delete Comments
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-info">
          <h3>ℹ️ Admin Information</h3>
          <ul>
            <li><strong>Database Location:</strong> c:\Users\BrknChrds\Desktop\workshit\HGPh_4.0\backend\data\users.db</li>
            <li><strong>Comments Storage:</strong> Browser localStorage (local to each computer)</li>
            <li><strong>Create Admin:</strong> Run <code>node create-admin-local.js</code> in backend folder</li>
            <li><strong>View All Accounts:</strong> Open users.db file in the backend/data folder</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
