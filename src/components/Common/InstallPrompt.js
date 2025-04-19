import React, { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const InstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const captureInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPromptEvent(e);
      // Update UI to notify the user they can install the PWA
      setIsVisible(true);
    };

    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isAppInstalled) {
      window.addEventListener('beforeinstallprompt', captureInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) {
      return;
    }
    
    // Show the install prompt
    installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Reset the install prompt variable
      setInstallPromptEvent(null);
      setIsVisible(false);
    });
  };

  const dismissPrompt = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 mx-auto max-w-md z-50 ${
      isDark ? 'bg-violet-900' : 'bg-violet-700'
    } text-white rounded-lg shadow-lg p-4`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-3">
            <img src="/biztras.png" alt="BizTras" className="w-10 h-10 rounded-lg" />
          </div>
          <div>
            <h3 className="font-semibold">Install BizTras</h3>
            <p className="text-sm text-violet-200">Install our app for a better experience</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={dismissPrompt}
            className={`p-2 ${
              isDark ? 'hover:bg-violet-800' : 'hover:bg-violet-600'
            } rounded-lg`}
            aria-label="Dismiss"
          >
            <FiX />
          </button>
          <button 
            onClick={handleInstallClick}
            className={`flex items-center gap-1 ${
              isDark ? 'bg-violet-800 hover:bg-violet-700' : 'bg-violet-500 hover:bg-violet-600'
            } py-2 px-4 rounded-lg`}
          >
            <FiDownload />
            <span>Install</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;