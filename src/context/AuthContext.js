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
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [isCloud, setIsCloud] = useState(localStorage.getItem('isCloud') === 'true');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Set user data correctly
        if (response.user) {
          setCurrentUser(response.user);
          // Set admin status based on user data
          setIsAdmin(response.user.isAdmin === true);
          localStorage.setItem('isAdmin', response.user.isAdmin === true ? 'true' : 'false');
          
          // Set cloud status based on user data
          setIsCloud(response.user.isCloud === true);
          localStorage.setItem('isCloud', response.user.isCloud === true ? 'true' : 'false');
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
      
      const { token: newToken, user } = response;
      
      // Strict admin validation
      if (!user || !user.isAdmin) {
        throw new Error('Admin access required');
      }
      
      // Store token and set user
      localStorage.setItem('token', newToken);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isCloud', user.isCloud === true ? 'true' : 'false');
      setToken(newToken);
      setCurrentUser(user);
      setIsAdmin(true);
      setIsCloud(user.isCloud === true);
      
      return user;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid admin credentials';
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

  // Other methods remain the same as in the previous implementation
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

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      
      const { token: newToken, user } = response;
      
      // Store token and set user
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(user);
      
      // Check if user is admin
      if (user.isAdmin) {
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
      }
      
      // Check if user is cloud user
      if (user.isCloud) {
        localStorage.setItem('isCloud', 'true');
        setIsCloud(true);
      }
      
      return user;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid email or password';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
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