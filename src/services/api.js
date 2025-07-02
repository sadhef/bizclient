import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
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
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
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
      toast.error('Network error. Please check your connection.');
    } else {
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
    
  bulkApproveUsers: (userIds) =>
    api.put('/admin/users/bulk-approve', { userIds }),
    
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
    
  getStatus: () => 
    api.get('/challenge/status'),
    
  getHint: () => 
    api.get('/challenge/hint'),
    
  getSubmissions: (level) => 
    api.get('/challenge/submissions', { params: { level } }),
    
  resetChallenge: () =>
    api.post('/challenge/reset'),
    
  getLeaderboard: (limit = 10) =>
    api.get('/challenge/leaderboard', { params: { limit } }),
    
  getChallengeInfo: () =>
    api.get('/challenge/info'),
    
  getLevels: () =>
    api.get('/challenge/levels'),
    
  validateFlag: (flag, level) =>
    api.post('/challenge/validate', { flag, level })
};

export const utilAPI = {
  healthCheck: () => 
    api.get('/health')
};

// Helper functions
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return 'An unexpected error occurred.';
  }
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const getErrorCode = (error) => {
  return error.response?.data?.code || null;
};

export default api;