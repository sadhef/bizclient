// Updated src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Determine the correct API base URL
const getApiBaseUrl = () => {
  // For production (Vercel)
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // For development - check both environment variables
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
};

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for CORS with credentials
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token to headers if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.error('Network Error Details:', {
        message: error.message,
        config: error.config,
        baseURL: error.config?.baseURL,
        url: error.config?.url
      });
      toast.error('Network error. Please check your connection and server status.');
      return Promise.reject(error);
    }

    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          if (data.code === 'TOKEN_EXPIRED' || data.code === 'INVALID_TOKEN') {
            localStorage.removeItem('token');
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
          }
          break;
          
        case 403:
          if (data.code === 'PENDING_APPROVAL') {
            toast.warning('Your account is pending admin approval.');
          } else if (data.code === 'ADMIN_ACCESS_REQUIRED') {
            toast.error('Admin access required.');
          } else if (data.code === 'CHALLENGE_INACTIVE') {
            toast.warning('Challenge is not currently active.');
          } else if (data.code === 'CHALLENGE_ALREADY_ENDED') {
            toast.error(data.error);
          }
          break;
          
        case 404:
          if (data.code === 'ROUTE_NOT_FOUND') {
            toast.error('Page not found.');
          }
          break;
          
        case 410:
          if (data.code === 'TIME_EXPIRED') {
            toast.error('Challenge time has expired!');
            window.location.href = '/thank-you';
          }
          break;
          
        case 429:
          toast.warning('Too many requests. Please slow down.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          if (data.error && !data.silent) {
            toast.error(data.error);
          }
      }
    } else if (error.request) {
      console.error('Request made but no response received:', error.request);
      toast.error('Network error. Please check your connection.');
    } else {
      console.error('Error setting up request:', error.message);
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
    
  register: (userData) => 
    api.post('/auth/register', userData),
    
  logout: () => 
    api.post('/auth/logout'),
    
  getMe: () => 
    api.get('/auth/me'),
    
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword, confirmPassword }),
    
  refreshToken: () =>
    api.post('/auth/refresh')
};

export const adminAPI = {
  getUsers: (params = {}) => 
    api.get('/admin/users', { params }),
    
  approveUser: (userId) => 
    api.put(`/admin/users/${userId}/approve`),
    
  disapproveUser: (userId) => 
    api.put(`/admin/users/${userId}/disapprove`),
    
  deleteUser: (userId) => 
    api.delete(`/admin/users/${userId}`),
    
  resetUser: (userId) => 
    api.put(`/admin/users/${userId}/reset`),
    
  getUserResetHistory: (userId) =>
    api.get(`/admin/users/${userId}/reset-history`),
    
  forceEndChallenge: (userId, reason) =>
    api.put(`/admin/users/${userId}/force-end`, { reason }),
    
  bulkApproveUsers: (userIds) =>
    api.put('/admin/users/bulk-approve', { userIds }),
    
  bulkResetUsers: (userIds) =>
    api.put('/admin/users/bulk-reset', { userIds }),
    
  getConfig: () => 
    api.get('/admin/config'),
    
  updateConfig: (config) => 
    api.put('/admin/config', config),
    
  getChallenges: () => 
    api.get('/admin/challenges'),
    
  createChallenge: (challenge) => 
    api.post('/admin/challenges', challenge),
    
  updateChallenge: (challengeId, challenge) => 
    api.put(`/admin/challenges/${challengeId}`, challenge),
    
  deleteChallenge: (challengeId) => 
    api.delete(`/admin/challenges/${challengeId}`),
    
  previewChallenge: (challengeId) =>
    api.get(`/admin/challenges/${challengeId}/preview`),
    
  getMonitoring: () => 
    api.get('/admin/monitoring'),
    
  getStats: () => 
    api.get('/admin/stats'),
    
  exportUsers: (format = 'json') =>
    api.get('/admin/export/users', { params: { format } })
};

export const challengeAPI = {
  startChallenge: () => 
    api.post('/challenge/start'),
    
  getCurrentChallenge: () => 
    api.get('/challenge/current'),
    
  submitFlag: (flag) => 
    api.post('/challenge/submit', { flag }),
    
  getHint: () => 
    api.get('/challenge/hint'),
    
  endChallenge: () => 
    api.post('/challenge/end'),
    
  getResults: () => 
    api.get('/challenge/results')
};

export default api;