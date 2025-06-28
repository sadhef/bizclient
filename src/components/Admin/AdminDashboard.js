import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { 
  FiUsers, 
  FiBarChart2, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiClock, 
  FiShield,
  FiUserCheck,
  FiCloud,
  FiSettings,
  FiAlertTriangle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const history = useHistory();

  // Fetch all data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, challengesRes, progressRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/challenges'),
        api.get('/admin/progress')
      ]);

      setUsers(usersRes.data || []);
      setChallenges(challengesRes.data || []);
      setUserProgress(progressRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  // Delete user progress
  const handleDeleteProgress = async (progressId) => {
    try {
      setDeleteLoading(progressId);
      await api.delete(`/admin/progress/${progressId}`);
      
      // Update local state
      setUserProgress(prev => prev.filter(p => p._id !== progressId));
      toast.success('User progress deleted successfully');
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting progress:', error);
      toast.error('Failed to delete user progress');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Update user role
  const handleUpdateUserRole = async (userId, role) => {
    try {
      setRoleUpdateLoading(userId);
      await api.put(`/admin/users/${userId}/role`, { role });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, role } : user
      ));
      
      toast.success(`User role updated to ${role} successfully`);
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setRoleUpdateLoading(null);
    }
  };

  // Get role badge styling
  const getRoleBadge = (role) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (role) {
      case 'admin':
        return `${baseClasses} ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'}`;
      case 'iscloud':
        return `${baseClasses} ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`;
      default:
        return `${baseClasses} ${isDark ? 'bg-gray-900/30 text-gray-300' : 'bg-gray-100 text-gray-800'}`;
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FiShield className="w-4 h-4" />;
      case 'iscloud':
        return <FiCloud className="w-4 h-4" />;
      default:
        return <FiUserCheck className="w-4 h-4" />;
    }
  };

  // Format time remaining
  const formatTimeRemaining = (endTime) => {
    if (!endTime) return 'No time limit';
    
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status?.toLowerCase()) {
      case 'completed':
        return `${baseClasses} ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`;
      case 'in-progress':
        return `${baseClasses} ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`;
      case 'expired':
        return `${baseClasses} ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`;
      default:
        return `${baseClasses} ${isDark ? 'bg-gray-900/30 text-gray-300' : 'bg-gray-100 text-gray-800'}`;
    }
  };

  // Delete confirmation modal
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`}>
        <div className="flex items-center mb-4">
          <FiAlertTriangle className="text-red-500 w-6 h-6 mr-3" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Delete User Progress
          </h3>
        </div>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Are you sure you want to delete this user's progress? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedItem(null);
            }}
            className={`px-4 py-2 rounded-md ${
              isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteProgress(selectedItem._id)}
            disabled={deleteLoading === selectedItem?._id}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {deleteLoading === selectedItem?._id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );

  // Role update modal
  const RoleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`}>
        <div className="flex items-center mb-4">
          <FiSettings className="text-blue-500 w-6 h-6 mr-3" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Update User Role
          </h3>
        </div>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Update role for: <strong>{selectedUser?.name}</strong>
        </p>
        
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Select New Role
          </label>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Select role...</option>
            <option value="user">User</option>
            <option value="iscloud">Cloud User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowRoleModal(false);
              setSelectedUser(null);
              setNewRole('');
            }}
            className={`px-4 py-2 rounded-md ${
              isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => handleUpdateUserRole(selectedUser._id, newRole)}
            disabled={!newRole || roleUpdateLoading === selectedUser?._id}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {roleUpdateLoading === selectedUser?._id ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${isDark ? 'border-indigo-400' : 'border-indigo-600'} mx-auto`}></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Admin Dashboard
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage users, challenges, and monitor progress
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg mb-6`}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FiUsers className="inline mr-2" />
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'challenges'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FiBarChart2 className="inline mr-2" />
                Challenges ({challenges.length})
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'progress'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FiClock className="inline mr-2" />
                Progress ({userProgress.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
            <div className={`px-4 py-5 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b sm:px-6`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Registered Users
                </h2>
                <span className={`${isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-800'} px-3 py-1 rounded-full text-sm font-medium`}>
                  Total: {users.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      User
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Email
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Role
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Institution
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Registration Date
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {users.map((user) => (
                    <tr key={user._id} className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getRoleBadge(user.role)}>
                          <span className="flex items-center">
                            {getRoleIcon(user.role)}
                            <span className="ml-1 capitalize">{user.role}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {user.institution || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setShowRoleModal(true);
                          }}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                            isDark 
                              ? 'text-blue-300 bg-blue-900/30 hover:bg-blue-900/50' 
                              : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                          }`}
                        >
                          <FiSettings className="w-4 h-4 mr-1" />
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
            <div className={`px-4 py-5 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b sm:px-6`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Challenge Levels
                </h2>
                <div className="flex items-center space-x-3">
                  <span className={`${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'} px-3 py-1 rounded-full text-sm font-medium`}>
                    Total: {challenges.length}
                  </span>
                  <button
                    onClick={() => history.push('/admin/levels/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <FiPlus className="mr-2" /> Create Level
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Level
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Title
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Difficulty
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Created Date
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {challenges.map((challenge) => (
                    <tr key={challenge._id} className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Level {challenge.level}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {challenge.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          challenge.difficulty === 'Easy' ? (isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800') :
                          challenge.difficulty === 'Medium' ? (isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
                          (isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800')
                        }`}>
                          {challenge.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {new Date(challenge.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => history.push(`/admin/levels/${challenge._id}`)}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                              isDark 
                                ? 'text-blue-300 bg-blue-900/30 hover:bg-blue-900/50' 
                                : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                            }`}
                          >
                            <FiEdit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => history.push(`/challenge/${challenge._id}`)}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                              isDark 
                                ? 'text-green-300 bg-green-900/30 hover:bg-green-900/50' 
                                : 'text-green-700 bg-green-100 hover:bg-green-200'
                            }`}
                          >
                            <FiEye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {challenges.length === 0 && (
                    <tr>
                      <td colSpan={5} className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No challenges created yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
            <div className={`px-4 py-5 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b sm:px-6`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  User Progress
                </h2>
                <span className={`${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'} px-3 py-1 rounded-full text-sm font-medium`}>
                  Total: {userProgress.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      User
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Email
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Current Level
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Completed Levels
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Time Left
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {userProgress.map((progress) => (
                    <tr key={progress._id} className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {progress.user?.name || 'Unknown User'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {progress.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Level {progress.currentLevel || 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {progress.completedLevels?.length || 0} levels
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={getStatusBadge(progress.status)}>
                          {progress.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          {formatTimeRemaining(progress.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => history.push(`/progress/${progress._id}`)}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                              isDark 
                                ? 'text-blue-300 bg-blue-900/30 hover:bg-blue-900/50' 
                                : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                            }`}
                          >
                            <FiEye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(progress);
                              setShowDeleteModal(true);
                            }}
                            disabled={deleteLoading === progress._id}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                              deleteLoading === progress._id
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            } ${
                              isDark 
                                ? 'text-red-300 bg-red-900/30 hover:bg-red-900/50' 
                                : 'text-red-700 bg-red-100 hover:bg-red-200'
                            }`}
                          >
                            <FiTrash2 className="w-4 h-4 mr-1" />
                            {deleteLoading === progress._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {userProgress.length === 0 && (
                    <tr>
                      <td colSpan={7} className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No user progress found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiUsers className={`h-6 w-6 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} truncate`}>
                      Total Users
                    </dt>
                    <dd>
                      <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {users.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {users.filter(u => u.role === 'admin').length} Admins
                </span>
                <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  • {users.filter(u => u.role === 'iscloud').length} Cloud Users
                </span>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiBarChart2 className={`h-6 w-6 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} truncate`}>
                      Total Challenges
                    </dt>
                    <dd>
                      <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {challenges.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {challenges.filter(c => c.difficulty === 'Easy').length} Easy
                </span>
                <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  • {challenges.filter(c => c.difficulty === 'Medium').length} Medium
                  • {challenges.filter(c => c.difficulty === 'Hard').length} Hard
                </span>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiClock className={`h-6 w-6 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} truncate`}>
                      Active Progress
                    </dt>
                    <dd>
                      <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {userProgress.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {userProgress.filter(p => p.status === 'completed').length} Completed
                </span>
                <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  • {userProgress.filter(p => p.status === 'in-progress').length} In Progress
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDeleteModal && <DeleteModal />}
      {showRoleModal && <RoleModal />}
    </div>
  );
};

export default AdminDashboard;