import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaTimes, FaDownload } from 'react-icons/fa';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt variable
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Don't show if user dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) { // Don't show for 7 days
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
              Install Challenge Platform
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
              Install our app for a better experience with offline access and notifications.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex items-center px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FaDownload className="h-3 w-3 mr-1" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className={`px-3 py-1 text-xs ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-600 hover:text-gray-700'
                } rounded hover:bg-gray-100`}
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className={`ml-2 ${
              isDark 
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;