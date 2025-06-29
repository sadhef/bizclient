import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      
      setIsSupported(supported);
      
      if (supported && currentUser) {
        registerServiceWorker();
        checkExistingSubscription();
      }
    };

    checkSupport();
  }, [currentUser]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  };

  const checkExistingSubscription = async () => {
    if (!currentUser) return;

    try {
      const response = await api.get('/push-notifications/subscription-status');
      setIsSubscribed(response.data.data.hasActiveSubscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToNotifications = useCallback(async () => {
    if (!isSupported || !currentUser) {
      toast.error('Push notifications are not supported');
      return false;
    }

    setIsLoading(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setIsLoading(false);
        return false;
      }

      // Get VAPID public key
      const vapidResponse = await api.get('/push-notifications/vapid-public-key');
      const vapidPublicKey = vapidResponse.data.publicKey;

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to server
      await api.post('/push-notifications/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
        }
      });

      setSubscription(subscription);
      setIsSubscribed(true);
      toast.success('🔔 Successfully subscribed to notifications!');
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error('Failed to subscribe to notifications');
      setIsLoading(false);
      return false;
    }
  }, [isSupported, currentUser]);

  const unsubscribeFromNotifications = useCallback(async () => {
    if (!currentUser) return false;

    setIsLoading(true);

    try {
      // Unsubscribe from server
      await api.delete('/push-notifications/unsubscribe');

      // Unsubscribe from browser
      if (subscription) {
        await subscription.unsubscribe();
      }

      setSubscription(null);
      setIsSubscribed(false);
      toast.success('🔕 Successfully unsubscribed from notifications');
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast.error('Failed to unsubscribe from notifications');
      setIsLoading(false);
      return false;
    }
  }, [currentUser, subscription]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    checkExistingSubscription
  };
};