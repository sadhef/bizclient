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
  FiPlay
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
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [challengeNotStarted, setChallengeNotStarted] = useState(false);

  useEffect(() => {
    loadChallenge();
    loadSubmissions();
  }, []);

  useEffect(() => {
    let interval;
    if (timeRemaining > 0 && challengeStatus?.isActive) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            history.push('/thank-you');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining, challengeStatus, history]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const challengeResponse = await challengeAPI.getCurrentChallenge();
      setChallenge(challengeResponse.data.challenge);
      setChallengeStatus(challengeResponse.data.user);
      setTimeRemaining(challengeResponse.data.timeRemaining);
      setChallengeNotStarted(false);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.code === 'CHALLENGE_NOT_STARTED') {
        setChallengeNotStarted(true);
      } else if (error.response?.status === 410) {
        history.push('/thank-you');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await challengeAPI.getSubmissions();
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const startChallenge = async () => {
    try {
      setLoading(true);
      await challengeAPI.startChallenge();
      await loadChallenge();
    } catch (error) {
      console.error('Error starting challenge:', error);
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
        
        if (response.data.allChallengesComplete || response.data.completed) {
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
          
          setTimeRemaining(response.data.timeRemaining);
          
          setTimeout(async () => {
            await loadChallenge();
            await loadSubmissions();
          }, 1000);
          
          return;
        }
      }
      
      setTimeout(() => {
        loadSubmissions();
      }, 500);
      
    } catch (error) {
      if (error.response?.status === 410) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-light-primary dark:bg-dark-primary">
        <LoadingSpinner message="Loading challenge..." />
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
          <p className="text-light-secondary dark:text-dark-secondary mb-6">
            You need to start the challenge first to access the levels.
          </p>
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
                <p className="text-sm text-light-secondary dark:text-dark-secondary">Time Remaining</p>
                <p className={`text-lg font-bold ${getTimeColor()}`}>
                  {formatTime(timeRemaining)}
                </p>
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Challenge Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Description */}
            <div className="card">
              <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
                Challenge Description
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-light-secondary dark:text-dark-secondary whitespace-pre-wrap">
                  {challenge.description}
                </p>
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
                >
                  {showHint ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
              
              {showHint && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiHelpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-800 dark:text-yellow-200">
                      {hint}
                    </p>
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
                      disabled={submitting}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting || !flag.trim()}
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
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                  </div>
                  {challengeStatus?.completedLevels?.length > 0 && (
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
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
                Recent Submissions
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {submissions.length > 0 ? (
                  submissions.slice(0, 10).map((submission, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        submission.isCorrect
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {submission.isCorrect ? (
                          <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <FiXCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                        <span className="text-sm font-medium">
                          Level {submission.level}
                        </span>
                      </div>
                      <span className="text-xs text-light-secondary dark:text-dark-secondary">
                        {new Date(submission.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-light-secondary dark:text-dark-secondary text-center py-4">
                    No submissions yet
                  </p>
                )}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;