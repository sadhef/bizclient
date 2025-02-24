import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiLock, FiUnlock } from 'react-icons/fi';

const formatTimeRemaining = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const hints = {
  1: "Find the flag located in the website https://bizdemo.online",
  2: " Inspect the webpage and capture the flag from https://biztrasflag2.bizdemo.online",
  3: "Do your magic to get yourself authorized as admin here https://biztrasflag3.bizdemo.online",
  4: " Same process but read the code given in https://biztrasflag4.bizdemo.online"
};

const correctFlags = {
  1: "biztrasflag{join_biztras_cyber_team}",
  2: "biztrasflag{SecureWithBiztrasCyberSecurity}",
  3: "biztrasflag{GetReadyCybeerSecurity}",
  4: "biztrasflag{YouRAProHacker}"
};

const Challenges = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [userFlag, setUserFlag] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [loading, setLoading] = useState(true);
  const [flagAttempts, setFlagAttempts] = useState({});
  const [attemptCounts, setAttemptCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [hintUsed, setHintUsed] = useState({ 1: false, 2: false, 3: false, 4: false });
  const [levelStatus, setLevelStatus] = useState({ 1: false, 2: false, 3: false, 4: false });
  const [intervalId, setIntervalId] = useState(null);

  const history = useHistory();
  const userEmail = localStorage.getItem('userEmail');

  const saveProgressToServer = useCallback(async (progressData = {}) => {
    if (!userEmail) return;

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const dataToSend = {
        userEmail,
        currentLevel,
        timeRemaining: timeLeft,
        flagsEntered: {
          ...flagAttempts,
          ...(progressData.flagsEntered || {})
        },
        attemptCounts: {
          ...attemptCounts,
          ...(progressData.attemptCounts || {})
        },
        hintUsed: {
          ...hintUsed,
          ...(progressData.hintUsed || {})
        },
        levelStatus: {
          ...levelStatus,
          ...(progressData.levelStatus || {})
        },
        completed: progressData.completed || false
      };

      const response = await fetch(`${apiBaseUrl}/save-progress`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save progress');
      }

      const result = await response.json();
      
      if (result.progress) {
        if (result.progress.levelStatus) {
          setLevelStatus(result.progress.levelStatus);
        }
        if (result.progress.completed && progressData.completed) {
          history.push('/thank-you');
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error(error.message || 'Failed to save progress');
    }
  }, [userEmail, currentLevel, timeLeft, flagAttempts, attemptCounts, hintUsed, levelStatus, history]);

  const cleanupTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const initializeTimer = useCallback((initialTime) => {
    cleanupTimer();
    
    const newIntervalId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          cleanupTimer();
          saveProgressToServer({ completed: true });
          return 0;
        }
        return newTime;
      });
    }, 1000);

    setIntervalId(newIntervalId);
  }, [cleanupTimer, saveProgressToServer]);

  const fetchTimeRemaining = useCallback(async () => {
    if (!userEmail) {
      toast.error('User email not found');
      history.push('/');
      return null;
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/get-time/${encodeURIComponent(userEmail)}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch time: ${response.status}`);
      }

      const data = await response.json();
      return data.timeRemaining;
    } catch (error) {
      console.error('Error fetching time:', error);
      toast.error('Failed to fetch remaining time');
      return null;
    }
  }, [userEmail, history]);

  useEffect(() => {
    let mounted = true;

    const initializeChallenge = async () => {
      try {
        const remainingTime = await fetchTimeRemaining();
        
        if (!mounted) return;

        if (remainingTime === 0) {
          toast.info('Time has expired!');
          history.push('/thank-you');
          return;
        }

        if (remainingTime) {
          setTimeLeft(remainingTime);
          initializeTimer(remainingTime);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing challenge:', error);
        if (mounted) {
          toast.error('Failed to initialize challenge');
          setLoading(false);
        }
      }
    };

    if (!userEmail) {
      toast.error('Please register first');
      history.push('/');
    } else {
      initializeChallenge();
    }

    return () => {
      mounted = false;
      cleanupTimer();
    };
  }, [userEmail, history, fetchTimeRemaining, initializeTimer, cleanupTimer]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const saveInterval = setInterval(() => {
      saveProgressToServer();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [timeLeft, saveProgressToServer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (timeLeft <= 0) {
      toast.error("Time's up! You can't submit answers anymore.");
      return;
    }

    setAttemptCounts(prev => ({
      ...prev,
      [currentLevel]: (prev[currentLevel] || 0) + 1
    }));

    const newFlagAttempts = {
      ...flagAttempts,
      [currentLevel]: userFlag
    };
    setFlagAttempts(newFlagAttempts);

    if (userFlag.toLowerCase() === correctFlags[currentLevel].toLowerCase()) {
      const isFinalLevel = currentLevel === 4;
      const newLevelStatus = {
        ...levelStatus,
        [currentLevel]: true
      };
      setLevelStatus(newLevelStatus);
      
      toast.success(
        isFinalLevel 
          ? 'Congratulations! You have completed all levels!' 
          : 'Correct flag! Advancing to next level!'
      );

      await saveProgressToServer({
        flagsEntered: newFlagAttempts,
        currentLevel,
        completed: isFinalLevel,
        levelStatus: newLevelStatus
      });

      if (isFinalLevel) {
        cleanupTimer();
        history.push('/thank-you');
      } else {
        setCurrentLevel(prev => prev + 1);
        setUserFlag('');
        setShowHint(false);
      }
    } else {
      toast.error("Incorrect flag. Try again!");
      
      if (attemptCounts[currentLevel] >= 2 && !hintUsed[currentLevel]) {
        toast.info("Having trouble? Consider using a hint!");
      }

      await saveProgressToServer({
        flagsEntered: newFlagAttempts,
        currentLevel,
        completed: false
      });
    }
  };

  const useHintForLevel = () => {
    setHintUsed(prev => ({
      ...prev,
      [currentLevel]: true
    }));
    setShowHint(true);
    toast.info("Hint revealed!");
    saveProgressToServer();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Time's Up!</h2>
          <p className="text-gray-600 mb-4">Your challenge session has ended.</p>
          <button
            onClick={() => history.push('/thank-you')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <FiClock className="text-indigo-600 mr-2" size={24} />
            <span className="text-lg font-mono">
              Time Remaining: {' '}
              <span className={timeLeft < 300 ? "text-red-600 font-bold" : "text-indigo-800 font-bold"}>
                {formatTimeRemaining(timeLeft)}
              </span>
            </span>
          </div>
          <button 
            onClick={() => saveProgressToServer()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Save Progress
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            {[1, 2, 3, 4].map(level => (
              <div 
                key={level}
                className={`flex-1 text-center py-3 ${
                  level === currentLevel ? 'bg-indigo-600 text-white' :
                  level < currentLevel ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-500'
                }`}
              >
                {level < currentLevel ? (
                  <FiCheckCircle className="inline mr-1" />
                ) : level > currentLevel ? (
                  <FiLock className="inline mr-1" />
                ) : (
                  <FiUnlock className="inline mr-1" />
                )}
                Level {level}
              </div>
            ))}
          </div>

          <div className="p-8">
            <h2 className="text-3xl font-bold text-indigo-800 mb-2">Level {currentLevel} Challenge</h2>
            
            <p className="text-gray-700 mb-6">
              Find and submit the flag for this level. Each flag is a unique string that proves you've completed the challenge.
            </p>

            {showHint && hintUsed[currentLevel] && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Hint:</strong> {hints[currentLevel]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Enter Flag:</label>
                <input
                  type="text"
                  value={userFlag}
                  onChange={(e) => setUserFlag(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Enter the flag for this level..."
                  required
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  className="flex-grow px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
                >
                  Submit Flag
                </button>
                
                {!hintUsed[currentLevel] && (
                  <button
                    type="button"
                    onClick={useHintForLevel}
                    className="flex-grow px-6 py-3 bg-white border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition shadow-sm"
                  >
                    Use Hint
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 text-sm text-gray-600 text-right">
              Attempts for this level: {attemptCounts[currentLevel] || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;