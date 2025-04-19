import axios from 'axios';
import { isOnline, cacheApiResponse, getCachedApiResponse, queueOfflineRequest, processOfflineQueue } from './network';

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
    
    // Check if online
    if (!isOnline()) {
      // If it's a GET request, we'll try to use cache in the response interceptor
      // For other methods, queue the request
      if (config.method.toLowerCase() !== 'get') {
        console.log('Offline: Queueing request', config.method, config.url);
        queueOfflineRequest(config.method, config.url.replace(API_BASE_URL, ''), config.data);
        
        // Return a rejected promise to prevent axios from trying to make the request
        return Promise.reject(new Error('Offline'));
      }
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
    // Cache successful GET requests for offline use
    if (response.config.method.toLowerCase() === 'get') {
      cacheApiResponse(response.config.url.replace(API_BASE_URL, ''), response.data);
    }
    
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Offline handling for GET requests
    if (error.message === 'Network Error' || error.message === 'Offline') {
      if (originalRequest.method.toLowerCase() === 'get') {
        console.log('Offline: Trying to get cached response for', originalRequest.url);
        const cachedData = getCachedApiResponse(originalRequest.url.replace(API_BASE_URL, ''));
        
        if (cachedData) {
          console.log('Offline: Using cached data for', originalRequest.url);
          return Promise.resolve(cachedData);
        }
      }
    }
    
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

// Process offline queue when going back online
window.addEventListener('online', async () => {
  console.log('Back online, processing offline queue');
  const processed = await processOfflineQueue(api);
  if (processed > 0) {
    console.log(`Processed ${processed} offline requests`);
  }
});

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
      // If offline and no cached data is available (would be handled in interceptor)
      if ((error.message === 'Network Error' || error.message === 'Offline') && !getCachedApiResponse(endpoint)) {
        console.error(`Offline: No cached data available for ${endpoint}`);
        throw new Error('You are offline and this content is not available offline');
      }
      
      console.error(`GET Error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // POST request with offline support
  post: async (endpoint, data = {}) => {
    try {
      const response = await instance.post(endpoint, data);
      return response;
    } catch (error) {
      // If offline, the request should have been queued in the interceptor
      if (error.message === 'Offline') {
        console.log(`Offline: Request queued for later: POST ${endpoint}`);
        return { queued: true, message: 'Request queued for when you are back online' };
      }
      
      console.error(`POST Error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // PUT request with offline support
  put: async (endpoint, data = {}) => {
    try {
      const response = await instance.put(endpoint, data);
      return response;
    } catch (error) {
      // If offline, the request should have been queued in the interceptor
      if (error.message === 'Offline') {
        console.log(`Offline: Request queued for later: PUT ${endpoint}`);
        return { queued: true, message: 'Request queued for when you are back online' };
      }
      
      console.error(`PUT Error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // PATCH request with offline support
  patch: async (endpoint, data = {}) => {
    try {
      const response = await instance.patch(endpoint, data);
      return response;
    } catch (error) {
      // If offline, the request should have been queued in the interceptor
      if (error.message === 'Offline') {
        console.log(`Offline: Request queued for later: PATCH ${endpoint}`);
        return { queued: true, message: 'Request queued for when you are back online' };
      }
      
      console.error(`PATCH Error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // DELETE request with offline support
  delete: async (endpoint) => {
    try {
      const response = await instance.delete(endpoint);
      return response;
    } catch (error) {
      // If offline, the request should have been queued in the interceptor
      if (error.message === 'Offline') {
        console.log(`Offline: Request queued for later: DELETE ${endpoint}`);
        return { queued: true, message: 'Request queued for when you are back online' };
      }
      
      console.error(`DELETE Error for ${endpoint}:`, error);
      throw error;
    }
  }
};

export default api;