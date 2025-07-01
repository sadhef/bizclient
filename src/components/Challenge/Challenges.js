import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiClock, FiFlag, FiHelpCircle, FiLogOut, FiTrophy, FiCheckCircle, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { formatTimeRemaining } from '../../utils/timer';
import { useTheme } from '../../context/ThemeContext';

const ChallengeComponent = () => {
  const [challenge, setChallenge] = useState(null);
  const [userFlag, setUserFlag] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({
    currentLevel: 1,
    completedLevels: [],
    timeRemaining: 0,
    totalTimeLimit: 3600,
    finalScore: 0
  });
  const [intervalId, setIntervalId] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);

  const history = useHistory();
  const { currentUser, logout } = useAuth();
  const { isDark } = useTheme();

  // Fetch current challenge
  const fetchCurrentChallenge = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!currentUser || currentUser.status !== 'approved') {
        toast.error('Access denied. Please wait for admin approval.');
        logout();
        return;
      }
      
      const response = await api.get('/challenges/current');
      
      if (response.data.timeExpired) {
        toast.info('Time has expired! Redirecting to results...');
        history.push('/thank-you');
        return;
      }
      
      if (response.data.completed) {
        toast.success('Congratulations! All challenges completed!');
        history.push('/thank-you');
        return;
      }
      
      const { challenge: challengeData, progress: progressData } = response.data;
      
      setChallenge(challengeData);
      setProgress(progressData);
      setTimeLeft(challengeData.timeRemaining);
      
      // Show hint if already used
      if (challengeData.hintUsed && challengeData.hint) {
        setShowHint(true);
      }
      
    } catch (err) {
      console.error('Error fetching challenge:', err);
      if (err.response?.status === 403) {
        toast.error('Access denied. Please wait for admin approval.');
        logout();
      } else {
        toast.error('Failed to load challenge');
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, history, logout]);

  // Initialize timer
  const initializeTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    const newIntervalId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(newIntervalId);
          toast.info("Time's up! Redirecting to results...");
          history.push('/thank-you');
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    setIntervalId(newIntervalId);
  }, [intervalId, history]);

  // Load challenge on mount
  useEffect(() => {
    if (!currentUser) {
      toast.error('Please login first');
      history.push('/login');
      return;
    }
    
    fetchCurrentChallenge();
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentUser, fetchCurrentChallenge, history, intervalId]);

  // Start timer when challenge loads
  useEffect(() => {
    if (challenge && timeLeft > 0 && !intervalId) {
      initializeTimer();
    }
  }, [challenge, timeLeft, initializeTimer, intervalId]);

  // Handle flag submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userFlag.trim()) {
      toast.error('Please enter a flag');
      return;
    }
    
    if (timeLeft <= 0) {
      toast.error("Time's up! You can't submit anymore.");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await api.post('/challenges/submit-flag', { 
        flag: userFlag.trim() 
      });
      
      if (response.data.correct) {
        toast.success(response.data.message);
        setUserFlag('');
        setShowHint(false);
        
        if (response.data.completed) {
          setTimeout(() => {
            history.push('/thank-you');
          }, 2000);
        } else {
          // Fetch next challenge
          setTimeout(() => {
            fetchCurrentChallenge();
          }, 1500);
        }
      } else {
        toast.error(response.data.message);
        if (response.data.hint) {
          toast.info(response.data.hint);
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
  const handleHint = async () => {
    try {
      setHintLoading(true);
      
      const response = await api.post('/challenges/request-hint');
      
      setShowHint(true);
      toast.info(response.data.message);
      
      // Update challenge with hint
      setChallenge(prev => ({
        ...prev,
        hint: response.data.hint,
        hintUsed: true
      }));
      
    } catch (err) {
      console.error('Error requesting hint:', err);
      toast.error('Failed to get hint');
    } finally {
      setHintLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    logout();
    history.push('/login');
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!progress.totalChallenges) return 0;
    return Math.round((progress.completedLevels.length / progress.totalChallenges) * 100);
  };

  // Get time color based on remaining time
  const getTimeColor = () => {
    const percentage = (timeLeft / progress.totalTimeLimit) * 100;
    if (percentage <= 10) return 'text-red-500';
    if (percentage <= 25) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${
        isDark ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
               : 'bg-gradient-to-br from-blue-900 via-purple-900 to-violet-900'
      } flex justify-center items-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading Challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className={`min-h-screen ${
        isDark ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
               : 'bg-gradient-to-br from-blue-900 via-purple-900 to-violet-900'
      } flex justify-center items-center`}>
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Challenge Available</h2>
          <button
            onClick={() => history.push('/login')}
            className="bg-white text-purple-900 px-6 py-2 rounded-lg hover:bg-gray-100"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
             : 'bg-gradient-to-br from-blue-900 via-purple-900 to-violet-900'
    } py-8 px-4 relative overflow-hidden`}>
      
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute transform -rotate-45 bg-white w-96 h-96 rounded-full -top-20 -left-20" />
        <div className="absolute transform rotate-45 bg-white w-96 h-96 rounded-full -bottom-20 -right-20" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">CTF Challenge Platform</h1>
          <p className="text-purple-200 text-lg">Level {challenge.levelNumber}: {challenge.title}</p>
        </div>

        {/* Timer and Score Bar */}
        <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <FiClock className="text-white mr-2" size={24} />
                <div>
                  <span className="text-white text-sm">Time Remaining</span>
                  <div className={`text-2xl font-mono font-bold ${getTimeColor()}`}>
                    {formatTimeRemaining(timeLeft)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <FiTrophy className="text-yellow-400 mr-2" size={20} />
                <div>
                  <span className="text-white text-sm">Score</span>
                  <div className="text-xl font-bold text-yellow-400">
                    {progress.finalScore}
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (timeLeft / progress.totalTimeLimit) * 100)}%` }}
            ></div>
          </div>
          <p className="text-white/70 text-sm">
            Progress: {progress.completedLevels.length} / {progress.totalChallenges || 10} levels completed
          </p>
        </div>

        {/* Level Progress Indicator */}
        <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 mb-8 border border-white/10">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto">
            {Array.from({ length: progress.totalChallenges || 10 }, (_, index) => {
              const levelNum = index + 1;
              const isCompleted = progress.completedLevels.includes(levelNum);
              const isCurrent = levelNum === progress.currentLevel;
              const isLocked = levelNum > progress.currentLevel;
              
              return (
                <div
                  key={levelNum}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-400 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-400 text-white animate-pulse'
                      : isLocked
                      ? 'bg-gray-600 border-gray-500 text-gray-400'
                      : 'bg-gray-700 border-gray-600 text-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <FiCheckCircle className="w-5 h-5" />
                  ) : isLocked ? (
                    <FiLock className="w-4 h-4" />
                  ) : (
                    levelNum
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Challenge Container */}
        <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
          {/* Challenge Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{challenge.title}</h2>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    challenge.difficulty === 'easy' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : challenge.difficulty === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {challenge.difficulty.toUpperCase()}
                  </span>
                  <span className="text-yellow-300 font-medium">
                    {challenge.points} points
                  </span>
                  <span className="text-purple-300 text-sm">
                    Attempts: {challenge.attemptCount}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Level</p>
                <p className="text-3xl font-bold text-white">{challenge.levelNumber}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Challenge Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Challenge Description</h3>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-white/90 leading-relaxed">{challenge.description}</p>
              </div>
            </div>

            {/* Hint Section */}
            {showHint && challenge.hint && (
              <div className="mb-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiHelpCircle className="text-yellow-400 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="text-yellow-300 font-medium mb-2">Hint</h4>
                      <p className="text-yellow-100">{challenge.hint}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Flag Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-3">Submit Your Flag</label>
                <div className="relative">
                  <FiFlag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                  <input
                    type="text"
                    value={userFlag}
                    onChange={(e) => setUserFlag(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter the flag here... (e.g., flag{example})"
                    disabled={submitting || timeLeft <= 0}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting || timeLeft <= 0 || !userFlag.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center justify-center">
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : timeLeft <= 0 ? (
                      'Time Expired'
                    ) : (
                      <>
                        <FiFlag className="mr-2" />
                        Submit Flag
                      </>
                    )}
                  </span>
                </button>
                
                {!challenge.hintUsed && (
                  <button
                    type="button"
                    onClick={handleHint}
                    disabled={hintLoading || timeLeft <= 0}
                    className="bg-yellow-600/80 hover:bg-yellow-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {hintLoading ? (
                      <>
                        <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <FiHelpCircle className="mr-2" />
                        Get Hint (-20 pts)
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/70 text-sm">Completed Levels</p>
                  <p className="text-2xl font-bold text-green-400">{progress.completedLevels.length}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/70 text-sm">Current Score</p>
                  <p className="text-2xl font-bold text-yellow-400">{progress.finalScore}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/70 text-sm">Progress</p>
                  <p className="text-2xl font-bold text-blue-400">{getProgressPercentage()}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-sm">
            Complete all levels within the time limit to achieve the highest score!
          </p>
        </div>
      </div>

      {/* Emergency Time Warning */}
      {timeLeft <= 300 && timeLeft > 0 && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse z-50">
          <div className="flex items-center">
            <FiClock className="mr-2" />
            <span className="font-bold">Warning: Less than 5 minutes remaining!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeComponent;