import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8002';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000 // 5 seconds timeout
});

// Library API
export const libraryAPI = {
  getAll: (params = {}) => api.get('/library', { params }),
  getStats: () => api.get('/library/stats'),
  getById: (id) => api.get(`/library/${id}`),
  create: (data, token) => api.post('/library', data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  update: (id, data, token) => api.put(`/library/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  delete: (id) => api.delete(`/library/${id}`)
};

// Articles API
export const articlesAPI = {
  getAll: (params = {}) => api.get('/articles', { params }),
  getById: (id) => api.get(`/articles/${id}`),
  create: (data, token) => api.post('/articles', data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  update: (id, data, token) => api.put(`/articles/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  delete: (id) => api.delete(`/articles/${id}`)
};

// Contact API
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  markAsRead: (id) => api.put(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`)
};

// Auth API
export const authAPI = {
  register: (username, email, password, role = 'user') => api.post('/auth/register', { username, email, password, role }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: (token) => api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getAllUsers: (token) => api.get('/auth/users', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateUserRole: (id, role, token) => api.put(`/auth/users/${id}/role`, { role }, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  deleteUser: (id, token) => api.delete(`/auth/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  toggleUserStatus: (id, isActive, token) => api.put(`/auth/users/${id}/status`, { isActive }, {
    headers: { Authorization: `Bearer ${token}` }
  })
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
