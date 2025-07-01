import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon, FaUser, FaSignOutAlt, FaBars, FaTimes, FaCog } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { currentUser, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const history = useHistory();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    history.push('/login');
    setShowUserMenu(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navLinks = isAdmin ? [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/challenges', label: 'Challenges' }
  ] : [
    { path: '/dashboard', label: 'Challenges', exact: true },
    { path: '/profile', label: 'Profile' }
  ];

  return (
    <nav className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-b ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Challenge Platform
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(link.path)
                      ? isDark 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-gray-100 text-gray-900'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                isDark 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-2 p-2 rounded-full transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaUser className="h-4 w-4 text-white" />
                </div>
                <span className={`hidden md:block text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentUser?.name}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className={`px-4 py-2 text-sm border-b ${
                    isDark ? 'text-gray-300 border-gray-700' : 'text-gray-600 border-gray-200'
                  }`}>
                    <p className="font-medium">{currentUser?.name}</p>
                    <p className="text-xs">{currentUser?.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      isDark 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaCog className="inline h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      isDark 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaSignOutAlt className="inline h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-md transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActivePath(link.path)
                      ? isDark 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-gray-100 text-gray-900'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;