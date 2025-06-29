import React, { useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import {
  FiFlag,
  FiUser,
  FiLogIn,
  FiLogOut,
  FiUserPlus,
  FiShield,
  FiMenu,
  FiX,
  FiCloudLightning,
  FiHelpCircle,
  FiBell
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import PushNotificationManager from '../Admin/PushNotificationManager';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { currentUser, isAdmin, isCloud, logout } = useAuth();
  const { isDark } = useTheme();
  const { unreadCount } = useChat();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => {
    logout();
    history.push('/login');
    closeMenu();
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`${isDark ? 'bg-dark-primary/80 shadow-lg' : 'bg-violet-900/80'} backdrop-blur-md text-white sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link
                to={currentUser ? (isAdmin ? '/admin-dashboard' : isCloud ? '/cloud-dashboard' : '/challenges') : '/login'}
                className="text-2xl font-bold text-violet-100 hover:text-white"
              >
                BizTras
              </Link>

              <div className="hidden sm:flex space-x-3">
                {!currentUser && (
                  <>
                    <Link
                      to="/login"
                      className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                        isActive('/login') ? 'bg-violet-700 text-white' : 'hover:bg-violet-700/40 text-violet-300'
                      }`}
                    >
                      <FiLogIn className="mr-1" /> Login
                    </Link>
                    <Link
                      to="/cloud-login"
                      className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                        isActive('/cloud-login') ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700/40 text-indigo-300'
                      }`}
                    >
                      <FiCloudLightning className="mr-1" /> Cloud Login
                    </Link>
                  </>
                )}
                
                {currentUser && !isAdmin && !isCloud && (
                  <Link
                    to="/challenges"
                    className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                      isActive('/challenges') ? 'bg-violet-700 text-white' : 'hover:bg-violet-700/40 text-violet-300'
                    }`}
                  >
                    <FiFlag className="mr-1" /> Challenges
                  </Link>
                )}

                {isAdmin && (
                  <>
                    <Link
                      to="/admin-dashboard"
                      className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                        isActive('/admin-dashboard') ? 'bg-violet-700 text-white' : 'hover:bg-violet-700/40 text-violet-300'
                      }`}
                    >
                      <FiShield className="mr-1" /> Admin Dashboard
                    </Link>
                    <button
                      onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                      className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                        showNotificationPanel ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700/40 text-indigo-300'
                      }`}
                    >
                      <FiBell className="mr-1" /> Push Notifications
                    </button>
                  </>
                )}

                {isCloud && (
                  <Link
                    to="/cloud-dashboard"
                    className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                      isActive('/cloud-dashboard') ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700/40 text-indigo-300'
                    }`}
                  >
                    <FiCloudLightning className="mr-1" /> Cloud Dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />

              {currentUser && (
                <>
                  <Link
                    to="/support"
                    className={`flex items-center px-3 py-2 text-sm rounded-md font-medium relative ${
                      isActive('/support') ? 'bg-violet-700 text-white' : 'hover:bg-violet-700/40 text-violet-300'
                    }`}
                  >
                    <FiHelpCircle className="mr-1" />
                    <span className="hidden sm:inline">Support</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  <div className="flex items-center space-x-2">
                    <FiUser className="text-violet-300" />
                    <span className="text-violet-100 font-medium hidden sm:inline">
                      {currentUser.name}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm rounded-md font-medium hover:bg-red-600/40 text-red-300"
                  >
                    <FiLogOut className="mr-1" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}

              {!currentUser && (
                <Link
                  to="/register"
                  className="flex items-center px-3 py-2 text-sm rounded-md font-medium hover:bg-violet-700/40 text-violet-300"
                >
                  <FiUserPlus className="mr-1" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              )}

              <button
                onClick={toggleMenu}
                className="sm:hidden p-2 rounded-md hover:bg-violet-700/40"
              >
                {isMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="sm:hidden bg-violet-800/90 backdrop-blur-md rounded-b-lg mt-2 p-4 space-y-2">
              {!currentUser && (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-sm rounded-md font-medium text-violet-300 hover:bg-violet-700/40"
                  >
                    <FiLogIn className="inline mr-2" /> Login
                  </Link>
                  <Link
                    to="/cloud-login"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-sm rounded-md font-medium text-indigo-300 hover:bg-indigo-700/40"
                  >
                    <FiCloudLightning className="inline mr-2" /> Cloud Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-sm rounded-md font-medium text-violet-300 hover:bg-violet-700/40"
                  >
                    <FiUserPlus className="inline mr-2" /> Register
                  </Link>
                </>
              )}

              {currentUser && !isAdmin && !isCloud && (
                <Link
                  to="/challenges"
                  onClick={closeMenu}
                  className="block px-3 py-2 text-sm rounded-md font-medium text-violet-300 hover:bg-violet-700/40"
                >
                  <FiFlag className="inline mr-2" /> Challenges
                </Link>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin-dashboard"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-sm rounded-md font-medium text-violet-300 hover:bg-violet-700/40"
                  >
                    <FiShield className="inline mr-2" /> Admin Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setShowNotificationPanel(!showNotificationPanel);
                      closeMenu();
                    }}
                    className="block w-full text-left px-3 py-2 text-sm rounded-md font-medium text-indigo-300 hover:bg-indigo-700/40"
                  >
                    <FiBell className="inline mr-2" /> Push Notifications
                  </button>
                </>
              )}

              {isCloud && (
                <Link
                  to="/cloud-dashboard"
                  onClick={closeMenu}
                  className="block px-3 py-2 text-sm rounded-md font-medium text-indigo-300 hover:bg-indigo-700/40"
                >
                  <FiCloudLightning className="inline mr-2" /> Cloud Dashboard
                </Link>
              )}

              {currentUser && (
                <>
                  <Link
                    to="/support"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-sm rounded-md font-medium text-violet-300 hover:bg-violet-700/40 relative"
                  >
                    <FiHelpCircle className="inline mr-2" /> Support
                    {unreadCount > 0 && (
                      <span className="absolute right-2 top-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <div className="px-3 py-2 text-sm text-violet-100">
                    <FiUser className="inline mr-2" />
                    {currentUser.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-sm rounded-md font-medium text-red-300 hover:bg-red-600/40"
                  >
                    <FiLogOut className="inline mr-2" /> Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Push Notification Panel Modal */}
      {showNotificationPanel && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <PushNotificationManager onClose={() => setShowNotificationPanel(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;