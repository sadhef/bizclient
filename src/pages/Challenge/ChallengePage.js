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
  FiInfo
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
  const [challengeEnded, setChallengeEnded] = useState(false); // NEW: Track if challenge ended
  const [endReason, setEndReason] = useState(null); // NEW: Track why challenge ended
  
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
      
      // Load challenge
      const challengeResponse = await challengeAPI.getCurrentChallenge();
      setChallenge(challengeResponse.data.challenge);
      setChallengeStatus(challengeResponse.data.user);
      
      // Timer setup
      const timeLeft = challengeResponse.data.timeRemaining || 0;
      const isActive = challengeResponse.data.isActive;
      const challengeStartTime = challengeResponse.data.user?.challengeStartTime;
      
      setTimeRemaining(timeLeft);
      setTimerActive(isActive && challengeStartTime);
      
      setChallengeNotStarted(false);
      setChallengeEnded(false);
      setEndReason(null);
      
      console.log('Challenge timer initialized:', {
        timeRemaining: timeLeft,
        isActive,
        hasStarted: !!challengeStartTime
      });

      // Load submissions
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
        // NEW: Handle challenge already ended
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
      
      // NEW: Handle restart prevention
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
          
          // Update timer with new time remaining
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
    if (timeRemaining > 300) return 'text-green-600 dark:text-green-400';
    if (timeRemaining > 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  console.log('Challenge render:', { timeRemaining, timerActive, challengeEnded, endReason });

  if (loading) {
    return (
      <div className="min-h-screen bg-light-primary dark:bg-dark-primary">
        <LoadingSpinner message="Loading challenge..." />
      </div>
    );
  }

  // NEW: Handle challenge ended state
  if (challengeEnded) {
    return (
      <div className="min-h-screen bg-light-primary dark:bg-dark-primary flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            endReason === 'completed' 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {endReason === 'completed' ? (
              <FiCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            ) : (
              <FiXCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-4">
            {endReason === 'completed' ? 'Challenge Completed!' : 'Challenge Ended'}
          </h2>
          
          <div className="text-light-secondary dark:text-dark-secondary mb-6">
            {endReason === 'completed' 
              ? 'Congratulations! You have completed all challenge levels.'
              : endReason === 'expired'
              ? 'Your challenge time has expired.'
              : 'The challenge has ended.'
            }
          </div>

          {/* Info about restart */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Want to try again?
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Only administrators can reset your challenge progress. Contact an admin to restart the challenge.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => history.push('/thank-you')}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4" />
              View Results
            </button>
            <button
              onClick={() => history.push('/dashboard')}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <FiArrowRight className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (challengeNotStarted) {
    return (
      <div className="min-h-screen bg-light-primary dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full mb-6">
            <FiPlay className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-4">
            Ready to Start?
          </h2>
          <div className="text-light-secondary dark:text-dark-secondary mb-6">
            You need to start the challenge first to access the levels.
          </div>
          <div className="space-y-3">
            <button
              onClick={startChallenge}
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FiPlay className="w-4 h-4" />
              {loading ? 'Starting...' : 'Start Challenge'}
            </button>
            <button
              onClick={() => history.push('/dashboard')}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <FiArrowRight className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-light-primary dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary mb-4">
            No Challenge Available
          </h2>
          <button
            onClick={() => history.push('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiTarget className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              <h1 className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                {challenge.title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-light-secondary dark:text-dark-secondary">Time Remaining</div>
                <div className={`text-lg font-bold ${getTimeColor()} flex items-center gap-2`}>
                  <FiClock className="w-5 h-5" />
                  <span>
                    {formatTime(timeRemaining)}
                  </span>
                  {timeRemaining <= 60 && timeRemaining > 0 && (
                    <span className="animate-pulse text-red-500">⚠️</span>
                  )}
                  {timerActive && timeRemaining > 0 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-light-secondary dark:text-dark-secondary">
            <div className="flex items-center gap-2">
              <FiTarget className="w-4 h-4" />
              <span>Level {challenge.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiFlag className="w-4 h-4" />
              <span>Attempts: {challengeStatus?.totalAttempts}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${timerActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span>{timerActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        {/* NEW: Warning for inactive timer */}
        {!timerActive && timeRemaining <= 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Challenge Time Expired
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  Your challenge time has expired. You can no longer submit answers.
                </p>
                <button
                  onClick={() => history.push('/thank-you')}
                  className="btn-secondary text-sm"
                >
                  View Results
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Challenge Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Description */}
            <div className="card">
              <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
                Challenge Description
              </h2>
              <div className="text-light-secondary dark:text-dark-secondary whitespace-pre-wrap">
                {challenge.description}
              </div>
            </div>

            {/* Hint Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                  Hint
                </h2>
                <button
                  onClick={() => showHint ? setShowHint(false) : loadHint()}
                  className="btn-secondary flex items-center gap-2"
                  disabled={!timerActive}
                >
                  {showHint ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
              
              {showHint && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiHelpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-yellow-800 dark:text-yellow-200">
                      {hint}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Flag Submission */}
            <div className="card">
              <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
                Submit Flag
              </h2>
              <form onSubmit={submitFlag} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-secondary dark:text-dark-secondary mb-2">
                    Flag
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiFlag className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                      className="input pl-10"
                      placeholder="Enter your answer..."
                      disabled={submitting || !timerActive}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting || !flag.trim() || !timerActive}
                  className="btn-primary flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      Submit Answer
                    </>
                  )}
                </button>
                
                {/* NEW: Submission disabled warning */}
                {!timerActive && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <FiXCircle className="w-4 h-4" />
                    Submissions disabled - Challenge time expired
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Timer Display */}
            <div className="card border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
              <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4 flex items-center gap-2">
                <FiClock className="w-5 h-5" />
                Live Challenge Timer
              </h3>
              <div className="text-center">
                {/* Large timer display */}
                <div className={`text-4xl font-bold ${getTimeColor()} mb-3`}>
                  {formatTime(timeRemaining)}
                </div>
                
                {/* Linear progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      timeRemaining > 300 ? 'bg-green-500' :
                      timeRemaining > 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.max(0, Math.min(100, (timeRemaining / 3600) * 100))}%` 
                    }}
                  />
                </div>

                <div className="text-xs text-light-secondary dark:text-dark-secondary flex items-center justify-center gap-1 mb-2">
                  {timerActive ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live Timer Active
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Timer Stopped
                    </>
                  )}
                </div>

                {timeRemaining <= 60 && timeRemaining > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mt-3">
                    <div className="text-xs text-red-700 dark:text-red-300 font-medium animate-pulse">
                      ⚠️ Time running out!
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-700">
                  <div className="text-xs text-violet-600 dark:text-violet-400">
                    ⚡ Updates every second
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="card">
              <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
                Your Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-light-secondary dark:text-dark-secondary mb-2">
                    <span>Current Level</span>
                    <span>{challengeStatus?.currentLevel}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-light-secondary dark:text-dark-secondary mb-2">
                    <span>Completed Levels</span>
                    <span>{challengeStatus?.completedLevels?.length}</span>
                  </div>{challengeStatus?.completedLevels?.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {challengeStatus.completedLevels.map((level) => (
                        <span
                          key={level}
                          className="inline-flex items-center px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded"
                        >
                          <FiCheckCircle className="w-3 h-3 mr-1" />
                          Level {level}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-sm text-light-secondary dark:text-dark-secondary mb-2">
                    <span>Total Attempts</span>
                    <span>{challengeStatus?.totalAttempts}</span>
                  </div>
                </div>

                {/* NEW: Challenge Status */}
                <div>
                  <div className="flex justify-between text-sm text-light-secondary dark:text-dark-secondary mb-2">
                    <span>Challenge Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      timerActive 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : timeRemaining <= 0
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {timerActive ? 'Active' : timeRemaining <= 0 ? 'Expired' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>
            </div>


            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => history.push('/challenges')}
                  className="btn-secondary w-full flex items-center gap-2"
                >
                  <FiTarget className="w-4 h-4" />
                  View All Challenges
                </button>
                <button
                  onClick={() => history.push('/dashboard')}
                  className="btn-secondary w-full flex items-center gap-2"
                >
                  <FiArrowRight className="w-4 h-4" />
                  Back to Dashboard
                </button>

                {/* NEW: Challenge ended actions */}
                {!timerActive && timeRemaining <= 0 && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                      <p className="text-xs text-light-secondary dark:text-dark-secondary mb-3 text-center">
                        Challenge time expired
                      </p>
                      <button
                        onClick={() => history.push('/thank-you')}
                        className="btn-primary w-full flex items-center gap-2"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        View Results
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* NEW: Restart Information */}
            {!timerActive && (
              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Challenge Restart Policy
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      Once a challenge ends (completion or expiration), only administrators can reset your progress.
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Contact an admin if you need to restart the challenge.
                    </p>
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

export default ChallengePage;