import React from 'react';
import { FiWifiOff } from 'react-icons/fi';
import useOnlineStatus from '../../hooks/useOnlineStatus';

const OfflineNotification = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-max z-50">
      <div className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <FiWifiOff className="mr-2" />
        <span>You are currently offline. Some features may be unavailable.</span>
      </div>
    </div>
  );
};

export default OfflineNotification;