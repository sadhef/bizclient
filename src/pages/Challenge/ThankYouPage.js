import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { challengeAPI } from '../../services/api';
import { 
  FiAward, 
  FiClock, 
  FiTarget, 
  FiFlag, 
  FiStar, 
  FiArrowRight,
  FiDownload,
  FiShare2
} from 'react-icons/fi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ThankYouPage = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [challengeStatus, setChallengeStatus] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    loadThankYouData();
  }, []);

  const loadThankYouData = async () => {
    try {
      setLoading(true);
      
      // Load user's challenge status
      const statusResponse = await challengeAPI.getStatus();
      setChallengeStatus(statusResponse.data);
      
      // Calculate user stats
      const stats = {
        completedLevels: statusResponse.data.completedLevels?.length || 0,
        totalAttempts: statusResponse.data.totalAttempts || 0,
        timeSpent: statusResponse.data.challengeStartTime && statusResponse.data.challengeEndTime
          ? Math.floor((new Date(statusResponse.data.challengeEndTime) - new Date(statusResponse.data.challengeStartTime)) / 1000)
          : 0,
        isCompleted: statusResponse.data.isCompleted || false
      };
      setUserStats(stats);
      
      // Load leaderboard
      try {
        const leaderboardResponse = await challengeAPI.getLeaderboard(10);
        setLeaderboard(leaderboardResponse.data.leaderboard);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      }
      
    } catch (error) {
      console.error('Error loading thank you data:', error);
    } finally {
      setLoading(false);
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

  const getPerformanceRating = () => {
    if (!userStats) return 'Good Try!';
    
    if (userStats.isCompleted) {
      if (userStats.totalAttempts <= 5) return 'Excellent!';
      if (userStats.totalAttempts <= 10) return 'Great!';
      if (userStats.totalAttempts <= 20) return 'Good!';
      return 'Well Done!';
    } else {
      if (userStats.completedLevels >= 1) return 'Good Progress!';
      return 'Keep Trying!';
    }
  };

  const shareResults = () => {
    const text = `I just completed ${userStats?.completedLevels || 0} level(s) in the BizTras CTF Challenge! ${userStats?.isCompleted ? '🏆 Full completion!' : '💪 Making progress!'}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'BizTras CTF Challenge Results',
        text: text,
        url: window.location.origin
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard!');
      });
    }
  };

  const downloadCertificate = () => {
    // This would generate a PDF certificate
    // For now, we'll just show an alert
    alert('Certificate download feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <LoadingSpinner message="Loading your results..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black dark:bg-white rounded-full mb-6">
            <FiAward className="w-10 h-10 text-white dark:text-black" />
          </div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
            {userStats?.isCompleted ? 'Congratulations!' : 'Thank You for Participating!'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {userStats?.isCompleted 
              ? 'You have successfully completed the BizTras CTF Challenge!'
              : 'Your challenge session has ended.'}
          </p>
          <p className="text-lg text-black dark:text-white font-semibold">
            {getPerformanceRating()}
          </p>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <FiTarget className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white mb-2">
              {userStats?.completedLevels || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Levels Completed
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <FiFlag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white mb-2">
              {userStats?.totalAttempts || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Attempts
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <FiClock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white mb-2">
              {userStats?.timeSpent ? formatTime(userStats.timeSpent) : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Time Spent
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
              <FiStar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white mb-2">
              {userStats?.isCompleted ? 'Complete' : 'Partial'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Status
            </p>
          </div>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-12">
            <h3 className="text-xl font-bold text-black dark:text-white mb-6 text-center">
              🏆 Leaderboard
            </h3>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry._id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.username === user?.username
                      ? 'bg-black dark:bg-white text-white dark:text-black border border-gray-300 dark:border-gray-600'
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        entry.username === user?.username
                          ? 'text-white dark:text-black'
                          : 'text-black dark:text-white'
                      }`}>
                        {entry.username}
                        {entry.username === user?.username && ' (You)'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      entry.username === user?.username
                        ? 'text-white dark:text-black'
                        : 'text-black dark:text-white'
                    }`}>
                      {entry.completedCount} levels
                    </p>
                    <p className={`text-sm ${
                      entry.username === user?.username
                        ? 'text-gray-200 dark:text-gray-800'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {entry.totalAttempts} attempts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message from Organizers */}
        <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center mb-12">
          <h3 className="text-xl font-bold text-black dark:text-white mb-4">
            Thank You for Participating!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            We hope you enjoyed the BizTras CTF Challenge! Whether you completed all levels or just started your journey, 
            you've taken an important step in improving your cybersecurity skills. Keep learning, keep practicing, 
            and remember that every expert was once a beginner.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => history.push('/dashboard')}
              className="flex items-center gap-2 px-6 py-3 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              <FiArrowRight className="w-4 h-4" />
              Back to Dashboard
            </button>
            {!userStats?.isCompleted && challengeStatus?.challengeActive && (
              <button
                onClick={() => history.push('/challenge')}
                className="flex items-center gap-2 px-6 py-3 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <FiTarget className="w-4 h-4" />
                Try Again
              </button>
            )}
          </div>
        </div>

        {/* Share and Download Section */}
        <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center">
          <h3 className="text-lg font-bold text-black dark:text-white mb-4">
            Share Your Achievement
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={shareResults}
              className="flex items-center gap-2 px-6 py-3 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FiShare2 className="w-4 h-4" />
              Share Results
            </button>
            {userStats?.isCompleted && (
              <button
                onClick={downloadCertificate}
                className="flex items-center gap-2 px-6 py-3 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Download Certificate
              </button>
            )}
          </div>
          {userStats?.isCompleted && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Certificate feature coming soon!
            </p>
          )}
        </div>

        {/* Achievement Badge for Completed Users */}
        {userStats?.isCompleted && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mb-4">
                <FiAward className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                🎉 CTF Champion! 🎉
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 max-w-md mx-auto">
                You've successfully completed all challenge levels! Your dedication to cybersecurity excellence is commendable.
              </p>
            </div>
          </div>
        )}

        {/* Progress Summary for Partial Completion */}
        {!userStats?.isCompleted && userStats?.completedLevels > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
                <FiTarget className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                Great Progress!
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 max-w-md mx-auto">
                You've completed {userStats.completedLevels} level{userStats.completedLevels !== 1 ? 's' : ''}! 
                Every step forward in cybersecurity knowledge counts. Keep learning and come back to continue your journey.
              </p>
            </div>
          </div>
        )}

        {/* Encouragement for New Participants */}
        {!userStats?.completedLevels && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 dark:from-gray-300 dark:to-gray-500 rounded-full mb-4">
                <FiStar className="w-8 h-8 text-white dark:text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Thanks for Trying!
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 max-w-md mx-auto">
                Every cybersecurity expert started somewhere. The fact that you participated shows your interest in security. 
                Keep learning, and don't hesitate to try again when you feel ready!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThankYouPage;