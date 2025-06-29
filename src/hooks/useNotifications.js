import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const useNotifications = () => {
  const { currentUser } = useAuth();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check notification permission status
  const checkPermissionStatus = useCallback(() => {
    if ('Notification' in window) {
      setIsPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Initialize notifications
  const initializeNotifications = useCallback(async () => {
    if (!currentUser || !notificationService.isSupported) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check current permission
      checkPermissionStatus();

      if (Notification.permission === 'granted') {
        // Get FCM token
        const token = await notificationService.getFCMToken();
        setFcmToken(token);

        // Save token to database
        await notificationService.saveTokenToDatabase(token, currentUser.id);

        // Listen for messages
        notificationService.onMessageListener();
      }
    } catch (err) {
      console.error('Error initializing notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, checkPermissionStatus]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!notificationService.isSupported) {
      throw new Error('Notifications are not supported on this device');
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await notificationService.requestPermission();
      setFcmToken(token);
      setIsPermissionGranted(true);

      if (currentUser) {
        await notificationService.saveTokenToDatabase(token, currentUser.id);
      }

      toast.success('Notifications enabled successfully!');
      return token;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    try {
      // Remove token from database
      if (fcmToken) {
        await fetch('/api/notifications/token', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ token: fcmToken })
        });
      }

      setFcmToken(null);
      setIsPermissionGranted(false);
      toast.success('Notifications disabled successfully!');
    } catch (err) {
      console.error('Error disabling notifications:', err);
      toast.error('Failed to disable notifications');
    }
  }, [fcmToken]);

  // Initialize on mount and user change
  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  // Check permission status on focus
  useEffect(() => {
    const handleFocus = () => checkPermissionStatus();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkPermissionStatus]);

  return {
    isPermissionGranted,
    fcmToken,
    isLoading,
    error,
    isSupported: notificationService.isSupported,
    requestPermission,
    disableNotifications,
    initializeNotifications
  };
};

export default useNotifications;