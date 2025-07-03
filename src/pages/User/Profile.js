import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { challengeAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Target, 
  Award, 
  Flag,
  Clock,
  Edit3,
  Save,
  X,
  Lock,
  CheckCircle,
  Activity,
  Shield,
  Star
} from 'lucide-react';
import {
  Card,
  CardContent,
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
  NumberTicker,
  PulsingDot,
  TypewriterEffect
} from '../../components/magicui';
import { cn, formatDate } from '../../lib/utils';
import LoadingSpinner from '../../components/UX/LoadingSpinner';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, changePassword, refreshUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [challengeStatus, setChallengeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user's submissions
      try {
        const submissionsResponse = await challengeAPI.getSubmissions();
        setSubmissions(submissionsResponse.data.submissions);
      } catch (error) {
        console.error('Error loading submissions:', error);
      }
      
      // Load challenge status
      try {
        const statusResponse = await challengeAPI.getStatus();
        setChallengeStatus(statusResponse.data);
      } catch (error) {
        console.error('Error loading challenge status:', error);
      }
      
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setPasswordLoading(true);
      const result = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      
      if (result.success) {
        setShowPasswordForm(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const getSuccessRate = () => {
    if (submissions.length === 0) return 0;
    const correctSubmissions = submissions.filter(sub => sub.isCorrect).length;
    return Math.round((correctSubmissions / submissions.length) * 100);
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
              words={['Loading', 'profile...']}
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
                My Profile
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TypewriterEffect 
                words={['View', 'your', 'account', 'information', 'and', 'challenge', 'progress']}
                delay={50}
              />
            </motion.p>
          </div>
        </FloatingElement>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <FloatingElement delay={0.2}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-black dark:text-white">
                      Account Information
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-600 dark:from-white dark:to-gray-300 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white dark:text-black text-xl font-bold">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                          {user?.username}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                      <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                        <User className="w-5 h-5 text-black dark:text-white" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
                          <p className="font-medium text-black dark:text-white">
                            {user?.username}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                        <Mail className="w-5 h-5 text-black dark:text-white" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="font-medium text-black dark:text-white">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      

                      <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                        <div className={cn(
                          "w-5 h-5 rounded-full",
                          user?.isApproved ? 'bg-green-500' : 'bg-yellow-500'
                        )} />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                          <p className="font-medium text-black dark:text-white">
                            {user?.isAdmin ? 'Administrator' : user?.isApproved ? 'Approved' : 'Pending Approval'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>

            {/* Password Change */}
            <FloatingElement delay={0.3}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-black dark:text-white">
                      Security Settings
                    </CardTitle>
                    {!showPasswordForm && (
                      <Button
                        onClick={() => setShowPasswordForm(true)}
                        variant="outline"
                        className="flex items-center gap-2 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Edit3 className="w-4 h-4" />
                        Change Password
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {showPasswordForm ? (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <Input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="pl-10 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <Input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="pl-10 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <Input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            className="pl-10 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <GlowingButton
                          type="submit"
                          disabled={passwordLoading}
                          variant="primary"
                          className="flex items-center gap-2"
                        >
                          {passwordLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full"
                              />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Password
                            </>
                          )}
                        </GlowingButton>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                          }}
                          variant="outline"
                          className="flex items-center gap-2 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 p-4 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                      <Lock className="w-5 h-5" />
                      <span>Password is hidden for security</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FloatingElement>

            {/* Submission History */}
            <FloatingElement delay={0.4}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-black dark:text-white mb-6">
                    Submission History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submissions.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {submissions.map((submission, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            submission.isCorrect
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              submission.isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                            )}>
                              <Flag className={cn(
                                "w-4 h-4",
                                submission.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              )} />
                            </div>
                            <div>
                              <p className="font-medium text-black dark:text-white">
                                Level {submission.level}
                              </p>
                              <p className={cn(
                                "text-sm",
                                submission.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                              )}>
                                {submission.isCorrect ? 'Correct' : 'Incorrect'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(submission.timestamp)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                      <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No submissions yet</p>
                      <p className="text-sm">Start a challenge to see your submission history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FloatingElement>
          </div>

          {/* Sidebar - Stats */}
          <div className="space-y-6">
            {/* Challenge Stats */}
            <FloatingElement delay={0.5}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-black dark:text-white" />
                    Challenge Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
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

                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Total Attempts</span>
                      <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400">
                        <NumberTicker value={challengeStatus?.totalAttempts || 0} />
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Success Rate</span>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400">
                        <NumberTicker value={getSuccessRate()} />%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>


            {/* Progress Overview */}
            <FloatingElement delay={0.7}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-black dark:text-white" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {challengeStatus?.hasStarted ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>Challenge Progress</span>
                          <span>
                            {challengeStatus?.completedLevels?.length || 0} completed
                          </span>
                        </div>
                        <Progress 
                          value={challengeStatus?.isCompleted ? 100 : ((challengeStatus?.completedLevels?.length || 0) * 50)}
                          className="h-3"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>Status</span>
                          <span className={cn(
                            "font-medium",
                            challengeStatus?.isCompleted ? 'text-green-600 dark:text-green-400' :
                            challengeStatus?.isActive ? 'text-blue-600 dark:text-blue-400' :
                            'text-gray-600 dark:text-gray-400'
                          )}>
                            {challengeStatus?.isCompleted ? 'Completed' :
                             challengeStatus?.isActive ? 'In Progress' :
                             'Ended'}
                          </span>
                        </div>
                      </div>

                      {challengeStatus?.challengeStartTime && (
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>Started</span>
                            <span>{formatDate(challengeStatus.challengeStartTime)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                      <p>Challenge not started yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FloatingElement>

            {/* Account Status */}
            <FloatingElement delay={0.8}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-black dark:text-white" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Account Type</span>
                      <Badge className={cn(
                        "text-xs",
                        user?.isAdmin 
                          ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/30 dark:border-white/30'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      )}>
                        {user?.isAdmin ? 'Administrator' : 'User'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <Badge className={cn(
                        "text-xs",
                        user?.isApproved || user?.isAdmin
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      )}>
                        {user?.isApproved || user?.isAdmin ? 'Approved' : 'Pending Approval'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Challenge Access</span>
                      <Badge className={cn(
                        "text-xs",
                        user?.isApproved || user?.isAdmin
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      )}>
                        {user?.isApproved || user?.isAdmin ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
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

export default Profile;