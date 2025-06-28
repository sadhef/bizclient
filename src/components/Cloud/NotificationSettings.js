import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FiX, 
  FiSave, 
  FiBell, 
  FiBellOff,
  FiClock,
  FiVolume2,
  FiVolumeX,
  FiPlay,
  FiAlertTriangle
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

// VAPID Configuration - Multiple fallback options
const getVAPIDKey = () => {
  // Try to get from environment first
  const envKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
  
  // Backend VAPID key (should match your .env file)
  const backendKey = 'BEQJhOMdmb92CNQ0sDDHxWDWWG84EvogFlEqMPt41OrJlYwMXo7fAAu077xu_il6SInks4OytQP6M9RmpM6c8RI';
  
  console.log('🔍 VAPID Key Debug:');
  console.log('Environment Key:', envKey);
  console.log('Backend Key:', backendKey);
  console.log('Using:', envKey || backendKey);
  
  return envKey || backendKey;
};

const VAPID_PUBLIC_KEY = getVAPIDKey();

const NotificationSettings = ({ onClose }) => {
  const { isDark } = useTheme();
  
  const [preferences, setPreferences] = useState({
    reminderNotifications: true,
    dueNotifications: true,
    overdueNotifications: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    },
    notificationSound: 'default'
  });
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  // Load current preferences and debug info
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await api.get('/notifications/preferences');
        if (response.status === 'success') {
          setPreferences(response.preferences);
          setIsSubscribed(response.isSubscribed);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        toast.error('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };

    // Set debug information
    setDebugInfo({
      notificationSupport: 'Notification' in window,
      serviceWorkerSupport: 'serviceWorker' in navigator,
      pushManagerSupport: 'PushManager' in window,
      vapidKey: VAPID_PUBLIC_KEY,
      vapidKeyLength: VAPID_PUBLIC_KEY ? VAPID_PUBLIC_KEY.length : 0,
      environmentKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
      allEnvVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP'))
    });

    loadPreferences();
  }, []);

  // Handle preference changes
  const handlePreferenceChange = (key, value) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setPreferences(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // Save preferences
  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await api.patch('/notifications/preferences', {
        preferences
      });
      
      if (response.status === 'success') {
        toast.success('Notification preferences saved successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Test notification
  const handleTestNotification = async () => {
    try {
      setTesting(true);
      
      const response = await api.post('/notifications/test');
      
      if (response.status === 'success') {
        toast.success('Test notification sent! Check your browser notifications.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setTesting(false);
    }
  };

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    try {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (error) {
      console.error('Error converting VAPID key:', error);
      throw new Error('Invalid VAPID key format');
    }
  };

  // Enable notifications with comprehensive error handling
  const enableNotifications = async () => {
    try {
      console.log('🔔 Starting notification setup...');
      
      // Check VAPID key first
      if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.length < 80) {
        console.error('❌ VAPID public key not found or invalid');
        console.log('Current VAPID key:', VAPID_PUBLIC_KEY);
        toast.error('VAPID public key not configured properly. Please check your environment variables.');
        return;
      }

      console.log('✅ VAPID key found:', VAPID_PUBLIC_KEY.substring(0, 20) + '...');

      // Check browser support
      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
      }

      if (!('serviceWorker' in navigator)) {
        throw new Error('This browser does not support service workers');
      }

      if (!('PushManager' in window)) {
        throw new Error('This browser does not support push messaging');
      }

      console.log('✅ Browser supports all required features');

      // Request permission
      console.log('📋 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Notification permission denied. Please enable notifications in your browser settings.');
      }

      console.log('✅ Notification permission granted');

      // Register service worker
      console.log('🔧 Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Wait for service worker to be ready
      console.log('⏳ Waiting for service worker...');
      await navigator.serviceWorker.ready;
      console.log('✅ Service worker ready');

      // Convert VAPID key to proper format
      console.log('🔑 Converting VAPID key...');
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      console.log('✅ VAPID key converted successfully');

      // Subscribe to push notifications
      console.log('📡 Subscribing to push notifications...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('✅ Push subscription successful:', subscription);

      // Send subscription to backend
      console.log('💾 Saving subscription to backend...');
      const response = await api.post('/notifications/subscribe', { 
        subscription: subscription.toJSON(),
        preferences 
      });

      if (response.status === 'success') {
        setIsSubscribed(true);
        toast.success('Push notifications enabled successfully!');
        console.log('✅ Notification setup completed successfully');
      } else {
        throw new Error('Failed to save subscription to server');
      }

    } catch (error) {
      console.error('❌ Error enabling notifications:', error);
      
      // Provide specific error messages
      if (error.name === 'NotSupportedError') {
        toast.error('Push notifications are not supported on this device/browser');
      } else if (error.name === 'NotAllowedError') {
        toast.error('Permission denied. Please enable notifications in browser settings');
      } else if (error.message.includes('applicationServerKey')) {
        toast.error('Invalid VAPID key configuration. Please contact support.');
      } else if (error.message.includes('gcm_sender_id')) {
        toast.error('Web app manifest configuration error. Please refresh and try again.');
      } else if (error.message.includes('VAPID')) {
        toast.error('VAPID key configuration error. Please check environment variables.');
      } else {
        toast.error(`Failed to enable notifications: ${error.message}`);
      }
    }
  };

  // Disable notifications
  const disableNotifications = async () => {
    try {
      // Unsubscribe from push notifications
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      // Remove subscription from backend
      await api.delete('/notifications/unsubscribe');
      
      setIsSubscribed(false);
      toast.success('Notifications disabled successfully');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Failed to disable notifications');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-8`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${
        isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-xl font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Notification Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* VAPID Status Check */}
          {(!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.length < 80) && (
            <div className={`p-4 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700`}>
              <div className="flex items-center">
                <FiAlertTriangle className="text-red-600 mr-3" size={24} />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-300">
                    VAPID Configuration Error
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    VAPID public key is missing or invalid. Push notifications will not work.
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    Current key: {VAPID_PUBLIC_KEY ? `${VAPID_PUBLIC_KEY.substring(0, 20)}... (${VAPID_PUBLIC_KEY.length} chars)` : 'Not found'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notification Status */}
          <div className={`p-4 rounded-lg border ${
            isSubscribed 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
              : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isSubscribed ? (
                  <FiBell className="text-green-600 mr-3" size={24} />
                ) : (
                  <FiBellOff className="text-yellow-600 mr-3" size={24} />
                )}
                <div>
                  <h3 className={`font-medium ${
                    isSubscribed 
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
                  </h3>
                  <p className={`text-sm ${
                    isSubscribed 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {isSubscribed 
                      ? 'You will receive push notifications for your tasks'
                      : 'Enable notifications to get reminders for your tasks'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {isSubscribed && (
                  <button
                    onClick={handleTestNotification}
                    disabled={testing}
                    className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {testing ? (
                      <>
                        <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <FiPlay className="mr-2" size={16} />
                        Test
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={isSubscribed ? disableNotifications : enableNotifications}
                  disabled={!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.length < 80}
                  className={`px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSubscribed
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isSubscribed ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>

          {/* Debug Information */}
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`font-medium mb-3 text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              System Information
            </h4>
            <div className={`grid grid-cols-2 gap-4 text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div>
                <div className="space-y-1">
                  <div>Notifications: {debugInfo.notificationSupport ? '✅' : '❌'}</div>
                  <div>Service Worker: {debugInfo.serviceWorkerSupport ? '✅' : '❌'}</div>
                  <div>Push Manager: {debugInfo.pushManagerSupport ? '✅' : '❌'}</div>
                </div>
              </div>
              <div>
                <div className="space-y-1">
                  <div>VAPID Key: {debugInfo.vapidKey ? '✅' : '❌'}</div>
                  <div>Key Length: {debugInfo.vapidKeyLength}</div>
                  <div>Env Key: {debugInfo.environmentKey ? '✅' : '❌'}</div>
                </div>
              </div>
            </div>
            {debugInfo.vapidKey && (
              <div className="mt-2 text-xs">
                <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs break-all">
                  {debugInfo.vapidKey.substring(0, 40)}...
                </div>
              </div>
            )}
          </div>

          {/* Rest of your notification settings... */}
          {/* Notification Types */}
          <div>
            <h3 className={`text-lg font-medium mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Notification Types
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Reminder Notifications
                  </span>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get notified at the reminder time you set for tasks
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.reminderNotifications}
                  onChange={(e) => handlePreferenceChange('reminderNotifications', e.target.checked)}
                  className="form-checkbox text-violet-600 focus:ring-violet-500"
                  disabled={!isSubscribed}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Due Date Notifications
                  </span>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get notified when tasks are due
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.dueNotifications}
                  onChange={(e) => handlePreferenceChange('dueNotifications', e.target.checked)}
                  className="form-checkbox text-violet-600 focus:ring-violet-500"
                  disabled={!isSubscribed}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Overdue Notifications
                  </span>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get notified about overdue tasks
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.overdueNotifications}
                  onChange={(e) => handlePreferenceChange('overdueNotifications', e.target.checked)}
                  className="form-checkbox text-violet-600 focus:ring-violet-500"
                  disabled={!isSubscribed}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-2 border rounded-lg transition ${
              isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving || !isSubscribed}
            className="flex items-center px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" size={16} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;