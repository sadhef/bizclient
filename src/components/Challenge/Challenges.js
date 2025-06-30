import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiLock, FiUnlock, FiHelpCircle, FiFlag, FiLogOut, FiWifiOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { formatTimeRemaining, formatTimeDetailed } from '../../utils/timer';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import { useTheme } from '../../context/ThemeContext';

const Challenges = () => {
  const [challenge, setChallenge] = useState(null);
  const [userFlag, setUserFlag] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [totalTimeLimit, setTotalTimeLimit] = useState(3600);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    currentLevel: 1,
    completedLevels: [],
    timeRemaining: 3600,
    totalTimeLimit: 3600
  });
  const [error, setError] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [offlineData, setOfflineData] = useState(null);

  const history = useHistory();
  const { currentUser, logout } = useAuth();
  const isOnline = useOnlineStatus();
  const { isDark } = useTheme();

  // Fetch current challenge
  const fetchCurrentChallenge = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Critical check - if no user is logged in, redirect to login page
      if (!currentUser) {
        history.push('/login');
        return;
      }
      
      const response = await api.get('/challenges/current');
      
      // Check if completed or time expired
      if (response.completed) {
        toast.success('Congratulations! You have completed all challenges!');
        history.push('/thank-you');
        return;
      }
      
      if (response.timeExpired) {
        toast.info('Time has expired!');
        history.push('/thank-you');
        return;
      }

      // Check if no challenges are available
      if (response.noChallenges) {
        setError('No challenges available yet. Please contact administrator.');
        setLoading(false);
        return;
      }
      
      if (response.challenge) {
        console.log('📊 Received challenge data:', response.challenge);
        
        setChallenge(response.challenge);
        setTimeLeft(response.challenge.timeRemaining || 3600);
        setTotalTimeLimit(response.challenge.totalTimeLimit || response.challenge.timeRemaining || 3600);
        setShowHint(response.challenge.hintUsed || false);
        
        // Update progress state with safe defaults
        setProgress(prev => ({
          ...prev,
          currentLevel: response.challenge.levelNumber || 1,
          timeRemaining: response.challenge.timeRemaining || 3600,
          totalTimeLimit: response.challenge.totalTimeLimit || response.challenge.timeRemaining || 3600,
          completedLevels: prev.completedLevels || [] // Ensure completedLevels is always an array
        }));
        
        console.log('🎯 Challenge loaded with attempts:', response.challenge.attemptCount);
      }
    } catch (err) {
      console.error('Error fetching challenge:', err);
      setError('Failed to load challenge. Please try again.');
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        history.push('/login');
      } else if (err.response?.status === 403) {
        toast.error('Access denied. You need user access to view challenges.');
        history.push('/login');
      } else {
        toast.error('Failed to load challenge');
      }
    } finally {
      setLoading(false);
    }
  }, [history, currentUser, logout]);

  // Initialize timer
  const initializeTimer = useCallback(() => {
    // Clear existing timer if any
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Set up new timer
    const newIntervalId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(newIntervalId);
          toast.info("Time's up!");
          history.push('/thank-you');
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    setIntervalId(newIntervalId);
    
    return () => clearInterval(newIntervalId);
  }, [intervalId, history]);

  // Check authentication and load challenge on mount
  useEffect(() => {
    // Immediate redirect if not logged in
    if (!currentUser) {
      toast.error('Please login first');
      history.push('/login');
      return;
    }
    
    fetchCurrentChallenge();
    
    // Clean up timer on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentUser, fetchCurrentChallenge, history, intervalId]);

  // Initialize timer when challenge is loaded
  useEffect(() => {
    if (challenge && timeLeft > 0 && !intervalId) {
      initializeTimer();
    }
  }, [challenge, timeLeft, initializeTimer, intervalId]);

  // FIXED: Handle flag submission with proper attempt count update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (timeLeft <= 0) {
      toast.error("Time's up! You can't submit answers anymore.");
      return;
    }
    
    // Prevent submission while offline
    if (!isOnline) {
      toast.warning('Cannot submit flags while offline. Please reconnect to the internet.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      console.log('🚩 Submitting flag:', userFlag);
      
      const response = await api.post('/challenges/submit', { flag: userFlag });
      
      console.log('📊 Flag submission response:', response);
      
      if (response.correct) {
        // Correct flag
        if (response.completed) {
          toast.success('Congratulations! You have completed all challenges!');
          history.push('/thank-you');
        } else {
          toast.success('Correct flag! Moving to the next level.');
          setUserFlag('');
          setShowHint(false);
          
          // Update the challenge with new attempt count
          setChallenge(prev => ({
            ...prev,
            attemptCount: response.attempts || ((prev?.attemptCount || 0) + 1)
          }));
          
          // Fetch the next challenge
          setTimeout(() => {
            fetchCurrentChallenge();
          }, 1000);
        }
      } else {
        // Wrong flag - update attempt count immediately
        toast.error('Incorrect flag. Try again!');
        
        // FIXED: Update attempt count in real-time
        setChallenge(prev => ({
          ...prev,
          attemptCount: response.attempts || ((prev?.attemptCount || 0) + 1)
        }));
        
        console.log('❌ Updated attempt count to:', response.attempts);
        
        // Suggest hint after a few attempts
        if (response.attempts >= 3 && !challenge?.hintUsed) {
          toast.info('Having trouble? Consider using a hint!');
        }
      }
    } catch (err) {
      console.error('Error submitting flag:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        history.push('/login');
      } else {
        toast.error('Failed to submit flag. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle hint request
  const handleGetHint = async () => {
    try {
      const response = await api.get('/challenges/hint');
      
      if (response.hint) {
        setShowHint(true);
        setChallenge(prev => ({
          ...prev,
          hint: response.hint,
          hintUsed: true
        }));
        toast.success('Hint revealed!');
      }
    } catch (err) {
      console.error('Error getting hint:', err);
      toast.error('Failed to get hint. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    logout();
    toast.success('Logged out successfully');
    history.push('/login');
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading challenge...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <FiWifiOff className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Unable to Load Challenge
          </h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={fetchCurrentChallenge}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No challenge state
  if (!challenge) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <FiFlag className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No Challenge Available
          </h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            No challenges are currently available. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Challenge Platform
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Level {challenge.levelNumber || 1} - {challenge.title || 'Loading...'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-red-50'
            } rounded-md transition-colors`}
          >
            <FiLogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <FiWifiOff className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  You're currently offline
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  You can view the challenge but cannot submit flags until you're back online.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Challenge Area */}
          <div className="lg:col-span-2">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
              {/* Challenge Header */}
              <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {challenge.title}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <FiClock className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${
                      timeLeft <= 300 ? 'text-red-600' : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {formatTimeRemaining(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Challenge Content */}
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {challenge.description}
                  </p>
                </div>

                {/* Hint Section */}
                {showHint && challenge.hint && (
                  <div className={`mt-6 p-4 ${isDark ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg`}>
                    <div className="flex items-start">
                      <FiHelpCircle className={`h-5 w-5 mt-0.5 mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div>
                        <h4 className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>
                          Hint
                        </h4>
                        <p className={`mt-1 text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                          {challenge.hint}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Flag Submission Form */}
                <form onSubmit={handleSubmit} className="mt-8">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label htmlFor="flag" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Submit your flag
                      </label>
                      <input
                        type="text"
                        id="flag"
                        value={userFlag}
                        onChange={(e) => setUserFlag(e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="Enter your flag here..."
                        disabled={timeLeft <= 0 || !isOnline}
                        required
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <button
                        type="submit"
                        disabled={submitting || timeLeft <= 0 || !isOnline || !userFlag.trim()}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Hint Button */}
                {!showHint && !challenge.hintUsed && (
                  <div className="mt-4">
                    <button
                      onClick={handleGetHint}
                      className={`flex items-center px-4 py-2 text-sm font-medium ${
                        isDark 
                          ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-700' 
                          : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                      } rounded-md transition-colors`}
                    >
                      <FiHelpCircle className="mr-2 h-4 w-4" />
                      Need a hint?
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                Your Progress
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Current Level</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {progress?.currentLevel || 1}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Completed Levels</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {progress?.completedLevels?.length || 0}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Time Remaining</span>
                    <span className={`font-medium ${
                      timeLeft <= 300 ? 'text-red-600' : isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatTimeDetailed(timeLeft)}
                    </span>
                  </div>
                  <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        timeLeft <= 300 ? 'bg-red-600' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.max(0, (timeLeft / totalTimeLimit) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* FIXED: Display attempt count from challenge data */}
                {challenge && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Attempts</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {challenge.attemptCount || 0}
                      </span>
                    </div>
                    {challenge.attemptCount > 0 && (
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {challenge.attemptCount === 1 ? '1 attempt made' : `${challenge.attemptCount} attempts made`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status Card */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                Challenge Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  {challenge?.hintUsed ? (
                    <FiUnlock className="h-5 w-5 text-yellow-600 mr-3" />
                  ) : (
                    <FiLock className="h-5 w-5 text-gray-400 mr-3" />
                  )}
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Hint {challenge?.hintUsed ? 'Used' : 'Available'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <FiClock className={`h-5 w-5 mr-3 ${
                    timeLeft > 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {timeLeft > 0 ? 'Time Active' : 'Time Expired'}
                  </span>
                </div>

                {/* FIXED: Show attempt status with proper styling */}
                <div className="flex items-center">
                  <FiFlag className={`h-5 w-5 mr-3 ${
                    challenge?.attemptCount > 0 ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {challenge?.attemptCount > 0 
                      ? `${challenge.attemptCount} Attempt${challenge.attemptCount !== 1 ? 's' : ''} Made`
                      : 'No Attempts Yet'
                    }
                  </span>
                </div>

                {/* Show attempt feedback */}
                {challenge?.attemptCount >= 3 && !challenge?.hintUsed && (
                  <div className={`mt-3 p-2 rounded ${isDark ? 'bg-yellow-900 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
                    <p className={`text-xs ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      💡 Having trouble? Consider using the hint!
                    </p>
                  </div>
                )}

                {challenge?.attemptCount >= 5 && (
                  <div className={`mt-3 p-2 rounded ${isDark ? 'bg-orange-900 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
                    <p className={`text-xs ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                      🤔 Take a break and think differently about the challenge.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Card */}
            {challenge?.attemptCount > 0 && (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Performance
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Efficiency
                    </span>
                    <div className="flex items-center">
                      <div className={`w-16 h-2 rounded-full mr-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-2 rounded-full ${
                            challenge.attemptCount <= 2 ? 'bg-green-500' :
                            challenge.attemptCount <= 5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.max(20, Math.min(100, 100 - (challenge.attemptCount - 1) * 15))}%` 
                          }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        challenge.attemptCount <= 2 ? 'text-green-600' :
                        challenge.attemptCount <= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {challenge.attemptCount <= 2 ? 'Excellent' :
                         challenge.attemptCount <= 5 ? 'Good' : 'Keep Trying'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      Level Progress
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Level {challenge.levelNumber}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;