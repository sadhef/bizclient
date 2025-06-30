import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiUsers, 
  FiFlag, 
  FiPlusCircle, 
  FiHome, 
  FiRefreshCw,
  FiTrash2,
  FiEdit,
  FiClock,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiSettings,
  FiShield,
  FiCloud,
  FiUserPlus,
  FiBarChart2
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatTimeRemaining, formatTimeDetailed } from '../../utils/timer';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null });
  const [showTimeSetting, setShowTimeSetting] = useState(false);
  const [defaultTimeLimit, setDefaultTimeLimit] = useState(3600); // Default 1 hour in seconds
  const [newTimeLimit, setNewTimeLimit] = useState(3600);

  const history = useHistory();
  const { currentUser, isAdmin } = useAuth();
  const { isDark } = useTheme();

  // Fetch data based on active tab
  const fetchData = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Fetch appropriate data based on active tab
      if (activeTab === 'users' || activeTab === 'progress') {
        const [usersResponse, progressResponse, statsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/progress'),
          api.get('/users/stats')
        ]);
        
        if (usersResponse.users) {
          setUsers(usersResponse.users);
        }
        
        if (progressResponse.progress) {
          setUserProgress(progressResponse.progress);
        }
        
        if (statsResponse.stats) {
          setStats(statsResponse.stats);
        }
      }
      
      if (activeTab === 'challenges') {
        const challengesResponse = await api.get('/challenges');
        if (challengesResponse.challenges) {
          setChallenges(challengesResponse.challenges);
        }
      }
      
      // Fetch the system settings
      try {
        const settingsResponse = await api.get('/settings');
        if (settingsResponse && settingsResponse.settings) {
          setDefaultTimeLimit(settingsResponse.settings.defaultTimeLimit || 3600);
          setNewTimeLimit(settingsResponse.settings.defaultTimeLimit || 3600);
        }
      } catch (settingsError) {
        console.warn('Could not load settings:', settingsError);
        // Don't fail the whole fetch operation if settings can't be loaded
      }
      
      if (showToast) {
        toast.success('Data refreshed successfully');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  // Load data on mount and when active tab changes
  useEffect(() => {
    // Redirect if not logged in as admin
    if (!currentUser || !isAdmin) {
      toast.error('Admin access required');
      history.push('/admin-login');
      return;
    }
    
    fetchData();
  }, [currentUser, isAdmin, fetchData, history, activeTab]);


  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    // First click sets confirmation state
    if (deleteConfirm.type !== 'user' || deleteConfirm.id !== userId) {
      setDeleteConfirm({ type: 'user', id: userId });
      setTimeout(() => setDeleteConfirm({ type: null, id: null }), 3000);
      return;
    }

    try {
      setLoading(true);
      
      // Delete the user first - the backend should handle deleting progress
      await api.delete(`/users/${userId}`);
      
      // Update UI state to remove the deleted user
      setUsers(prev => prev.filter(user => user._id !== userId));
      setUserProgress(prev => prev.filter(progress => progress.userId !== userId));
      
      toast.success('User deleted successfully');
      setDeleteConfirm({ type: null, id: null });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a challenge
  const handleDeleteChallenge = async (challengeId) => {
    // First click sets confirmation state
    if (deleteConfirm.type !== 'challenge' || deleteConfirm.id !== challengeId) {
      setDeleteConfirm({ type: 'challenge', id: challengeId });
      setTimeout(() => setDeleteConfirm({ type: null, id: null }), 3000);
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/challenges/${challengeId}`);
      
      setChallenges(prev => prev.filter(challenge => challenge._id !== challengeId));
      
      toast.success('Challenge deleted successfully');
      setDeleteConfirm({ type: null, id: null });
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Failed to delete challenge');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggling challenge enabled status
  const handleToggleChallenge = async (challengeId, currentStatus) => {
    try {
      setLoading(true);
      
      await api.patch(`/challenges/${challengeId}`, {
        enabled: !currentStatus
      });
      
      setChallenges(prev => prev.map(challenge => 
        challenge._id === challengeId 
          ? { ...challenge, enabled: !challenge.enabled } 
          : challenge
      ));
      
      toast.success(`Challenge ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling challenge:', error);
      toast.error('Failed to update challenge');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating the default time limit
  const handleUpdateTimeLimit = async () => {
    try {
      setLoading(true);
      
      // Get time in seconds from hours and minutes
      const hours = parseInt(document.getElementById('hours').value) || 0;
      const minutes = parseInt(document.getElementById('minutes').value) || 0;
      const totalSeconds = (hours * 3600) + (minutes * 60);
      
      // Ensure newTimeLimit is a valid number between 5 minutes and 24 hours
      if (totalSeconds < 300) {
        toast.error('Time limit must be at least 5 minutes (300 seconds)');
        setLoading(false);
        return;
      }
      
      if (totalSeconds > 86400) {
        toast.error('Time limit cannot exceed 24 hours (86400 seconds)');
        setLoading(false);
        return;
      }
      
      // Make the API call with the calculated total seconds
      const response = await api.post('/settings/update', {
        defaultTimeLimit: totalSeconds
      });
      
      // Update the UI with the new time limit
      setDefaultTimeLimit(totalSeconds);
      setNewTimeLimit(totalSeconds);
      setShowTimeSetting(false);
      
      toast.success('Default time limit updated successfully');
      
      // Refresh progress data to see updated time limits
      if (activeTab === 'progress') {
        fetchData(false);
      }
    } catch (error) {
      console.error('Error updating time limit:', error);
      toast.error('Failed to update time limit: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Quick role update from dashboard
  const handleQuickRoleUpdate = async (userId, field, value) => {
    try {
      const roleData = { [field]: value };
      await api.patch(`/users/${userId}/roles`, roleData);
      
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, [field]: value } : user
      ));
      
      const fieldName = field === 'isAdmin' ? 'Admin' : field === 'isCloud' ? 'Cloud' : field;
      toast.success(`${fieldName} access ${value ? 'granted' : 'removed'} successfully`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  // Get user's progress status
  const getUserProgressStatus = (userId) => {
    const progress = userProgress.find(p => p.userId === userId);
    if (!progress) return { completed: false, currentLevel: 1, timeRemaining: defaultTimeLimit };
    
    return {
      completed: progress.completed,
      currentLevel: progress.currentLevel,
      completedLevels: progress.levelStatus ? Array.from(progress.levelStatus.entries())
        .filter(([_, completed]) => completed)
        .map(([level]) => parseInt(level))
        : [],
      timeRemaining: progress.timeRemaining
    };
  };

  // Time limit input component
  const TimeLimitSetting = () => {
    const [hoursValue, setHoursValue] = useState(Math.floor(defaultTimeLimit / 3600));
    const [minutesValue, setMinutesValue] = useState(Math.floor((defaultTimeLimit % 3600) / 60));
    
    const handleSave = () => {
      const hours = parseInt(hoursValue) || 0;
      const minutes = parseInt(minutesValue) || 0;
      const totalSeconds = (hours * 3600) + (minutes * 60);
      
      // Validate the time limit
      if (totalSeconds < 300) {
        toast.error('Time limit must be at least 5 minutes (300 seconds)');
        return;
      }
      
      if (totalSeconds > 86400) {
        toast.error('Time limit cannot exceed 24 hours (86400 seconds)');
        return;
      }
      
      // Call the handler that will make the API request
      handleUpdateTimeLimit();
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
          <h3 className="text-xl font-bold mb-4">Set Default Challenge Time Limit</h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            Set the default time limit for all new challenge attempts. This will not affect users who have already started challenges.
          </p>
          
          <div className="flex items-center space-x-4 mb-6">
            <div>
              <label htmlFor="hours" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Hours</label>
              <input
                type="number"
                id="hours"
                min="0"
                max="24"
                value={hoursValue}
                onChange={(e) => setHoursValue(e.target.value)}
                className={`w-20 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label htmlFor="minutes" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Minutes</label>
              <input
                type="number"
                id="minutes"
                min="0"
                max="59"
                value={minutesValue}
                onChange={(e) => setMinutesValue(e.target.value)}
                className={`w-20 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div className="mt-7">
              <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                = {formatTimeDetailed((parseInt(hoursValue) || 0) * 3600 + (parseInt(minutesValue) || 0) * 60)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowTimeSetting(false)}
              className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                isDark
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${
            isDark ? 'border-indigo-400' : 'border-indigo-600'
          } mx-auto`}></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>BizTras Admin Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center space-x-2 md:space-x-4">
            {(activeTab === 'challenges' || activeTab === 'progress') && (
              <button
                onClick={() => setShowTimeSetting(true)}
                className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  isDark
                    ? 'text-indigo-400 bg-gray-800 border-gray-700 hover:bg-gray-700'
                    : 'text-indigo-600 bg-white hover:bg-gray-50 border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                <FiSettings className="mr-2" />
                Time Limit: {formatTimeRemaining(defaultTimeLimit)}
              </button>
            )}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
                isDark
                  ? 'text-indigo-400 bg-gray-800 border-gray-700 hover:bg-gray-700'
                  : 'text-indigo-600 bg-white hover:bg-gray-50 border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
            >
              <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className={`rounded-md p-4 mb-6 ${
            isDark ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-800'}`}>Error</h3>
                <div className={`mt-2 text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg mb-6`}>
          <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 px-4 text-center ${
                activeTab === 'users' 
                  ? isDark 
                    ? 'border-b-2 border-indigo-500 text-indigo-400 font-medium' 
                    : 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex-1 py-4 px-4 text-center ${
                activeTab === 'challenges' 
                  ? isDark 
                    ? 'border-b-2 border-indigo-500 text-indigo-400 font-medium' 
                    : 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiFlag className="inline mr-2" />
              Challenges ({challenges.length})
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-4 px-4 text-center ${
                activeTab === 'progress' 
                  ? isDark 
                    ? 'border-b-2 border-indigo-500 text-indigo-400 font-medium' 
                    : 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiClock className="inline mr-2" />
              User Progress ({userProgress.length})
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiUsers className={`h-6 w-6 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Total Users</dt>
                        <dd className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers || users.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiShield className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Admin Users</dt>
                        <dd className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {users.filter(u => u.isAdmin).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiCloud className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Cloud Users</dt>
                        <dd className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {users.filter(u => u.isCloud).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiUserPlus className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Recent (7d)</dt>
                        <dd className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {users.filter(u => {
                            const registrationDate = new Date(u.registrationTime);
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return registrationDate >= weekAgo;
                          }).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
              <div className={`px-4 py-5 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b sm:px-6`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Registered Users</h2>
                  <span className={`${
                    isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-800'
                  } px-3 py-1 rounded-full text-sm font-medium`}>
                    Total: {users.length}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Name
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Email
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Institution
                      </th>
                      <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Roles
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Registration Date
                      </th>
                      <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                    {users.map((user) => (
                      <tr key={user._id} className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{user.institution || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleQuickRoleUpdate(user._id, 'isAdmin', !user.isAdmin)}
                              className={`p-1 rounded ${user.isAdmin ? 'text-red-600 hover:text-red-800' : 'text-gray-400 hover:text-red-600'}`}
                              title={`${user.isAdmin ? 'Remove' : 'Grant'} Admin Access`}
                            >
                              <FiShield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleQuickRoleUpdate(user._id, 'isCloud', !user.isCloud)}
                              className={`p-1 rounded ${user.isCloud ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 hover:text-blue-600'}`}
                              title={`${user.isCloud ? 'Remove' : 'Grant'} Cloud Access`}
                            >
                              <FiCloud className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            {new Date(user.registrationTime).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={loading}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                              deleteConfirm.type === 'user' && deleteConfirm.id === user._id
                                ? isDark
                                  ? 'bg-red-900 text-red-200 hover:bg-red-800'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                                : isDark
                                  ? 'text-red-400 hover:text-red-300'
                                  : 'text-red-600 hover:text-red-900'
                            }`}
                          >
                            <FiTrash2 className="mr-1" />
                            {deleteConfirm.type === 'user' && deleteConfirm.id === user._id ? 'Confirm' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="6" className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          No users registered yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
            <div className={`px-4 py-5 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b sm:px-6`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Challenge Levels</h2>
                <Link
                  to="/level-manager"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FiPlusCircle className="mr-2" />
                  Add New Level
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Level
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Title
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Flag
                    </th>
                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Status
                    </th>
                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {challenges.sort((a, b) => a.levelNumber - b.levelNumber).map((challenge) => (
                    <tr key={challenge._id} className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Level {challenge.levelNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{challenge.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{challenge.flag}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          challenge.enabled 
                            ? isDark
                              ? 'bg-green-900 text-green-200' 
                              : 'bg-green-100 text-green-800'
                            : isDark
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {challenge.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleToggleChallenge(challenge._id, challenge.enabled)}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${
                              challenge.enabled
                                ? isDark
                                  ? 'text-yellow-400 hover:text-yellow-300'
                                  : 'text-yellow-600 hover:text-yellow-800'
                                : isDark
                                  ? 'text-green-400 hover:text-green-300'
                                  : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {challenge.enabled 
                              ? <><FiToggleRight className="mr-1" /> Disable</> 
                              : <><FiToggleLeft className="mr-1" /> Enable</>}
                          </button>
                          <Link
                            to={`/level-manager/${challenge._id}`}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${
                              isDark
                                ? 'text-indigo-400 hover:text-indigo-300'
                                : 'text-indigo-600 hover:text-indigo-800'
                            }`}
                          >
                            <FiEdit className="mr-1" /> Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteChallenge(challenge._id)}
                            disabled={loading}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${
                              deleteConfirm.type === 'challenge' && deleteConfirm.id === challenge._id
                                ? isDark
                                  ? 'bg-red-900 text-red-200 hover:bg-red-800'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                                : isDark
                                  ? 'text-red-400 hover:text-red-300'
                                  : 'text-red-600 hover:text-red-900'
                            }`}
                          >
                            <FiTrash2 className="mr-1" />
                            {deleteConfirm.type === 'challenge' && deleteConfirm.id === challenge._id ? 'Confirm' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {challenges.length === 0 && (
                    <tr>
                      <td colSpan="5" className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
                <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>User Progress</h2>
                <span className={`${
                  isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-800'
                } px-3 py-1 rounded-full text-sm font-medium`}>
                  Total: {userProgress.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      User
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Email
                    </th>
                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Current Level
                    </th>
                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Completed Levels
                    </th>
                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Status
                    </th>
                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Time Left
                    </th>
                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {userProgress.map((progress) => {
                    const user = users.find(u => u._id === progress.userId) || { name: 'Unknown', email: 'Unknown' };
                    return (
                      <tr key={progress._id} className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Level {progress.currentLevel}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            {progress.levelStatus && Object.entries(progress.levelStatus)
                              .filter(([_, isCompleted]) => isCompleted)
                              .map(([level]) => level)
                              .sort((a, b) => parseInt(a) - parseInt(b))
                              .join(', ') || 'None'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            progress.completed 
                              ? isDark
                                ? 'bg-green-900 text-green-200'
                                : 'bg-green-100 text-green-800'
                              : progress.timeRemaining <= 0
                                ? isDark
                                  ? 'bg-red-900 text-red-200'
                                  : 'bg-red-100 text-red-800'
                                : isDark
                                  ? 'bg-yellow-900 text-yellow-200'
                                  : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {progress.completed 
                              ? 'Completed' 
                              : progress.timeRemaining <= 0
                                ? 'Time Expired'
                                : 'In Progress'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <FiClock className={`mr-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-sm ${
                              progress.timeRemaining < 300 
                                ? isDark ? 'text-red-400' : 'text-red-600'
                                : isDark ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {formatTimeRemaining(progress.timeRemaining)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Link
                              to={`/user-progress/${progress.userId}`}
                              className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${
                                isDark
                                  ? 'text-indigo-400 hover:text-indigo-300'
                                  : 'text-indigo-600 hover:text-indigo-800'
                              }`}
                            >
                              <FiEye className="mr-1" /> View Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {userProgress.length === 0 && (
                    <tr>
                      <td colSpan="7" className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No progress data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Time Setting Modal */}
      {showTimeSetting && <TimeLimitSetting />}
    </div>
  );
};

export default AdminDashboard;