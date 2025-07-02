import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { challengeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiTarget, 
  FiLock, 
  FiCheckCircle, 
  FiPlay,
  FiEye,
  FiClock
} from 'react-icons/fi';
import LoadingSpinner from '../../components/UX/LoadingSpinner';

const ChallengeList = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [levels, setLevels] = useState([]);
  const [challengeStatus, setChallengeStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      
      // Load available levels
      const levelsResponse = await challengeAPI.getLevels();
      setLevels(levelsResponse.data.levels);
      
      // Load current challenge status
      const statusResponse = await challengeAPI.getStatus();
      setChallengeStatus(statusResponse.data);
      
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async () => {
    try {
      await challengeAPI.startChallenge();
      history.push('/challenge');
    } catch (error) {
      console.error('Error starting challenge:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-primary dark:bg-dark-primary">
        <LoadingSpinner message="Loading challenges..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light-primary dark:text-dark-primary mb-2">
            Challenge Levels
          </h1>
          <p className="text-light-secondary dark:text-dark-secondary">
            Complete each level in order to progress through the CTF challenge
          </p>
        </div>

        {/* Challenge Status */}
        {challengeStatus && (
          <div className="card mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                  Challenge Status
                </h2>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FiTarget className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="text-light-secondary dark:text-dark-secondary">
                      Current Level: {challengeStatus.currentLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-light-secondary dark:text-dark-secondary">
                      Completed: {challengeStatus.completedLevels?.length || 0} levels
                    </span>
                  </div>
                  {challengeStatus.timeRemaining > 0 && (
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-light-secondary dark:text-dark-secondary">
                        Time remaining: {Math.floor(challengeStatus.timeRemaining / 60)}m {challengeStatus.timeRemaining % 60}s
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {!challengeStatus.hasStarted ? (
                <button
                  onClick={startChallenge}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiPlay className="w-4 h-4" />
                  Start Challenge
                </button>
              ) : challengeStatus.isActive ? (
                <button
                  onClick={() => history.push('/challenge')}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiTarget className="w-4 h-4" />
                  Continue Challenge
                </button>
              ) : (
                <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium">
                  Challenge Ended
                </span>
              )}
            </div>
          </div>
        )}

        {/* Challenge Levels */}
        <div className="space-y-4">
          {levels.map((level) => (
            <div
              key={level.level}
              className={`card transition-all duration-200 ${
                level.isCompleted
                  ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                  : level.isCurrent
                  ? 'border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10'
                  : level.isAccessible
                  ? 'hover:border-gray-300 dark:hover:border-gray-600'
                  : 'opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Level Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    level.isCompleted
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : level.isCurrent
                      ? 'bg-violet-100 dark:bg-violet-900/30'
                      : level.isAccessible
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {level.isCompleted ? (
                      <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : level.isAccessible ? (
                      <FiTarget className={`w-6 h-6 ${
                        level.isCurrent 
                          ? 'text-violet-600 dark:text-violet-400' 
                          : 'text-blue-600 dark:text-blue-400'
                      }`} />
                    ) : (
                      <FiLock className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>

                  {/* Level Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                        Level {level.level}
                      </h3>
                      {level.isCompleted && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                          Completed
                        </span>
                      )}
                      {level.isCurrent && !level.isCompleted && (
                        <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-light-primary dark:text-dark-primary mb-2">
                      {level.title}
                    </h4>
                    {level.isAccessible && (
                      <p className="text-light-secondary dark:text-dark-secondary text-sm">
                        {level.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-3">
                  {level.isCompleted ? (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      ✓ Solved
                    </span>
                  ) : level.isCurrent && challengeStatus?.isActive ? (
                    <button
                      onClick={() => history.push('/challenge')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <FiPlay className="w-4 h-4" />
                      Continue
                    </button>
                  ) : level.isAccessible && challengeStatus?.hasStarted ? (
                    <button
                      onClick={() => history.push('/challenge')}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <FiEye className="w-4 h-4" />
                      View
                    </button>
                  ) : !level.isAccessible ? (
                    <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                      <FiLock className="w-4 h-4" />
                      Locked
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
            How to Play
          </h3>
          <div className="space-y-3 text-sm text-light-secondary dark:text-dark-secondary">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-violet-600 dark:text-violet-400 font-bold text-xs">1</span>
              </div>
              <p>Start the challenge to begin your timer and unlock the first level</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-violet-600 dark:text-violet-400 font-bold text-xs">2</span>
              </div>
              <p>Complete each level by finding and submitting the correct flag</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-violet-600 dark:text-violet-400 font-bold text-xs">3</span>
              </div>
              <p>Each completed level unlocks the next one in sequence</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-violet-600 dark:text-violet-400 font-bold text-xs">4</span>
              </div>
              <p>Complete all levels before time runs out to win the challenge</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeList;