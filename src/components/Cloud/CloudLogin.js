import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSignInAlt, FaCloudUploadAlt } from 'react-icons/fa';
import { FiCloudLightning } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';

const CloudLogin = () => {
  const history = useHistory();
  const { login, logout, currentUser, isCloud, loading, error } = useAuth();
  const { isDark } = useTheme();

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Debug helper function
  const logAuthState = useCallback(() => {
    console.log('Auth State:', { 
      currentUser: currentUser ? 'User exists' : 'No user', 
      isCloud: isCloud, 
      loading, 
      error 
    });
    if (currentUser) {
      console.log('User cloud status:', currentUser.isCloud);
    }
  }, [currentUser, isCloud, loading, error]);

  // Custom direct API call to check cloud access
  const checkCloudAccess = useCallback(async (token) => {
    try {
      // Set the token for this specific request
      api.setToken(token);
      
      // Fetch user data directly
      const response = await api.get('/auth/me');
      
      // Log the full response for debugging
      console.log('Direct API response:', response);
      
      // Explicitly check cloud access
      if (response && response.user) {
        // Use strict equality to check boolean true
        return response.user.isCloud === true;
      }
      return false;
    } catch (err) {
      console.error('Error checking cloud access:', err);
      return false;
    }
  }, []);

  // Check if user is already logged in and has cloud access
  useEffect(() => {
    // Debug logging
    logAuthState();
    
    // If user exists and has cloud access, redirect
    if (currentUser && isCloud === true) {
      console.log('Cloud access confirmed, redirecting to dashboard');
      history.push('/cloud-dashboard');
    }
    // If login was attempted and user exists but doesn't have cloud access
    else if (loginAttempted && currentUser && isCloud !== true) {
      console.log('Login attempted but no cloud access');
      setFormError('Your account does not have cloud access. Please contact an administrator.');
      toast.error('Access denied: Cloud access required');
      
      // Reset login state to prevent loops
      setLoginAttempted(false);
      
      // Log out the user to clear the current state
      logout();
    }
  }, [currentUser, isCloud, history, logAuthState, loginAttempted, logout]);

  // Display error from auth context
  useEffect(() => {
    if (error) {
      setFormError(error);
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      setFormError('');
      
      // First, attempt to directly authenticate with the API
      const response = await api.post('/auth/login', { 
        email: credentials.email, 
        password: credentials.password 
      });
      
      console.log('Login response:', response);
      
      if (response && response.token) {
        // Check cloud access directly before proceeding
        const hasCloudAccess = await checkCloudAccess(response.token);
        
        if (hasCloudAccess) {
          console.log('Cloud access verified directly');
          
          // If confirmed, proceed with normal login flow
          const user = await login(credentials.email, credentials.password);
          
          // Mark login as attempted and let the useEffect handle the redirect
          setLoginAttempted(true);
          
          toast.success('Cloud login successful!');
          history.push('/cloud-dashboard');
        } else {
          console.log('No cloud access found');
          setFormError('Your account does not have cloud access. Please contact an administrator.');
          toast.error('Access denied: Cloud access required');
        }
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Handle login failure
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900' 
        : 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900'
    } py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute transform -rotate-45 bg-white w-96 h-96 rounded-full -top-20 -left-20" />
        <div className="absolute transform rotate-45 bg-white w-96 h-96 rounded-full -bottom-20 -right-20" />
      </div>

      <div className="max-w-md mx-auto relative">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-full inline-flex mx-auto mb-6 drop-shadow-xl">
              <FiCloudLightning size={48} className="text-white" />
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-600 opacity-50 blur rounded-full" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Cloud Dashboard</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-indigo-200">Secure login required for cloud access</p>
        </div>

        <div className={`backdrop-blur-lg ${
          isDark 
            ? 'bg-gray-800/40 border-gray-700/30' 
            : 'bg-indigo-100/10 border-indigo-200/20'
        } rounded-2xl shadow-2xl p-8 border relative overflow-hidden`}>
          {/* Error Message */}
          {formError && (
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-6 rounded-r">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-300">{formError}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative group">
              <label className="block text-sm font-medium text-indigo-100 mb-2">Email <span className="text-red-300">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200 transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700/70' 
                      : 'bg-indigo-600/20 border-indigo-500/20 hover:bg-indigo-600/30'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-indigo-100 mb-2">Password <span className="text-red-300">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200 transition-colors duration-200" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700/70' 
                      : 'bg-indigo-600/20 border-indigo-500/20 hover:bg-indigo-600/30'
                  }`}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={formLoading || loading}
                className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-200 shadow-lg relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-indigo-50/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center">
                  {formLoading || loading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-indigo-50 rounded-full animate-spin mr-2" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt className="mr-2" />
                      Access Cloud Dashboard
                    </>
                  )}
                </span>
              </button>
            </div>

            <div className="text-center text-sm text-indigo-200 mt-4">
              Not a cloud user?{' '}
              <Link to="/login" className="text-indigo-300 hover:text-white font-medium">
                Regular Login
              </Link>
            </div>
          </form>
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      </div>
    </div>
  );
};

export default CloudLogin;