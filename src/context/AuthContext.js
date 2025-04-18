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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to load user on mount or token change
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setCurrentUser(null);
        setIsAdmin(false);
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
        setCurrentUser(response.user);
        setIsAdmin(response.user?.isAdmin || false);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError(err.message || 'Failed to authenticate');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        setToken(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      
      // We don't automatically log in after registration anymore
      // Instead, we return the user data and redirect to login page
      return response.user;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Login function
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
      
      return user;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid email or password';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Admin login function
  const adminLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/admin/login', { email, password });
      
      const { token: newToken, user } = response;
      
      // Store token and set user
      localStorage.setItem('token', newToken);
      localStorage.setItem('isAdmin', 'true');
      setToken(newToken);
      setCurrentUser(user);
      setIsAdmin(true);
      
      return user;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid admin credentials';
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
    setToken(null);
    setCurrentUser(null);
    setIsAdmin(false);
  };

  // Context value
  const value = {
    currentUser,
    isAdmin,
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