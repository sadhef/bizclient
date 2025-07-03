import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { challengeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flag, 
  Clock, 
  Target, 
  Eye, 
  EyeOff, 
  Send, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  ArrowRight,
  Play,
  AlertTriangle,
  Info,
  Trophy,
  Timer,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label,
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
  GradientBorderCard,
  RippleEffect
} from '../../components/magicui';
import { cn, formatTime, getTimeColor } from '../../lib/utils';
import { toast } from 'react-toastify';

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
  const [submissions, setSubmissions] = useState([]);
  const [challengeNotStarted, setChallengeNotStarted] = useState(false);
  const [challengeEnded, setChallengeEnded] = useState(false);
  const [endReason, setEndReason] = useState(null);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    loadChallengeData();
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
            setChallengeEnded(true);
            setEndReason('expired');
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

  const loadChallengeData = async () => {
    try {
      setLoading(true);
      
      const challengeResponse = await challengeAPI.getCurrentChallenge();
      setChallenge(challengeResponse.data.challenge);
      setChallengeStatus(challengeResponse.data.user);
      
      const timeLeft = challengeResponse.data.timeRemaining || 0;
      const isActive = challengeResponse.data.isActive;
      const challengeStartTime = challengeResponse.data.user?.challengeStartTime;
      
      setTimeRemaining(timeLeft);
      setTimerActive(isActive && challengeStartTime);
      
      setChallengeNotStarted(false);
      setChallengeEnded(false);
      setEndReason(null);

      try {
        const submissionsResponse = await challengeAPI.getSubmissions();
        setSubmissions(submissionsResponse.data.submissions);
      } catch (error) {
        console.error('Error loading submissions:', error);
      }
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.code === 'CHALLENGE_NOT_STARTED') {
        setChallengeNotStarted(true);
        setTimerActive(false);
      } else if (error.response?.status === 410) {
        setTimerActive(false);
        setChallengeEnded(true);
        setEndReason('expired');
        history.push('/thank-you');
      } else if (error.response?.data?.code === 'CHALLENGE_ALREADY_ENDED') {
        setChallengeEnded(true);
        setEndReason(error.response.data.reason || 'unknown');
        setTimerActive(false);
      }
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
      }
      
      await loadChallengeData();
    } catch (error) {
      console.error('Error starting challenge:', error);
      
      if (error.response?.data?.code === 'CHALLENGE_ALREADY_ENDED') {
        setChallengeEnded(true);
        setEndReason(error.response.data.reason);
        toast.error(error.response.data.error);
      }
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
        
        if (response.data.allChallengesComplete || response.data.completed || response.data.challengeEnded) {
          setTimerActive(false);
          setChallengeEnded(true);
          setEndReason('completed');
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
          
          const newTimeRemaining = response.data.timeRemaining || 0;
          setTimeRemaining(newTimeRemaining);
          
          setTimeout(async () => {
            await loadChallengeData();
          }, 1000);
          
          return;
        }
      }
      
      setTimeout(async () => {
        const submissionsResponse = await challengeAPI.getSubmissions();
        setSubmissions(submissionsResponse.data.submissions);
      }, 500);
      
    } catch (error) {
      if (error.response?.status === 410) {
        setTimerActive(false);
        setChallengeEnded(true);
        setEndReason('expired');
        history.push('/thank-you');
      }
    } finally {
      setSubmitting(false);
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
            words={['Loading', 'challenge...']}
            className="text-xl text-black dark:text-white"
            delay={100}
          />
        </div>
      </div>
    );
  }

  // Challenge ended state
  if (challengeEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6 relative overflow-hidden">
        <ParticleBackground particleCount={15} />
        <AnimatedGridPattern className="opacity-5" />
        
        <FloatingElement className="text-center max-w-md">
          <motion.div 
            className={cn(
              "inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-2xl",
              endReason === 'completed' 
                ? 'bg-green-100 dark:bg-green-900/30 shadow-green-500/25' 
                : 'bg-red-100 dark:bg-red-900/30 shadow-red-500/25'
            )}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {endReason === 'completed' ? (
              <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            )}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
            {endReason === 'completed' ? 'Challenge Completed!' : 'Challenge Ended'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {endReason === 'completed' 
              ? 'Congratulations! You have completed all challenge levels.'
              : endReason === 'expired'
              ? 'Your challenge time has expired.'
              : 'The challenge has ended.'
            }
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Want to try again?
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Only administrators can reset your challenge progress. Contact an admin to restart the challenge.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <GlowingButton
              onClick={() => history.push('/thank-you')}
              variant="primary"
              className="w-full"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Results
            </GlowingButton>
            <Button
              onClick={() => history.push('/dashboard')}
              variant="outline"
              className="w-full bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </FloatingElement>
      </div>
    );
  }

  // Challenge not started state
  if (challengeNotStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6 relative overflow-hidden">
        <ParticleBackground particleCount={15} />
        <AnimatedGridPattern className="opacity-5" />
        
        <FloatingElement className="text-center max-w-md">
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 bg-black/10 dark:bg-white/10 rounded-full mb-6 shadow-2xl shadow-black/25 dark:shadow-white/25"
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
          
          <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
            Ready to Start?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to start the challenge first to access the levels.
          </p>
          
          <div className="space-y-3">
            <GlowingButton
              onClick={startChallenge}
              disabled={loading}
              variant="primary"
              className="w-full"
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
                  <Play className="w-4 h-4 mr-2" />
                  Start Challenge
                </>
              )}
            </GlowingButton>
            <Button
              onClick={() => history.push('/dashboard')}
              variant="outline"
              className="w-full bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </FloatingElement>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            No Challenge Available
          </h2>
          <Button 
            onClick={() => history.push('/dashboard')} 
            variant="outline"
            className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Go to Dashboard
          </Button>
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

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <FloatingElement delay={0} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-3 bg-black/10 dark:bg-white/10 rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <Target className="w-8 h-8 text-black dark:text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white mb-1">
                  {challenge.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>Level {challenge.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    <span>Attempts: <NumberTicker value={challengeStatus?.totalAttempts || 0} /></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PulsingDot color={timerActive ? 'bg-green-500' : 'bg-red-500'} />
                    <span>{timerActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Timer Display */}
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Remaining</div>
              <div className={cn("text-2xl font-bold flex items-center gap-2", getTimeColor(timeRemaining))}>
                <Timer className="w-6 h-6" />
                <span>{formatTime(timeRemaining)}</span>
                {timeRemaining <= 60 && timeRemaining > 0 && (
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-red-500"
                  >
                    ⚠️
                  </motion.span>
                )}
                {timerActive && timeRemaining > 0 && (
                  <PulsingDot color="bg-green-500" />
                )}
              </div>
            </div>
          </div>
        </FloatingElement>

        {/* Time Expired Warning */}
        {!timerActive && timeRemaining <= 0 && (
          <FloatingElement delay={0.1} className="mb-6">
            <Card className="bg-red-50 dark:bg-red-900/20 backdrop-blur-xl border-red-300 dark:border-red-700 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      Challenge Time Expired
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      Your challenge time has expired. You can no longer submit answers.
                    </p>
                    <GlowingButton
                      onClick={() => history.push('/thank-you')}
                      variant="danger"
                      size="sm"
                    >
                      View Results
                    </GlowingButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FloatingElement>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Challenge Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Description */}
            <FloatingElement delay={0.2}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-black dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-black dark:text-white" />
                    Challenge Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                    {challenge.description}
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>

            {/* Hint Section */}
            <FloatingElement delay={0.3}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-black dark:text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      Hint
                    </CardTitle>
                    <RippleEffect>
                      <Button
                        onClick={() => showHint ? setShowHint(false) : loadHint()}
                        disabled={!timerActive}
                        variant="outline"
                        className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {showHint ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Hide Hint
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Show Hint
                          </>
                        )}
                      </Button>
                    </RippleEffect>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 backdrop-blur-sm"
                      >
                        <div className="flex items-start gap-3">
                          <HelpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="text-yellow-800 dark:text-yellow-200">
                            <TypewriterEffect 
                              words={hint.split(' ')}
                              delay={50}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </FloatingElement>

            {/* Flag Submission */}
            <FloatingElement delay={0.4}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-black dark:text-white flex items-center gap-2">
                    <Flag className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Submit Flag
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={submitFlag} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="flag" className="text-gray-700 dark:text-gray-300 font-medium">
                        Flag
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Flag className="h-5 w-5 text-gray-500 dark:text-gray-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors" />
                        </div>
                        <Input
                          id="flag"
                          type="text"
                          value={flag}
                          onChange={(e) => setFlag(e.target.value)}
                          className="pl-10 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/20 h-12"
                          placeholder="Enter your answer..."
                          disabled={submitting || !timerActive}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    
                    <RippleEffect>
  <GlowingButton
    type="submit"
    disabled={submitting || !flag.trim() || !timerActive}
    variant={timerActive ? "success" : "danger"}
    className="w-full h-14 text-lg font-semibold flex items-center justify-center gap-3"
  >
    {submitting ? (
      <>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
        />
        <span>Submitting...</span>
      </>
    ) : (
      <>
        <Send className="w-5 h-5" />
        <span>Submit Answer</span>
      </>
    )}
  </GlowingButton>
</RippleEffect>
                    
                    {/* Submission disabled warning */}
                    {!timerActive && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-300 dark:border-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                        Submissions disabled - Challenge time expired
                      </motion.div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </FloatingElement>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Timer Display */}
            <FloatingElement delay={0.5}>
              <GradientBorderCard className="text-center">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center justify-center gap-2">
                  <Timer className="w-5 h-5" />
                  Live Challenge Timer
                </h3>
                
                {/* Large timer display */}
                <div className={cn("text-4xl font-bold mb-4", getTimeColor(timeRemaining))}>
                  {formatTime(timeRemaining)}
                </div>
                
                {/* Circular progress */}
                <div className="flex justify-center mb-4">
                  <AnimatedProgressRing 
                    progress={(timeRemaining / 3600) * 100} 
                    size={100} 
                    strokeWidth={6}
                  />
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {timerActive ? (
                    <>
                      <PulsingDot color="bg-green-500" />
                      Live Timer Active
                    </>
                  ) : (
                    <>
                      <PulsingDot color="bg-red-500" />
                      Timer Stopped
                    </>
                  )}
                </div>

                {/* Warning for low time */}
                {timeRemaining <= 60 && timeRemaining > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3 mt-3"
                  >
                    <div className="text-xs text-red-700 dark:text-red-300 font-medium animate-pulse flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Time running out!
                    </div>
                  </motion.div>
                )}

                <Separator className="bg-gray-300 dark:bg-gray-700 my-4" />
                <div className="text-xs text-black dark:text-white">
                  ⚡ Updates every second
                </div>
              </GradientBorderCard>
            </FloatingElement>

            {/* Progress Card */}
            <FloatingElement delay={0.6}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Current Level</span>
                      <Badge variant="outline" className="border-black/30 dark:border-white/30 text-black dark:text-white">
                        <NumberTicker value={challengeStatus?.currentLevel || 1} />
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Completed Levels</span>
                        <span className="text-black dark:text-white font-medium">
                          <NumberTicker value={challengeStatus?.completedLevels?.length || 0} />
                        </span>
                      </div>
                      {challengeStatus?.completedLevels?.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {challengeStatus.completedLevels.map((level) => (
                            <motion.span
                              key={level}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded border border-green-300 dark:border-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Level {level}
                            </motion.span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Total Attempts</span>
                      <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400">
                        <NumberTicker value={challengeStatus?.totalAttempts || 0} />
                      </Badge>
                    </div>

                    {/* Challenge Status */}
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Challenge Status</span>
                      <Badge 
                        variant={timerActive ? 'success' : timeRemaining <= 0 ? 'danger' : 'warning'}
                        className="text-xs"
                      >
                        <PulsingDot 
                          color={
                            timerActive ? 'bg-green-500' : 
                            timeRemaining <= 0 ? 'bg-red-500' : 
                            'bg-yellow-500'
                          } 
                          className="mr-2" 
                        />
                        {timerActive ? 'Active' : timeRemaining <= 0 ? 'Expired' : 'Paused'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>

            {/* Quick Actions */}
            <FloatingElement delay={0.7}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-black dark:text-white" />
                    Quick Actions
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
                  <Button
                    onClick={() => history.push('/dashboard')}
                    variant="outline"
                    className="w-full justify-start bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>

                  {/* Challenge ended actions */}
                  {!timerActive && timeRemaining <= 0 && (
                    <>
                      <Separator className="bg-gray-300 dark:bg-gray-700" />
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          Challenge time expired
                        </p>
                        <GlowingButton
                          onClick={() => history.push('/thank-you')}
                          variant="primary"
                          className="w-full"
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          View Results
                        </GlowingButton>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </FloatingElement>

            {/* Restart Information */}
            {!timerActive && (
              <FloatingElement delay={0.8}>
                <Card className="bg-blue-50 dark:bg-blue-900/20 backdrop-blur-xl border-blue-300 dark:border-blue-700 shadow-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                          Challenge Restart Policy
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          Once a challenge ends (completion or expiration), only administrators can reset your progress.
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Contact an admin if you need to restart the challenge.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FloatingElement>
            )}

            {/* Submission History */}
            {submissions.length > 0 && (
              <FloatingElement delay={0.9}>
                <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                      <Flag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      Recent Submissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {submissions.slice(-5).map((submission, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            submission.isCorrect
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center",
                              submission.isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                            )}>
                              {submission.isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-black dark:text-white">
                                Level {submission.level}
                              </p>
                              <p className={cn(
                                "text-xs",
                                submission.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                              )}>
                                {submission.isCorrect ? 'Correct' : 'Incorrect'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(submission.timestamp).toLocaleTimeString()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FloatingElement>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;