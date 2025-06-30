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
      
      // Set challenge data
      if (response.challenge) {
        setChallenge(response.challenge);
        
        // Update time remaining from challenge data
        const challengeTimeRemaining = response.challenge.timeRemaining || 3600;
        setTimeLeft(challengeTimeRemaining);
        
        // Update hint state if hint was previously used
        if (response.challenge.hintUsed) {
          setShowHint(true);
        }
      }
      
      // Fetch user progress
      const progressResponse = await api.get('/progress/me');
      if (progressResponse.progress) {
        setProgress({
          currentLevel: progressResponse.progress.currentLevel || 1,
          completedLevels: progressResponse.progress.completedLevels || [],
          timeRemaining: progressResponse.progress.timeRemaining || 3600,
          totalTimeLimit: progressResponse.progress.totalTimeLimit || 3600
        });
        
        // Update time limits
        setTimeLeft(progressResponse.progress.timeRemaining || 3600);
        setTotalTimeLimit(progressResponse.progress.totalTimeLimit || 3600);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        history.push('/login');
      } else {
        setError('Failed to load challenge. Please try again.');
        toast.error('Failed to load challenge');
      }
      
      setLoading(false);
    }
  }, [currentUser, history, logout]);

  // Fetch progress separately
  const fetchProgress = useCallback(async () => {
    try {
      const response = await api.get('/progress/me');
      if (response.progress) {
        setProgress({
          currentLevel: response.progress.currentLevel || 1,
          completedLevels: response.progress.completedLevels || [],
          timeRemaining: response.progress.timeRemaining || 3600,
          totalTimeLimit: response.progress.totalTimeLimit || 3600
        });
        
        // Update time limits
        setTimeLeft(response.progress.timeRemaining || 3600);
        setTotalTimeLimit(response.progress.totalTimeLimit || 3600);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0 && !loading && challenge) {
      const interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = Math.max(0, prevTime - 1);
          
          // If time runs out, handle expiration
          if (newTime === 0) {
            toast.warning('Time has expired!');
            history.push('/thank-you');
          }
          
          return newTime;
        });
      }, 1000);
      
      setIntervalId(interval);
      
      return () => clearInterval(interval);
    }
  }, [timeLeft, loading, challenge, history]);

  // Initial load effect
  useEffect(() => {
    if (currentUser) {
      fetchCurrentChallenge();
    } else {
      history.push('/login');
    }
  }, [currentUser, fetchCurrentChallenge, history]);

  // Handle flag submission
  const handleSubmitFlag = async (e) => {
    e.preventDefault();
    
    if (!userFlag.trim()) {
      toast.error('Please enter a flag');
      return;
    }
    
    if (!isOnline) {
      toast.error('You must be online to submit flags');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await api.post('/challenges/submit', { flag: userFlag });
      
      if (response.correct) {
        toast.success(response.message || 'Correct! Moving to next level.');
        setUserFlag('');
        setShowHint(false);
        
        if (response.completed) {
          // All challenges completed
          history.push('/thank-you');
        } else {
          // Refresh to get next challenge
          await fetchCurrentChallenge();
          await fetchProgress();
        }
      } else {
        toast.error(response.message || 'Incorrect flag. Try again!');
        setUserFlag('');
      }
    } catch (error) {
      console.error('Error submitting flag:', error);
      toast.error('Failed to submit flag. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle hint request
  const handleGetHint = async () => {
    if (!challenge?.hint) {
      toast.info('No hint available for this challenge');
      return;
    }
    
    if (!isOnline) {
      toast.error('You must be online to get hints');
      return;
    }
    
    try {
      const response = await api.get('/challenges/hint');
      if (response.hint) {
        setShowHint(true);
        toast.info('Hint unlocked!');
        
        // Update the local challenge state to reflect hint was used
        setChallenge(prev => ({
          ...prev,
          hintUsed: true,
          hint: response.hint
        }));
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      toast.error('Failed to get hint');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  // Calculate time progress percentage
  const calculateTimeProgress = () => {
    if (!totalTimeLimit || totalTimeLimit === 0) return 0;
    return (timeLeft / totalTimeLimit) * 100;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading challenge...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchCurrentChallenge}
            className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No challenge state
  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">No challenge available</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-violet-100 via-purple-200 to-violet-300'
    } p-4`}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            CTF Challenge
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Online Status Indicator */}
            {!isOnline && (
              <div className="flex items-center gap-2 text-yellow-400">
                <FiWifiOff />
                <span className="text-sm">Offline Mode</span>
              </div>
            )}
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isDark 
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
        
        {/* Timer */}
        <div className="mt-4">
          <div className="flex items-center gap-2 text-white mb-2">
            <FiClock className={timeLeft < 300 ? 'text-red-400 animate-pulse' : ''} />
            <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-400' : ''}`}>
              {formatTimeRemaining(timeLeft)}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ({formatTimeDetailed(timeLeft)})
            </span>
          </div>
          
          {/* Time Progress Bar */}
          <div className={`h-2 ${isDark ? 'bg-gray-700/50' : 'bg-violet-800/50'} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${timeLeft < 300 ? 'bg-red-500' : timeLeft < 600 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${calculateTimeProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Challenge Container */}
        <div className={`mt-8 backdrop-blur-lg ${
          isDark 
            ? 'bg-gray-800/40 border-gray-700/30' 
            : 'bg-violet-50/10 border-violet-200/20'
        } rounded-2xl shadow-2xl border overflow-hidden relative`}>
          {/* Progress Bar */}
          <div className={`border-b ${isDark ? 'border-gray-700/50' : 'border-violet-300/20'}`}>
            <div className="flex">
              {/* Completed levels */}
              {progress.completedLevels && Array.isArray(progress.completedLevels) && progress.completedLevels.map(level => (
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
              
              {/* Current level */}
              <div
                className={`flex-1 text-center py-3 ${
                  isDark ? 'bg-violet-900/30 text-violet-200' : 'bg-violet-600/30 text-violet-50'
                }`}
              >
                <FiUnlock className="inline mr-1" />
                Level {challenge?.levelNumber || progress.currentLevel}
              </div>
              
              {/* Future levels are locked */}
              {challenge?.totalLevels && Array.from({ 
                length: Math.max(0, challenge.totalLevels - (challenge?.levelNumber || progress.currentLevel)) 
              }).map((_, idx) => {
                const futureLevel = (challenge?.levelNumber || progress.currentLevel) + idx + 1;
                if (!progress.completedLevels?.includes(futureLevel)) {
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
            {/* Challenge Title */}
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {challenge?.title}
            </h2>
            
            {/* Challenge Description */}
            <p className={`${isDark ? 'text-violet-100' : 'text-gray-700'} mb-6 leading-relaxed`}>
              {challenge?.description}
            </p>

            {/* Hint Box */}
            {(showHint || challenge?.hintUsed) && challenge?.hint && (
              <div className={`${
                isDark 
                  ? 'bg-yellow-900/20 border-yellow-700/30 text-yellow-200' 
                  : 'bg-yellow-100 border-yellow-300 text-yellow-800'
              } border rounded-lg p-4 mb-6`}>
                <div className="flex items-start gap-2">
                  <FiHelpCircle className="mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Hint:</div>
                    <div>{challenge.hint}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Flag Submission Form */}
            <form onSubmit={handleSubmitFlag} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-violet-200' : 'text-gray-700'
                }`}>
                  Enter Flag:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userFlag}
                    onChange={(e) => setUserFlag(e.target.value)}
                    placeholder="CTF{...}"
                    disabled={submitting || !isOnline}
                    className={`flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                      isDark 
                        ? 'bg-gray-700/50 text-white placeholder-gray-400 focus:ring-violet-500' 
                        : 'bg-white/80 text-gray-800 placeholder-gray-500 focus:ring-violet-400'
                    } ${(!isOnline || submitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !isOnline}
                    className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      isDark 
                        ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                        : 'bg-violet-500 hover:bg-violet-600 text-white'
                    } ${(!isOnline || submitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <FiFlag />
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>

              {/* Hint Button */}
              {!showHint && !challenge?.hintUsed && challenge?.hint && (
                <button
                  type="button"
                  onClick={handleGetHint}
                  disabled={!isOnline}
                  className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isDark 
                      ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-600/30' 
                      : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300'
                  } ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiHelpCircle />
                  Get Hint
                </button>
              )}
            </form>

            {/* Attempt Count */}
            {challenge?.attemptCount > 0 && (
              <div className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Attempts: {challenge.attemptCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;