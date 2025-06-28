import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiUsers, FiBarChart2, FiSettings, FiLogOut, FiRefreshCw, 
  FiTrash2, FiEye, FiToggleLeft, FiToggleRight, FiShield,
  FiCloud, FiUserPlus, FiEdit
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

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

  const history = useHistory();
  const { currentUser, isAdmin, logout } = useAuth();

  // Fetch data based on active tab
  const fetchData = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      setError(null);
      
      if (activeTab === 'users') {
        const [usersResponse, statsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/users/stats')
        ]);
        
        if (usersResponse.users) {
          setUsers(usersResponse.users);
        }
        
        if (statsResponse.stats) {
          setStats(statsResponse.stats);
        }
      } else if (activeTab === 'challenges') {
        const response = await api.get('/challenges');
        if (response.challenges) {
          setChallenges(response.challenges);
        }
      } else if (activeTab === 'progress') {
        const response = await api.get('/progress');
        if (response.progress) {
          setUserProgress(response.progress);
        }
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

  // Navigate to user manager
  const handleManageUsers = () => {
    history.push('/admin/users');
  };

  // Quick role update from dashboard
  const handleQuickRoleUpdate = async (userId, field, value) => {
    try {
      const roleData = { [field]: value };
      const response = await api.patch(`/users/${userId}/roles`, roleData);
      
      if (response.user) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? response.user : user
        ));
        toast.success(`User ${field} updated successfully`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(`Failed to update user ${field}`);
    }
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
      toast.error('Failed to update challenge status');
    } finally {
      setLoading(false);
    }
  };

  // Render users tab with role management
  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUsers className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiShield className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Admin Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.adminUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCloud className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cloud Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.cloudUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUserPlus className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recent (7d)</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.recentRegistrations || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Registered Users</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage user accounts and permissions
            </p>
          </div>
          <button
            onClick={handleManageUsers}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiEdit className="mr-2 h-4 w-4" />
            Manage Users
          </button>
        </div>
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user._id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <FiUsers className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="ml-2 flex items-center space-x-1">
                        {user.isAdmin && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            <FiShield className="mr-1 h-3 w-3" />
                            Admin
                          </span>
                        )}
                        {user.isCloud && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <FiCloud className="mr-1 h-3 w-3" />
                            Cloud
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.institution}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Quick Role Toggles */}
                  <div className="flex items-center space-x-2">
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
                  
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white ${
                      deleteConfirm.type === 'user' && deleteConfirm.id === user._id
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-red-400 hover:bg-red-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Render challenges tab (existing functionality)
  const renderChallengesTab = () => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Challenges</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage challenges and their settings
        </p>
      </div>
      <ul className="divide-y divide-gray-200">
        {challenges.map((challenge) => (
          <li key={challenge._id}>
            <div className="px-4 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{challenge.title}</div>
                <div className="text-sm text-gray-500">Level: {challenge.level}</div>
                <div className="text-sm text-gray-500">
                  Points: {challenge.points} | Time Limit: {challenge.timeLimit}s
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleChallenge(challenge._id, challenge.enabled)}
                  className={`p-1 rounded ${challenge.enabled ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {challenge.enabled ? <FiToggleRight className="h-6 w-6" /> : <FiToggleLeft className="h-6 w-6" />}
                </button>
                <button
                  onClick={() => handleDeleteChallenge(challenge._id)}
                  className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white ${
                    deleteConfirm.type === 'challenge' && deleteConfirm.id === challenge._id
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-red-400 hover:bg-red-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  // Render progress tab (existing functionality)
  const renderProgressTab = () => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">User Progress</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Monitor user progress and performance
        </p>
      </div>
      <ul className="divide-y divide-gray-200">
        {userProgress.map((progress) => (
          <li key={progress._id}>
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{progress.userName}</div>
                  <div className="text-sm text-gray-500">
                    Level: {progress.currentLevel} | Score: {progress.totalScore}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Completed: {progress.completedChallenges.length} challenges
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {currentUser?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FiLogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'challenges'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiBarChart2 className="inline mr-2" />
              Challenges ({challenges.length})
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiSettings className="inline mr-2" />
              Progress ({userProgress.length})
            </button>
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mt-6">
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

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'challenges' && renderChallengesTab()}
          {activeTab === 'progress' && renderProgressTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;