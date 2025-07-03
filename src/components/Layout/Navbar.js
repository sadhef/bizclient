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
  FiLogOut,
  FiHome,
  FiTarget,
  FiSettings,
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
    history.push('/');
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Check if current page is homepage, login, or register
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);
  const isHomepage = location.pathname === '/';

  const NavLink = ({ to, children, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${
        isActive(to)
          ? 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </Link>
  );

  // For homepage when user is not authenticated, show minimal navbar
  if (isHomepage && !isAuthenticated()) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-sm">BT</span>
              </div>
              <span className="text-xl font-black text-black dark:text-white">
                BIZTRAS CTF
              </span>
            </Link>

            {/* Right side - Theme toggle and auth buttons */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/20 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>

              {/* Auth Buttons */}
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors uppercase tracking-wider rounded-lg"
                >
                  Register
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 rounded-lg text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/20"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="sm:hidden bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-white/20 dark:border-black/20 py-4">
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-sm font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors uppercase tracking-wider rounded-lg mx-4"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // For login/register pages, show simple navbar with theme toggle
  if ((location.pathname === '/login' || location.pathname === '/register') && !isAuthenticated()) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-sm">BT</span>
              </div>
              <span className="text-xl font-black text-black dark:text-white">
                BIZTRAS CTF
              </span>
            </Link>

            {/* Right side - Theme toggle and nav links */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>

              {/* Navigation Links */}
              <div className="hidden sm:flex items-center gap-3">
                {location.pathname === '/login' ? (
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Don't have an account? <span className="font-bold">Register</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Already have an account? <span className="font-bold">Login</span>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="flex flex-col gap-2">
                {location.pathname === '/login' ? (
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors rounded-lg"
                  >
                    Don't have an account? Register
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors rounded-lg"
                  >
                    Already have an account? Login
                  </Link>
                )}
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors rounded-lg"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Regular authenticated navbar (existing functionality)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isAuthenticated() ? (user?.isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-sm">BT</span>
              </div>
              <span className="text-xl font-black text-black dark:text-white">
                BIZTRAS CTF
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Only show if authenticated */}
          {isAuthenticated() && (
            <div className="hidden md:flex items-center gap-2">
              {isAdmin() ? (
                /* Admin Navigation */
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
          )}

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

            {/* Auth Buttons or Profile Menu */}
            {isAuthenticated() ? (
              /* Profile Menu */
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <span className="text-white dark:text-black text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-black dark:text-white">
                    {user?.username}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-black dark:text-white">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                      {user?.isAdmin && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-black dark:bg-white text-white dark:text-black rounded font-medium">
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
            ) : (
              /* Auth Buttons for non-authenticated users - only show if not on public pages */
              !isPublicPage && (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors uppercase tracking-wider"
                  >
                    Register
                  </Link>
                </div>
              )
            )}

            {/* Mobile Menu Button - Only show if authenticated */}
            {isAuthenticated() && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Only show if authenticated */}
        {isAuthenticated() && isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col gap-2">
              {isAdmin() ? (
                /* Admin Mobile Navigation */
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