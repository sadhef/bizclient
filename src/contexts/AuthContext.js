import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up API interceptor for token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Response interceptor for error handling
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Load user on component mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Error loading user:', error);
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login function with admin redirect
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      const { token: newToken, user: userData, message } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success(message || 'Login successful!');
      
      return { 
        success: true, 
        user: userData,
        // NEW: Specify redirect path based on user role
        redirectTo: userData.isAdmin ? '/admin' : '/dashboard'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        code: error.response?.data?.code 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function with admin redirect
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      
      const { token: newToken, user: newUser, message } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      toast.success(message || 'Registration successful!');
      
      return { 
        success: true, 
        user: newUser,
        // NEW: Specify redirect path based on user role (though new users won't be admin)
        redirectTo: newUser.isAdmin ? '/admin' : '/dashboard'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        code: error.response?.data?.code 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      toast.info('Logged out successfully');
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Error refreshing user:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
      return null;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      setLoading(true);
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      toast.success(response.data.message || 'Password changed successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      toast.error(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        code: error.response?.data?.code 
      };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.isAdmin || false;
  };

  // Check if user is approved
  const isApproved = () => {
    return user?.isApproved || false;
  };

  // Check if user can access challenges
  const canAccessChallenges = () => {
    return user && (user.isApproved || user.isAdmin);
  };

  // NEW: Get appropriate home route for user
  const getHomeRoute = () => {
    if (!user) return '/login';
    return user.isAdmin ? '/admin' : '/dashboard';
  };

  // NEW: Check if current route is valid for user role
  const isValidRouteForUser = (pathname) => {
    if (!user) return false;
    
    if (user.isAdmin) {
      // Admin should only access admin routes
      return pathname.startsWith('/admin') || pathname === '/';
    } else {
      // Users should not access admin routes
      return !pathname.startsWith('/admin');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    changePassword,
    isAuthenticated,
    isAdmin,
    isApproved,
    canAccessChallenges,
    getHomeRoute,        // NEW
    isValidRouteForUser, // NEW
    api // Export api instance for other components
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;