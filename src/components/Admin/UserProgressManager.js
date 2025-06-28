import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiArrowLeft, 
  FiUser, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiRotateCcw,
  FiActivity,
  FiFlag,
  FiHelpCircle,
  FiEye,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';
import { formatTimeRemaining, formatTimeDetailed } from '../../utils/timer';

const UserProgressManager = () => {
  const { userId } = useParams();
  const history = useHistory();
  const { currentUser, isAdmin } = useAuth();
  const { isDark } = useTheme();

  const [userDetails, setUserDetails] = useState(null);
  const [progress, setProgress] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  // Fetch user progress data
  useEffect(() => {
    // Redirect if not logged in as admin
    if (!currentUser || !isAdmin) {
      toast.error('Admin access required');
      history.push('/admin-login');
      return;
    }

    // Check if userId is provided
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    fetchUserProgress();
  }, [currentUser, isAdmin, userId, history]);

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate userId format (MongoDB ObjectId)
      if (!userId || userId === 'undefined' || userId.length !== 24) {
        throw new Error('Invalid user ID format');
      }

      const [userResponse, progressResponse, challengesResponse] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/progress/${userId}`),
        api.get('/challenges')
      ]);

      if (userResponse.user) {
        setUserDetails(userResponse.user);
      } else {
        throw new Error('User not found');
      }

      if (progressResponse.progress) {
        setProgress(progressResponse.progress);
      } else {
        // Create initial progress if none exists
        const initProgressResponse = await api.post('/progress', {
          userId,
          currentLevel: 1,
          timeRemaining: 3600,
          totalTimeLimit: 3600
        });
        setProgress(initProgressResponse.progress);
      }

      if (challengesResponse.challenges) {
        setChallenges(challengesResponse.challenges);
      }

    } catch (err) {
      console.error('Error fetching user progress:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load user progress data');
      toast.error('Failed to load user progress data');
    } finally {
      setLoading(false);
    }
  };

  // Reset user progress
  const resetProgress = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
      return;
    }

    try {
      setSaving(true);
      
      await api.patch(`/progress/${userId}`, {
        resetProgress: true
      });
      
      toast.success('User progress reset successfully');
      setResetConfirm(false);
      
      // Refresh data
      fetchUserProgress();
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress');
    } finally {
      setSaving(false);
    }
  };

  // Update user progress
  const updateProgress = async (updates) => {
    try {
      setSaving(true);
      
      await api.patch(`/progress/${userId}`, updates);
      
      toast.success('Progress updated successfully');
      
      // Refresh data
      fetchUserProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setSaving(false);
    }
  };

  // Get challenge by level number
  const getChallengeByLevel = (levelNumber) => {
    return challenges.find(c => c.levelNumber === levelNumber);
  };

  // Get completed levels
  const getCompletedLevels = () => {
    if (!progress || !progress.levelStatus) return [];
    
    return Object.entries(progress.levelStatus)
      .filter(([_, completed]) => completed)
      .map(([level]) => parseInt(level))
      .sort((a, b) => a - b);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${
            isDark ? 'border-indigo-400' : 'border-indigo-600'
          } mx-auto`}></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading user progress...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link
              to="/admin-dashboard"
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                isDark
                  ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className={`rounded-md p-4 ${
            isDark ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <FiXCircle className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-400'}`} />
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-800'}`}>Error</h3>
                <div className={`mt-2 text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedLevels = getCompletedLevels();
  const currentChallenge = getChallengeByLevel(progress?.currentLevel);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              to="/admin-dashboard"
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium mr-4 ${
                isDark
                  ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              User Progress Management
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
            <div className={`px-4 py-5 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b sm:px-6`}>
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`} id="user-info-title">
                User Information
              </h2>
            </div>
            <div className="p-6">
              {userDetails && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FiUser className={`mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Name</p>
                      <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{userDetails.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FiUser className={`mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Email</p>
                      <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{userDetails.email}</p>
                    </div>
                  </div>
                  
                  {userDetails.institution && (
                    <div className="flex items-center">
                      <FiUser className={`mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Institution</p>
                        <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{userDetails.institution}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <FiClock className={`mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Registration Date</p>
                      <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(userDetails.registrationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Information */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
            <div className={`px-4 py-5 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b sm:px-6`}>
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Progress Overview</h2>
            </div>
            <div className="p-6">
              {progress && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Current Level:</span>
                    <span className={`px-3 py-1 ${isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'} rounded-full text-sm font-medium`}>
                      Level {progress.currentLevel}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      progress.completed 
                        ? isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        : progress.timeRemaining <= 0
                          ? isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                          : isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {progress.completed 
                        ? 'Completed' 
                        : progress.timeRemaining <= 0
                          ? 'Time Expired'
                          : 'In Progress'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Completed Levels:</span>
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {completedLevels.length > 0 ? completedLevels.join(', ') : 'None'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Start Time:</span>
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(progress.startTime).toLocaleString()}
                    </span>
                  </div>
                  
                  {progress.completedAt && (
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Completed At:</span>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(progress.completedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {progress && !progress.completed && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Time Remaining:</span>
                    <span className={`text-sm font-mono ${
                      progress.timeRemaining < 300 
                        ? isDark ? 'text-red-400' : 'text-red-600'
                        : isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatTimeRemaining(progress.timeRemaining)}
                    </span>
                  </div>
                  
                  <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress.timeRemaining <= 0 ? 'bg-red-500' : 
                        progress.timeRemaining < 600 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (progress.timeRemaining / (progress.totalTimeLimit || 3600)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={resetProgress}
                  disabled={saving}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    resetConfirm 
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                      : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Resetting...
                    </div>
                  ) : (
                    <>
                      <FiRotateCcw className="mr-2" />
                      {resetConfirm ? 'Confirm Reset Progress' : 'Reset Progress'}
                    </>
                  )}
                </button>
                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                  This will reset the user's progress to level 1 and clear all completed levels.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Challenge Details */}
        {currentChallenge && (
          <div className={`mt-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
            <div className={`px-4 py-5 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b sm:px-6`}>
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Current Challenge - Level {currentChallenge.levelNumber}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentChallenge.title}
                  </h3>
                  <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentChallenge.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                      <FiHelpCircle className="inline mr-1" />
                      Hint
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                      {currentChallenge.hint}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                      <FiFlag className="inline mr-1" />
                      Correct Flag
                    </h4>
                    <p className={`text-sm font-mono ${isDark ? 'text-green-400' : 'text-green-600'} p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                      {currentChallenge.flag}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Level Progress Breakdown */}
        {challenges.length > 0 && (
          <div className={`mt-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
            <div className={`px-4 py-5 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b sm:px-6`}>
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Level Progress Breakdown</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenges
                  .sort((a, b) => a.levelNumber - b.levelNumber)
                  .map((challenge) => {
                    const isCompleted = completedLevels.includes(challenge.levelNumber);
                    const isCurrent = progress?.currentLevel === challenge.levelNumber;
                    const attemptCount = progress?.attemptCounts?.[challenge.levelNumber.toString()] || 0;
                    const hintUsed = progress?.hintsUsed?.[challenge.levelNumber.toString()] || false;
                    
                    return (
                      <div
                        key={challenge._id}
                        className={`p-4 rounded-lg border ${
                          isCurrent
                            ? isDark ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
                            : isCompleted
                              ? isDark ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50'
                              : isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Level {challenge.levelNumber}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {isCompleted && (
                              <FiCheckCircle className="text-green-500" />
                            )}
                            {isCurrent && (
                              <FiActivity className="text-indigo-500" />
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                          {challenge.title}
                        </p>
                        
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} space-y-1`}>
                          <p>Attempts: {attemptCount}</p>
                          <p>Hint used: {hintUsed ? 'Yes' : 'No'}</p>
                          <p>Status: {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Pending'}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProgressManager;