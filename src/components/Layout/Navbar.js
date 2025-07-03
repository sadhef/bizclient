import React, { useState, useEffect } from 'react';
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
  FiAward,
  FiChevronDown,
  FiActivity,
  FiShield,
  FiZap
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const history = useHistory();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside or route changes
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
      setIsProfileMenuOpen(false);
    };
    if (isMenuOpen || isProfileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen, isProfileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    history.push('/');
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const NavLink = ({ to, children, icon: Icon, onClick, className = "" }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`nav-link group relative ${isActive(to) ? 'active' : ''} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />}
      <span className="relative z-10">{children}</span>
      {isActive(to) && (
        <div className="absolute inset-0 bg-black dark:bg-white text-white dark:text-black rounded-lg -z-10" />
      )}
    </Link>
  );

  // Logo Component for reusability
  const Logo = ({ className = "w-10 h-10" }) => (
    <div className={`${className} bg-white dark:bg-gray-900 flex items-center justify-center transition-all duration-300 group-hover:scale-105 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700`}>
      <img 
        src="/biztras.png" 
        alt="Re-Challenge Logo" 
        className="w-full h-full object-contain"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="w-full h-full bg-black dark:bg-white rounded flex items-center justify-center text-white dark:text-black font-black text-sm hidden">
        BT
      </div>
    </div>
  );

  // Authenticated user navbar
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={isAuthenticated() ? (user?.isAdmin ? '/admin' : '/dashboard') : '/'} 
            className="flex items-center gap-3 group"
          >
            <Logo />
            <div className="hidden sm:block">
              <div className="text-xl font-black text-black dark:text-white tracking-tight">
                Re-Challenge CTF
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                {isAdmin() ? 'Admin Portal' : 'Challenge Platform'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated() && (
            <div className="hidden lg:flex items-center gap-6">
              {isAdmin() ? (
                /* Admin Navigation */
                <div className="flex items-center gap-2">
                  <NavLink to="/admin" icon={FiSettings}>
                    Dashboard
                  </NavLink>
                  <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
                  <div className="flex items-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <FiShield className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Admin Mode</span>
                  </div>
                </div>
              ) : (
                /* User Navigation */
                <div className="flex items-center gap-2">
                  <NavLink to="/dashboard" icon={FiHome}>
                    Dashboard
                  </NavLink>
                  {user?.isApproved && (
                    <>
                      <NavLink to="/challenges" icon={FiTarget}>
                        Challenges
                      </NavLink>
                      <NavLink to="/challenge" icon={FiAward}>
                        Current
                      </NavLink>
                    </>
                  )}
                  <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
                  {user?.isApproved ? (
                    <div className="flex items-center gap-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <FiActivity className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <FiZap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Pending</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-200 group"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FiSun className="w-5 h-5 text-yellow-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-600 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-200" />
              )}
            </button>

            {/* Desktop Profile menu - Only show on desktop */}
            {isAuthenticated() && (
              <div className="relative hidden lg:block">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                  }}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-700 dark:from-white dark:to-gray-300 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <span className="text-white dark:text-black text-sm font-bold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {user?.isAdmin && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <FiShield className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-black dark:text-white">
                      {user?.username}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.isAdmin ? 'Administrator' : user?.isApproved ? 'Active User' : 'Pending Approval'}
                    </div>
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile dropdown */}
                {isProfileMenuOpen && (
                  <div className="dropdown-menu animate-scale-in">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                      <div className="font-semibold text-black dark:text-white">
                        {user?.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {user?.isAdmin && (
                          <span className="badge-error">
                            <FiShield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                        {user?.isApproved || user?.isAdmin ? (
                          <span className="badge-success">
                            <FiActivity className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="badge-warning">
                            <FiZap className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {!isAdmin() && (
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="dropdown-item"
                        >
                          <FiUser className="w-4 h-4" />
                          My Profile
                        </Link>
                      )}
                      
                      {isAdmin() && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="dropdown-item"
                        >
                          <FiSettings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <div className="dropdown-divider" />
                      
                      <button
                        onClick={handleLogout}
                        className="dropdown-item text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isAuthenticated() && isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <div className="px-4 py-6">
              {/* User info on mobile */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-700 dark:from-white dark:to-gray-300 rounded-xl flex items-center justify-center">
                  <span className="text-white dark:text-black font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-black dark:text-white">
                    {user?.username}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Navigation links */}
              <div className="space-y-2">
                {isAdmin() ? (
                  <NavLink 
                    to="/admin" 
                    icon={FiSettings}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full justify-start"
                  >
                    Admin Dashboard
                  </NavLink>
                ) : (
                  <>
                    <NavLink 
                      to="/dashboard" 
                      icon={FiHome}
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full justify-start"
                    >
                      Dashboard
                    </NavLink>
                    {user?.isApproved && (
                      <>
                        <NavLink 
                          to="/challenges" 
                          icon={FiTarget}
                          onClick={() => setIsMenuOpen(false)}
                          className="w-full justify-start"
                        >
                          Challenges
                        </NavLink>
                        <NavLink 
                          to="/challenge" 
                          icon={FiAward}
                          onClick={() => setIsMenuOpen(false)}
                          className="w-full justify-start"
                        >
                          Current Challenge
                        </NavLink>
                        <NavLink 
                          to="/profile" 
                          icon={FiUser}
                          onClick={() => setIsMenuOpen(false)}
                          className="w-full justify-start"
                        >
                          My Profile
                        </NavLink>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Status indicator on mobile */}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                  {user?.isAdmin ? (
                    <span className="badge-error">
                      <FiShield className="w-3 h-3" />
                      Administrator
                    </span>
                  ) : user?.isApproved ? (
                    <span className="badge-success">
                      <FiActivity className="w-3 h-3" />
                      Active User
                    </span>
                  ) : (
                    <span className="badge-warning">
                      <FiZap className="w-3 h-3" />
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>

              {/* Logout button */}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
                >
                  <FiLogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for mobile menus */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;