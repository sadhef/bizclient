import React, { useState } from 'react';
import { FaBell, FaBellSlash } from 'react-icons/fa';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useAuth } from '../../context/AuthContext';

const NotificationButton = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    subscribeToNotifications, 
    unsubscribeFromNotifications 
  } = usePushNotifications();
  const { currentUser } = useAuth();

  if (!currentUser || !isSupported) {
    return null;
  }

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribeFromNotifications();
    } else {
      await subscribeToNotifications();
    }
  };

  const getTooltipText = () => {
    if (isLoading) return 'Processing...';
    if (isSubscribed) return 'Disable notifications';
    return 'Enable notifications';
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleNotifications}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isLoading}
        className={`p-2 rounded-full transition-all duration-300 ${
          isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-white/10'
        } ${
          isSubscribed
            ? 'text-green-400'
            : 'text-gray-400'
        }`}
        title={getTooltipText()}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : isSubscribed ? (
          <FaBell className="w-5 h-5" />
        ) : (
          <FaBellSlash className="w-5 h-5" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && !isLoading && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
          {getTooltipText()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;