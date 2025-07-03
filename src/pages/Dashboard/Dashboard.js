import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { challengeAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Clock, 
  Award, 
  User, 
  Flag,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  RefreshCw,
  Shield,
  Zap,
  Trophy,
  Timer,
  Activity
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Progress,
  Separator
} from '../../components/ui';
import { 
  FloatingElement, 
  GlowingButton, 
  ParticleBackground,
  AnimatedGridPattern,
  AnimatedProgressRing,
  NumberTicker,
  PulsingDot,
  TypewriterEffect,
  AnimatedCounter,
  GradientBorderCard
} from '../../components/magicui';
import { cn, formatTime, getTimeColor } from '../../lib/utils';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, isAdmin, isApproved } = useAuth();
  const history = useHistory();
  const [challengeStatus, setChallengeStatus] = useState(null);
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [canStartInfo, setCanStartInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    loadDashboardData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-black/30 dark:border-white/30 border-t-black dark:border-t-white rounded-full mx-auto mb-4"
          />
          <TypewriterEffect 
            words={['Loading', 'dashboard...']}
            className="text-xl text-black dark:text-white"
            delay={100}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-gray-800 p-6 relative overflow-hidden">
      {/* Background Effects */}
      <ParticleBackground particleCount={20} />
      <AnimatedGridPattern className="opacity-5" />
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-black/5 dark:bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Header */}
        <FloatingElement delay={0} className="mb-8">
          <div className="text-center lg:text-left">
            <motion.h1 
              className="text-4xl lg:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-black dark:text-white">
                Welcome back,{' '}
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {user?.username}!
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isAdmin() ? (
                <TypewriterEffect 
                  words={['Admin', 'Dashboard', '-', 'Manage', 'your', 'CTF', 'platform']}
                  delay={50}
                />
              ) : (
                <TypewriterEffect 
                  words={['Ready', 'to', 'take', 'on', 'the', 'challenge?']}
                  delay={50}
                />
              )}
            </motion.p>
          </div>
        </FloatingElement>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User Status Card */}
          <FloatingElement delay={0.1}>
            <Card className="h-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      <AnimatedCounter value={isAdmin() ? 'Administrator' : isApproved() ? 'Approved' : 'Pending Approval'} />
                    </p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-xl",
                    isAdmin() ? 'bg-black/10 dark:bg-white/10' :
                    isApproved() ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                  )}>
                    <User className={cn(
                      "w-6 h-6",
                      isAdmin() ? 'text-black dark:text-white' :
                      isApproved() ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                    )} />
                  </div>
                </div>
                <div className="mt-3">
                  <Badge 
                    variant={isAdmin() ? 'default' : isApproved() ? 'success' : 'warning'}
                    className="text-xs"
                  >
                    {isAdmin() ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin Access
                      </>
                    ) : isApproved() ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Full Access
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Awaiting Approval
                      </>
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </FloatingElement>

          {/* Current Level Card */}
          {(isApproved() || isAdmin()) && (
            <FloatingElement delay={0.2}>
              <Card className="h-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Level</p>
                      <p className="text-2xl font-bold text-black dark:text-white">
                        <NumberTicker value={challengeStatus?.currentLevel || 1} />
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/10 dark:bg-white/10">
                      <Target className="w-6 h-6 text-black dark:text-white" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center">
                    <Progress 
                      value={((challengeStatus?.currentLevel || 1) / (challengeInfo?.totalLevels || 1)) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                      {challengeStatus?.currentLevel || 1}/{challengeInfo?.totalLevels || 1}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>
          )}

          {/* Time Remaining Card */}
          {challengeStatus?.hasStarted && (
            <FloatingElement delay={0.3}>
              <Card className="h-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Remaining</p>
                      <div className="flex items-center gap-2">
                        <p className={cn("text-xl font-bold", getTimeColor(timeRemaining))}>
                          {formatTime(timeRemaining)}
                        </p>
                        {timerActive && timeRemaining > 0 && (
                          <PulsingDot color="bg-green-500" />
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <Timer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge variant={timerActive ? 'success' : 'danger'} className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      {timerActive ? 'Active' : 'Stopped'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>
          )}

          {/* Attempts Card */}
          {(isApproved() || isAdmin()) && (
            <FloatingElement delay={0.4}>
              <Card className="h-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Attempts</p>
                      <p className="text-2xl font-bold text-black dark:text-white">
                        <NumberTicker value={challengeStatus?.totalAttempts || 0} />
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                      <Flag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-600 dark:text-orange-400">
                      <Zap className="w-3 h-3 mr-1" />
                      Submissions
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Challenge Status */}
          <div className="lg:col-span-2">
            <FloatingElement delay={0.5}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-black dark:text-white" />
                      <CardTitle className="text-2xl text-black dark:text-white">
                        Challenge Status
                      </CardTitle>
                    </div>
                    <Badge 
                      variant={challengeInfo?.challengeActive ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {challengeInfo?.challengeActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <AnimatePresence mode="wait">
                    {!isApproved() && !isAdmin() ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-12"
                      >
                        <motion.div 
                          className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-6"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                          Account Pending Approval
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                          Your account is waiting for admin approval before you can access challenges.
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            You will receive access once an administrator approves your account. 
                            Please be patient while we review your registration.
                          </p>
                        </div>
                      </motion.div>
                    ) : !challengeInfo?.challengeActive ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-12"
                      >
                        <motion.div 
                          className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Pause className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                          Challenge Not Active
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          The challenge is currently not active. Please check back later.
                        </p>
                      </motion.div>
                    ) : challengeStatus?.isCompleted || challengeStatus?.isExpired ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-12"
                      >
                        <motion.div 
                          className={cn(
                            "inline-flex items-center justify-center w-20 h-20 rounded-full mb-6",
                            challengeStatus.isCompleted 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-red-100 dark:bg-red-900/30'
                          )}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {challengeStatus.isCompleted ? (
                            <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                          )}
                        </motion.div>
                        <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                          {challengeStatus.isCompleted ? 'Challenge Completed!' : 'Challenge Expired'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {challengeStatus.isCompleted 
                            ? 'Congratulations! You have successfully completed all challenge levels.'
                            : 'Your challenge time has expired.'
                          }
                        </p>
                        
                        {/* Challenge Summary Grid */}
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
                          <div className="text-center p-4 bg-white/50 dark:bg-black/50 rounded-xl border border-gray-300 dark:border-gray-700">
                            <p className="text-2xl font-bold text-black dark:text-white">
                              <NumberTicker value={challengeStatus?.completedLevels?.length || 0} />
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Levels Completed</p>
                          </div>
                          <div className="text-center p-4 bg-white/50 dark:bg-black/50 rounded-xl border border-gray-300 dark:border-gray-700">
                            <p className="text-2xl font-bold text-black dark:text-white">
                              <NumberTicker value={challengeStatus?.totalAttempts || 0} />
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</p>
                          </div>
                        </div>

                        {/* Restart Information */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                Want to try again?
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                Only administrators can reset your challenge progress. Contact an admin to restart the challenge.
                              </p>
                              {challengeStatus.resetCount > 0 && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  This account has been reset {challengeStatus.resetCount} time{challengeStatus.resetCount !== 1 ? 's' : ''}.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : challengeStatus?.hasStarted ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                              Challenge In Progress
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Level {challengeStatus.currentLevel} of {challengeInfo?.totalLevels}
                            </p>
                          </div>
                          <Badge 
                            variant={timerActive ? 'success' : 'danger'}
                            className="text-sm px-3 py-1"
                          >
                            <PulsingDot 
                              color={timerActive ? 'bg-green-500' : 'bg-red-500'} 
                              className="mr-2" 
                            />
                            {timerActive ? 'Active' : 'Expired'}
                          </Badge>
                        </div>

                        {/* Live Timer Display */}
                        {timerActive && timeRemaining > 0 && (
                          <div className="bg-gradient-to-r from-blue-50 to-gray-50 dark:from-blue-900/20 dark:to-gray-900/20 border border-blue-300 dark:border-blue-700 rounded-xl p-6 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">Time Remaining</p>
                                <div className={cn("text-3xl font-bold flex items-center gap-3", getTimeColor(timeRemaining))}>
                                  <Timer className="w-6 h-6" />
                                  <span>{formatTime(timeRemaining)}</span>
                                  <PulsingDot color="bg-green-500" />
                                </div>
                              </div>
                              <div className="text-right">
                                <AnimatedProgressRing 
                                  progress={(timeRemaining / 3600) * 100} 
                                  size={80} 
                                  strokeWidth={6}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Progress Section */}
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Challenge Progress</span>
                            <span>
                              {challengeStatus.completedLevels?.length || 0} / {challengeInfo?.totalLevels} levels
                            </span>
                          </div>
                          <Progress 
                            value={((challengeStatus.completedLevels?.length || 0) / (challengeInfo?.totalLevels || 1)) * 100}
                            className="h-3"
                          />
                        </div>

                        {/* Action Button */}
                        <GlowingButton
                          onClick={() => history.push('/challenge')}
                          disabled={!timerActive}
                          variant={timerActive ? "success" : "danger"}
                          className="w-full h-12 text-lg font-semibold"
                        >
                          {timerActive ? (
                            <>
                              <Play className="w-5 h-5 mr-2" />
                              Continue Challenge
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 mr-2" />
                              Challenge Expired
                            </>
                          )}
                        </GlowingButton>
                      </motion.div>
                    ) : canStartInfo && !canStartInfo.canStart ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-12"
                      >
                        <motion.div 
                          className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                          Cannot Start Challenge
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {canStartInfo.reason}
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-300 dark:border-gray-700 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-start gap-3">
                            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Need a reset?
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Contact an administrator to reset your challenge progress and try again.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-12"
                      >
                        <motion.div 
                          className="inline-flex items-center justify-center w-20 h-20 bg-black/10 dark:bg-white/10 rounded-full mb-6"
                          whileHover={{ scale: 1.1 }}
                          animate={{ 
                            boxShadow: [
                              "0 0 0 0 rgba(0, 0, 0, 0.4)",
                              "0 0 0 20px rgba(0, 0, 0, 0)",
                            ]
                          }}
                          transition={{ 
                            boxShadow: { duration: 2, repeat: Infinity }
                          }}
                        >
                          <Play className="w-10 h-10 text-black dark:text-white" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                          Ready to Start
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Begin your CTF journey with {challengeInfo?.totalLevels} challenging levels.
                        </p>
                        <GlowingButton
                          onClick={startChallenge}
                          disabled={loading}
                          variant="primary"
                          className="px-8 py-3 text-lg font-semibold"
                        >
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full mr-2"
                              />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5 mr-2" />
                              Start Challenge
                            </>
                          )}
                        </GlowingButton>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </FloatingElement>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Info Card */}
            <FloatingElement delay={0.6}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-lg text-black dark:text-white">
                      Challenge Info
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Title</span>
                      <span className="font-medium text-black dark:text-white text-sm">
                        {challengeInfo?.challengeTitle || 'BizTras CTF Challenge'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Total Levels</span>
                      <Badge variant="outline" className="border-black/30 dark:border-white/30 text-black dark:text-white">
                        <NumberTicker value={challengeInfo?.totalLevels || 0} />
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Time Limit</span>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400">
                        {challengeInfo?.timeLimit ? `${challengeInfo.timeLimit} min` : 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  {challengeInfo?.challengeDescription && (
                    <>
                      <Separator className="bg-gray-300 dark:bg-gray-700" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Description</p>
                        <p className="text-black dark:text-white text-sm bg-white/50 dark:bg-black/50 p-3 rounded-lg">
                          {challengeInfo.challengeDescription}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </FloatingElement>

            {/* Live Timer Widget for Active Challenges */}
            {challengeStatus?.hasStarted && timerActive && timeRemaining > 0 && (
              <FloatingElement delay={0.7}>
                <Card className="text-center bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center justify-center gap-2">
                      <Timer className="w-5 h-5" />
                      Live Timer
                    </h3>
                    <div className={cn("text-4xl font-bold mb-4", getTimeColor(timeRemaining))}>
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 mb-4">
                      <motion.div 
                        className={cn(
                          "h-3 rounded-full transition-all duration-1000",
                          timeRemaining > 300 ? 'bg-green-500' :
                          timeRemaining > 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        )}
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (timeRemaining / 3600) * 100))}%` 
                        }}
                        animate={{ width: `${Math.max(0, Math.min(100, (timeRemaining / 3600) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <PulsingDot color="bg-green-500" />
                      Live Countdown Active
                    </div>
                    <Separator className="bg-gray-300 dark:bg-gray-700 my-4" />
                    <p className="text-xs text-black dark:text-white">
                      ⚡ Updates every second
                    </p>
                  </CardContent>
                </Card>
              </FloatingElement>
            )}

            {/* Quick Actions for Admins */}
            {isAdmin() && (
              <FloatingElement delay={0.8}>
                <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-black dark:text-white" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <GlowingButton
                      onClick={() => history.push('/admin')}
                      variant="primary"
                      className="w-full justify-start"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </GlowingButton>
                    <Button
                      onClick={() => history.push('/admin?tab=users')}
                      variant="outline"
                      className="w-full justify-start bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button
                      onClick={() => history.push('/admin?tab=challenges')}
                      variant="outline"
                      className="w-full justify-start bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Manage Challenges
                    </Button>
                  </CardContent>
                </Card>
              </FloatingElement>
            )}

            {/* Quick Navigation for Users */}
            {!isAdmin() && isApproved() && (
              <FloatingElement delay={0.8}>
                <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-black dark:text-white" />
                      Quick Navigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => history.push('/challenges')}
                      variant="outline"
                      className="w-full justify-start bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      View All Challenges
                    </Button>
                    {challengeStatus?.hasStarted && challengeStatus?.isActive && (
                      <GlowingButton
                        onClick={() => history.push('/challenge')}
                        variant="success"
                        className="w-full justify-start"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Current Challenge
                      </GlowingButton>
                    )}
                    <Button
                      onClick={() => history.push('/profile')}
                      variant="outline"
                      className="w-full justify-start bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Button>
                  </CardContent>
                </Card>
              </FloatingElement>
            )}

            {/* Platform Stats Card */}
            <FloatingElement delay={0.9}>
              <Card className="bg-gradient-to-br from-black/10 to-gray-600/10 dark:from-white/10 dark:to-gray-400/10 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-black dark:text-white" />
                    Platform Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-white/50 dark:bg-black/50 rounded-lg">
                      <p className="text-2xl font-bold text-black dark:text-white">
                        <NumberTicker value={challengeInfo?.totalLevels || 0} />
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Levels</p>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-black/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        <NumberTicker value={challengeInfo?.timeLimit || 0} />
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Time Limit (min)</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <Badge 
                      variant={challengeInfo?.challengeActive ? "success" : "secondary"}
                      className="text-xs"
                    >
                      <PulsingDot 
                        color={challengeInfo?.challengeActive ? 'bg-green-500' : 'bg-gray-500'} 
                        className="mr-2" 
                      />
                      Platform {challengeInfo?.challengeActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;