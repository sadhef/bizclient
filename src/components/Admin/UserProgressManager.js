import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiArrowLeft, 
  FiUser, 
  FiClock, 
  FiFlag, 
  FiRefreshCw, 
  FiCheckCircle,
  FiLock,
  FiHelpCircle,
  FiSave,
  FiRotateCcw
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { formatTimeRemaining, formatTimeDetailed } from '../../utils/timer';

const UserProgressManager = () => {
  const { userId } = useParams();
  const history = useHistory();
  const { currentUser, isAdmin } = useAuth();

  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  
  // Time setting form
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [showTimeForm, setShowTimeForm] = useState(false);
  
  // Format time for the form
  const setupTimeForm = useCallback((seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    setHours(h);
    setMinutes(m);
  }, []);

  // Fetch user progress
  const fetchUserProgress = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Get user data
      const userResponse = await api.get(`/users/${userId}`);
      setUser(userResponse.user);
      
      // Get progress data
      const progressResponse = await api.get(`/progress/${userId}`);
      setProgress(progressResponse.progress);
      
      // Setup time form with current values
      if (progressResponse.progress.totalTimeLimit) {
        setupTimeForm(progressResponse.progress.totalTimeLimit);
      }
      
      if (showToast) {
        toast.success('Data refreshed successfully');
      }
    } catch (err) {
      console.error('Error fetching user progress:', err);
      setError('Failed to load user progress. Please try again.');
      toast.error('Failed to load user progress');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, setupTimeForm]);

  // Parse time inputs to seconds
  const getTimeInSeconds = () => {
    return (parseInt(hours) * 3600) + (parseInt(minutes) * 60);
  };

  // Load data on mount
  useEffect(() => {
    // Redirect if not logged in as admin
    if (!currentUser || !isAdmin) {
      toast.error('Admin access required');
      history.push('/admin-login');
      return;
    }
    
    fetchUserProgress();
  }, [currentUser, isAdmin, fetchUserProgress, history]);

  // Handle time limit update
  const updateTimeLimit = async () => {
    try {
      setSaving(true);
      
      const totalSeconds = getTimeInSeconds();
      
      if (totalSeconds < 300) { // Minimum 5 minutes
        toast.error('Time limit must be at least 5 minutes');
        return;
      }
      
      await api.patch(`/progress/${userId}`, {
        totalTimeLimit: totalSeconds,
      });
      
      toast.success('Time limit updated successfully');
      setShowTimeForm(false);
      fetchUserProgress();
    } catch (err) {
      console.error('Error updating time limit:', err);
      toast.error('Failed to update time limit');
    } finally {
      setSaving(false);
    }
  };

  // Handle progress reset
  const resetProgress = async () => {
    try {
      if (!resetConfirm) {
        setResetConfirm(true);
        setTimeout(() => setResetConfirm(false), 3000);
        return;
      }
      
      setSaving(true);
      
      await api.patch(`/progress/${userId}`, {
        resetProgress: true
      });
      
      toast.success('Progress reset successfully');
      setResetConfirm(false);
      fetchUserProgress();
    } catch (err) {
      console.error('Error resetting progress:', err);
      toast.error('Failed to reset progress');
    } finally {
      setSaving(false);
    }
  };

  // Handle going back
  const handleBack = () => {
    history.push('/admin-dashboard');
  };

  // Loading state
  if (loading && !progress) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900 ml-6">
              User Progress Management
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fetchUserProgress(true)}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {user && progress && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">User Information</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FiUser className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-500">Institution</p>
                    <p className="mt-1 text-sm text-gray-900">{user.institution || 'Not specified'}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-500">Registration Date</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(user.registrationTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Management */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Time Management</h2>
                  <button
                    onClick={() => setShowTimeForm(!showTimeForm)}
                    className="inline-flex items-center px-3 py-1 border border-indigo-500 text-indigo-600 rounded-md text-sm hover:bg-indigo-50"
                  >
                    <FiClock className="mr-1" />
                    {showTimeForm ? 'Cancel' : 'Adjust Time'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                {showTimeForm ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Adjust the total time limit for this user. Current remaining time will be adjusted proportionally.
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <div>
                        <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                        <input
                          type="number"
                          id="hours"
                          min="0"
                          max="24"
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
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
                          value={minutes}
                          onChange={(e) => setMinutes(e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={updateTimeLimit}
                      disabled={saving}
                      className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <FiSave className="mr-2" />
                          Save New Time Limit
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Time Remaining:</span>
                      <span className={`text-lg font-mono ${
                        progress.timeRemaining < 300 ? 'text-red-600 font-bold' : 'text-gray-900'
                      }`}>
                        {formatTimeRemaining(progress.timeRemaining)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Total Time Limit:</span>
                      <span className="text-lg font-mono text-gray-900">
                        {formatTimeDetailed(progress.totalTimeLimit || 3600)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Start Time:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(progress.startTime).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(progress.lastUpdated).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-full rounded-full ${
                          progress.timeRemaining < 300 ? 'bg-red-500' : 
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
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    This will reset the user's progress to level 1 and clear all completed levels.
                  </p>
                </div>
              </div>
            </div>

            {/* Challenge Progress */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Challenge Progress</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">Current Level:</span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    Level {progress.currentLevel}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Completed Levels</h3>
                  <div className="grid grid-cols-6 gap-2">
                    {progress.completedLevels?.length > 0 ? (
                      progress.completedLevels.map(level => (
                        <span 
                          key={level} 
                          className="flex items-center justify-center p-2 bg-green-100 text-green-800 rounded text-sm"
                        >
                          <FiCheckCircle className="mr-1" />
                          {level}
                        </span>
                      ))
                    ) : (
                      <span className="col-span-6 text-sm text-gray-500">No levels completed yet</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Hints Used</h3>
                  <div className="grid grid-cols-6 gap-2">
                    {progress.levelHints && Object.entries(progress.levelHints).length > 0 ? (
                      Object.entries(progress.levelHints)
                        .filter(([_, used]) => used)
                        .map(([level]) => (
                          <span 
                            key={level} 
                            className="flex items-center justify-center p-2 bg-yellow-100 text-yellow-800 rounded text-sm"
                          >
                            <FiHelpCircle className="mr-1" />
                            {level}
                          </span>
                        ))
                    ) : (
                      <span className="col-span-6 text-sm text-gray-500">No hints used yet</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Flagging Attempts</h3>
                  {progress.levelAttempts && Object.entries(progress.levelAttempts).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(progress.levelAttempts).map(([level, data]) => (
                        <div key={level} className="border border-gray-200 rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Level {level}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                              {data.attempts} attempt{data.attempts !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {data.flags && data.flags.length > 0 && (
                            <div className="text-xs font-mono text-gray-500 max-h-24 overflow-y-auto">
                              {data.flags.map((flag, idx) => (
                                <div key={idx} className="flex items-center py-1 border-t border-gray-100">
                                  <FiFlag className="mr-1 text-gray-400" size={12} />
                                  <span>{flag}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No flag attempts recorded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProgressManager;