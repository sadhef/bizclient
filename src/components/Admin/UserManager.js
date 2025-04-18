import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiBookOpen, FiHome, FiMapPin, FiRefreshCw, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const history = useHistory();
  const { currentUser, isAdmin } = useAuth();

  // Fetch users
  const fetchUsers = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await api.get('/users');
      
      if (response.users) {
        setUsers(response.users);
      }
      
      if (showToast) {
        toast.success('User data refreshed successfully');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch user details
  const fetchUserDetails = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/users/${userId}`);
      
      if (response.user) {
        setUserDetails(response.user);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details. Please try again.');
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load users on mount
  useEffect(() => {
    // Redirect if not logged in as admin
    if (!currentUser || !isAdmin) {
      toast.error('Admin access required');
      history.push('/admin-login');
      return;
    }
    
    fetchUsers();
  }, [currentUser, isAdmin, fetchUsers, history]);

  // Load user details when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchUserDetails(selectedUser);
    } else {
      setUserDetails(null);
    }
  }, [selectedUser, fetchUserDetails]);

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    // First click sets confirmation state
    if (deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      setLoading(true);
      
      // Delete the user first
      await api.delete(`/users/${userId}`);
      
      // Update the local state after successful deletion
      setUsers(prev => prev.filter(user => user._id !== userId));
      
      if (selectedUser === userId) {
        setSelectedUser(null);
        setUserDetails(null);
      }
      
      toast.success('User deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a user
  const handleSelectUser = (userId) => {
    setSelectedUser(userId === selectedUser ? null : userId);
  };

  // Handle going back to dashboard
  const handleBackToDashboard = () => {
    history.push('/admin-dashboard');
  };

  // Loading state
  if (loading && !refreshing && !userDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 ml-6">User Management</h1>
          
          <div className="ml-auto">
            <button
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* User List */}
          <div className="md:w-1/3">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Users</h2>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                <ul className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <li 
                      key={user._id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedUser === user._id ? 'bg-indigo-50' : ''}`}
                      onClick={() => handleSelectUser(user._id)}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user._id);
                            }}
                            disabled={loading}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${
                              deleteConfirm === user._id
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'text-red-600 hover:text-red-900'
                            }`}
                          >
                            <FiTrash2 className="mr-1" />
                            {deleteConfirm === user._id ? 'Confirm' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                  {users.length === 0 && (
                    <li className="p-4 text-center text-gray-500">
                      No users found
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="md:w-2/3">
            <div className="bg-white shadow rounded-lg">
              {userDetails ? (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">User Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <FiUser className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-500">Name</h4>
                        <p className="text-base text-gray-900">{userDetails.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <FiMail className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                        <p className="text-base text-gray-900">{userDetails.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <FiPhone className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                        <p className="text-base text-gray-900">{userDetails.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <FiBookOpen className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-500">Education</h4>
                        <p className="text-base text-gray-900">{userDetails.education || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <FiHome className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-500">Institution</h4>
                        <p className="text-base text-gray-900">{userDetails.institution || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <FiMapPin className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-500">Location</h4>
                        <p className="text-base text-gray-900">{userDetails.location || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Registration Date</h4>
                    <p className="text-base text-gray-900">
                      {new Date(userDetails.registrationTime).toLocaleString()}
                    </p>
                  </div>
                  
                  {userDetails.lastLogin && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Last Login</h4>
                      <p className="text-base text-gray-900">
                        {new Date(userDetails.lastLogin).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <FiUser className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>Select a user to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManager;