import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';
import { formatTimeDetailed } from '../../utils/timer';
import { 
  FaTrophy, 
  FaClock, 
  FaFlag, 
  FaLightbulb, 
  FaStar, 
  FaChartLine,
  FaHome,
  FaDownload,
  FaShare
} from 'react-icons/fa';

const ThankYouPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { currentUser, logout } = useAuth();
  const { isDark } = useTheme();
  const history = useHistory();

  useEffect(() => {
    if (!currentUser) {
      history.push('/login');
      return;
    }
    
    fetchResults();
  }, [currentUser, history]);

  const fetchResults = async () => {
    try {
      const response = await api.get('/challenges/user-results');
      setResults(response.data.results);
      
      // Show confetti if user completed all challenges
      if (response.data.results.completed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceGrade = () => {
    if (!results) return 'N/A';
    
    const { completionPercentage, timeUsed, totalTimeLimit } = results;
    const timeEfficiency = ((totalTimeLimit - timeUsed) / totalTimeLimit) * 100;
    
    if (completionPercentage === 100 && timeEfficiency > 50) return 'A+';
    if (completionPercentage >= 90) return 'A';
    if (completionPercentage >= 80) return 'B+';
    if (completionPercentage >= 70) return 'B';
    if (completionPercentage >= 60) return 'C+';
    if (completionPercentage >= 50) return 'C';
    return 'D';
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': case 'A': return 'text-green-500';
      case 'B+': case 'B': return 'text-blue-500';
      case 'C+': case 'C': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  const downloadCertificate = () => {
    // This would generate a PDF certificate
    alert('Certificate download feature coming soon!');
  };

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CTF Challenge Results',
        text: `I just completed the CTF Challenge! Score: ${results.finalScore}, Grade: ${getPerformanceGrade()}`,
        url: window.location.origin
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `I just completed the CTF Challenge! Score: ${results.finalScore}, Grade: ${getPerformanceGrade()}`;
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  const handleBackToHome = () => {
    logout();
    history.push('/login');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${
        isDark ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
               : 'bg-gradient-to-br from-blue-900 via-purple-900 to-violet-900'
      } flex justify-center items-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading Results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`min-h-screen ${
        isDark ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
               : 'bg-gradient-to-br from-blue-900 via-purple-900 to-violet-900'
      } flex justify-center items-center`}>
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
          <button
            onClick={() => history.push('/login')}
            className="bg-white text-purple-900 px-6 py-2 rounded-lg hover:bg-gray-100"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const grade = getPerformanceGrade();

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
             : 'bg-gradient-to-br from-blue-900 via-purple-900 to-violet-900'
    } py-8 px-4 relative overflow-hidden`}>
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute transform -rotate-45 bg-white w-96 h-96 rounded-full -top-20 -left-20" />
        <div className="absolute transform rotate-45 bg-white w-96 h-96 rounded-full -bottom-20 -right-20" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <FaTrophy className="mx-auto text-yellow-400 mb-4" size={80} />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {results.completed ? 'Congratulations!' : 'Challenge Complete!'}
            </h1>
            <p className="text-purple-200 text-xl">
              {results.completed 
                ? 'You have successfully completed all challenges!' 
                : results.timeExpired 
                  ? 'Time expired, but great effort!' 
                  : 'Challenge session ended'}
            </p>
          </div>
        </div>

        {/* Results Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Final Score */}
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 text-center">
            <FaTrophy className="mx-auto text-yellow-400 mb-3" size={32} />
            <h3 className="text-white/70 text-sm uppercase tracking-wide mb-2">Final Score</h3>
            <p className="text-3xl font-bold text-yellow-400">{results.finalScore}</p>
          </div>

          {/* Grade */}
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 text-center">
            <FaStar className="mx-auto text-purple-400 mb-3" size={32} />
            <h3 className="text-white/70 text-sm uppercase tracking-wide mb-2">Grade</h3>
            <p className={`text-3xl font-bold ${getGradeColor(grade)}`}>{grade}</p>
          </div>

          {/* Completion Rate */}
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 text-center">
            <FaChartLine className="mx-auto text-green-400 mb-3" size={32} />
            <h3 className="text-white/70 text-sm uppercase tracking-wide mb-2">Completion</h3>
            <p className="text-3xl font-bold text-green-400">{results.completionPercentage}%</p>
          </div>

          {/* Time Used */}
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 text-center">
            <FaClock className="mx-auto text-blue-400 mb-3" size={32} />
            <h3 className="text-white/70 text-sm uppercase tracking-wide mb-2">Time Used</h3>
            <p className="text-xl font-bold text-blue-400">{formatTimeDetailed(results.timeUsed)}</p>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Detailed Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Performance Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Levels Completed</span>
                  <span className="text-white font-bold">
                    {results.completedLevels} / {results.totalChallenges}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Total Attempts</span>
                  <span className="text-white font-bold">{results.totalAttempts}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Hints Used</span>
                  <span className="text-white font-bold">{results.hintsUsed}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Accuracy Rate</span>
                  <span className="text-white font-bold">
                    {results.totalAttempts > 0 
                      ? Math.round((results.completedLevels / results.totalAttempts) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Time Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Time Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Start Time</span>
                  <span className="text-white font-bold">
                    {new Date(results.startTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">End Time</span>
                  <span className="text-white font-bold">
                    {new Date(results.endTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Total Duration</span>
                  <span className="text-white font-bold">
                    {formatTimeDetailed(results.timeUsed)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Time Efficiency</span>
                  <span className="text-white font-bold">
                    {Math.round(((results.totalTimeLimit - results.timeUsed) / results.totalTimeLimit) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70">Overall Progress</span>
              <span className="text-white font-bold">{results.completionPercentage}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${results.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Achievement Badge */}
        {results.completed && (
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-lg rounded-xl border border-yellow-400/30 p-6 mb-8 text-center">
            <FaTrophy className="mx-auto text-yellow-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-yellow-400 mb-2">🎉 CHALLENGE MASTER 🎉</h3>
            <p className="text-white/90">
              You have successfully completed all challenges within the time limit!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadCertificate}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            <FaDownload className="mr-2" />
            Download Certificate
          </button>
          
          <button
            onClick={shareResults}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            <FaShare className="mr-2" />
            Share Results
          </button>
          
          <button
            onClick={handleBackToHome}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            <FaHome className="mr-2" />
            Back to Home
          </button>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-white/70">
            Thank you for participating in the CTF Challenge! 
            {results.completed 
              ? ' You are a true champion!' 
              : ' Keep practicing and come back stronger!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;