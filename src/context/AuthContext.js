import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set the token in API headers
          api.setToken(token);
          
          // Verify token and get user data
          const response = await api.get('/auth/me');
          if (response && response.user) {
            setCurrentUser(response.user);
          } else {
            // Invalid token, clear it
            localStorage.removeItem('token');
            api.setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        api.setToken(null);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password, userType = 'user') => {
    try {
      const endpoint = userType === 'admin' ? '/auth/admin/login' :
                     userType === 'cloud' ? '/auth/cloud-login' : '/auth/login';
      
      const response = await api.post(endpoint, { email, password });
      
      if (response && response.token && response.user) {
        localStorage.setItem('token', response.token);
        api.setToken(response.token);
        setCurrentUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response && response.token && response.user) {
        localStorage.setItem('token', response.token);
        api.setToken(response.token);
        setCurrentUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Admin login function
  const adminLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      
      if (response && response.token && response.user) {
        localStorage.setItem('token', response.token);
        api.setToken(response.token);
        setCurrentUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  // Cloud login function
  const cloudLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/cloud-login', { email, password });
      
      if (response && response.token && response.user) {
        localStorage.setItem('token', response.token);
        api.setToken(response.token);
        setCurrentUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Cloud login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    api.setToken(null);
    setCurrentUser(null);
  };

  // Update user function
  const updateUser = (userData) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
  };

  // Computed values
  const isUser = currentUser?.isUser === true;
  const isAdmin = currentUser?.isAdmin === true;
  const isCloud = currentUser?.isCloud === true;
  const isRegularUser = currentUser && isUser && !isAdmin && !isCloud;

  const value = {
    currentUser,
    loading,
    isInitialized,
    isUser,
    isAdmin,
    isCloud,
    isRegularUser,
    login,
    register,
    adminLogin,
    cloudLogin,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};