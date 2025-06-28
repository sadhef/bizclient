import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiUser, FiMail, FiPhone, FiBookOpen, FiHome, FiMapPin, 
  FiRefreshCw, FiTrash2, FiArrowLeft, FiShield, FiCloud,
  FiEdit2, FiSave, FiX, FiSettings, FiCalendar, FiClock
} from 'react-icons/fi';
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
  const [editingRoles, setEditingRoles] = useState(null);
  const [roleUpdating, setRoleUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

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
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle updating user roles
  const handleUpdateRoles = async (userId, newRoles) => {
    try {
      setRoleUpdating(true);
      
      const response = await api.patch(`/users/${userId}/roles`, newRoles);
      
      if (response.user) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user._id === userId ? response.user : user
        ));
        
        // Update user details if currently viewing this user
        if (selectedUser === userId) {
          setUserDetails(response.user);
        }
        
        toast.success('User roles updated successfully');
        setEditingRoles(null);
      }
    } catch (error) {
      console.error('Error updating user roles:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user roles';
      toast.error(errorMessage);
    } finally {
      setRoleUpdating(false);
    }
  };

  // Quick role toggle
  const handleQuickRoleToggle = async (userId, roleType, currentValue) => {
    try {
      const roleData = { [roleType]: !currentValue };
      const response = await api.patch(`/users/${userId}/roles`, roleData);
      
      if (response.user) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user._id === userId ? response.user : user
        ));
        
        // Update user details if currently viewing this user
        if (selectedUser === userId) {
          setUserDetails(response.user);
        }
        
        const roleName = roleType === 'isAdmin' ? 'Admin' : 'Cloud';
        const action = !currentValue ? 'granted' : 'removed';
        toast.success(`${roleName} access ${action} successfully`);
      }
    } catch (error) {
      console.error('Error toggling user role:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user role';
      toast.error(errorMessage);
    }
  };

  // Handle selecting a user
  const handleSelectUser = (userId) => {
    setSelectedUser(userId === selectedUser ? null : userId);
    setEditingRoles(null);
  };

  // Handle going back to dashboard
  const handleBackToDashboard = () => {
    history.push('/admin-dashboard');
  };

  // Start editing roles
  const startEditingRoles = (user) => {
    setEditingRoles({
      userId: user._id,
      isAdmin: user.isAdmin || false,
      isCloud: user.isCloud || false
    });
  };

  // Cancel editing roles
  const cancelEditingRoles = () => {
    setEditingRoles(null);
  };

  // Save role changes
  const saveRoleChanges = () => {
    if (editingRoles) {
      handleUpdateRoles(editingRoles.userId, {
        isAdmin: editingRoles.isAdmin,
        isCloud: editingRoles.isCloud
      });
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.institution && user.institution.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' ||
                       (filterRole === 'admin' && user.isAdmin) ||
                       (filterRole === 'cloud' && user.isCloud) ||
                       (filterRole === 'regular' && !user.isAdmin && !user.isCloud);
    
    return matchesSearch && matchesRole;
  });

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role badge component
  const getRoleBadge = (user) => {
    const badges = [];
    if (user.isAdmin) {
      badges.push(
        <span key="admin" className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-1">
          <FiShield className="mr-1 h-3 w-3" />
          Admin
        </span>
      );
    }
    if (user.isCloud) {
      badges.push(
        <span key="cloud" className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
          <FiCloud className="mr-1 h-3 w-3" />
          Cloud
        </span>
      );
    }
    if (!user.isAdmin && !user.isCloud) {
      badges.push(
        <span key="regular" className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Regular User
        </span>
      );
    }
    return badges;
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
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mr-6"
            >
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>
          
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, email, or institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="sm:w-48">
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                id="role-filter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">All Users</option>
                <option value="admin">Admin Users</option>
                <option value="cloud">Cloud Users</option>
                <option value="regular">Regular Users</option>
              </select>
            </div>
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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* User List */}
          <div className="lg:w-1/3">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Users ({filteredUsers.length} of {users.length})
                </h2>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: '700px' }}>
                <ul className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <li 
                      key={user._id} 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                        selectedUser === user._id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''
                      }`}
                      onClick={() => handleSelectUser(user._id)}
                    >
                      <div className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <FiUser className="h-5 w-5 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4 min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {user.email}
                              </div>
                              <div className="flex items-center mt-1 flex-wrap">
                                {getRoleBadge(user)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickRoleToggle(user._id, 'isAdmin', user.isAdmin);
                              }}
                              className={`p-1 rounded transition-colors duration-200 ${
                                user.isAdmin ? 'text-red-600 hover:text-red-800' : 'text-gray-400 hover:text-red-600'
                              }`}
                              title={`${user.isAdmin ? 'Remove' : 'Grant'} Admin Access`}
                            >
                              <FiShield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickRoleToggle(user._id, 'isCloud', user.isCloud);
                              }}
                              className={`p-1 rounded transition-colors duration-200 ${
                                user.isCloud ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 hover:text-blue-600'
                              }`}
                              title={`${user.isCloud ? 'Remove' : 'Grant'} Cloud Access`}
                            >
                              <FiCloud className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {filteredUsers.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filterRole !== 'all' 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'No users are registered yet.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="lg:w-2/3">
            {userDetails ? (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">User Details</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage user information and permissions
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {!editingRoles && (
                        <button
                          onClick={() => startEditingRoles(userDetails)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FiSettings className="mr-2 h-4 w-4" />
                          Manage Roles
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(userDetails._id)}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors duration-200 ${
                          deleteConfirm === userDetails._id
                            ? 'text-white bg-red-600 hover:bg-red-700'
                            : 'text-red-700 bg-red-100 hover:bg-red-200'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                      >
                        <FiTrash2 className="mr-2 h-4 w-4" />
                        {deleteConfirm === userDetails._id ? 'Confirm Delete' : 'Delete User'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-5 sm:p-6">
                  {/* Role Management Section */}
                  {editingRoles && editingRoles.userId === userDetails._id && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FiEdit2 className="mr-2" />
                        Edit User Roles
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="admin-role"
                              name="admin-role"
                              type="checkbox"
                              checked={editingRoles.isAdmin}
                              onChange={(e) => setEditingRoles(prev => ({
                                ...prev,
                                isAdmin: e.target.checked
                              }))}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="admin-role" className="font-medium text-gray-700">
                              <span className="flex items-center">
                                <FiShield className="mr-2 h-4 w-4 text-red-500" />
                                Administrator Access
                              </span>
                            </label>
                            <p className="text-gray-500">
                              Full administrative privileges including user management, system settings, and all dashboard features.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="cloud-role"
                              name="cloud-role"
                              type="checkbox"
                              checked={editingRoles.isCloud}
                              onChange={(e) => setEditingRoles(prev => ({
                                ...prev,
                                isCloud: e.target.checked
                              }))}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="cloud-role" className="font-medium text-gray-700">
                              <span className="flex items-center">
                                <FiCloud className="mr-2 h-4 w-4 text-blue-500" />
                                Cloud Access
                              </span>
                            </label>
                            <p className="text-gray-500">
                              Access to cloud management features, server monitoring, and infrastructure tools.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex items-center space-x-3">
                        <button
                          onClick={saveRoleChanges}
                          disabled={roleUpdating}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiSave className="mr-2 h-4 w-4" />
                          {roleUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={cancelEditingRoles}
                          disabled={roleUpdating}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FiX className="mr-2 h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* User Information */}
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiUser className="mr-2 h-4 w-4" />
                        Full Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{userDetails.name}</dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiMail className="mr-2 h-4 w-4" />
                        Email Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{userDetails.email}</dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiPhone className="mr-2 h-4 w-4" />
                        Phone Number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userDetails.phone || <span className="text-gray-400 italic">Not provided</span>}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiBookOpen className="mr-2 h-4 w-4" />
                        Education Level
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userDetails.education || <span className="text-gray-400 italic">Not provided</span>}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiHome className="mr-2 h-4 w-4" />
                        Institution
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userDetails.institution || <span className="text-gray-400 italic">Not provided</span>}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiMapPin className="mr-2 h-4 w-4" />
                        Location
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userDetails.location || <span className="text-gray-400 italic">Not provided</span>}
                      </dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 mb-2">Current Roles & Permissions</dt>
                      <dd className="mt-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          {userDetails.isAdmin && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                              <FiShield className="mr-1 h-4 w-4" />
                              Administrator
                            </span>
                          )}
                          {userDetails.isCloud && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              <FiCloud className="mr-1 h-4 w-4" />
                              Cloud Access
                            </span>
                          )}
                          {!userDetails.isAdmin && !userDetails.isCloud && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                              <FiUser className="mr-1 h-4 w-4" />
                              Regular User
                            </span>
                          )}
                        </div>
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiCalendar className="mr-2 h-4 w-4" />
                        Registration Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(userDetails.registrationTime)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FiClock className="mr-2 h-4 w-4" />
                        Last Login
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userDetails.lastLogin ? (
                          formatDate(userDetails.lastLogin)
                        ) : (
                          <span className="text-gray-400 italic">Never logged in</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No user selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a user from the list to view their details and manage their roles.
                  </p>
                  <div className="mt-6">
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>💡 <strong>Quick Actions:</strong></p>
                      <p>• Click <FiShield className="inline h-3 w-3 mx-1" /> to toggle Admin access</p>
                      <p>• Click <FiCloud className="inline h-3 w-3 mx-1" /> to toggle Cloud access</p>
                      <p>• Select a user for detailed management</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {users.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {users.filter(user => user.isAdmin).length}
                </div>
                <div className="text-sm text-gray-500">Administrators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {users.filter(user => user.isCloud).length}
                </div>
                <div className="text-sm text-gray-500">Cloud Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {users.filter(user => !user.isAdmin && !user.isCloud).length}
                </div>
                <div className="text-sm text-gray-500">Regular Users</div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            User Management Help
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Role Permissions:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>Admin:</strong> Full system access, user management, settings</li>
                <li>• <strong>Cloud:</strong> Infrastructure monitoring, server management</li>
                <li>• <strong>Regular:</strong> Standard user features only</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Security Notes:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• You cannot modify your own admin role</li>
                <li>• Role changes take effect immediately</li>
                <li>• Deleted users cannot be recovered</li>
                <li>• All actions are logged for security</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bulk Actions Section */}
        {filteredUsers.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiSettings className="mr-2" />
              Bulk Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const regularUsers = filteredUsers.filter(user => !user.isAdmin && !user.isCloud);
                  if (regularUsers.length === 0) {
                    toast.info('No regular users to upgrade');
                    return;
                  }
                  if (window.confirm(`Grant admin access to ${regularUsers.length} regular user(s)?`)) {
                    regularUsers.forEach(user => handleQuickRoleToggle(user._id, 'isAdmin', false));
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FiShield className="mr-2 h-4 w-4" />
                Bulk Grant Admin
              </button>
              
              <button
                onClick={() => {
                  const regularUsers = filteredUsers.filter(user => !user.isAdmin && !user.isCloud);
                  if (regularUsers.length === 0) {
                    toast.info('No regular users to upgrade');
                    return;
                  }
                  if (window.confirm(`Grant cloud access to ${regularUsers.length} regular user(s)?`)) {
                    regularUsers.forEach(user => handleQuickRoleToggle(user._id, 'isCloud', false));
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiCloud className="mr-2 h-4 w-4" />
                Bulk Grant Cloud
              </button>

              <button
                onClick={() => {
                  const adminUsers = filteredUsers.filter(user => user.isAdmin);
                  if (adminUsers.length === 0) {
                    toast.info('No admin users to revoke');
                    return;
                  }
                  if (window.confirm(`Revoke admin access from ${adminUsers.length} user(s)?`)) {
                    adminUsers.forEach(user => handleQuickRoleToggle(user._id, 'isAdmin', true));
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiX className="mr-2 h-4 w-4" />
                Revoke All Admin
              </button>

              <button
                onClick={() => {
                  const cloudUsers = filteredUsers.filter(user => user.isCloud);
                  if (cloudUsers.length === 0) {
                    toast.info('No cloud users to revoke');
                    return;
                  }
                  if (window.confirm(`Revoke cloud access from ${cloudUsers.length} user(s)?`)) {
                    cloudUsers.forEach(user => handleQuickRoleToggle(user._id, 'isCloud', true));
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiX className="mr-2 h-4 w-4" />
                Revoke All Cloud
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Bulk actions apply only to filtered users ({filteredUsers.length} users)
              </p>
            </div>
          </div>
        )}

        {/* Recent Activity Log */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiClock className="mr-2" />
            Recent User Activity
          </h3>
          <div className="space-y-3">
            {users
              .filter(user => user.lastLogin)
              .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))
              .slice(0, 5)
              .map(user => (
                <div key={user._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <FiUser className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">Last login</div>
                    <div className="text-xs text-gray-500">{formatDate(user.lastLogin)}</div>
                  </div>
                </div>
              ))}
            
            {users.filter(user => user.lastLogin).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FiClock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No user activity recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export & Reports</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const csvData = users.map(user => ({
                  Name: user.name,
                  Email: user.email,
                  Phone: user.phone || 'N/A',
                  Institution: user.institution || 'N/A',
                  Location: user.location || 'N/A',
                  IsAdmin: user.isAdmin ? 'Yes' : 'No',
                  IsCloud: user.isCloud ? 'Yes' : 'No',
                  RegistrationDate: formatDate(user.registrationTime),
                  LastLogin: user.lastLogin ? formatDate(user.lastLogin) : 'Never'
                }));
                
                const csvContent = [
                  Object.keys(csvData[0]).join(','),
                  ...csvData.map(row => Object.values(row).join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                toast.success('User data exported successfully');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV
            </button>
            
            <button
              onClick={() => {
                const reportData = {
                  generatedAt: new Date().toISOString(),
                  totalUsers: users.length,
                  adminUsers: users.filter(user => user.isAdmin).length,
                  cloudUsers: users.filter(user => user.isCloud).length,
                  regularUsers: users.filter(user => !user.isAdmin && !user.isCloud).length,
                  recentRegistrations: users.filter(user => {
                    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return new Date(user.registrationTime) > oneWeekAgo;
                  }).length,
                  activeUsers: users.filter(user => user.lastLogin).length
                };
                
                const jsonContent = JSON.stringify(reportData, null, 2);
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `user-report-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                toast.success('User report generated successfully');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiBarChart3 className="mr-2 h-4 w-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManager;