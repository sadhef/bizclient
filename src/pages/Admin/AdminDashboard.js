import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { 
  FiUsers, 
  FiTarget, 
  FiSettings, 
  FiMonitor,
  FiBarChart2,
  FiUserCheck,
  FiUserX,
  FiTrash2,
  FiRefreshCw,
  FiPlus,
  FiEdit3,
  FiSave,
  FiX,
  FiClock,
  FiMenu,
  FiChevronDown
} from 'react-icons/fi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [config, setConfig] = useState(null);
  const [monitoring, setMonitoring] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [challengeForm, setChallengeForm] = useState({
    level: '',
    title: '',
    description: '',
    hint: '',
    flag: ''
  });

  // Mobile navigation state
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Live monitoring timer states
  const [monitoringTimeRemaining, setMonitoringTimeRemaining] = useState({});
  const monitoringIntervalRef = useRef(null);
  const monitoringDataRef = useRef([]);

  // Update monitoring data ref
  useEffect(() => {
    monitoringDataRef.current = monitoring;
  }, [monitoring]);

  // Get tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  // Update monitoring timers
  const updateMonitoringTimers = useCallback(() => {
    const currentData = monitoringDataRef.current;
    
    if (currentData.length === 0) return;

    setMonitoringTimeRemaining(prev => {
      const updated = { ...prev };
      let hasActiveUsers = false;

      currentData.forEach(user => {
        if (user.isActive && user.timeRemaining > 0) {
          hasActiveUsers = true;
          const currentTime = updated[user.id] !== undefined ? updated[user.id] : user.timeRemaining;
          const newTime = Math.max(0, currentTime - 1);
          updated[user.id] = newTime;
        }
      });

      if (!hasActiveUsers && monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }

      return updated;
    });
  }, []);

  // Start monitoring timer
  const startMonitoringTimer = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }

    // Initialize time remaining for all users
    const initialTimes = {};
    monitoring.forEach(user => {
      if (user.isActive && user.timeRemaining > 0) {
        initialTimes[user.id] = user.timeRemaining;
      }
    });
    setMonitoringTimeRemaining(initialTimes);

    monitoringIntervalRef.current = setInterval(updateMonitoringTimers, 1000);
  }, [monitoring, updateMonitoringTimers]);

  // Auto-refresh monitoring data and start live timers
  useEffect(() => {
    let interval;
    if (activeTab === 'monitoring') {
      interval = setInterval(loadMonitoringData, 5000);
      
      // Start the timer for live countdown
      startMonitoringTimer();
    } else {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [activeTab, startMonitoringTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'overview':
          await loadStats();
          break;
        case 'users':
          await loadUsers();
          break;
        case 'challenges':
          await loadChallenges();
          break;
        case 'config':
          await loadConfig();
          break;
        case 'monitoring':
          await loadMonitoringData();
          break;
        default:
          await loadStats();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const response = await adminAPI.getStats();
    setStats(response.data);
  };

  const loadUsers = async () => {
    const response = await adminAPI.getUsers();
    setUsers(response.data.users);
  };

  const loadChallenges = async () => {
    const response = await adminAPI.getChallenges();
    setChallenges(response.data);
  };

  const loadConfig = async () => {
    const response = await adminAPI.getConfig();
    setConfig(response.data);
  };

  const loadMonitoringData = async () => {
    try {
      const response = await adminAPI.getMonitoring();
      setMonitoring(response.data);
      
      // Update monitoring times when new data is loaded
      if (activeTab === 'monitoring') {
        setTimeout(() => {
          startMonitoringTimer();
        }, 100);
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      toast.success('User approved successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleDisapproveUser = async (userId) => {
    try {
      await adminAPI.disapproveUser(userId);
      toast.success('User approval revoked');
      loadUsers();
    } catch (error) {
      toast.error('Failed to disapprove user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        loadUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleResetUser = async (userId) => {
    if (window.confirm('Are you sure you want to reset this user\'s progress?')) {
      try {
        await adminAPI.resetUser(userId);
        toast.success('User progress reset successfully');
        loadUsers();
        if (activeTab === 'monitoring') {
          loadMonitoringData();
        }
      } catch (error) {
        toast.error('Failed to reset user progress');
      }
    }
  };

  const handleSaveConfig = async () => {
    try {
      await adminAPI.updateConfig(config);
      toast.success('Configuration updated successfully');
    } catch (error) {
      toast.error('Failed to update configuration');
    }
  };

  const handleSaveChallenge = async () => {
    try {
      if (editingChallenge) {
        await adminAPI.updateChallenge(editingChallenge._id, challengeForm);
        toast.success('Challenge updated successfully');
      } else {
        await adminAPI.createChallenge(challengeForm);
        toast.success('Challenge created successfully');
      }
      
      setShowChallengeModal(false);
      setEditingChallenge(null);
      setChallengeForm({
        level: '',
        title: '',
        description: '',
        hint: '',
        flag: ''
      });
      loadChallenges();
    } catch (error) {
      toast.error(editingChallenge ? 'Failed to update challenge' : 'Failed to create challenge');
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await adminAPI.deleteChallenge(challengeId);
        toast.success('Challenge deleted successfully');
        loadChallenges();
      } catch (error) {
        toast.error('Failed to delete challenge');
      }
    }
  };

  const openChallengeModal = (challenge = null) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setChallengeForm({
        level: challenge.level,
        title: challenge.title,
        description: challenge.description,
        hint: challenge.hint || '',
        flag: challenge.flag
      });
    } else {
      setEditingChallenge(null);
      setChallengeForm({
        level: '',
        title: '',
        description: '',
        hint: '',
        flag: ''
      });
    }
    setShowChallengeModal(true);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getTimeColor = (time) => {
    if (time > 300) return 'text-green-600 dark:text-green-400';
    if (time > 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'challenges', label: 'Challenges', icon: FiTarget },
    { id: 'config', label: 'Configuration', icon: FiSettings },
    { id: 'monitoring', label: 'Live Monitoring', icon: FiMonitor }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Manage your Re-Challenge CTF platform
          </p>
        </div>

        {/* Mobile Tabs Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-black dark:text-white bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-2">
              {tabs.find(tab => tab.id === activeTab)?.icon && React.createElement(tabs.find(tab => tab.id === activeTab).icon, { className: "w-4 h-4" })}
              <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
            </div>
            <FiChevronDown className={`w-4 h-4 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showMobileMenu && (
            <div className="mt-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMobileMenu(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    } first:rounded-t-lg last:rounded-b-lg`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-black dark:border-white text-black dark:text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner message="Loading dashboard..." />
        ) : (
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                        <p className="text-lg sm:text-2xl font-bold text-black dark:text-white">
                          {stats.userStats.total}
                        </p>
                      </div>
                      <FiUsers className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Approved Users</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                          {stats.userStats.approved}
                        </p>
                      </div>
                      <FiUserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                        <p className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {stats.userStats.active}
                        </p>
                      </div>
                      <FiMonitor className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Challenges</p>
                        <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {stats.challengeStats.total}
                        </p>
                      </div>
                      <FiTarget className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Level Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-4">
                      Level Completion Stats
                    </h3>
                    <div className="space-y-3">
                      {stats.levelStats.map((level) => (
                        <div key={level._id} className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Level {level._id}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                            {level.count} users
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-4">
                      Current Level Distribution
                    </h3>
                    <div className="space-y-3">
                      {stats.currentLevelStats.map((level) => (
                        <div key={level._id} className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Level {level._id}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                            {level.count} users
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white">
                    User Management
                  </h3>
                  <button
                    onClick={loadUsers}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {/* Mobile User Cards */}
                <div className="block sm:hidden space-y-4">
                  {users.map((user) => (
                    <div key={user._id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-black dark:text-white text-sm">
                            {user.username}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isApproved
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        }`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-4 text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            Level: <span className="text-black dark:text-white font-medium">{user.currentLevel}</span>
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Attempts: <span className="text-black dark:text-white font-medium">{user.totalAttempts}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!user.isApproved ? (
                          <button
                            onClick={() => handleApproveUser(user._id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded"
                            title="Approve User"
                          >
                            <FiUserCheck className="w-3 h-3" />
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDisapproveUser(user._id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded"
                            title="Revoke Approval"
                          >
                            <FiUserX className="w-3 h-3" />
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => handleResetUser(user._id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                          title="Reset Progress"
                        >
                          <FiRefreshCw className="w-3 h-3" />
                          Reset
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded"
                          title="Delete User"
                        >
                          <FiTrash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                          Level
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                          Attempts
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm font-medium text-black dark:text-white">
                                {user.username}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isApproved
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            }`}>
                              {user.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-black dark:text-white">
                            {user.currentLevel}
                          </td>
                          <td className="py-3 px-4 text-sm text-black dark:text-white">
                            {user.totalAttempts}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {!user.isApproved ? (
                                <button
                                  onClick={() => handleApproveUser(user._id)}
                                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                  title="Approve User"
                                >
                                  <FiUserCheck className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDisapproveUser(user._id)}
                                  className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                                  title="Revoke Approval"
                                >
                                  <FiUserX className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleResetUser(user._id)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Reset Progress"
                              >
                                <FiRefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete User"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white">
                    Challenge Management
                  </h3>
                  <button
                    onClick={() => openChallengeModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Challenge
                  </button>
                </div>

                <div className="grid gap-4">
                  {challenges.map((challenge) => (
                    <div key={challenge._id} className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded">
                              Level {challenge.level}
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-2">
                            {challenge.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                            {challenge.description}
                          </p>
                        </div>
                        <div className="flex gap-2 sm:ml-4">
                          <button
                            onClick={() => openChallengeModal(challenge)}
                            className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit Challenge"
                          >
                            <FiEdit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="sm:hidden">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteChallenge(challenge._id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Challenge"
                          >
                            <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="sm:hidden">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration Tab */}
            {activeTab === 'config' && config && (
              <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 max-w-full sm:max-w-2xl">
                <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-6">
                  Challenge Configuration
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Challenge Title
                    </label>
                    <input
                      type="text"
                      value={config.challengeTitle}
                      onChange={(e) => setConfig({...config, challengeTitle: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Challenge Description
                    </label>
                    <textarea
                      value={config.challengeDescription}
                      onChange={(e) => setConfig({...config, challengeDescription: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        value={config.totalTimeLimit}
                        onChange={(e) => setConfig({...config, totalTimeLimit: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        min="1"
                        max="1440"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Max Levels
                      </label>
                      <input
                        type="number"
                        value={config.maxLevels}
                        onChange={(e) => setConfig({...config, maxLevels: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.challengeActive}
                        onChange={(e) => setConfig({...config, challengeActive: e.target.checked})}
                        className="rounded border-gray-300 text-black focus:ring-black dark:focus:ring-white"
                      />
                      <span className="text-sm font-medium text-black dark:text-white">
                        Challenge Active
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.registrationOpen}
                        onChange={(e) => setConfig({...config, registrationOpen: e.target.checked})}
                        className="rounded border-gray-300 text-black focus:ring-black dark:focus:ring-white"
                      />
                      <span className="text-sm font-medium text-black dark:text-white">
                        Registration Open
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.allowHints}
                        onChange={(e) => setConfig({...config, allowHints: e.target.checked})}
                        className="rounded border-gray-300 text-black focus:ring-black dark:focus:ring-white"
                      />
                      <span className="text-sm font-medium text-black dark:text-white">
                        Allow Hints
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    <FiSave className="w-4 h-4" />
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {/* Monitoring Tab - RESPONSIVE WITH LIVE COUNTDOWN */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white">
                    Live User Monitoring
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Auto-refreshing every 5 seconds
                    </div>
                    <button
                      onClick={loadMonitoringData}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      Refresh Now
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {monitoring.map((user) => {
                    // Use live countdown time if available, otherwise use original time
                    const displayTimeRemaining = user.isActive && monitoringTimeRemaining[user.id] !== undefined 
                      ? monitoringTimeRemaining[user.id] 
                      : user.timeRemaining;

                    return (
                      <div key={user.id} className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h4 className="text-sm font-semibold text-black dark:text-white">
                              {user.username}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                                user.isActive
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}>
                                {user.isActive && (
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                )}
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {user.email}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs">Current Level</p>
                              <p className="font-medium text-black dark:text-white">
                                {user.currentLevel}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs">Completed</p>
                              <p className="font-medium text-black dark:text-white">
                                {user.completedLevels.length} levels
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs">Attempts</p>
                              <p className="font-medium text-black dark:text-white">
                                {user.totalAttempts}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs">Time Remaining</p>
                              <div className="flex items-center gap-1">
                                <p className={`font-medium text-xs sm:text-sm ${
                                  user.isActive ? getTimeColor(displayTimeRemaining) : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {user.isActive ? formatTime(displayTimeRemaining) : 'N/A'}
                                </p>
                                {user.isActive && displayTimeRemaining > 0 && (
                                  <FiClock className={`w-3 h-3 ${getTimeColor(displayTimeRemaining)}`} />
                                )}
                              </div>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">Last Activity</p>
                              <p className="font-medium text-black dark:text-white text-xs">
                                {user.lastActivity ? new Date(user.lastActivity).toLocaleTimeString() : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Time Progress Bar for Active Users */}
                          {user.isActive && displayTimeRemaining > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                <span>Time Progress</span>
                                <span>{Math.round((displayTimeRemaining / 3600) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                                    displayTimeRemaining > 300 ? 'bg-green-500' :
                                    displayTimeRemaining > 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.max(0, Math.min(100, (displayTimeRemaining / 3600) * 100))}%` 
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Started: {user.challengeStartTime ? new Date(user.challengeStartTime).toLocaleTimeString() : 'N/A'}
                                </span>
                                {user.challengeEndTime && (
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Ends: {new Date(user.challengeEndTime).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleResetUser(user.id)}
                                className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 self-start sm:self-auto"
                                title="Reset Progress"
                              >
                                <FiRefreshCw className="w-3 h-3" />
                                Reset
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {monitoring.length === 0 && (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                      <FiMonitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No active users to monitor</p>
                      <p className="text-xs">Users will appear here when they start challenges</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Challenge Modal - RESPONSIVE */}
        {showChallengeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white">
                    {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
                  </h3>
                  <button
                    onClick={() => setShowChallengeModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Level
                    </label>
                    <input
                      type="number"
                      value={challengeForm.level}
                      onChange={(e) => setChallengeForm({...challengeForm, level: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      min="1"
                      placeholder="1"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={challengeForm.title}
                      onChange={(e) => setChallengeForm({...challengeForm, title: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      placeholder="Challenge title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Description
                    </label>
                    <textarea
                      value={challengeForm.description}
                      onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      placeholder="Challenge description"
                    />
                  </div>

                  {/* Hint */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Hint (Optional)
                    </label>
                    <textarea
                      value={challengeForm.hint}
                      onChange={(e) => setChallengeForm({...challengeForm, hint: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      placeholder="Hint for users"
                    />
                  </div>

                  {/* Flag */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Flag
                    </label>
                    <input
                      type="text"
                      value={challengeForm.flag}
                      onChange={(e) => setChallengeForm({...challengeForm, flag: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      placeholder="Re-Challenge{flag_content}"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleSaveChallenge}
                    className="flex items-center justify-center gap-2 px-6 py-3 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    <FiSave className="w-4 h-4" />
                    {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                  </button>
                  <button
                    onClick={() => setShowChallengeModal(false)}
                    className="px-6 py-3 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;