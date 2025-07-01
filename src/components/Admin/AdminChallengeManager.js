import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaToggleOn, 
  FaToggleOff,
  FaClock,
  FaUsers,
  FaSave,
  FaTimes
} from 'react-icons/fa';

const AdminChallengeManager = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [globalTimeLimit, setGlobalTimeLimit] = useState(3600);
  const [liveProgress, setLiveProgress] = useState([]);
  
  const { isDark } = useTheme();

  const [newChallenge, setNewChallenge] = useState({
    levelNumber: '',
    title: '',
    description: '',
    hint: '',
    flag: '',
    difficulty: 'easy',
    points: 100,
    category: 'general'
  });

  useEffect(() => {
    fetchChallenges();
    fetchLiveProgress();
    
    // Set up live progress polling
    const interval = setInterval(fetchLiveProgress, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/challenges/admin/all');
      setChallenges(response.data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveProgress = async () => {
    try {
      const response = await api.get('/challenges/admin/live-progress');
      setLiveProgress(response.data.progress || []);
    } catch (error) {
      console.error('Error fetching live progress:', error);
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    
    if (!newChallenge.levelNumber || !newChallenge.title || !newChallenge.description || 
        !newChallenge.hint || !newChallenge.flag) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await api.post('/challenges', newChallenge);
      toast.success('Challenge created successfully!');
      setShowCreateModal(false);
      setNewChallenge({
        levelNumber: '',
        title: '',
        description: '',
        hint: '',
        flag: '',
        difficulty: 'easy',
        points: 100,
        category: 'general'
      });
      fetchChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error(error.response?.data?.message || 'Failed to create challenge');
    }
  };

  const handleUpdateChallenge = async (id, updateData) => {
    try {
      await api.patch(`/challenges/${id}`, updateData);
      toast.success('Challenge updated successfully!');
      setEditingChallenge(null);
      fetchChallenges();
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast.error('Failed to update challenge');
    }
  };

  const handleToggleChallenge = async (id, currentStatus) => {
    try {
      await api.patch(`/challenges/${id}`, { enabled: !currentStatus });
      toast.success(`Challenge ${!currentStatus ? 'enabled' : 'disabled'} successfully!`);
      fetchChallenges();
    } catch (error) {
      console.error('Error toggling challenge:', error);
      toast.error('Failed to update challenge status');
    }
  };

  const handleDeleteChallenge = async (id) => {
    if (!window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/challenges/${id}`);
      toast.success('Challenge deleted successfully!');
      fetchChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Failed to delete challenge');
    }
  };

  const handleSetGlobalTime = async () => {
    if (globalTimeLimit < 300) {
      toast.error('Time limit must be at least 5 minutes (300 seconds)');
      return;
    }
    
    try {
      await api.post('/challenges/admin/set-global-time', { timeLimit: globalTimeLimit });
      toast.success('Global time limit updated successfully!');
      fetchLiveProgress();
    } catch (error) {
      console.error('Error setting global time:', error);
      toast.error('Failed to update global time limit');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex justify-center items-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Challenge Management Dashboard
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Create, manage challenges and monitor live progress
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Create Challenge
            </button>
          </div>
        </div>

        {/* Live Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Users</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {liveProgress.filter(p => !p.completed && !p.timeExpired).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FaUsers className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {liveProgress.filter(p => p.completed).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <FaClock className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Time Expired</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {liveProgress.filter(p => p.timeExpired).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <FaPlus className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Challenges</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {challenges.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Time Control */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Global Time Control
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Set Global Time Limit (seconds)
              </label>
              <input
                type="number"
                min="300"
                value={globalTimeLimit}
                onChange={(e) => setGlobalTimeLimit(parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="3600"
              />
            </div>
            <button
              onClick={handleSetGlobalTime}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
            >
              <FaSave className="mr-2" />
              Update Time
            </button>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Current time limit: {formatTime(globalTimeLimit)} (affects all active users)
          </p>
        </div>

        {/* Live Progress Monitor */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-8`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Live Progress Monitor
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>User</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Current Level</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Progress</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Score</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Time Remaining</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Status</th>
                </tr>
              </thead>
              <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                {liveProgress.map((progress) => (
                  <tr key={progress._id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {progress.user?.name || 'Unknown'}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            {progress.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Level {progress.currentLevel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${progress.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {progress.progressPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {progress.finalScore}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        progress.timeRemaining < 300 ? 'text-red-600 font-bold' : isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {progress.timeExpired ? 'Expired' : formatTime(progress.timeRemaining)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        progress.completed 
                          ? 'bg-green-100 text-green-800'
                          : progress.timeExpired
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {progress.completed ? 'Completed' : progress.timeExpired ? 'Time Expired' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Challenges List */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Manage Challenges
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Level</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Challenge</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Difficulty</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Points</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                {challenges.sort((a, b) => a.levelNumber - b.levelNumber).map((challenge) => (
                  <tr key={challenge._id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {challenge.levelNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {challenge.title}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {challenge.description.substring(0, 100)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                        getDifficultyColor(challenge.difficulty)
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {challenge.points}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleChallenge(challenge._id, challenge.enabled)}
                        className="flex items-center"
                      >
                        {challenge.enabled ? (
                          <>
                            <FaToggleOn className="h-5 w-5 text-green-600 mr-1" />
                            <span className="text-green-600 text-sm">Active</span>
                          </>
                        ) : (
                          <>
                            <FaToggleOff className="h-5 w-5 text-gray-400 mr-1" />
                            <span className="text-gray-400 text-sm">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingChallenge(challenge)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100"
                          title="Edit Challenge"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(challenge._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100"
                          title="Delete Challenge"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Challenge Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Create New Challenge
                </h3>
                <form onSubmit={handleCreateChallenge} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Level Number *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newChallenge.levelNumber}
                      onChange={(e) => setNewChallenge({...newChallenge, levelNumber: parseInt(e.target.value)})}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Description *
                    </label>
                    <textarea
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Hint *
                    </label>
                    <textarea
                      value={newChallenge.hint}
                      onChange={(e) => setNewChallenge({...newChallenge, hint: e.target.value})}
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Flag *
                    </label>
                    <input
                      type="text"
                      value={newChallenge.flag}
                      onChange={(e) => setNewChallenge({...newChallenge, flag: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="flag{example}"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Difficulty
                      </label>
                      <select
                        value={newChallenge.difficulty}
                        onChange={(e) => setNewChallenge({...newChallenge, difficulty: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Points
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newChallenge.points}
                        onChange={(e) => setNewChallenge({...newChallenge, points: parseInt(e.target.value)})}
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Create Challenge
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChallengeManager;