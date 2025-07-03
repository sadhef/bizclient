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
  FiInfo,
  FiXCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiZap,
  FiShield,
  FiActivity,
  FiBarChart,
  FiCalendar,
  FiMapPin
} from 'react-icons/fi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, isAdmin, isApproved } = useAuth();
  const history = useHistory();
  const [challengeStatus, setChallengeStatus] = useState(null);
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [canStartInfo, setCanStartInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Enhanced timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerColor, setTimerColor] = useState('text-green-500');

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Enhanced timer effect with color changes
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          const newTime = prevTime - 1;
          
          // Update timer color based on remaining time
          if (newTime > 300) {
            setTimerColor('text-green-500 dark:text-green-400');
          } else if (newTime > 60) {
            setTimerColor('text-yellow-500 dark:text-yellow-400');
          } else {
            setTimerColor('text-red-500 dark:text-red-400');
          }
          
          if (newTime <= 0) {
            setTimerActive(false);
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load challenge info for all users
      const infoResponse = await challengeAPI.getChallengeInfo();
      setChallengeInfo(infoResponse.data);
      
      // Load challenge status for approved users
      if (isApproved() || isAdmin()) {
        try {
          const statusResponse = await challengeAPI.getStatus();
          setChallengeStatus(statusResponse.data);
          
          // Set timer values
          const timeLeft = statusResponse.data.timeRemaining || 0;
          setTimeRemaining(timeLeft);
          setTimerActive(statusResponse.data.isActive && statusResponse.data.hasStarted);
          
          // Set initial timer color
          if (timeLeft > 300) {
            setTimerColor('text-green-500 dark:text-green-400');
          } else if (timeLeft > 60) {
            setTimerColor('text-yellow-500 dark:text-yellow-400');
          } else {
            setTimerColor('text-red-500 dark:text-red-400');
          }
          
        } catch (error) {
          console.error('Error loading challenge status:', error);
        }

        // Check if user can start challenge
        try {
          const canStartResponse = await challengeAPI.getCanStart();
          setCanStartInfo(canStartResponse.data);
        } catch (error) {
          console.error('Error checking start eligibility:', error);
        }
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
      const response = await challengeAPI.startChallenge();
      
      if (response.data.alreadyStarted) {
        toast.info('Challenge already in progress');
      } else {
        toast.success('Challenge started successfully!');
      }
      
      await loadDashboardData();
      history.push('/challenge');
    } catch (error) {
      console.error('Error starting challenge:', error);
      
      if (error.response?.data?.code === 'CHALLENGE_ALREADY_ENDED') {
        setCanStartInfo({
          canStart: false,
          reason: error.response.data.error,
          hasStarted: true,
          isCompleted: error.response.data.reason === 'completed',
          isExpired: error.response.data.reason === 'expired'
        });
        toast.error(error.response.data.error);
      }
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

  const getProgressPercentage = () => {
    if (!challengeStatus || !challengeInfo) return 0;
    const completed = challengeStatus.completedLevels?.length || 0;
    const total = challengeInfo.totalLevels || 1;
    return Math.round((completed / total) * 100);
  };

  const StatCard = ({ icon: Icon, label, value, description, color = "text-black dark:text-white", bgColor = "bg-white dark:bg-gray-950" }) => (
    <div className={`card-enhanced group ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl ${bgColor === "bg-white dark:bg-gray-950" ? "bg-gray-100 dark:bg-gray-800" : "bg-white/20 dark:bg-black/20"} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</p>
              <p className={`text-xl font-black ${color} leading-none`}>{value}</p>
            </div>
          </div>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <LoadingSpinner message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-700 dark:from-white dark:to-gray-300 rounded-xl flex items-center justify-center">
                  <span className="text-white dark:text-black text-xl font-black">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white leading-none">
                    Welcome back,
                  </h1>
                  <p className="text-xl md:text-2xl font-light text-gray-600 dark:text-gray-400">
                    {user?.username}
                  </p>
                </div>
              </div>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl">
                {isAdmin() 
                  ? 'Monitor and manage your CTF platform from the admin dashboard.' 
                  : isApproved()
                  ? 'Ready to tackle some cybersecurity challenges? Your journey to mastery continues here.'
                  : 'Your account is pending approval. Once approved, you\'ll gain access to all challenges.'
                }
              </p>
            </div>
            
            {/* Quick action button */}
            <div className="hidden lg:block">
              {isAdmin() ? (
                <button
                  onClick={() => history.push('/admin')}
                  className="btn-professional-primary group"
                >
                  <FiShield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Admin Portal
                </button>
              ) : challengeStatus?.isActive && timerActive ? (
                <button
                  onClick={() => history.push('/challenge')}
                  className="btn-professional-primary group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <FiZap className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">Continue Challenge</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FiUser}
            label="Account Status"
            value={isAdmin() ? 'Administrator' : isApproved() ? 'Active' : 'Pending'}
            description={isAdmin() ? 'Full system access' : isApproved() ? 'Challenge access enabled' : 'Awaiting admin approval'}
            color={isAdmin() ? 'text-red-500' : isApproved() ? 'text-green-500' : 'text-yellow-500'}
          />
          
          {(isApproved() || isAdmin()) && challengeStatus && (
            <>
              <StatCard
                icon={FiTarget}
                label="Current Level"
                value={challengeStatus.currentLevel || 1}
                description={`${challengeStatus.completedLevels?.length || 0} levels completed`}
                color="text-blue-500 dark:text-blue-400"
              />
              
              <StatCard
                icon={FiFlag}
                label="Total Attempts"
                value={challengeStatus.totalAttempts || 0}
                description="Submission count"
                color="text-purple-500 dark:text-purple-400"
              />
              
              {challengeStatus.hasStarted && (
                <StatCard
                  icon={FiClock}
                  label="Time Remaining"
                  value={timerActive ? formatTime(timeRemaining) : 'Inactive'}
                  description={timerActive ? 'Live countdown' : 'Timer stopped'}
                  color={timerActive ? timerColor : 'text-gray-500 dark:text-gray-400'}
                />
              )}
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Primary Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Challenge Status Card */}
            <div className="card-enhanced">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-700 dark:from-white dark:to-gray-300 rounded-xl flex items-center justify-center">
                  <FiAward className="w-6 h-6 text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black dark:text-white">
                    Challenge Hub
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your cybersecurity challenge dashboard
                  </p>
                </div>
              </div>

              {!isApproved() && !isAdmin() ? (
                /* Pending Approval State */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl mb-4">
                    <FiAlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                    Account Pending Approval
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                    Your account is currently under review by our administrators. 
                    You'll receive access to challenges once your account is approved.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FiInfo className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2 text-sm">
                          What happens next?
                        </h4>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                          <li>• Administrators will review your account within 24-48 hours</li>
                          <li>• You'll receive email notification once approved</li>
                          <li>• Full challenge access will be enabled immediately</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !challengeInfo?.challengeActive ? (
                /* Challenge Inactive State */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                    <FiPause className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                    Challenge Platform Inactive
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    The challenge platform is currently offline. Check back later for updates.
                  </p>
                </div>
              ) : challengeStatus?.isCompleted || challengeStatus?.isExpired ? (
                /* Challenge Completed/Expired State */
                <div className="text-center py-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                    challengeStatus.isCompleted 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {challengeStatus.isCompleted ? (
                      <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    ) : (
                      <FiXCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                    {challengeStatus.isCompleted ? 'Challenge Completed!' : 'Challenge Expired'}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    {challengeStatus.isCompleted 
                      ? 'Congratulations! You have successfully completed all challenge levels.'
                      : 'Your challenge time has expired. Contact an admin to reset your progress.'
                    }
                  </p>

                  {/* Results Summary */}
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-black dark:text-white mb-1">
                        {challengeStatus?.completedLevels?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Levels Completed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-black dark:text-white mb-1">
                        {challengeStatus?.totalAttempts || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Total Attempts
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => history.push('/thank-you')}
                      className="btn-professional-primary"
                    >
                      <FiAward className="w-4 h-4" />
                      View Results
                    </button>
                    {!challengeStatus.isCompleted && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Need to restart? Contact an administrator
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : challengeStatus?.hasStarted ? (
                /* Challenge In Progress State */
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-black dark:text-white mb-1">
                        Challenge in Progress
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Level {challengeStatus.currentLevel} of {challengeInfo?.totalLevels}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      timerActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {timerActive ? 'ACTIVE' : 'EXPIRED'}
                    </div>
                  </div>

                  {/* Live Timer Display */}
                  {timerActive && timeRemaining > 0 && (
                    <div className="bg-gradient-to-r from-black/5 via-transparent to-black/5 dark:from-white/5 dark:via-transparent dark:to-white/5 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Remaining</p>
                          <div className={`text-2xl font-black ${timerColor} flex items-center gap-2`}>
                            <FiClock className="w-6 h-6" />
                            <span>{formatTime(timeRemaining)}</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-16 relative">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-gray-200 dark:text-gray-700"
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

                  {/* Progress Section */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      <span>Challenge Progress</span>
                      <span>{getProgressPercentage()}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{challengeStatus.completedLevels?.length || 0} completed</span>
                      <span>{challengeInfo?.totalLevels || 0} total levels</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => history.push('/challenge')}
                    className="btn-professional-primary w-full group relative overflow-hidden"
                    disabled={!timerActive}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <FiTarget className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">
                      {timerActive ? 'Continue Challenge' : 'Challenge Expired'}
                    </span>
                  </button>
                </div>
              ) : canStartInfo && !canStartInfo.canStart ? (
                /* Cannot Start State */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
                    <FiXCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                    Cannot Start Challenge
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    {canStartInfo.reason}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FiRefreshCw className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-1 text-sm">
                          Need a Reset?
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Contact an administrator to reset your challenge progress and try again.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Ready to Start State */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-black to-gray-700 dark:from-white dark:to-gray-300 rounded-2xl mb-4 group-hover:scale-105 transition-transform duration-300">
                    <FiPlay className="w-8 h-8 text-white dark:text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                    Ready to Begin
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                    Start your cybersecurity challenge journey with {challengeInfo?.totalLevels} progressively challenging levels.
                  </p>
                  
                  {/* Challenge preview */}
                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
                    <div className="text-center">
                      <div className="text-xl font-black text-black dark:text-white mb-1">
                        {challengeInfo?.totalLevels || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Levels</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black text-black dark:text-white mb-1">
                        {challengeInfo?.timeLimit || 'N/A'}m
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Time Limit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black text-black dark:text-white mb-1">
                        ∞
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Attempts</div>
                    </div>
                  </div>

                  <button
                    onClick={startChallenge}
                    className="btn-professional-primary group relative overflow-hidden"
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {loading ? (
                      <>
                        <div className="loading-spinner relative z-10" />
                        <span className="relative z-10">Starting...</span>
                      </>
                    ) : (
                      <>
                        <FiZap className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                        <span className="relative z-10">Start Challenge</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {(isApproved() || isAdmin()) && challengeStatus && (
              <div className="card-enhanced">
                <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                  Quick Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-blue-500 dark:text-blue-400 mb-1">
                      {challengeStatus.currentLevel}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Current Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-500 dark:text-green-400 mb-1">
                      {challengeStatus.completedLevels?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-purple-500 dark:text-purple-400 mb-1">
                      {challengeStatus.totalAttempts || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Attempts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-orange-500 dark:text-orange-400 mb-1">
                      {getProgressPercentage()}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Progress</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Challenge Info */}
            <div className="card-enhanced">
              <div className="flex items-center gap-2 mb-4">
                <FiInfo className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <h3 className="text-base font-bold text-black dark:text-white">
                  Platform Info
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Challenge Title</div>
                  <div className="font-semibold text-black dark:text-white text-sm">
                    {challengeInfo?.challengeTitle || 'BizTras CTF Challenge'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Levels</div>
                  <div className="font-semibold text-black dark:text-white text-sm">
                    {challengeInfo?.totalLevels || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Limit</div>
                  <div className="font-semibold text-black dark:text-white text-sm">
                    {challengeInfo?.timeLimit ? `${challengeInfo.timeLimit} minutes` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Platform Status</div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    challengeInfo?.challengeActive 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      challengeInfo?.challengeActive ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {challengeInfo?.challengeActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Timer Widget */}
            {challengeStatus?.hasStarted && timerActive && timeRemaining > 0 && (
              <div className="card-enhanced bg-gradient-to-br from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black">
                <div className="text-center">
                  <h3 className="text-base font-bold mb-3 flex items-center justify-center gap-2">
                    <FiClock className="w-4 h-4" />
                    Live Challenge Timer
                  </h3>
                  <div className="text-3xl font-black mb-3">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="w-full bg-white/20 dark:bg-black/20 rounded-full h-1.5 mb-3">
                    <div 
                      className="bg-white dark:bg-black h-1.5 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, (timeRemaining / 3600) * 100))}%` 
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs opacity-80">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span>Live Updates</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card-enhanced">
              <h3 className="text-base font-bold text-black dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {isAdmin() ? (
                  <>
                    <button
                      onClick={() => history.push('/admin')}
                      className="btn-professional-secondary w-full justify-start text-sm"
                    >
                      <FiShield className="w-4 h-4" />
                      Admin Dashboard
                    </button>
                    <button
                      onClick={() => history.push('/admin?tab=users')}
                      className="btn-professional-ghost w-full justify-start text-sm"
                    >
                      <FiUser className="w-4 h-4" />
                      Manage Users
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => history.push('/challenges')}
                      className="btn-professional-secondary w-full justify-start text-sm"
                    >
                      <FiTarget className="w-4 h-4" />
                      View Challenges
                    </button>
                    {challengeStatus?.hasStarted && challengeStatus?.isActive && (
                      <button
                        onClick={() => history.push('/challenge')}
                        className="btn-professional-primary w-full justify-start text-sm"
                      >
                        <FiPlay className="w-4 h-4" />
                        Current Challenge
                      </button>
                    )}
                    <button
                      onClick={() => history.push('/profile')}
                      className="btn-professional-ghost w-full justify-start text-sm"
                    >
                      <FiUser className="w-4 h-4" />
                      My Profile
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Achievement Badge */}
            {challengeStatus?.isCompleted && (
              <div className="card-enhanced bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mb-3">
                    <FiAward className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-black dark:text-white mb-1 text-sm">
                    CTF Champion!
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    You've conquered all challenge levels
                  </p>
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