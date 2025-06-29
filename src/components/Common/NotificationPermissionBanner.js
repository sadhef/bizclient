import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiBell, FiX, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';

const NotificationPermissionBanner = () => {
  const { currentUser } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (currentUser && notificationService.isSupported) {
      const status = notificationService.getPermissionStatus();
      setPermissionStatus(status);
      
      // Show banner if permission is default (not asked yet) or denied
      setShowBanner(status === 'default' || status === 'denied');
    }
  }, [currentUser]);

  const handleEnableNotifications = async () => {
    try {
      setIsRequesting(true);
      const token = await notificationService.requestPermission();
      
      if (token && currentUser) {
        await notificationService.saveTokenToDatabase(token, currentUser.id);
        toast.success('🔔 Notifications enabled successfully!');
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      
      if (error.message.includes('denied')) {
        toast.warn('Notifications were blocked. You can enable them in your browser settings.');
      } else {
        toast.error('Failed to enable notifications');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store dismissal in localStorage to remember user's choice
    localStorage.setItem('notificationBannerDismissed', 'true');
  };

  const openBrowserSettings = () => {
    toast.info('Go to your browser settings → Privacy & Security → Site Settings → Notifications to enable notifications for this site.');
  };

  // Don't show banner if dismissed before
  if (localStorage.getItem('notificationBannerDismissed') === 'true') {
    return null;
  }

  if (!showBanner || !currentUser || !notificationService.isSupported) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FiBell className="text-2xl" />
            <div>
              <p className="font-semibold">
                {permissionStatus === 'denied' 
                  ? '🔔 Notifications are currently blocked' 
                  : '🔔 Enable notifications to stay updated'
                }
              </p>
              <p className="text-sm opacity-90">
                {permissionStatus === 'denied'
                  ? 'Get notified about important updates, challenges, and system alerts'
                  : 'Receive real-time notifications for challenges, announcements, and important updates'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {permissionStatus === 'denied' ? (
              <button
                onClick={openBrowserSettings}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FiSettings className="w-4 h-4" />
                <span>Browser Settings</span>
              </button>
            ) : (
              <button
                onClick={handleEnableNotifications}
                disabled={isRequesting}
                className="bg-white text-indigo-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isRequesting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <span>Enabling...</span>
                  </div>
                ) : (
                  'Enable Notifications'
                )}
              </button>
            )}
            
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Dismiss"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;