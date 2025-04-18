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
  FiToggleRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { formatTimeRemaining } from '../../utils/timer';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null });

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
      await api.delete(`/users/${userId}`);
      
      // Also delete user progress
      await api.delete(`/progress/${userId}`);
      
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

  // Get user's progress status
  const getUserProgressStatus = (userId) => {
    const progress = userProgress.find(p => p.userId === userId);
    if (!progress) return { completed: false, currentLevel: 1, timeRemaining: 3600 };
    
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 font-medium';
      case 'In Progress': return 'text-yellow-600';
      case 'Not Started': return 'text-gray-500';
      default: return 'text-gray-500';
    }
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
    </div>
  );
};

export default AdminDashboard;