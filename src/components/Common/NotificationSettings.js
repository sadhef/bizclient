import React from 'react';
import { FiBell, FiBellOff, FiCheck, FiX } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import useNotifications from '../../hooks/useNotifications';

const NotificationSettings = () => {
  const { isDark } = useTheme();
  const {
    isPermissionGranted,
    isLoading,
    error,
    isSupported,
    requestPermission,
    disableNotifications
  } = useNotifications();

  if (!isSupported) {
    return (
      <div className={`p-4 rounded-lg ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <FiBellOff className="mr-3 text-gray-500" />
          <div>
            <h3 className="font-medium">Notifications Not Supported</h3>
            <p className="text-sm opacity-75">
              Your browser or device doesn't support push notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg ${
      isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isPermissionGranted ? (
            <FiBell className="mr-3 text-green-500" />
          ) : (
            <FiBellOff className="mr-3 text-gray-500" />
          )}
          <div>
            <h3 className="font-medium">Push Notifications</h3>
            <p className="text-sm opacity-75">
              {isPermissionGranted 
                ? 'You will receive important updates and announcements'
                : 'Enable notifications to stay updated with important information'
              }
            </p>
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isPermissionGranted ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-green-500">
                <FiCheck className="mr-1" />
                <span className="text-sm">Enabled</span>
              </div>
              <button
                onClick={disableNotifications}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                Disable
              </button>
            </div>
          ) : (
            <button
              onClick={requestPermission}
              disabled={isLoading}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enabling...
                </div>
              ) : (
                'Enable Notifications'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;