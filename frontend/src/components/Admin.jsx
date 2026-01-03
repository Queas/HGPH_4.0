import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

function Admin() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers(token);
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await authAPI.updateUserRole(userId, newRole, token);
      if (response.data.success) {
        setUsers(users.map(u =>
          u._id === userId ? { ...u, role: newRole } : u
        ));
        setSuccess('User role updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to update user role');
      console.error('Update role error:', error);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const response = await authAPI.toggleUserStatus(userId, !currentStatus, token);
      if (response.data.success) {
        setUsers(users.map(u =>
          u._id === userId ? { ...u, isActive: !currentStatus } : u
        ));
        setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to update user status');
      console.error('Toggle status error:', error);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const response = await authAPI.deleteUser(userId, token);
      if (response.data.success) {
        setUsers(users.filter(u => u._id !== userId));
        setSuccess('User deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to delete user');
      console.error('Delete user error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <div className="container">
          <div className="access-denied-content">
            <h2>Access Denied</h2>
            <p>You need administrator privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="admin" className="section admin">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Admin</span>
          <h2 className="section-title">User Management</h2>
          <p className="section-subtitle">
            Manage user accounts and permissions
          </p>
        </div>

        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="leaf-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <div className="admin-stats">
              <div className="stat-card">
                <h3>{users.length}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-card">
                <h3>{users.filter(u => u.role === 'professional').length}</h3>
                <p>Professionals</p>
              </div>
              <div className="stat-card">
                <h3>{users.filter(u => u.role === 'admin').length}</h3>
                <p>Administrators</p>
              </div>
              <div className="stat-card">
                <h3>{users.filter(u => u.isActive).length}</h3>
                <p>Active Users</p>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userData) => (
                    <tr key={userData._id}>
                      <td>{userData.username}</td>
                      <td>{userData.email}</td>
                      <td>
                        <select
                          value={userData.role}
                          onChange={(e) => handleRoleChange(userData._id, e.target.value)}
                          className="role-select"
                          disabled={userData._id === user._id} // Can't change own role
                        >
                          <option value="user">User</option>
                          <option value="professional">Professional</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${userData.isActive ? 'active' : 'inactive'}`}>
                          {userData.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{formatDate(userData.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleStatusToggle(userData._id, userData.isActive)}
                            className={`action-btn ${userData.isActive ? 'deactivate' : 'activate'}`}
                            disabled={userData._id === user._id} // Can't deactivate self
                          >
                            {userData.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userData._id, userData.username)}
                            className="action-btn delete"
                            disabled={userData._id === user._id} // Can't delete self
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Admin;