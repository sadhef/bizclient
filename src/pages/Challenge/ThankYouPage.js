import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { challengeAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  Award, 
  Clock, 
  Target, 
  Flag, 
  Star, 
  ArrowRight,
  Download,
  Share2,
  Trophy,
  CheckCircle,
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
  Separator
} from '../../components/ui';
import { 
  FloatingElement, 
  GlowingButton, 
  ParticleBackground,
  AnimatedGridPattern,
  NumberTicker,
  PulsingDot,
  TypewriterEffect,
  GradientBorderCard
} from '../../components/magicui';
import { cn, formatTime } from '../../lib/utils';
import LoadingSpinner from '../../components/UX/LoadingSpinner';

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
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-black/30 dark:border-white/30 border-t-black dark:border-t-white rounded-full mx-auto mb-4"
            />
            <TypewriterEffect 
              words={['Loading', 'your', 'results...']}
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
      <ParticleBackground particleCount={30} />
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
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gray-800/5 dark:bg-gray-200/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <FloatingElement delay={0} className="text-center mb-12">
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 bg-black dark:bg-white rounded-2xl mb-6 shadow-2xl shadow-black/25 dark:shadow-white/25"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)"
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Award className="w-10 h-10 text-white dark:text-black" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            {userStats?.isCompleted ? 'Congratulations!' : 'Thank You for Participating!'}
          </h1>
          
          <div className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            <TypewriterEffect 
              words={userStats?.isCompleted 
                ? ['You', 'have', 'successfully', 'completed', 'the', 'BizTras', 'CTF', 'Challenge!']
                : ['Your', 'challenge', 'session', 'has', 'ended.']
              }
              delay={80}
            />
          </div>
          
          <p className="text-lg text-black dark:text-white font-semibold">
            {getPerformanceRating()}
          </p>
        </FloatingElement>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <FloatingElement delay={0.2}>
            <Card className="text-center bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-black dark:text-white mb-2">
                  <NumberTicker value={userStats?.completedLevels || 0} />
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Levels Completed
                </p>
              </CardContent>
            </Card>
          </FloatingElement>

          <FloatingElement delay={0.3}>
            <Card className="text-center bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <Flag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-black dark:text-white mb-2">
                  <NumberTicker value={userStats?.totalAttempts || 0} />
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Attempts
                </p>
              </CardContent>
            </Card>
          </FloatingElement>

          <FloatingElement delay={0.4}>
            <Card className="text-center bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-black dark:text-white mb-2">
                  {userStats?.timeSpent ? formatTime(userStats.timeSpent) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Time Spent
                </p>
              </CardContent>
            </Card>
          </FloatingElement>

          <FloatingElement delay={0.5}>
            <Card className="text-center bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-black dark:text-white mb-2">
                  {userStats?.isCompleted ? 'Complete' : 'Partial'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </p>
              </CardContent>
            </Card>
          </FloatingElement>
        </div>

        
        

        {/* Message from Organizers */}
        <FloatingElement delay={0.7} className="mb-12">
          <Card className="text-center bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black dark:text-white">
                Thank You for Participating!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                We hope you enjoyed the BizTras CTF Challenge! Whether you completed all levels or just started your journey, 
                you've taken an important step in improving your cybersecurity skills. Keep learning, keep practicing, 
                and remember that every expert was once a beginner.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <GlowingButton
                  onClick={() => history.push('/dashboard')}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Back to Dashboard
                </GlowingButton>
                
                {!userStats?.isCompleted && challengeStatus?.challengeActive && (
                  <Button
                    onClick={() => history.push('/challenge')}
                    variant="outline"
                    className="flex items-center gap-2 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Target className="w-4 h-4" />
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </FloatingElement>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Share Results */}
          <FloatingElement delay={0.8}>
            <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                    <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    Share Your Results
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Share your CTF achievement with friends and colleagues!
                  </p>
                  <Button
                    onClick={shareResults}
                    variant="outline"
                    className="w-full bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FloatingElement>

          {/* Download Certificate */}
          {userStats?.isCompleted && (
            <FloatingElement delay={0.9}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                      <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                      Download Certificate
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Get your completion certificate as proof of achievement!
                    </p>
                    <GlowingButton
                      onClick={downloadCertificate}
                      variant="success"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </GlowingButton>
                  </div>
                </CardContent>
              </Card>
              </FloatingElement>
          )}
        </div>

        {/* Performance Analysis */}
        <FloatingElement delay={1.0} className="mb-12">
          <Card className="bg-gradient-to-br from-black/5 to-gray-600/5 dark:from-white/5 dark:to-gray-400/5 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-black dark:text-white" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Completion Rate */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/50 dark:bg-black/50 rounded-full mb-4 border border-gray-300 dark:border-gray-600">
                    <CheckCircle className={cn(
                      "w-8 h-8",
                      userStats?.isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    )} />
                  </div>
                  <h4 className="font-semibold text-black dark:text-white mb-2">Completion Rate</h4>
                  <p className="text-2xl font-bold text-black dark:text-white mb-1">
                    {userStats?.completedLevels ? Math.round((userStats.completedLevels / 2) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userStats?.completedLevels || 0} of 2 levels completed
                  </p>
                </div>

                {/* Accuracy */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/50 dark:bg-black/50 rounded-full mb-4 border border-gray-300 dark:border-gray-600">
                    <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-black dark:text-white mb-2">Accuracy</h4>
                  <p className="text-2xl font-bold text-black dark:text-white mb-1">
                    {userStats?.totalAttempts > 0 
                      ? Math.round((userStats.completedLevels / userStats.totalAttempts) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Success rate per attempt
                  </p>
                </div>

                {/* Efficiency */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/50 dark:bg-black/50 rounded-full mb-4 border border-gray-300 dark:border-gray-600">
                    <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h4 className="font-semibold text-black dark:text-white mb-2">Efficiency</h4>
                  <p className="text-2xl font-bold text-black dark:text-white mb-1">
                    {getPerformanceRating()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Overall performance rating
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-300 dark:bg-gray-700 my-6" />

              {/* Performance Insights */}
              <div className="space-y-4">
                <h4 className="font-semibold text-black dark:text-white mb-4">Performance Insights</h4>
                
                {userStats?.isCompleted ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-green-800 dark:text-green-200 mb-1">
                          Excellent Work!
                        </h5>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          You successfully completed all challenge levels. Your problem-solving skills and persistence paid off!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : userStats?.completedLevels > 0 ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Great Progress!
                        </h5>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          You made solid progress through the challenges. Each level completed shows your growing expertise!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Flag className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                          Keep Learning!
                        </h5>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Every attempt is a learning opportunity. CTF challenges require practice and patience - keep at it!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Performance */}
                {userStats?.timeSpent > 0 && (
                  <div className="p-4 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-black dark:text-white mb-1">
                          Time Management
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          You spent {formatTime(userStats.timeSpent)} on the challenge. 
                          {userStats.timeSpent < 1800 ? ' Great time efficiency!' : 
                           userStats.timeSpent < 3600 ? ' Good pacing through the challenges.' : 
                           ' Thorough approach to problem-solving.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </FloatingElement>

      </div>
    </div>
  );
};

export default ThankYouPage;