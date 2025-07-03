import React, { useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiSun, 
  FiMoon, 
  FiMenu, 
  FiX, 
  FiUser, 
  FiSettings, 
  FiLogOut,
  FiHome,
  FiTarget,
  FiUsers,
  FiAward
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const history = useHistory();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    history.push('/login');
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const NavLink = ({ to, children, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </Link>
  );

  if (!isAuthenticated()) {
    return null; // Don't show navbar on login/register pages
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BT</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                BizTras CTF
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAdmin() ? (
              /* Admin Navigation - Only Admin Dashboard */
              <NavLink to="/admin" icon={FiSettings}>
                Admin Dashboard
              </NavLink>
            ) : (
              /* User Navigation */
              <>
                <NavLink to="/dashboard" icon={FiHome}>
                  Dashboard
                </NavLink>
                {user?.isApproved && (
                  <>
                    <NavLink to="/challenges" icon={FiTarget}>
                      Challenges
                    </NavLink>
                    <NavLink to="/challenge" icon={FiAward}>
                      Current Challenge
                    </NavLink>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.username}
                </span>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                    {user?.isAdmin && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded">
                        Admin
                      </span>
                    )}
                    {!user?.isApproved && !user?.isAdmin && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                        Pending Approval
                      </span>
                    )}
                  </div>
                  
                  {/* Profile Link - Only for non-admin users */}
                  {!isAdmin() && (
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiUser className="w-4 h-4" />
                      Profile
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col gap-2">
              {isAdmin() ? (
                /* Admin Mobile Navigation - Only Admin Dashboard */
                <NavLink 
                  to="/admin" 
                  icon={FiSettings}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </NavLink>
              ) : (
                /* User Mobile Navigation */
                <>
                  <NavLink 
                    to="/dashboard" 
                    icon={FiHome}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  {user?.isApproved && (
                    <>
                      <NavLink 
                        to="/challenges" 
                        icon={FiTarget}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Challenges
                      </NavLink>
                      <NavLink 
                        to="/challenge" 
                        icon={FiAward}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Current Challenge
                      </NavLink>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isMenuOpen || isProfileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsMenuOpen(false);
            setIsProfileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;