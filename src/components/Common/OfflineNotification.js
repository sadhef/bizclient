import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';

const OfflineNotification = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`flex items-center px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline 
          ? 'bg-green-600 text-white' 
          : isDark 
            ? 'bg-red-900 text-white' 
            : 'bg-red-600 text-white'
      }`}>
        {isOnline ? (
          <FaWifi className="h-4 w-4 mr-2" />
        ) : (
          <FaExclamationTriangle className="h-4 w-4 mr-2" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? 'Back online!' : 'You are offline. Some features may be unavailable.'}
        </span>
      </div>
    </div>
  );
};

export default OfflineNotification;