import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaClock, FaTrophy, FaPlay, FaCheck, FaStar } from 'react-icons/fa';

const ChallengeCard = ({ challenge, progress, onClick }) => {
  const { isDark } = useTheme();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    if (!progress) return <FaPlay className="h-4 w-4" />;
    
    switch (progress.status) {
      case 'completed':
        return <FaCheck className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <FaClock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FaPlay className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    if (!progress) return 'Start Challenge';
    
    switch (progress.status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'Continue';
      default:
        return 'Start Challenge';
    }
  };

  const getProgressPercentage = () => {
    if (!progress || progress.status === 'not_started') return 0;
    if (progress.status === 'completed') return 100;
    if (progress.status === 'in_progress') return 50; // Could be calculated based on actual progress
    return 0;
  };

  return (
    <div
      onClick={onClick}
      className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-2 line-clamp-2`}>
              {challenge.title}
            </h3>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
              getDifficultyColor(challenge.difficulty)
            }`}>
              {challenge.difficulty}
            </span>
          </div>
          <div className="ml-4">
            {getStatusIcon()}
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        } mb-4 line-clamp-3`}>
          {challenge.description}
        </p>

        {/* Tags */}
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {challenge.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-full ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tag}
              </span>
            ))}
            {challenge.tags.length > 3 && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                +{challenge.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="mb-4">
            <div className={`w-full bg-gray-200 rounded-full h-2 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <FaTrophy className={`h-4 w-4 mr-1 ${
                isDark ? 'text-yellow-400' : 'text-yellow-500'
              }`} />
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {challenge.points} pts
              </span>
            </div>
            
            {challenge.timeLimit && (
              <div className="flex items-center">
                <FaClock className={`h-4 w-4 mr-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {challenge.timeLimit}m
                </span>
              </div>
            )}

            {challenge.averageRating && (
              <div className="flex items-center">
                <FaStar className="h-4 w-4 mr-1 text-yellow-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {challenge.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <span className={`text-sm font-medium ${
            progress?.status === 'completed' 
              ? 'text-green-600' 
              : progress?.status === 'in_progress'
              ? 'text-yellow-600'
              : 'text-blue-600'
          }`}>
            {getStatusText()}
          </span>
        </div>

        {/* Score (if completed) */}
        {progress?.status === 'completed' && progress.score && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Your Score:</span>
              <span className="font-semibold text-green-600">{progress.score}/{challenge.points}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;