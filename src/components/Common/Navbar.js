import React, { useState, useRef, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FaSignOutAlt, FaUser, FaCog, FaBell, FaBellSlash, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import NotificationManager from '../Admin/NotificationManager';

const Navbar = () => {
  const { currentUser, logout, isAdmin, isCloud } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const history = useHistory();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const dropdownRef = useRef(null);
  
  // Push notification hook
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    subscribeToNotifications, 
    unsubscribeFromNotifications 
  } = usePushNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    history.push('/login');
    setIsDropdownOpen(false);
  };

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribeFromNotifications();
    } else {
      await subscribeToNotifications();
    }
  };

  const getNotificationTooltip = () => {
    if (isLoading) return 'Processing...';
    if (isSubscribed) return 'Notifications enabled - Click to disable';
    return 'Notifications disabled - Click to enable';
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin-dashboard';
    if (isCloud) return '/cloud-dashboard';
    return '/challenges';
  };

  const getUserTypeLabel = () => {
    if (isAdmin) return 'Admin';
    if (isCloud) return 'Cloud User';
    return 'User';
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <nav className="bg-dark-light/95 backdrop-blur border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <Link to={getDashboardPath()} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-dark font-bold text-sm">CTF</span>
                </div>
                <span className="text-xl font-bold text-white hidden sm:block">
                  Biztras
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                {!isAdmin && !isCloud && (
                  <Link
                    to="/challenges"
                    className="text-gray-300 hover:text-primary transition-colors"
                  >
                    Challenges
                  </Link>
                )}
                
                {isAdmin && (
                  <>
                    <Link
                      to="/admin-dashboard"
                      className="text-gray-300 hover:text-primary transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/levels"
                      className="text-gray-300 hover:text-primary transition-colors"
                    >
                      Levels
                    </Link>
                    <Link
                      to="/admin/progress"
                      className="text-gray-300 hover:text-primary transition-colors"
                    >
                      Progress
                    </Link>
                  </>
                )}
                
                {isCloud && (
                  <Link
                    to="/cloud-dashboard"
                    className="text-gray-300 hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side - Notifications and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Push Notification Bell - For all users */}
              {isSupported && (
                <div className="relative">
                  <button
                    onClick={handleToggleNotifications}
                    disabled={isLoading}
                    className={`p-2 rounded-full transition-all duration-300 relative ${
                      isLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-white/10'
                    } ${
                      isSubscribed
                        ? 'text-green-400'
                        : 'text-gray-400'
                    }`}
                    title={getNotificationTooltip()}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : isSubscribed ? (
                      <FaBell className="w-5 h-5" />
                    ) : (
                      <FaBellSlash className="w-5 h-5" />
                    )}
                    
                    {/* Active indicator */}
                    {isSubscribed && !isLoading && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                </div>
              )}

              {/* Admin Notification Send Button */}
              {isAdmin && (
                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="p-2 rounded-full text-blue-400 hover:bg-white/10 transition-all duration-300"
                  title="Send Push Notification"
                >
                  <FaPaperPlane className="w-5 h-5" />
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? '🌞' : '🌙'}
              </button>

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-dark" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-white">
                      {currentUser.username}
                    </div>
                    <div className="text-xs text-gray-400">
                      {getUserTypeLabel()}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-light border border-white/10 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-white/10">
                      <div className="text-sm font-medium text-white">
                        {currentUser.username}
                      </div>
                      <div className="text-xs text-gray-400">
                        {currentUser.email}
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaUser className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaCog className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    
                    <hr className="border-white/10 my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Notification Modal */}
      {isAdmin && showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-light border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Send Push Notification</h2>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <NotificationManager onClose={() => setShowNotificationModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;