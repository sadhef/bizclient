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
  FiHelpCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
                <Link
                  to="/admin-dashboard"
                  className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                    isActive('/admin') ? 'bg-violet-700 text-white' : 'hover:bg-violet-700/40 text-violet-300'
                  }`}
                >
                  <FiShield className="mr-1" /> Admin
                </Link>
              )}
              {/* Cloud Dashboard Link - Only visible for users with isCloud=true */}
              {currentUser && isCloud && (
                <Link
                  to="/cloud-dashboard"
                  className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                    isActive('/cloud-dashboard') ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700/40 text-indigo-300'
                  }`}
                >
                  <FiCloudLightning className="mr-1" /> Cloud Dashboard
                </Link>
              )}
              
              {/* Support Link - Show for all logged in users */}
              {currentUser && (
                <Link
                  to="/support"
                  className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                    isActive('/support') 
                      ? isCloud 
                        ? 'bg-indigo-700 text-white' 
                        : 'bg-violet-700 text-white' 
                      : isCloud
                        ? 'hover:bg-indigo-700/40 text-indigo-300'
                        : 'hover:bg-violet-700/40 text-violet-300'
                  }`}
                >
                  <FiHelpCircle className="mr-1" /> Support
                </Link>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <ThemeToggle />
            
            {!currentUser ? (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <FiUserPlus className="mr-1" /> Register
                </Link>
              </>
            ) : (
              <>
                <div className="text-sm text-violet-200 flex items-center">
                  <FiUser className="mr-1" /> {currentUser.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-300 hover:text-white hover:bg-red-600"
                >
                  <FiLogOut className="mr-1" /> Logout
                </button>
              </>
            )}
          </div>

          <div className="sm:hidden flex items-center">
            <ThemeToggle className="mr-2" />
            
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-violet-300 hover:text-white hover:bg-violet-700"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className={`sm:hidden ${isDark ? 'bg-dark-secondary border-dark-border' : 'bg-violet-800 border-violet-600'} border-t`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!currentUser && (
              <>
                <Link to="/login" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-violet-100 hover:bg-violet-700">
                  <FiLogIn className="inline mr-2" /> Login
                </Link>
                <Link to="/cloud-login" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-700">
                  <FiCloudLightning className="inline mr-2" /> Cloud Login
                </Link>
              </>
            )}
            {currentUser && !isAdmin && !isCloud && (
              <Link to="/challenges" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-violet-100 hover:bg-violet-700">
                <FiFlag className="inline mr-2" /> Challenges
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin-dashboard" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-violet-100 hover:bg-violet-700">
                <FiShield className="inline mr-2" /> Admin
              </Link>
            )}
            {/* Cloud Dashboard Link in mobile menu - Only visible for users with isCloud=true */}
            {currentUser && isCloud && (
              <Link to="/cloud-dashboard" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-700">
                <FiCloudLightning className="inline mr-2" /> Cloud Dashboard
              </Link>
            )}
            
            {/* Support Link in mobile menu - Show for all logged in users */}
            {currentUser && (
              <Link to="/support" onClick={closeMenu} className={`block px-3 py-2 rounded-md text-base font-medium ${
                isCloud ? 'text-indigo-100 hover:bg-indigo-700' : 'text-violet-100 hover:bg-violet-700'
              }`}>
                <FiHelpCircle className="inline mr-2" /> Support
              </Link>
            )}
          </div>
          <div className={`border-t ${isDark ? 'border-dark-border' : 'border-violet-600'} px-2 py-3`}>
            {!currentUser ? (
              <Link to="/register" onClick={closeMenu} className="block px-3 py-2 text-base font-medium text-violet-100 hover:bg-violet-700">
                <FiUserPlus className="inline mr-2" /> Register
              </Link>
            ) : (
              <>
                <div className="px-3 py-2 text-base text-violet-200">
                  <FiUser className="inline mr-2" /> {currentUser.name}
                </div>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base font-medium text-red-300 hover:text-white hover:bg-red-600">
                  <FiLogOut className="inline mr-2" /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;