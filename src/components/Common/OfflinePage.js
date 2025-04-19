import React from 'react';
import { Link } from 'react-router-dom';
import { FiWifiOff, FiRefreshCw, FiHome } from 'react-icons/fi';

const OfflinePage = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900 flex flex-col justify-center items-center p-4">
      <div className="backdrop-blur-lg bg-violet-50/10 rounded-2xl shadow-2xl p-8 border border-violet-200/20 text-center max-w-md">
        <div className="bg-violet-700/50 p-4 rounded-full inline-flex mb-6 text-violet-200">
          <FiWifiOff size={48} />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">You're Offline</h1>
        
        <p className="text-violet-200 mb-6">
          It looks like you've lost your internet connection. Some features may be unavailable until you reconnect.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
          >
            <FiRefreshCw className="mr-2" />
            Refresh Page
          </button>
          
          <Link 
            to="/" 
            className="w-full flex items-center justify-center py-3 px-4 bg-transparent border border-violet-500 text-violet-300 rounded-lg hover:bg-violet-50/10 transition"
          >
            <FiHome className="mr-2" />
            Return to Home
          </Link>
        </div>
        
        <p className="text-sm text-violet-300 mt-6">
          Don't worry, any unsaved changes will be synced when you're back online.
        </p>
      </div>
    </div>
  );
};

export default OfflinePage;