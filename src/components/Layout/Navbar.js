import React, { useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut,
  Home,
  Target,
  Users,
  Award,
  Shield,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import {
  Button,
  Avatar,
  AvatarFallback,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui';
import { 
  GlowingButton,
  FloatingElement,
  RippleEffect,
  PulsingDot
} from '../../components/magicui';
import { cn } from '../../lib/utils';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const history = useHistory();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    history.push('/login');
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const NavLink = ({ to, children, icon: Icon, onClick, isActiveLink = false }) => (
    <RippleEffect>
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
          isActiveLink
            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border border-violet-500/30'
            : 'text-slate-300 hover:text-white hover:bg-white/5'
        )}
      >
        {Icon && (
          <Icon className={cn(
            "w-4 h-4 transition-colors",
            isActiveLink ? 'text-violet-400' : 'text-slate-400 group-hover:text-white'
          )} />
        )}
        {children}
        {isActiveLink && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg"
            layoutId="activeTab"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    </RippleEffect>
  );

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <FloatingElement className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                whileHover={{ x: 2 }}
                className="hidden sm:block"
              >
                <span className="text-xl font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
                  BizTras CTF
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <PulsingDot color="bg-emerald-500" className="scale-75" />
                  <span className="text-xs text-emerald-400 font-medium">Online</span>
                </div>
              </motion.div>
            </Link>
          </FloatingElement>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin() ? (
              <NavLink 
                to="/admin" 
                icon={Settings}
                isActiveLink={isActive('/admin')}
              >
                Admin Dashboard
              </NavLink>
            ) : (
              <>
                <NavLink 
                  to="/dashboard" 
                  icon={Home}
                  isActiveLink={isActive('/dashboard')}
                >
                  Dashboard
                </NavLink>
                {user?.isApproved && (
                  <>
                    <NavLink 
                      to="/challenges" 
                      icon={Target}
                      isActiveLink={isActive('/challenges')}
                    >
                      Challenges
                    </NavLink>
                    <NavLink 
                      to="/challenge" 
                      icon={Award}
                      isActiveLink={isActive('/challenge')}
                    >
                      Current Challenge
                    </NavLink>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? 'dark' : 'light'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 p-2 h-auto bg-white/5 hover:bg-white/10 border border-white/10"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-semibold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-white leading-none">
                        {user?.username}
                      </p>
                      <p className="text-xs text-slate-400 leading-none mt-1">
                        {user?.isAdmin ? 'Administrator' : user?.isApproved ? 'Approved User' : 'Pending'}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                align="end" 
                className="w-64 bg-slate-800/95 backdrop-blur-xl border-white/10 shadow-2xl"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
                          {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user?.username}
                        </p>
                        <p className="text-xs text-slate-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {user?.isAdmin && (
                        <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {!user?.isApproved && !user?.isAdmin && (
                        <Badge className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {user?.isApproved && !user?.isAdmin && (
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-white/10" />
                
                {!isAdmin() && (
                  <DropdownMenuItem 
                    onClick={() => history.push('/profile')}
                    className="text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <motion.div 
              className="md:hidden"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-9 w-9 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isMenuOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-white/10 py-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                {isAdmin() ? (
                  <NavLink 
                    to="/admin" 
                    icon={Settings}
                    onClick={() => setIsMenuOpen(false)}
                    isActiveLink={isActive('/admin')}
                  >
                    Admin Dashboard
                  </NavLink>
                ) : (
                  <>
                    <NavLink 
                      to="/dashboard" 
                      icon={Home}
                      onClick={() => setIsMenuOpen(false)}
                      isActiveLink={isActive('/dashboard')}
                    >
                      Dashboard
                    </NavLink>
                    {user?.isApproved && (
                      <>
                        <NavLink 
                          to="/challenges" 
                          icon={Target}
                          onClick={() => setIsMenuOpen(false)}
                          isActiveLink={isActive('/challenges')}
                        >
                          Challenges
                        </NavLink>
                        <NavLink 
                          to="/challenge" 
                          icon={Award}
                          onClick={() => setIsMenuOpen(false)}
                          isActiveLink={isActive('/challenge')}
                        >
                          Current Challenge
                        </NavLink>
                      </>
                    )}
                  </>
                )}
                
                {/* Mobile Profile Section */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {user?.username}
                      </p>
                      <p className="text-xs text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {user?.isAdmin && (
                        <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {!user?.isApproved && !user?.isAdmin && (
                        <Badge className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {user?.isApproved && !user?.isAdmin && (
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {!isAdmin() && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        history.push('/profile');
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5 mb-2"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  )}
                  
                  <GlowingButton
                    onClick={handleLogout}
                    variant="danger"
                    className="w-full justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </GlowingButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;