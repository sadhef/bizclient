import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { challengeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Target, 
  Lock, 
  CheckCircle, 
  Play,
  Eye,
  Clock,
  Flag,
  Trophy,
  Activity,
  Zap
} from 'lucide-react';
import {
  Card,
  CardContent,
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
  NumberTicker,
  PulsingDot,
  TypewriterEffect
} from '../../components/magicui';
import { cn, formatTime } from '../../lib/utils';
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
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-black/30 dark:border-white/30 border-t-black dark:border-t-white rounded-full mx-auto mb-4"
            />
            <TypewriterEffect 
              words={['Loading', 'challenges...']}
              className="text-xl text-black dark:text-white"
              delay={100}
            />
          </div>
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
          <div className="text-center lg:text-left">
            <motion.h1 
              className="text-4xl lg:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-black dark:text-white">
                Challenge Levels
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TypewriterEffect 
                words={['Complete', 'each', 'level', 'in', 'order', 'to', 'progress']}
                delay={50}
              />
            </motion.p>
          </div>
        </FloatingElement>

        {/* Challenge Status */}
        {challengeStatus && (
          <FloatingElement delay={0.2} className="mb-8">
            <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-black dark:text-white mb-2 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-black dark:text-white" />
                      Challenge Status
                    </h2>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-black dark:text-white" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Current Level: <NumberTicker value={challengeStatus.currentLevel} />
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Completed: <NumberTicker value={challengeStatus.completedLevels?.length || 0} /> levels
                        </span>
                      </div>
                      {challengeStatus.timeRemaining > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Time remaining: {formatTime(challengeStatus.timeRemaining)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!challengeStatus.hasStarted ? (
                    <GlowingButton
                      onClick={startChallenge}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Challenge
                    </GlowingButton>
                  ) : challengeStatus.isActive ? (
                    <GlowingButton
                      onClick={() => history.push('/challenge')}
                      variant="success"
                      className="flex items-center gap-2"
                    >
                      <Target className="w-4 h-4" />
                      Continue Challenge
                    </GlowingButton>
                  ) : (
                    <Badge variant="danger" className="px-4 py-2 text-sm font-medium">
                      Challenge Ended
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </FloatingElement>
        )}

        {/* Challenge Levels */}
        <div className="space-y-4 mb-8">
          {levels.map((level, index) => (
            <FloatingElement key={level.level} delay={0.3 + (index * 0.1)}>
              <Card
                className={cn(
                  "transition-all duration-200 hover:shadow-lg cursor-pointer bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-xl",
                  level.isCompleted
                    ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                    : level.isCurrent
                    ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                    : level.isAccessible
                    ? 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    : 'opacity-75 border-gray-200 dark:border-gray-700'
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Level Icon */}
                      <motion.div 
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          level.isCompleted
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : level.isCurrent
                            ? 'bg-black/10 dark:bg-white/10'
                            : level.isAccessible
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        {level.isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : level.isAccessible ? (
                          <Target className={cn(
                            "w-6 h-6",
                            level.isCurrent 
                              ? 'text-black dark:text-white' 
                              : 'text-blue-600 dark:text-blue-400'
                          )} />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        )}
                      </motion.div>

                      {/* Level Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-black dark:text-white">
                            Level {level.level}
                          </h3>
                          {level.isCompleted && (
                            <Badge variant="success" className="text-xs">
                              <Trophy className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {level.isCurrent && !level.isCompleted && (
                            <Badge className="text-xs bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/30 dark:border-white/30">
                              <PulsingDot color="bg-black dark:bg-white" className="mr-1" />
                              Current
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-black dark:text-white mb-2">
                          {level.title}
                        </h4>
                        {level.isAccessible && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {level.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-3">
                      {level.isCompleted ? (
                        <div className="text-center">
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                          <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                            Solved
                          </span>
                        </div>
                      ) : level.isCurrent && challengeStatus?.isActive ? (
                        <GlowingButton
                          onClick={() => history.push('/challenge')}
                          variant="primary"
                          className="flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Continue
                        </GlowingButton>
                      ) : level.isAccessible && challengeStatus?.hasStarted ? (
                        <Button
                          onClick={() => history.push('/challenge')}
                          variant="outline"
                          className="flex items-center gap-2 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      ) : !level.isAccessible ? (
                        <div className="text-center">
                          <Lock className="w-6 h-6 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            Locked
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>
          ))}
        </div>

        {/* Instructions */}
        <FloatingElement delay={0.8}>
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-black dark:text-white" />
                How to Play
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black dark:text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-1">Start the Challenge</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Begin your timer and unlock the first level to start your CTF journey.
                    </p>
                  </div>
                </div>
                
                <Separator className="bg-gray-300 dark:bg-gray-700" />
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black dark:text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-1">Find the Flags</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Complete each level by finding and submitting the correct flag format.
                    </p>
                  </div>
                </div>
                
                <Separator className="bg-gray-300 dark:bg-gray-700" />
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black dark:text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-1">Progress Sequentially</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Each completed level unlocks the next one in the sequence.
                    </p>
                  </div>
                </div>
                
                <Separator className="bg-gray-300 dark:bg-gray-700" />
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black dark:text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-black dark:text-white mb-1">Beat the Clock</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Complete all levels before time runs out to win the challenge.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Challenge Stats */}
              <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
                <h4 className="font-medium text-black dark:text-white mb-4 flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Challenge Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                    <div className="text-2xl font-bold text-black dark:text-white mb-1">
                      <NumberTicker value={levels.length} />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Levels</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                      <NumberTicker value={challengeStatus?.completedLevels?.length || 0} />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      <NumberTicker value={challengeStatus?.currentLevel || 1} />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Current Level</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                      <NumberTicker value={challengeStatus?.totalAttempts || 0} />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Attempts</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {challengeStatus && challengeStatus.hasStarted && (
                <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-black dark:text-white">Overall Progress</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {challengeStatus.completedLevels?.length || 0} / {levels.length}
                    </span>
                  </div>
                  <Progress 
                    value={((challengeStatus.completedLevels?.length || 0) / levels.length) * 100}
                    className="h-3"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(((challengeStatus.completedLevels?.length || 0) / levels.length) * 100)}% Complete
                    </span>
                    {challengeStatus.isActive && (
                      <div className="flex items-center gap-1">
                        <PulsingDot color="bg-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
                <h4 className="font-medium text-black dark:text-white mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => history.push('/dashboard')}
                    variant="outline"
                    className="w-full justify-start bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  
                  {challengeStatus?.hasStarted && challengeStatus?.isActive && (
                    <GlowingButton
                      onClick={() => history.push('/challenge')}
                      variant="success"
                      className="w-full justify-start"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Continue Challenge
                    </GlowingButton>
                  )}
                  
                  {!challengeStatus?.hasStarted && (
                    <GlowingButton
                      onClick={startChallenge}
                      variant="primary"
                      className="w-full justify-start"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Challenge
                    </GlowingButton>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </FloatingElement>

        {/* Tips and Hints Card */}
        <FloatingElement delay={0.9} className="mt-8">
          <Card className="bg-gradient-to-br from-black/5 to-gray-600/5 dark:from-white/5 dark:to-gray-400/5 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">💡</span>
                  </div>
                  <div>
                    <p className="text-sm text-black dark:text-white font-medium mb-1">Use Hints Wisely</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Each level has a hint available if you get stuck. Use them strategically!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold">⏰</span>
                  </div>
                  <div>
                    <p className="text-sm text-black dark:text-white font-medium mb-1">Manage Your Time</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Keep an eye on the timer and prioritize levels based on difficulty.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                  <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">🔍</span>
                  </div>
                  <div>
                    <p className="text-sm text-black dark:text-white font-medium mb-1">Think Outside the Box</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      CTF challenges often require creative thinking and attention to detail.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FloatingElement>
      </div>
    </div>
  );
};

export default ChallengeList;