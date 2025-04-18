import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Create axios instance
const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for CORS with credentials
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      
      // Redirect to login page if needed
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Set token manually
  setToken: (token) => {
    if (token) {
      instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete instance.defaults.headers.common.Authorization;
    }
  },
  
  // GET request
  get: async (endpoint, params = {}) => {
    try {
      const response = await instance.get(endpoint, { params });
      return response;
    } catch (error) {
      console.error(`GET Error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // POST request
  post: async (endpoint, data = {}) => {
    try {
      const response = await instance.post(endpoint, data);
      return response;
    } catch (error) {
      console.error(`POST Error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // PUT request
  put: async (endpoint, data = {}) => {
    try {
      const response = await instance.put(endpoint, data);
      return response;
    } catch (error) {
      console.error(`PUT Error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // PATCH request
  patch: async (endpoint, data = {}) => {
    try {
      const response = await instance.patch(endpoint, data);
      return response;
    } catch (error) {
      console.error(`PATCH Error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // DELETE request
  delete: async (endpoint) => {
    try {
      const response = await instance.delete(endpoint);
      return response;
    } catch (error) {
      console.error(`DELETE Error for ${endpoint}:`, error);
      throw error;
    }
  }
};

export default api;