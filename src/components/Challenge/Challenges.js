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
      if (response.data.completed) {
        toast.success('Congratulations! You have completed all challenges!');
        history.push('/thank-you');
        return;
      }
      
      if (response.data.timeExpired) {
        toast.info('Time has expired!');
        history.push('/thank-you');
        return;
      }
      
      // Set challenge and progress
      setChallenge(response.data.challenge);
      setProgress(response.data.progress);
      setTimeLeft(response.data.challenge.timeRemaining);
      
      // Save to offline cache for use when offline
      setOfflineData(response.data);
      try {
        localStorage.setItem('offlineChallenge', JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Failed to cache challenge data offline', e);
      }
      
      // Set total time limit from the response
      if (response.data.challenge.totalTimeLimit) {
        setTotalTimeLimit(response.data.challenge.totalTimeLimit);
      } else if (response.data.progress.totalTimeLimit) {
        setTotalTimeLimit(response.data.progress.totalTimeLimit);
      }
      
      // If hint is already used, show it
      if (response.data.challenge.hintUsed) {
        setShowHint(true);
      }
    } catch (err) {
      console.error('Error fetching challenge:', err);
      
      // Check if we can use offline data
      if (!isOnline) {
        try {
          const cachedData = localStorage.getItem('offlineChallenge');
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            setOfflineData(parsed.data);
            setChallenge(parsed.data.challenge);
            setProgress(parsed.data.progress);
            setTimeLeft(parsed.data.challenge.timeRemaining);
            
            // Check if hint was used
            if (parsed.data.challenge.hintUsed) {
              setShowHint(true);
            }
            
            toast.info('You are offline. Using cached challenge data.');
          } else {
            setError('Unable to load challenge data while offline.');
            toast.error('Failed to load challenge in offline mode');
          }
        } catch (e) {
          console.error('Error loading cached challenge data', e);
          setError('Failed to load challenge. Please try again when online.');
        }
      } else {
        setError('Failed to load challenge. Please try again.');
        toast.error('Failed to load challenge');
      }
    } finally {
      setLoading(false);
    }
  }, [history, currentUser, isOnline]);

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

  // Handle flag submission
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
      
      const response = await api.post('/challenges/submit-flag', { flag: userFlag });
      
      if (response.data.correct) {
        // Correct flag
        if (response.data.completed) {
          toast.success('Congratulations! You have completed all challenges!');
          history.push('/thank-you');
        } else {
          toast.success('Correct flag! Moving to the next level.');
          setUserFlag('');
          setShowHint(false);
          fetchCurrentChallenge(); // Fetch the next challenge
        }
      } else {
        // Wrong flag
        toast.error('Incorrect flag. Try again!');
        
        // Suggest hint after a few attempts
        if (response.data.attempts >= 2 && !challenge.hintUsed) {
          toast.info('Having trouble? Consider using a hint!');
        }
      }
    } catch (err) {
      console.error('Error submitting flag:', err);
      toast.error('Failed to submit flag');
    } finally {
      setSubmitting(false);
    }
  };

  // Request hint
  const useHintForLevel = async () => {
    // Prevent using hint while offline
    if (!isOnline) {
      toast.warning('Cannot request hints while offline. Please reconnect to the internet.');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post('/challenges/request-hint');
      
      setShowHint(true);
      toast.info('Hint revealed!');
      
      // Update challenge with hint
      setChallenge(prev => ({
        ...prev,
        hint: response.data.hint,
        hintUsed: true
      }));
      
      // Update offline data with hint
      if (offlineData) {
        const updatedOfflineData = {
          ...offlineData,
          challenge: {
            ...offlineData.challenge,
            hint: response.data.hint,
            hintUsed: true
          }
        };
        setOfflineData(updatedOfflineData);
        
        // Update offline cache
        try {
          localStorage.setItem('offlineChallenge', JSON.stringify({
            data: updatedOfflineData,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.error('Failed to update cached challenge data', e);
        }
      }
    } catch (err) {
      console.error('Error requesting hint:', err);
      toast.error('Failed to get hint');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    history.push('/login');
    toast.success('Logged out successfully');
  };

  // Calculate time progress percentage
  const calculateTimeProgress = () => {
    if (totalTimeLimit === 0) return 0;
    return (timeLeft / totalTimeLimit) * 100;
  };

  // Offline banner component
  const OfflineBanner = () => (
    <div className={`${
      isDark ? 'bg-red-900/30 border-red-800/30' : 'bg-red-500/10 border-red-500/20'
    } border p-4 mb-6 rounded-lg`}>
      <div className="flex items-center">
        <FiWifiOff className={`${isDark ? 'text-red-400' : 'text-red-400'} mr-2`} size={20} />
        <div>
          <h3 className={`text-lg font-medium ${isDark ? 'text-red-400' : 'text-red-500'}`}>You're Offline</h3>
          <p className={`${isDark ? 'text-red-300' : 'text-red-400'} text-sm`}>
            You can continue with the current challenge, but you won't be able to submit flags or request hints until you're back online.
          </p>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading && !challenge) {
    return (
      <div className={`min-h-screen ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-violet-900' 
          : 'bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900'
      } flex justify-center items-center`}>
        <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Authentication check - redirect to login if no user
  if (!currentUser) {
    return null; // Return null while redirecting to avoid flash of content
  }

  // Time expired state
  if (timeLeft <= 0) {
    return (
      <div className={`min-h-screen ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-violet-900' 
          : 'bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900'
      } flex justify-center items-center`}>
        <div className={`backdrop-blur-lg ${
          isDark 
            ? 'bg-gray-800/40 border-gray-700/30' 
            : 'bg-violet-50/10 border-violet-200/20'
        } rounded-2xl shadow-2xl p-8 border text-center`}>
          <h2 className="text-3xl font-bold text-violet-50 mb-4">Time's Up!</h2>
          <p className="text-violet-200 mb-6">Your challenge session has ended.</p>
          <button
            onClick={() => history.push('/thank-you')}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white rounded-lg transition shadow-lg"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-violet-900' 
        : 'bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900'
    } py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute transform -rotate-45 bg-violet-50 w-96 h-96 rounded-full -top-20 -left-20" />
        <div className="absolute transform rotate-45 bg-violet-50 w-96 h-96 rounded-full -bottom-20 -right-20" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src="/biztras.png"
              alt="CTF Logo"
              className="mx-auto h-24 w-auto mb-6 drop-shadow-xl rounded-2xl"
            />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-400 to-violet-600 opacity-50 blur rounded-2xl" />
          </div>
          
          <h2 className="text-4xl font-bold text-violet-50 mb-2 tracking-tight">
            BizTras Challenge
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-violet-400 to-violet-600 mx-auto mb-4" />
          {challenge && (
            <p className="text-lg text-violet-200">Level {challenge.levelNumber}: {challenge.title}</p>
          )}
        </div>

        {/* Show offline banner when not online */}
        {!isOnline && <OfflineBanner />}

        {/* Timer and Logout Bar */}
        <div className={`backdrop-blur-lg ${
          isDark 
            ? 'bg-gray-800/40 border-gray-700/30' 
            : 'bg-violet-50/10 border-violet-200/20'
        } rounded-lg shadow-lg p-4 mb-6 border`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiClock className="text-violet-200 mr-2" size={24} />
              <div className="flex flex-col">
                <span className="text-lg font-mono text-violet-100">
                  Time Remaining: {' '}
                  <span className={timeLeft < 300 ? "text-red-300 font-bold" : "text-violet-50 font-bold"}>
                    {formatTimeRemaining(timeLeft)}
                  </span>
                </span>
                <span className="text-xs text-violet-300">
                  Total Time: {formatTimeDetailed(totalTimeLimit)}
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg transition flex items-center"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
          
          {/* Progress bar for time */}
          <div className={`mt-2 h-2 ${isDark ? 'bg-gray-700/50' : 'bg-violet-800/50'} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${timeLeft < 300 ? 'bg-red-500' : timeLeft < 600 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${calculateTimeProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Challenge Container */}
        <div className={`backdrop-blur-lg ${
          isDark 
            ? 'bg-gray-800/40 border-gray-700/30' 
            : 'bg-violet-50/10 border-violet-200/20'
        } rounded-2xl shadow-2xl border overflow-hidden relative`}>
          {/* Progress Bar */}
          <div className={`border-b ${isDark ? 'border-gray-700/50' : 'border-violet-300/20'}`}>
            <div className="flex">
              {progress.completedLevels && progress.completedLevels.map(level => (
                <div 
                  key={level}
                  className={`flex-1 text-center py-3 ${
                    isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-500/20 text-green-200'
                  }`}
                >
                  <FiCheckCircle className="inline mr-1" />
                  Level {level}
                </div>
              ))}
              <div
              className={`flex-1 text-center py-3 ${
                isDark ? 'bg-violet-900/30 text-violet-200' : 'bg-violet-600/30 text-violet-50'
              }`}
              >
                <FiUnlock className="inline mr-1" />
                Level {challenge?.levelNumber}
              </div>
              
              {/* Future levels are locked */}
              {Array.from({ length: Math.max(0, challenge?.totalLevels - challenge?.levelNumber || 0) }).map((_, idx) => {
                const futureLevel = (challenge?.levelNumber || 0) + idx + 1;
                if (!progress.completedLevels?.includes?.(futureLevel)) {
                  return (
                    <div 
                      key={futureLevel}
                      className={`flex-1 text-center py-3 ${
                        isDark ? 'bg-gray-900/30 text-gray-500' : 'bg-violet-900/30 text-violet-300/50'
                      }`}
                    >
                      <FiLock className="inline mr-1" />
                      Level {futureLevel}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          <div className="p-8">
            {/* Challenge Description */}
            <p className="text-violet-100 mb-6 leading-relaxed">
              {challenge?.description}
            </p>

            {/* Hint Box */}
            {showHint && challenge?.hint && (
              <div className={`${
                isDark ? 'bg-yellow-900/10 border-yellow-800/50' : 'bg-yellow-500/10 border-yellow-500/50'
              } border-l-4 p-4 mb-6 rounded-r text-yellow-100`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiHelpCircle className="h-5 w-5 text-yellow-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      <strong>Hint:</strong> {challenge.hint}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Flag Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-violet-100 font-medium mb-2">Enter Flag:</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFlag className="h-5 w-5 text-violet-300" />
                  </div>
                  <input
                    type="text"
                    value={userFlag}
                    onChange={(e) => setUserFlag(e.target.value)}
                    className={`w-full pl-10 pr-3 py-3 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50' 
                        : 'bg-violet-50/5 border-violet-200/20'
                    } border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-white placeholder-violet-300`}
                    placeholder="Enter the flag for this level..."
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={submitting || !isOnline}
                  className="flex-grow py-3 px-6 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white rounded-lg transition shadow-lg disabled:opacity-50 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-violet-50/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative flex items-center justify-center">
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-b-2 border-violet-50 rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : !isOnline ? (
                      <>
                        <FiWifiOff className="mr-2" />
                        Submit (Offline)
                      </>
                    ) : (
                      <>
                        Submit Flag
                      </>
                    )}
                  </span>
                </button>
                
                {!challenge?.hintUsed && (
                  <button
                    type="button"
                    onClick={useHintForLevel}
                    disabled={loading || !isOnline}
                    className={`flex-grow flex items-center justify-center px-6 py-3 ${
                      isDark
                        ? 'bg-gray-700/50 border-gray-600/50 text-violet-300 hover:bg-gray-700/70'
                        : 'bg-violet-50/10 border-violet-400/20 text-violet-200 hover:bg-violet-50/20'
                    } border rounded-lg transition shadow-sm disabled:opacity-50`}
                  >
                    <FiHelpCircle className="mr-2" />
                    {!isOnline ? 'Hint (Offline)' : 'Use Hint'}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 text-sm text-violet-300 text-right">
              Attempts for this level: {challenge?.attemptCount || 0}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Offline Sync Status */}
        {!isOnline && localStorage.getItem('offlineQueue') && (
          <div className={`mt-6 ${
            isDark ? 'bg-violet-900/10 border-violet-800/30' : 'bg-violet-500/10 border-violet-500'
          } border-l-4 p-4 rounded-r`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <FiClock className="h-5 w-5 text-violet-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-violet-300">
                  You have pending actions that will sync when you're back online.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Decorative bottom element */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
      </div>
    </div>
  );
};

export default Challenges;