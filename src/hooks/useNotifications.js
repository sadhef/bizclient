import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
export const useNotifications = (userId) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsSupported(NotificationService.isSupported());
    
    // Initialize if permission already granted
    if (userId && Notification.permission === 'granted') {
      NotificationService.initialize(userId);
    }
  }, [userId]);

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = await NotificationService.requestPermission();
      setToken(token);
      setPermission(Notification.permission);
      
      if (userId) {
        await NotificationService.saveTokenToServer(userId);
      }
      
      NotificationService.setupMessageListener();
      return token;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    token,
    isLoading,
    error,
    requestPermission
  };
};