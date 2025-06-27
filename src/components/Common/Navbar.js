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

              {currentUser && isAdmin && (
                <>
                  <Link
                    to="/admin-dashboard"
                    className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                      isActive('/admin-dashboard') ? 'bg-violet-700 text-white' : 'hover:bg-violet-700/40 text-violet-300'
                    }`}
                  >
                    <FiShield className="mr-1" /> Dashboard
                  </Link>
                </>
              )}

              {currentUser && isCloud && (
                <>
                  <Link
                    to="/cloud-dashboard"
                    className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                      isActive('/cloud-dashboard') ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700/40 text-indigo-300'
                    }`}
                  >
                    <FiCloudLightning className="mr-1" /> Cloud Dashboard
                  </Link>
                  <Link
                    to="/support"
                    className={`flex items-center px-3 py-2 text-sm rounded-md font-medium ${
                      isActive('/support') ? 'bg-purple-700 text-white' : 'hover:bg-purple-700/40 text-purple-300'
                    }`}
                  >
                    <FiHelpCircle className="mr-1" /> Support
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {currentUser && (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:block text-sm text-violet-200">
                  Welcome, {currentUser.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm rounded-md font-medium hover:bg-violet-700/40 text-violet-300"
                >
                  <FiLogOut className="mr-1" /> Logout
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="sm:hidden flex items-center justify-center p-2 rounded-md text-violet-200 hover:text-white hover:bg-violet-700/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {!currentUser && (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 text-base rounded-md font-medium ${
                      isActive('/login') ? 'bg-violet-700 text-white' : 'text-violet-300 hover:bg-violet-700/40'
                    }`}
                  >
                    <FiLogIn className="mr-2" /> Login
                  </Link>
                  <Link
                    to="/cloud-login"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 text-base rounded-md font-medium ${
                      isActive('/cloud-login') ? 'bg-indigo-700 text-white' : 'text-indigo-300 hover:bg-indigo-700/40'
                    }`}
                  >
                    <FiCloudLightning className="mr-2" /> Cloud Login
                  </Link>
                </>
              )}

              {currentUser && !isAdmin && !isCloud && (
                <Link
                  to="/challenges"
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-2 text-base rounded-md font-medium ${
                    isActive('/challenges') ? 'bg-violet-700 text-white' : 'text-violet-300 hover:bg-violet-700/40'
                  }`}
                >
                  <FiFlag className="mr-2" /> Challenges
                </Link>
              )}

              {currentUser && isAdmin && (
                <>
                  <Link
                    to="/admin-dashboard"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 text-base rounded-md font-medium ${
                      isActive('/admin-dashboard') ? 'bg-violet-700 text-white' : 'text-violet-300 hover:bg-violet-700/40'
                    }`}
                  >
                    <FiShield className="mr-2" /> Dashboard
                  </Link>
                </>
              )}

              {currentUser && isCloud && (
                <>
                  <Link
                    to="/cloud-dashboard"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 text-base rounded-md font-medium ${
                      isActive('/cloud-dashboard') ? 'bg-indigo-700 text-white' : 'text-indigo-300 hover:bg-indigo-700/40'
                    }`}
                  >
                    <FiCloudLightning className="mr-2" /> Cloud Dashboard
                  </Link>
                  <Link
                    to="/support"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 text-base rounded-md font-medium ${
                      isActive('/support') ? 'bg-purple-700 text-white' : 'text-purple-300 hover:bg-purple-700/40'
                    }`}
                  >
                    <FiHelpCircle className="mr-2" /> Support
                  </Link>
                </>
              )}

              {currentUser && (
                <div className="border-t border-violet-600 pt-4 mt-4">
                  <div className="px-3 py-2">
                    <div className="text-base font-medium text-white">{currentUser.name}</div>
                    <div className="text-sm text-violet-300">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base rounded-md font-medium text-violet-300 hover:bg-violet-700/40"
                  >
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;