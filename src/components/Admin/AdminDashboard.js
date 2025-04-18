import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiUsers, 
  FiFlag, 
  FiPlusCircle, 
  FiHome, 
  FiLogOut,
  FiRefreshCw,
  FiTrash2,
  FiEdit,
  FiClock,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { formatTimeRemaining, formatTimeDetailed } from '../../utils/timer';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null });
  const [showTimeSetting, setShowTimeSetting] = useState(false);
  const [defaultTimeLimit, setDefaultTimeLimit] = useState(3600); // Default 1 hour in seconds
  const [newTimeLimit, setNewTimeLimit] = useState(3600);

  const history = useHistory();
  const { currentUser, isAdmin, logout } = useAuth();

  // Fetch data based on active tab
  const fetchData = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Fetch appropriate data based on active tab
      if (activeTab === 'users' || activeTab === 'progress') {
        const [usersResponse, progressResponse] = await Promise.all([
          api.get('/users'),
          api.get('/progress')
        ]);
        
        setUsers(usersResponse.users);
        setUserProgress(progressResponse.progress);
      }
      
      if (activeTab === 'challenges') {
        const challengesResponse = await api.get('/challenges');
        setChallenges(challengesResponse.challenges);
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

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    history.push('/admin-login');
  };

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
      
      console.log("Raw input values - Hours:", hours, "Minutes:", minutes);
      console.log("Calculated total seconds:", totalSeconds);
      
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
      
      console.log("About to send time limit update request with totalSeconds:", totalSeconds);
      
      // Make the API call with the calculated total seconds
      const response = await api.post('/settings/update', {
        defaultTimeLimit: totalSeconds
      });
      
      console.log("API response:", response);
      
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
      if (error.response && error.response.data) {
        console.error('Server response:', error.response.data);
      }
      toast.error('Failed to update time limit: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
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

  // Format time input for display
  const formatTimeForInput = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return {
      hours,
      minutes
    };
  };

  // Parse time input to seconds
  const parseTimeToSeconds = (hours, minutes) => {
    return (parseInt(hours) * 3600) + (parseInt(minutes) * 60);
  };

  // Time limit input component
  const TimeLimitSetting = () => {
    const [hoursValue, setHoursValue] = useState(Math.floor(defaultTimeLimit / 3600));
    const [minutesValue, setMinutesValue] = useState(Math.floor((defaultTimeLimit % 3600) / 60));
    
    const handleSave = () => {
      // This doesn't do the actual saving - it just validates and calls handleUpdateTimeLimit
      // which will read the values directly from the inputs
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
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Set Default Challenge Time Limit</h3>
          <p className="text-sm text-gray-600 mb-4">
            Set the default time limit for all new challenge attempts. This will not affect users who have already started challenges.
          </p>
          
          <div className="flex items-center space-x-4 mb-6">
            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input
                type="number"
                id="hours"
                min="0"
                max="24"
                value={hoursValue}
                onChange={(e) => setHoursValue(e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="minutes" className="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
              <input
                type="number"
                id="minutes"
                min="0"
                max="59"
                value={minutesValue}
                onChange={(e) => setMinutesValue(e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mt-7">
              <span className="text-gray-500">
                = {formatTimeDetailed((parseInt(hoursValue) || 0) * 3600 + (parseInt(minutesValue) || 0) * 60)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowTimeSetting(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setShowTimeSetting(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiSettings className="mr-2" />
              Time Limit: {formatTimeRemaining(defaultTimeLimit)}
            </button>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiLogOut className="mr-2" /> Logout
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

        {/* Tab navigation */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 px-4 text-center ${activeTab === 'users' 
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiUsers className="inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex-1 py-4 px-4 text-center ${activeTab === 'challenges' 
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiFlag className="inline mr-2" />
              Challenges
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-4 px-4 text-center ${activeTab === 'progress' 
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiClock className="inline mr-2" />
              Progress
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Registered Users</h2>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  Total: {users.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Institution
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.institution || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(user.registrationTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={loading}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                            deleteConfirm.type === 'user' && deleteConfirm.id === user._id
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
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
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No users registered yet
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
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Challenge Levels</h2>
                <Link
                  to="/admin/challenges/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FiPlusCircle className="mr-2" />
                  Add New Level
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Flag
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {challenges.sort((a, b) => a.levelNumber - b.levelNumber).map((challenge) => (
                    <tr key={challenge._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Level {challenge.levelNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{challenge.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">{challenge.flag}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          challenge.enabled 
                            ? 'bg-green-100 text-green-800' 
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
                                ? 'text-yellow-600 hover:text-yellow-800'
                                : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {challenge.enabled 
                              ? <><FiToggleRight className="mr-1" /> Disable</> 
                              : <><FiToggleLeft className="mr-1" /> Enable</>}
                          </button>
                          <Link
                            to={`/admin/challenges/edit/${challenge._id}`}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            <FiEdit className="mr-1" /> Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteChallenge(challenge._id)}
                            disabled={loading}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${
                              deleteConfirm.type === 'challenge' && deleteConfirm.id === challenge._id
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
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
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
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
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">User Progress</h2>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  Total: {userProgress.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed Levels
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Left
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userProgress.map((progress) => {
                    const user = users.find(u => u._id === progress.userId) || { name: 'Unknown', email: 'Unknown' };
                    return (
                      <tr key={progress._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium">Level {progress.currentLevel}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-500">
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
                              ? 'bg-green-100 text-green-800' 
                              : progress.timeRemaining <= 0
                                ? 'bg-red-100 text-red-800'
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
                            <FiClock className="mr-1 text-gray-500" />
                            <span className={`text-sm ${progress.timeRemaining < 300 ? 'text-red-600' : 'text-gray-500'}`}>
                              {formatTimeRemaining(progress.timeRemaining)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Link
                              to={`/admin/progress/${progress.userId}`}
                              className="inline-flex items-center px-2 py-1 rounded-md text-sm text-indigo-600 hover:text-indigo-800"
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
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
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