import axios from 'axios';

const BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://bladerunner.greenjets.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  maxRedirects: 0,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response Error:', error);
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('user');
      
      // Fixed redirect path for admin
      if (window.location.pathname.includes('admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    adminLogin: '/auth/admin/login',
    verify: '/auth/verify',
    logout: '/auth/logout'
  },
  users: {
    getAll: '/users',
    approve: (id) => `/users/${id}/approve`,
    delete: (id) => `/users/${id}`,
  }
};

export default api;