import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

// Create the context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCloud, setIsCloud] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to normalize boolean flags
  const normalizeBoolean = (value) => {
    // Handle all possible truthy/falsy values
    if (value === true || value === 'true' || value === 1 || value === '1') {
      return true;
    }
    return false;
  };

  // Helper function to convert and store flags in localStorage
  const setUserFlags = (user) => {
    // Check for admin access (strictly)
    const hasAdminAccess = normalizeBoolean(user.isAdmin);
    localStorage.setItem('isAdmin', hasAdminAccess ? 'true' : 'false');
    setIsAdmin(hasAdminAccess);
    
    // Check for cloud access (strictly)
    const hasCloudAccess = normalizeBoolean(user.isCloud);
    localStorage.setItem('isCloud', hasCloudAccess ? 'true' : 'false');
    setIsCloud(hasCloudAccess);
    
    // Debug logging
    console.log('User flags set:', { isAdmin: hasAdminAccess, isCloud: hasCloudAccess });
    console.log('Original values:', { isAdmin: user.isAdmin, isCloud: user.isCloud });
  };

  // Effect to load user on mount or token change
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setCurrentUser(null);
        setIsAdmin(false);
        setIsCloud(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Set token for API calls
        api.setToken(token);
        
        // Fetch current user
        const response = await api.get('/auth/me');
        console.log('Auth context: Fetched user data:', response);
        
        // Set user data correctly
        if (response && response.user) {
          // Update user state
          setCurrentUser(response.user);
          
          // Set user flags
          setUserFlags(response.user);
        } else {
          throw new Error('User not found');
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError(err.message || 'Failed to authenticate');
        
        // Clear invalid token and statuses
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('isCloud');
        setToken(null);
        setCurrentUser(null);
        setIsAdmin(false);
        setIsCloud(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Admin login function with enhanced validation
  const adminLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/admin/login', { email, password });
      console.log('Admin login response:', response);
      
      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      const { token: newToken, user } = response;
      
      // Check for admin access specifically
      if (!normalizeBoolean(user.isAdmin)) {
        throw new Error('Admin access required');
      }
      
      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Update user state
      setCurrentUser(user);
      
      // Set user flags
      setUserFlags(user);
      
      return user;
    } catch (err) {
      console.error('Admin login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Invalid admin credentials';
      setError(errorMsg);
      
      // Clear any lingering admin-related data
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('isCloud');
      setToken(null);
      setCurrentUser(null);
      setIsAdmin(false);
      setIsCloud(false);
      
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // User registration
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      
      return response.user;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Regular user login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Logging in user:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response);
      
      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      const { token: newToken, user } = response;
      
      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Update user state
      setCurrentUser(user);
      
      // Set user flags
      setUserFlags(user);
      
      return user;
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Invalid email or password';
      setError(errorMsg);
      
      // Clear any existing auth data
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('isCloud');
      setToken(null);
      setCurrentUser(null);
      setIsAdmin(false);
      setIsCloud(false);
      
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isCloud');
    setToken(null);
    setCurrentUser(null);
    setIsAdmin(false);
    setIsCloud(false);
  };

  // Context value
  const value = {
    currentUser,
    isAdmin,
    isCloud,
    loading,
    error,
    register,
    login,
    adminLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;