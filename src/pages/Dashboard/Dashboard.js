import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { challengeAPI } from '../../services/api';
import { 
  FiTarget, 
  FiClock, 
  FiAward, 
  FiUser, 
  FiFlag,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user, isAdmin, isApproved } = useAuth();
  const history = useHistory();
  const [challengeStatus, setChallengeStatus] = useState(null);
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Simple timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Simple timer effect
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          const newTime = prevTime - 1;
          
          if (newTime <= 0) {
            history.push('/thank-you');
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load challenge info for all users
      const infoResponse = await challengeAPI.getChallengeInfo();
      setChallengeInfo(infoResponse.data);
      
      // Load challenge status for approved users
      if (isApproved() || isAdmin()) {
        const statusResponse = await challengeAPI.getStatus();
        setChallengeStatus(statusResponse.data);
        
        // Set timer values
        const timeLeft = statusResponse.data.timeRemaining || 0;
        setTimeRemaining(timeLeft);
        setTimerActive(statusResponse.data.isActive && statusResponse.data.hasStarted);
        
        console.log('Dashboard timer initialized:', {
          timeRemaining: timeLeft,
          isActive: statusResponse.data.isActive,
          hasStarted: statusResponse.data.hasStarted
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async () => {
    try {
      setLoading(true);
      await challengeAPI.startChallenge();
      await loadDashboardData();
      history.push('/challenge');
    } catch (error) {
      console.error('Error starting challenge:', error);
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

  const getTimeColor = () => {
    if (timeRemaining > 300) return 'text-green-600 dark:text-green-400';
    if (timeRemaining > 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  console.log('Dashboard render:', { timeRemaining, timerActive });

  if (loading) {
    return (
      <div className="min-h-screen bg-light-primary dark:bg-dark-primary">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light-primary dark:text-dark-primary mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-light-secondary dark:text-dark-secondary">
            {isAdmin() ? 'Admin Dashboard - Manage your CTF platform' : 'Ready to take on the challenge?'}
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User Status */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-secondary dark:text-dark-secondary">Status</p>
                <p className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                  {isAdmin() ? 'Administrator' : isApproved() ? 'Approved' : 'Pending Approval'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                isAdmin() ? 'bg-purple-100 dark:bg-purple-900/30' :
                isApproved() ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                <FiUser className={`w-6 h-6 ${
                  isAdmin() ? 'text-purple-600 dark:text-purple-400' :
                  isApproved() ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                }`} />
              </div>
            </div>
          </div>

          {/* Current Level */}
          {(isApproved() || isAdmin()) && (
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">Current Level</p>
                  <p className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    Level {challengeStatus?.currentLevel || 1}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/30">
                  <FiTarget className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </div>
          )}

          {/* Time Remaining */}
          {challengeStatus?.hasStarted && (
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">Time Remaining</p>
                  <div className="flex items-center gap-2">
                    {/* Force re-render with timestamp key */}
                    <p className={`text-lg font-semibold ${getTimeColor()}`} key={`time-${timeRemaining}-${Math.floor(Date.now()/1000)}`}>
                      {formatTime(timeRemaining)}
                    </p>
                    {timerActive && timeRemaining > 0 && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <FiClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          )}

          {/* Attempts */}
          {(isApproved() || isAdmin()) && (
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">Total Attempts</p>
                  <p className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                    {challengeStatus?.totalAttempts || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <FiFlag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Challenge Status */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <FiAward className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                <h2 className="text-xl font-bold text-light-primary dark:text-dark-primary">
                  Challenge Status
                </h2>
              </div>

              {!isApproved() && !isAdmin() ? (
                /* Pending Approval */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                    <FiAlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                    Account Pending Approval
                  </h3>
                  <p className="text-light-secondary dark:text-dark-secondary mb-4">
                    Your account is waiting for admin approval before you can access challenges.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You will receive access once an administrator approves your account. 
                      Please be patient while we review your registration.
                    </p>
                  </div>
                </div>
              ) : !challengeInfo?.challengeActive ? (
                /* Challenge Inactive */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <FiPause className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                    Challenge Not Active
                  </h3>
                  <p className="text-light-secondary dark:text-dark-secondary">
                    The challenge is currently not active. Please check back later.
                  </p>
                </div>
              ) : challengeStatus?.isCompleted ? (
                /* Challenge Completed */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                    <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                    Challenge Completed!
                  </h3>
                  <p className="text-light-secondary dark:text-dark-secondary mb-4">
                    Congratulations! You have successfully completed all challenge levels.
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {challengeStatus?.completedLevels?.length || 0}
                      </p>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary">
                        Levels Completed
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {challengeStatus?.totalAttempts || 0}
                      </p>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary">
                        Total Attempts
                      </p>
                    </div>
                  </div>
                </div>
              ) : challengeStatus?.hasStarted ? (
                /* Challenge In Progress */
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                        Challenge In Progress
                      </h3>
                      <p className="text-light-secondary dark:text-dark-secondary">
                        Level {challengeStatus.currentLevel} of {challengeInfo?.totalLevels}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      timerActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {timerActive ? 'Active' : 'Expired'}
                    </div>
                  </div>

                  {/* Live Timer Display */}
                  {timerActive && timeRemaining > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Time Remaining</p>
                          <div className={`text-2xl font-bold ${getTimeColor()} flex items-center gap-2`}>
                            <FiClock className="w-5 h-5" />
                            {/* Live countdown with forced re-render */}
                            <span key={`main-timer-${timeRemaining}-${Math.floor(Date.now()/1000)}`}>
                              {formatTime(timeRemaining)}
                            </span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-16 relative">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-gray-300 dark:text-gray-600"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={timeRemaining > 300 ? 'text-green-500' : timeRemaining > 60 ? 'text-yellow-500' : 'text-red-500'}
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${Math.max(0, (timeRemaining / 3600) * 100)}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-light-secondary dark:text-dark-secondary mb-2">
                      <span>Progress</span>
                      <span>
                        {challengeStatus.completedLevels?.length || 0} / {challengeInfo?.totalLevels} levels
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((challengeStatus.completedLevels?.length || 0) / (challengeInfo?.totalLevels || 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => history.push('/challenge')}
                    className="btn-primary w-full"
                    disabled={!timerActive}
                  >
                    {timerActive ? 'Continue Challenge' : 'Challenge Expired'}
                  </button>
                </div>
              ) : (
                /* Ready to Start */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full mb-4">
                    <FiPlay className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-2">
                    Ready to Start
                  </h3>
                  <p className="text-light-secondary dark:text-dark-secondary mb-6">
                    Begin your CTF journey with {challengeInfo?.totalLevels} challenging levels.
                  </p>
                  <button
                    onClick={startChallenge}
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Starting...' : 'Start Challenge'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary">
                  Challenge Info
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">Title</p>
                  <p className="font-medium text-light-primary dark:text-dark-primary">
                    {challengeInfo?.challengeTitle || 'BizTras CTF Challenge'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">Total Levels</p>
                  <p className="font-medium text-light-primary dark:text-dark-primary">
                    {challengeInfo?.totalLevels || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-light-secondary dark:text-dark-secondary">Time Limit</p>
                  <p className="font-medium text-light-primary dark:text-dark-primary">
                    {challengeInfo?.timeLimit ? `${challengeInfo.timeLimit} minutes` : 'N/A'}
                  </p>
                </div>
                {challengeInfo?.challengeDescription && (
                  <div>
                    <p className="text-sm text-light-secondary dark:text-dark-secondary">Description</p>
                    <p className="text-sm text-light-primary dark:text-dark-primary">
                      {challengeInfo.challengeDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Timer Widget for Active Challenges */}
            {challengeStatus?.hasStarted && timerActive && timeRemaining > 0 && (
              <div className="card border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-3 flex items-center justify-center gap-2">
                    <FiClock className="w-5 h-5" />
                    Live Timer
                  </h3>
                  {/* Large live countdown display */}
                  <div className={`text-4xl font-bold ${getTimeColor()} mb-3`} key={`widget-timer-${timeRemaining}-${Math.floor(Date.now()/1000)}`}>
                    {formatTime(timeRemaining)}
                  </div>
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
                  <p className="text-xs text-light-secondary dark:text-dark-secondary flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live Countdown Active
                  </p>
                  <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-700">
                    <p className="text-xs text-violet-600 dark:text-violet-400">
                      ⚡ Updates every second
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions for Admins */}
            {isAdmin() && (
              <div className="card">
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => history.push('/admin')}
                    className="btn-secondary w-full"
                  >
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => history.push('/admin?tab=users')}
                    className="btn-secondary w-full"
                  >
                    Manage Users
                  </button>
                  <button
                    onClick={() => history.push('/admin?tab=challenges')}
                    className="btn-secondary w-full"
                  >
                    Manage Challenges
                  </button>
                </div>
              </div>
            )}

            {/* Quick Navigation for Users */}
            {!isAdmin() && isApproved() && (
              <div className="card">
                <h3 className="text-lg font-semibold text-light-primary dark:text-dark-primary mb-4">
                  Quick Navigation
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => history.push('/challenges')}
                    className="btn-secondary w-full"
                  >
                    View All Challenges
                  </button>
                  {challengeStatus?.hasStarted && (
                    <button
                      onClick={() => history.push('/challenge')}
                      className="btn-secondary w-full"
                    >
                      Current Challenge
                    </button>
                  )}
                  <button
                    onClick={() => history.push('/profile')}
                    className="btn-secondary w-full"
                  >
                    My Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;