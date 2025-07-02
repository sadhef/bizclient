import React, { useState, useEffect } from 'react';
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
  FiEye,
  FiSave,
  FiX
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
    flag: '',
    difficulty: 'Medium',
    category: 'Web',
    points: 100
  });

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

  // Auto-refresh monitoring data
  useEffect(() => {
    let interval;
    if (activeTab === 'monitoring') {
      interval = setInterval(loadMonitoringData, 5000); // Refresh every 5 seconds
    }
    return () => clearInterval(interval);
  }, [activeTab]);

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
        flag: '',
        difficulty: 'Medium',
        category: 'Web',
        points: 100
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
        flag: challenge.flag,
        difficulty: challenge.difficulty,
        category: challenge.category,
        points: challenge.points
      });
    } else {
      setEditingChallenge(null);
      setChallengeForm({
        level: '',
        title: '',
        description: '',
        hint: '',
        flag: '',
        difficulty: 'Medium',
        category: 'Web',
        points: 100
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'challenges', label: 'Challenges', icon: FiTarget },
    { id: 'config', label: 'Configuration', icon: FiSettings },
    { id: 'monitoring', label: 'Live Monitoring', icon: FiMonitor }
  ];

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light-primary dark:text-dark-primary mb-2">
            Admin Dashboard
          </h1>
          <p className="text-light-secondary dark:text-dark-secondary">
            Manage your BizTras CTF platform
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-violet-500 text-violet-600 dark:text-violet-400'
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-light-secondary dark:text-dark-secondary">Total Users</p>
                        <p className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                          {stats.userStats.total}
                        </p>
                      </div>
                      <FiUsers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-light-secondary dark:text-dark-secondary">Approved Users</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {stats.userStats.approved}
                        </p>
                      </div>
                      <FiUserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-light-secondary dark:text-dark-secondary">Active Users</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {stats.userStats.active}
                        </p>
                      </div>
                      <FiMonitor className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-light-secondary dark:text-dark-secondary">Total Challenges</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {stats.challengeStats.total}
                        </p>
                      </div>
                      <FiTarget className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Charts would go here - Level completion stats, etc. */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
                      Level Completion Stats
                    </h3>
                    <div className="space-y-3">
                      {stats.levelStats.map((level) => (
                        <div key={level._id} className="flex justify-between items-center">
                          <span className="text-light-secondary dark:text-dark-secondary">
                            Level {level._id}
                          </span>
                          <span className="font-medium text-light-primary dark:text-dark-primary">
                            {level.count} users
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
                      Current Level Distribution
                    </h3>
                    <div className="space-y-3">
                      {stats.currentLevelStats.map((level) => (
                        <div key={level._id} className="flex justify-between items-center">
                          <span className="text-light-secondary dark:text-dark-secondary">
                            Level {level._id}
                          </span>
                          <span className="font-medium text-light-primary dark:text-dark-primary">
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
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    User Management
                  </h3>
                  <button
                    onClick={loadUsers}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-light-secondary dark:text-dark-secondary">
                          User
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-light-secondary dark:text-dark-secondary">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-light-secondary dark:text-dark-secondary">
                          Level
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-light-secondary dark:text-dark-secondary">
                          Attempts
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-light-secondary dark:text-dark-secondary">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-light-primary dark:text-dark-primary">
                                {user.username}
                              </p>
                              <p className="text-sm text-light-secondary dark:text-dark-secondary">
                                {user.email}</p>
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
                          <td className="py-3 px-4 text-light-primary dark:text-dark-primary">
                            {user.currentLevel}
                          </td>
                          <td className="py-3 px-4 text-light-primary dark:text-dark-primary">
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
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    Challenge Management
                  </h3>
                  <button
                    onClick={() => openChallengeModal()}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Challenge
                  </button>
                </div>

                <div className="grid gap-4">
                  {challenges.map((challenge) => (
                    <div key={challenge._id} className="card">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium rounded">
                              Level {challenge.level}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              challenge.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                              challenge.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>
                              {challenge.difficulty}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                              {challenge.category}
                            </span>
                          </div>
                          <h4 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                            {challenge.title}
                          </h4>
                          <p className="text-light-secondary dark:text-dark-secondary text-sm mb-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-light-secondary dark:text-dark-secondary">
                            <span>Points: {challenge.points}</span>
                            <span>Solves: {challenge.solveCount}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openChallengeModal(challenge)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit Challenge"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteChallenge(challenge._id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Challenge"
                          >
                            <FiTrash2 className="w-4 h-4" />
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
              <div className="card max-w-2xl">
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-6">
                  Challenge Configuration
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                      Challenge Title
                    </label>
                    <input
                      type="text"
                      value={config.challengeTitle}
                      onChange={(e) => setConfig({...config, challengeTitle: e.target.value})}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                      Challenge Description
                    </label>
                    <textarea
                      value={config.challengeDescription}
                      onChange={(e) => setConfig({...config, challengeDescription: e.target.value})}
                      rows={3}
                      className="input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        value={config.totalTimeLimit}
                        onChange={(e) => setConfig({...config, totalTimeLimit: parseInt(e.target.value)})}
                        className="input"
                        min="1"
                        max="1440"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                        Max Levels
                      </label>
                      <input
                        type="number"
                        value={config.maxLevels}
                        onChange={(e) => setConfig({...config, maxLevels: parseInt(e.target.value)})}
                        className="input"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.challengeActive}
                        onChange={(e) => setConfig({...config, challengeActive: e.target.checked})}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-sm font-medium text-light-primary dark:text-dark-primary">
                        Challenge Active
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.registrationOpen}
                        onChange={(e) => setConfig({...config, registrationOpen: e.target.checked})}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-sm font-medium text-light-primary dark:text-dark-primary">
                        Registration Open
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.allowHints}
                        onChange={(e) => setConfig({...config, allowHints: e.target.checked})}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-sm font-medium text-light-primary dark:text-dark-primary">
                        Allow Hints
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiSave className="w-4 h-4" />
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    Live User Monitoring
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-light-secondary dark:text-dark-secondary">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Auto-refreshing every 5 seconds
                  </div>
                </div>

                <div className="grid gap-4">
                  {monitoring.map((user) => (
                    <div key={user.id} className="card">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-light-primary dark:text-dark-primary">
                              {user.username}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-light-secondary dark:text-dark-secondary">Current Level</p>
                              <p className="font-medium text-light-primary dark:text-dark-primary">
                                {user.currentLevel}
                              </p>
                            </div>
                            <div>
                              <p className="text-light-secondary dark:text-dark-secondary">Completed</p>
                              <p className="font-medium text-light-primary dark:text-dark-primary">
                                {user.completedLevels.length} levels
                              </p>
                            </div>
                            <div>
                              <p className="text-light-secondary dark:text-dark-secondary">Attempts</p>
                              <p className="font-medium text-light-primary dark:text-dark-primary">
                                {user.totalAttempts}
                              </p>
                            </div>
                            <div>
                              <p className="text-light-secondary dark:text-dark-secondary">Time Remaining</p>
                              <p className={`font-medium ${
                                user.timeRemaining > 300 ? 'text-green-600 dark:text-green-400' :
                                user.timeRemaining > 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {user.isActive ? formatTime(user.timeRemaining) : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {user.submissions && user.submissions.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm text-light-secondary dark:text-dark-secondary mb-2">
                                Recent Submissions:
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {user.submissions.slice(-5).map((submission, index) => (
                                  <span
                                    key={index}
                                    className={`px-2 py-1 text-xs rounded ${
                                      submission.isCorrect
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    }`}
                                  >
                                    L{submission.level}: {submission.isCorrect ? '✓' : '✗'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {monitoring.length === 0 && (
                    <div className="text-center py-8 text-light-secondary dark:text-dark-secondary">
                      No active users to monitor
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Challenge Modal */}
        {showChallengeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
                  </h3>
                  <button
                    onClick={() => setShowChallengeModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                        Level
                      </label>
                      <input
                        type="number"
                        value={challengeForm.level}
                        onChange={(e) => setChallengeForm({...challengeForm, level: parseInt(e.target.value)})}
                        className="input"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                        Difficulty
                      </label>
                      <select
                        value={challengeForm.difficulty}
                        onChange={(e) => setChallengeForm({...challengeForm, difficulty: e.target.value})}
                        className="input"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                        Category
                      </label>
                      <select
                        value={challengeForm.category}
                        onChange={(e) => setChallengeForm({...challengeForm, category: e.target.value})}
                        className="input"
                      >
                        <option value="Web">Web</option>
                        <option value="Crypto">Crypto</option>
                        <option value="Forensics">Forensics</option>
                        <option value="Reverse">Reverse</option>
                        <option value="Pwn">Pwn</option>
                        <option value="Misc">Misc</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={challengeForm.title}
                      onChange={(e) => setChallengeForm({...challengeForm, title: e.target.value})}
                      className="input"
                      placeholder="Challenge title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                      Description
                    </label>
                    <textarea
                      value={challengeForm.description}
                      onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                      rows={4}
                      className="input"
                      placeholder="Challenge description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                      Hint (Optional)
                    </label>
                    <textarea
                      value={challengeForm.hint}
                      onChange={(e) => setChallengeForm({...challengeForm, hint: e.target.value})}
                      rows={2}
                      className="input"
                      placeholder="Hint for users"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                      Flag
                    </label>
                    <input
                      type="text"
                      value={challengeForm.flag}
                      onChange={(e) => setChallengeForm({...challengeForm, flag: e.target.value})}
                      className="input"
                      placeholder="BizTras{flag_content}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      value={challengeForm.points}
                      onChange={(e) => setChallengeForm({...challengeForm, points: parseInt(e.target.value)})}
                      className="input"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveChallenge}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiSave className="w-4 h-4" />
                    {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                  </button>
                  <button
                    onClick={() => setShowChallengeModal(false)}
                    className="btn-secondary"
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