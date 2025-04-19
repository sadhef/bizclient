/**
 * Network utility functions for offline detection and handling
 */

// Check if the user is online
export const isOnline = () => {
    return navigator.onLine;
  };
  
  // Add online/offline event listener
  export const addNetworkStatusListener = (onlineCallback, offlineCallback) => {
    window.addEventListener('online', onlineCallback);
    window.addEventListener('offline', offlineCallback);
    
    return () => {
      window.removeEventListener('online', onlineCallback);
      window.removeEventListener('offline', offlineCallback);
    };
  };
  
  // Network status hook can be created to integrate with React components
  // This allows for easy offline handling in components
  
  // Handle offline API calls for caching responses
  export const cacheApiResponse = (url, data) => {
    try {
      localStorage.setItem(`cache_${url}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      return true;
    } catch (error) {
      console.error('Error caching API response:', error);
      return false;
    }
  };
  
  // Get cached API response
  export const getCachedApiResponse = (url) => {
    try {
      const cachedData = localStorage.getItem(`cache_${url}`);
      if (!cachedData) return null;
      
      const parsedData = JSON.parse(cachedData);
      
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - parsedData.timestamp;
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
      
      if (cacheAge > cacheExpiry) {
        // Cache expired, remove it
        localStorage.removeItem(`cache_${url}`);
        return null;
      }
      
      return parsedData.data;
    } catch (error) {
      console.error('Error reading cached API response:', error);
      return null;
    }
  };
  
  // Queue offline API requests to sync when online
  export const queueOfflineRequest = (method, url, data) => {
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      
      offlineQueue.push({
        method,
        url,
        data,
        timestamp: Date.now()
      });
      
      localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
      return true;
    } catch (error) {
      console.error('Error queueing offline request:', error);
      return false;
    }
  };
  
  // Process offline queue when back online
  export const processOfflineQueue = async (apiInstance) => {
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      if (offlineQueue.length === 0) return;
      
      // Create a new queue for failed requests
      const failedRequests = [];
      
      // Process each queued request
      for (const request of offlineQueue) {
        try {
          // Make the API call
          if (request.method.toLowerCase() === 'get') {
            await apiInstance.get(request.url);
          } else if (request.method.toLowerCase() === 'post') {
            await apiInstance.post(request.url, request.data);
          } else if (request.method.toLowerCase() === 'put') {
            await apiInstance.put(request.url, request.data);
          } else if (request.method.toLowerCase() === 'patch') {
            await apiInstance.patch(request.url, request.data);
          } else if (request.method.toLowerCase() === 'delete') {
            await apiInstance.delete(request.url);
          } else {
            // Unsupported method, add to failed requests
            failedRequests.push(request);
          }
        } catch (error) {
          // If the request fails, add it back to the queue
          console.error(`Failed to process offline request ${request.url}:`, error);
          failedRequests.push(request);
        }
      }
      
      // Save failed requests back to queue
      if (failedRequests.length > 0) {
        localStorage.setItem('offlineQueue', JSON.stringify(failedRequests));
      } else {
        // All requests processed successfully, clear the queue
        localStorage.removeItem('offlineQueue');
      }
      
      return offlineQueue.length - failedRequests.length; // Return number of successfully processed requests
    } catch (error) {
      console.error('Error processing offline queue:', error);
      return 0;
    }
    }