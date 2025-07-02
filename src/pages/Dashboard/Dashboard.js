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
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Timer for countdown
  useEffect(() => {
    let interval;
    if (challengeStatus?.timeRemaining > 0 && challengeStatus?.isActive) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time expired, redirect to thank you page
            history.push('/thank-you');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [challengeStatus, history]);

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
        setTimeRemaining(statusResponse.data.timeRemaining || 0);
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
                  <p className={`text-lg font-semibold ${
                    timeRemaining > 300 ? 'text-green-600 dark:text-green-400' :
                    timeRemaining > 60 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {formatTime(timeRemaining)}
                  </p>
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
                      challengeStatus.isActive 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {challengeStatus.isActive ? 'Active' : 'Expired'}
                    </div>
                  </div>

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
                    disabled={!challengeStatus.isActive}
                  >
                    {challengeStatus.isActive ? 'Continue Challenge' : 'Challenge Expired'}
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