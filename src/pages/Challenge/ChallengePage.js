import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { challengeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiFlag, 
  FiClock, 
  FiTarget, 
  FiEye, 
  FiEyeOff, 
  FiSend, 
  FiCheckCircle, 
  FiXCircle,
  FiHelpCircle,
  FiArrowRight,
  FiPlay,
  FiAlertTriangle,
  FiInfo,
  FiActivity,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ChallengePage = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [challenge, setChallenge] = useState(null);
  const [challengeStatus, setChallengeStatus] = useState(null);
  const [flag, setFlag] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [challengeNotStarted, setChallengeNotStarted] = useState(false);
  const [challengeEnded, setChallengeEnded] = useState(false);
  const [endReason, setEndReason] = useState(null);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Load challenge data
  useEffect(() => {
    loadChallengeData();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          const newTime = prevTime - 1;
          
          if (newTime <= 0) {
            setTimerActive(false);
            setChallengeEnded(true);
            setEndReason('expired');
            toast.warning('Challenge time has expired!');
            setTimeout(() => history.push('/thank-you'), 1000);
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining, history]);

  const loadChallengeData = async () => {
    try {
      setLoading(true);
      
      const challengeResponse = await challengeAPI.getCurrentChallenge();
      setChallenge(challengeResponse.data.challenge);
      setChallengeStatus(challengeResponse.data.user);
      
      const timeLeft = challengeResponse.data.timeRemaining || 0;
      const isActive = challengeResponse.data.isActive;
      const challengeStartTime = challengeResponse.data.user?.challengeStartTime;
      
      setTimeRemaining(timeLeft);
      setTimerActive(isActive && challengeStartTime);
      
      setChallengeNotStarted(false);
      setChallengeEnded(false);
      setEndReason(null);

      try {
        const submissionsResponse = await challengeAPI.getSubmissions();
        setSubmissions(submissionsResponse.data.submissions);
      } catch (error) {
        console.error('Error loading submissions:', error);
      }
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.code === 'CHALLENGE_NOT_STARTED') {
        setChallengeNotStarted(true);
        setTimerActive(false);
      } else if (error.response?.status === 410) {
        setTimerActive(false);
        setChallengeEnded(true);
        setEndReason('expired');
        history.push('/thank-you');
      } else if (error.response?.data?.code === 'CHALLENGE_ALREADY_ENDED') {
        setChallengeEnded(true);
        setEndReason(error.response.data.reason || 'unknown');
        setTimerActive(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async () => {
    try {
      setLoading(true);
      const response = await challengeAPI.startChallenge();
      
      if (response.data.alreadyStarted) {
        toast.info('Challenge already in progress');
      }
      
      await loadChallengeData();
    } catch (error) {
      console.error('Error starting challenge:', error);
      
      if (error.response?.data?.code === 'CHALLENGE_ALREADY_ENDED') {
        setChallengeEnded(true);
        setEndReason(error.response.data.reason);
        toast.error(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadHint = async () => {
    try {
      const response = await challengeAPI.getHint();
      setHint(response.data.hint);
      setShowHint(true);
    } catch (error) {
      console.error('Error loading hint:', error);
    }
  };

  const submitFlag = async (e) => {
    e.preventDefault();
    
    if (!flag.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await challengeAPI.submitFlag(flag.trim());
      
      if (response.data.success) {
        setFlag('');
        
        if (response.data.allChallengesComplete || response.data.completed || response.data.challengeEnded) {
          setTimerActive(false);
          setChallengeEnded(true);
          setEndReason('completed');
          setTimeout(() => history.push('/thank-you'), 2000);
          return;
        }
        
        if (response.data.moveToNextLevel || response.data.levelProgression || response.data.hasNextLevel) {
          setShowHint(false);
          setHint('');
          
          setChallengeStatus(prev => ({
            ...prev,
            currentLevel: response.data.currentLevel,
            completedLevels: response.data.completedLevels,
            totalAttempts: response.data.totalAttempts
          }));
          
          const newTimeRemaining = response.data.timeRemaining || 0;
          setTimeRemaining(newTimeRemaining);
          
          setTimeout(async () => {
            await loadChallengeData();
          }, 1000);
          
          return;
        }
      }
      
      setTimeout(async () => {
        const submissionsResponse = await challengeAPI.getSubmissions();
        setSubmissions(submissionsResponse.data.submissions);
      }, 500);
      
    } catch (error) {
      if (error.response?.status === 410) {
        setTimerActive(false);
        setChallengeEnded(true);
        setEndReason('expired');
        history.push('/thank-you');
      }
    } finally {
      setSubmitting(false);
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

  const getTimeColor = () => {
    if (timeRemaining > 300) return 'text-green-500 dark:text-green-400';
    if (timeRemaining > 60) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <LoadingSpinner message="Loading challenge..." />
      </div>
    );
  }

  // Challenge ended state
  if (challengeEnded) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 ${
            endReason === 'completed' 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {endReason === 'completed' ? (
              <FiCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            ) : (
              <FiXCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
            {endReason === 'completed' ? 'Challenge Completed!' : 'Challenge Ended'}
          </h2>
          
          <div className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {endReason === 'completed' 
              ? 'Congratulations! You have completed all challenge levels.'
              : endReason === 'expired'
              ? 'Your challenge time has expired.'
              : 'The challenge has ended.'
            }
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">
                  Want to try again?
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Only administrators can reset your challenge progress. Contact an admin to restart the challenge.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => history.push('/thank-you')}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              <FiCheckCircle className="w-4 h-4" />
              View Results
            </button>
            <button
              onClick={() => history.push('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FiArrowRight className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Challenge not started state
  if (challengeNotStarted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-black dark:bg-white rounded-full mb-8">
            <FiPlay className="w-12 h-12 text-white dark:text-black" />
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
            Ready to Start?
          </h2>
          <div className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            You need to start the challenge first to access the levels.
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={startChallenge}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <FiPlay className="w-4 h-4" />
              {loading ? 'Starting...' : 'Start Challenge'}
            </button>
            <button
              onClick={() => history.push('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FiArrowRight className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No challenge available
  if (!challenge) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
            No Challenge Available
          </h2>
          <button
            onClick={() => history.push('/dashboard')}
            className="px-6 py-3 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <FiTarget className="w-6 h-6 text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black dark:text-white leading-none">
                  {challenge.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Level {challenge.level} Challenge
                </p>
              </div>
            </div>
            
            {/* Timer display */}
            <div className="text-right">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Remaining</div>
              <div className={`text-lg font-bold ${getTimeColor()} flex items-center gap-2`}>
                <FiClock className="w-5 h-5" />
                <span>{formatTime(timeRemaining)}</span>
                {timeRemaining <= 60 && timeRemaining > 0 && (
                  <span className="animate-pulse text-red-500">⚠️</span>
                )}
                {timerActive && timeRemaining > 0 && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FiTarget className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Level {challenge.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiFlag className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">Attempts: {challengeStatus?.totalAttempts}</span>
              </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${timerActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-gray-600 dark:text-gray-400">{timerActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        {/* Warning for inactive timer */}
        {!timerActive && timeRemaining <= 0 && (
          <div className="mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-800 dark:text-red-200 mb-2">Challenge Time Expired</h4>
                  <p className="text-xs text-red-700 dark:text-red-300 mb-3">Your challenge time has expired. You can no longer submit answers.</p>
                  <button
                    onClick={() => history.push('/thank-you')}
                    className="px-3 py-1 text-xs border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    View Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Challenge Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Challenge Description */}
            <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <FiInfo className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-black dark:text-white">
                  Challenge Description
                </h2>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                  {challenge.description}
                </pre>
              </div>
            </div>

            {/* Hint Section */}
            <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FiHelpCircle className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                  <h2 className="text-lg font-bold text-black dark:text-white">
                    Hint
                  </h2>
                </div>
                <button
                  onClick={() => showHint ? setShowHint(false) : loadHint()}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  disabled={!timerActive}
                >
                  {showHint ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
              
              {showHint ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiHelpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2">Hint</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">{hint}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FiHelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Click "Show Hint" to reveal a helpful clue</p>
                </div>
              )}
            </div>

            {/* Flag Submission */}
            <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <FiFlag className="w-5 h-5 text-green-500 dark:text-green-400" />
                <h2 className="text-lg font-bold text-black dark:text-white">
                  Submit Flag
                </h2>
              </div>
              
              <form onSubmit={submitFlag} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Your Answer</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiFlag className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      placeholder="Enter your flag or answer..."
                      disabled={submitting || !timerActive}
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Enter the flag you discovered or your answer to the challenge
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || !flag.trim() || !timerActive}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      <span>Submit Answer</span>
                    </>
                  )}
                </button>
                
                {!timerActive && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                    <FiXCircle className="w-4 h-4" />
                    Submissions disabled - Challenge time expired
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Timer Widget */}
            {challengeStatus?.hasStarted && timerActive && timeRemaining > 0 && (
              <div className="bg-black dark:bg-white text-white dark:text-black rounded-xl p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <FiClock className="w-5 h-5" />
                    <h3 className="text-sm font-bold">Live Timer</h3>
                  </div>
                  
                  {/* Large timer display */}
                  <div className={`text-2xl font-bold mb-4 ${
                    timeRemaining > 300 ? 'text-white dark:text-black' :
                    timeRemaining > 60 ? 'text-yellow-300 dark:text-yellow-600' :
                    'text-red-300 dark:text-red-600'
                  }`}>
                    {formatTime(timeRemaining)}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-white/20 dark:bg-black/20 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        timeRemaining > 300 ? 'bg-white dark:bg-black' :
                        timeRemaining > 60 ? 'bg-yellow-300 dark:bg-yellow-600' :
                        'bg-red-300 dark:bg-red-600'
                      }`}
                      style={{ 
                        width: `${Math.max(0, Math.min(100, (timeRemaining / 3600) * 100))}%` 
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs opacity-80">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Live Updates</span>
                  </div>

                  {timeRemaining <= 300 && timeRemaining > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20 dark:border-black/20">
                      <div className="text-xs font-medium animate-pulse">
                        {timeRemaining <= 60 ? '⚠️ Final Minute!' : '⏰ Time Running Low!'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Tracker */}
            <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <FiActivity className="w-5 h-5 text-black dark:text-white" />
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Your Progress
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    <span>Current Level</span>
                    <span>Level {challengeStatus?.currentLevel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <FiTarget className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Currently working on level {challengeStatus?.currentLevel}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    <span>Completed Levels</span>
                    <span>{challengeStatus?.completedLevels?.length || 0}</span>
                  </div>
                  {challengeStatus?.completedLevels?.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {challengeStatus.completedLevels.map((level) => (
                        <div
                          key={level}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium"
                        >
                          <FiCheckCircle className="w-3 h-3" />
                          Level {level}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      No levels completed yet
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    <span>Total Attempts</span>
                    <span>{challengeStatus?.totalAttempts || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <FiFlag className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {challengeStatus?.totalAttempts === 0 ? 'No attempts yet' : 
                       `${challengeStatus?.totalAttempts} submission${challengeStatus?.totalAttempts !== 1 ? 's' : ''} made`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            {submissions.length > 0 && (
              <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <FiRefreshCw className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                  <h3 className="text-sm font-bold text-black dark:text-white">
                    Recent Submissions
                  </h3>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {submissions.slice(0, 5).map((submission, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        submission.isCorrect
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          submission.isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {submission.isCorrect ? (
                            <FiCheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <FiXCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-black dark:text-white">
                            Level {submission.level}
                          </p>
                          <p className={`text-xs ${
                            submission.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                          }`}>
                            {submission.isCorrect ? 'Correct' : 'Incorrect'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(submission.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-bold text-black dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => history.push('/challenges')}
                  className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiTarget className="w-4 h-4" />
                  View All Challenges
                </button>
                
                <button
                  onClick={() => history.push('/dashboard')}
                  className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiArrowRight className="w-4 h-4" />
                  Back to Dashboard
                </button>

                {/* Challenge ended actions */}
                {!timerActive && timeRemaining <= 0 && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                        Challenge time expired
                      </p>
                      <button
                        onClick={() => history.push('/thank-you')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        View Results
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Help & Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-800 dark:text-blue-200 mb-2">
                    Challenge Tips
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Read the description carefully for clues</li>
                    <li>• Use hints when you're stuck</li>
                    <li>• Take your time to analyze the problem</li>
                    <li>• Try different approaches if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
