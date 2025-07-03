import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Settings, 
  Monitor,
  BarChart2,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Plus,
  Edit3,
  Save,
  X,
  Clock,
  Shield,
  Activity
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
  Separator,
  Textarea
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
import { cn, formatTime, getTimeColor } from '../../lib/utils';
import LoadingSpinner from '../../components/UX/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [config, setConfig] = useState(null);
  const [monitoring, setMonitoring] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [challengeForm, setChallengeForm] = useState({
    level: '',
    title: '',
    description: '',
    hint: '',
    flag: ''
  });

  // Live monitoring timer states
  const [monitoringTimeRemaining, setMonitoringTimeRemaining] = useState({});
  const monitoringIntervalRef = useRef(null);
  const monitoringDataRef = useRef([]);

  // Update monitoring data ref
  useEffect(() => {
    monitoringDataRef.current = monitoring;
  }, [monitoring]);

  // Get tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  // Update monitoring timers
  const updateMonitoringTimers = useCallback(() => {
    const currentData = monitoringDataRef.current;
    
    if (currentData.length === 0) return;

    setMonitoringTimeRemaining(prev => {
      const updated = { ...prev };
      let hasActiveUsers = false;

      currentData.forEach(user => {
        if (user.isActive && user.timeRemaining > 0) {
          hasActiveUsers = true;
          const currentTime = updated[user.id] !== undefined ? updated[user.id] : user.timeRemaining;
          const newTime = Math.max(0, currentTime - 1);
          updated[user.id] = newTime;
        }
      });

      if (!hasActiveUsers && monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }

      return updated;
    });
  }, []);

  // Start monitoring timer
  const startMonitoringTimer = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }

    // Initialize time remaining for all users
    const initialTimes = {};
    monitoring.forEach(user => {
      if (user.isActive && user.timeRemaining > 0) {
        initialTimes[user.id] = user.timeRemaining;
      }
    });
    setMonitoringTimeRemaining(initialTimes);

    monitoringIntervalRef.current = setInterval(updateMonitoringTimers, 1000);
  }, [monitoring, updateMonitoringTimers]);

  // Auto-refresh monitoring data and start live timers
  useEffect(() => {
    let interval;
    if (activeTab === 'monitoring') {
      interval = setInterval(loadMonitoringData, 5000);
      
      // Start the timer for live countdown
      startMonitoringTimer();
    } else {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [activeTab, startMonitoringTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'overview':
          await loadStats();
          break;
        case 'users':
          await loadUsers();
          break;
        case 'challenges':
          await loadChallenges();
          break;
        case 'config':
          await loadConfig();
          break;
        case 'monitoring':
          await loadMonitoringData();
          break;
        default:
          await loadStats();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const response = await adminAPI.getStats();
    setStats(response.data);
  };

  const loadUsers = async () => {
    const response = await adminAPI.getUsers();
    setUsers(response.data.users);
  };

  const loadChallenges = async () => {
    const response = await adminAPI.getChallenges();
    setChallenges(response.data);
  };

  const loadConfig = async () => {
    const response = await adminAPI.getConfig();
    setConfig(response.data);
  };

  const loadMonitoringData = async () => {
    try {
      const response = await adminAPI.getMonitoring();
      setMonitoring(response.data);
      
      // Update monitoring times when new data is loaded
      if (activeTab === 'monitoring') {
        setTimeout(() => {
          startMonitoringTimer();
        }, 100);
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      toast.success('User approved successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleDisapproveUser = async (userId) => {
    try {
      await adminAPI.disapproveUser(userId);
      toast.success('User approval revoked');
      loadUsers();
    } catch (error) {
      toast.error('Failed to disapprove user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        loadUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleResetUser = async (userId) => {
    if (window.confirm('Are you sure you want to reset this user\'s progress?')) {
      try {
        await adminAPI.resetUser(userId);
        toast.success('User progress reset successfully');
        loadUsers();
        if (activeTab === 'monitoring') {
          loadMonitoringData();
        }
      } catch (error) {
        toast.error('Failed to reset user progress');
      }
    }
  };

  const handleSaveConfig = async () => {
    try {
      await adminAPI.updateConfig(config);
      toast.success('Configuration updated successfully');
    } catch (error) {
      toast.error('Failed to update configuration');
    }
  };

  const handleSaveChallenge = async () => {
    try {
      if (editingChallenge) {
        await adminAPI.updateChallenge(editingChallenge._id, challengeForm);
        toast.success('Challenge updated successfully');
      } else {
        await adminAPI.createChallenge(challengeForm);
        toast.success('Challenge created successfully');
      }
      
      setShowChallengeModal(false);
      setEditingChallenge(null);
      setChallengeForm({
        level: '',
        title: '',
        description: '',
        hint: '',
        flag: ''
      });
      loadChallenges();
    } catch (error) {
      toast.error(editingChallenge ? 'Failed to update challenge' : 'Failed to create challenge');
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await adminAPI.deleteChallenge(challengeId);
        toast.success('Challenge deleted successfully');
        loadChallenges();
      } catch (error) {
        toast.error('Failed to delete challenge');
      }
    }
  };

  const openChallengeModal = (challenge = null) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setChallengeForm({
        level: challenge.level,
        title: challenge.title,
        description: challenge.description,
        hint: challenge.hint || '',
        flag: challenge.flag
      });
    } else {
      setEditingChallenge(null);
      setChallengeForm({
        level: '',
        title: '',
        description: '',
        hint: '',
        flag: ''
      });
    }
    setShowChallengeModal(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'monitoring', label: 'Live Monitoring', icon: Monitor }
  ];

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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <FloatingElement delay={0} className="mb-8">
          <div className="text-center lg:text-left">
            <motion.h1 
              className="text-4xl lg:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-black dark:text-white flex items-center gap-3">
                <Shield className="w-10 h-10" />
                Admin Dashboard
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TypewriterEffect 
                words={['Manage', 'your', 'BizTras', 'CTF', 'platform']}
                delay={50}
              />
            </motion.p>
          </div>
        </FloatingElement>

        {/* Tabs */}
        <FloatingElement delay={0.2} className="mb-8">
          <div className="border-b border-gray-300 dark:border-gray-700">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap",
                      activeTab === tab.id
                        ? 'border-black dark:border-white text-black dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </FloatingElement>

        {/* Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FloatingElement delay={0.3}>
                  <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
                          <p className="text-2xl font-bold text-black dark:text-white">
                            <NumberTicker value={stats.userStats.total} />
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                </FloatingElement>

                <FloatingElement delay={0.4}>
                  <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved Users</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            <NumberTicker value={stats.userStats.approved} />
                          </p>
                        </div>
                        <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                </FloatingElement>

                <FloatingElement delay={0.5}>
                  <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Users</p>
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            <NumberTicker value={stats.userStats.active} />
                          </p>
                        </div>
                        <Monitor className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>
                </FloatingElement>

                <FloatingElement delay={0.6}>
                  <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Challenges</p>
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            <NumberTicker value={stats.challengeStats.total} />
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </FloatingElement>
              </div>

              {/* Level Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FloatingElement delay={0.7}>
                  <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-lg text-black dark:text-white">
                        Level Completion Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.levelStats.map((level) => (
                          <div key={level._id} className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">
                              Level {level._id}
                            </span>
                            <Badge variant="outline" className="border-black/30 dark:border-white/30 text-black dark:text-white">
                              <NumberTicker value={level.count} /> users
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FloatingElement>

                <FloatingElement delay={0.8}>
                  <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-lg text-black dark:text-white">
                        Current Level Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.currentLevelStats.map((level) => (
                          <div key={level._id} className="flex justify-between items-center p-3 bg-white/50 dark:bg-black/50 rounded-lg border border-gray-300 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">
                              Level {level._id}
                            </span>
                            <Badge variant="outline" className="border-black/30 dark:border-white/30 text-black dark:text-white">
                              <NumberTicker value={level.count} /> users
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FloatingElement>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <FloatingElement delay={0.3}>
              <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-black dark:text-white">
                      User Management
                    </CardTitle>
                    <Button
                      onClick={loadUsers}
                      variant="outline"
                      className="flex items-center gap-2 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                            User
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                            Level
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                            Attempts
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-white/50 dark:hover:bg-black/50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-black dark:text-white">
                                  {user.username}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {user.email}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant={user.isApproved ? 'success' : 'warning'}
                                className="text-xs"
                              >
                                {user.isApproved ? 'Approved' : 'Pending'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-black dark:text-white">
                              {user.currentLevel}
                            </td>
                            <td className="py-3 px-4 text-black dark:text-white">
                              {user.totalAttempts}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                {!user.isApproved ? (
                                  <button
                                    onClick={() => handleApproveUser(user._id)}
                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                    title="Approve User"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDisapproveUser(user._id)}
                                    className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                                    title="Revoke Approval"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleResetUser(user._id)}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Reset Progress"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-6">
              <FloatingElement delay={0.3}>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Challenge Management
                  </h3>
                  <GlowingButton
                    onClick={() => openChallengeModal()}
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Challenge
                  </GlowingButton>
                </div>
              </FloatingElement>

              <div className="grid gap-4">
                {challenges.map((challenge, index) => (
                  <FloatingElement key={challenge._id} delay={0.4 + (index * 0.1)}>
                    <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="text-xs bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/30 dark:border-white/30">
                                Level {challenge.level}
                              </Badge>
                            </div>
                            <h4 className="text-lg font-semibold text-black dark:text-white mb-2">
                              {challenge.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                              {challenge.description}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => openChallengeModal(challenge)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit Challenge"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteChallenge(challenge._id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Challenge"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingElement>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === 'config' && config && (
            <FloatingElement delay={0.3}>
              <Card className="max-w-2xl bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-black dark:text-white">
                    Challenge Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Challenge Title
                      </Label>
                      <Input
                        type="text"
                        value={config.challengeTitle}
                        onChange={(e) => setConfig({...config, challengeTitle: e.target.value})}
                        className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Challenge Description
                      </Label>
                      <Textarea
                        value={config.challengeDescription}
                        onChange={(e) => setConfig({...config, challengeDescription: e.target.value})}
                        rows={3}
                        className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Time Limit (minutes)
                        </Label>
                        <Input
                          type="number"
                          value={config.totalTimeLimit}
                          onChange={(e) => setConfig({...config, totalTimeLimit: parseInt(e.target.value)})}
                          className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                          min="1"
                          max="1440"
                        />
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Levels
                        </Label>
                        <Input
                          type="number"
                          value={config.maxLevels}
                          onChange={(e) => setConfig({...config, maxLevels: parseInt(e.target.value)})}
                          className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.challengeActive}
                          onChange={(e) => setConfig({...config, challengeActive: e.target.checked})}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium text-black dark:text-white">
                          Challenge Active
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.registrationOpen}
                          onChange={(e) => setConfig({...config, registrationOpen: e.target.checked})}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium text-black dark:text-white">
                          Registration Open
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.allowHints}
                          onChange={(e) => setConfig({...config, allowHints: e.target.checked})}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium text-black dark:text-white">
                          Allow Hints
                        </span>
                      </label>
                    </div>

                    <GlowingButton
                      onClick={handleSaveConfig}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Configuration
                    </GlowingButton>
                  </div>
                </CardContent>
              </Card>
            </FloatingElement>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <FloatingElement delay={0.3}>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Live User Monitoring
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <PulsingDot color="bg-green-500" />
                      Auto-refreshing every 5 seconds
                    </div>
                    <Button
                      onClick={loadMonitoringData}
                      variant="outline"
                      className="flex items-center gap-2 bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Now
                    </Button>
                  </div>
                </div>
              </FloatingElement>

              <div className="grid gap-4">
                {monitoring.map((user, index) => {
                  // Use live countdown time if available, otherwise use original time
                  const displayTimeRemaining = user.isActive && monitoringTimeRemaining[user.id] !== undefined 
                    ? monitoringTimeRemaining[user.id] 
                    : user.timeRemaining;

                  return (
                    <FloatingElement key={user.id} delay={0.4 + (index * 0.1)}>
                      <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-300 dark:border-gray-700 shadow-xl">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-black dark:text-white">
                                  {user.username}
                                </h4>
                                <Badge 
                                  variant={user.isActive ? 'success' : 'secondary'}
                                  className="text-xs flex items-center gap-1"
                                >
                                  <PulsingDot 
                                    color={user.isActive ? 'bg-green-500' : 'bg-gray-500'} 
                                    className="scale-75" 
                                  />
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {user.email}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Current Level</p>
                                  <p className="font-medium text-black dark:text-white">
                                    {user.currentLevel}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Completed</p>
                                  <p className="font-medium text-black dark:text-white">
                                    {user.completedLevels.length} levels
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Attempts</p>
                                  <p className="font-medium text-black dark:text-white">
                                    {user.totalAttempts}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Time Remaining</p>
                                  <div className="flex items-center gap-1">
                                    <p className={cn(
                                      "font-medium",
                                      user.isActive ? getTimeColor(displayTimeRemaining) : 'text-gray-500 dark:text-gray-400'
                                    )}>
                                      {user.isActive ? formatTime(displayTimeRemaining) : 'N/A'}
                                    </p>
                                    {user.isActive && displayTimeRemaining > 0 && (
                                      <Clock className={cn("w-3 h-3", getTimeColor(displayTimeRemaining))} />
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Last Activity</p>
                                  <p className="font-medium text-black dark:text-white text-xs">
                                    {user.lastActivity ? new Date(user.lastActivity).toLocaleTimeString() : 'N/A'}
                                  </p>
                                </div>
                              </div>

                              {/* Time Progress Bar for Active Users */}
                              {user.isActive && displayTimeRemaining > 0 && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    <span>Time Progress</span>
                                    <span>{Math.round((displayTimeRemaining / 3600) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5">
                                    <motion.div 
                                      className={cn(
                                        "h-1.5 rounded-full transition-all duration-1000",
                                        displayTimeRemaining > 300 ? 'bg-green-500' :
                                        displayTimeRemaining > 60 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      )}
                                      style={{ 
                                        width: `${Math.max(0, Math.min(100, (displayTimeRemaining / 3600) * 100))}%` 
                                      }}
                                      animate={{ width: `${Math.max(0, Math.min(100, (displayTimeRemaining / 3600) * 100))}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {user.submissions && user.submissions.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Recent Submissions:
                                  </p>
                                  <div className="flex gap-2 flex-wrap">
                                    {user.submissions.slice(-5).map((submission, index) => (
                                      <span
                                        key={index}
                                        className={cn(
                                          "px-2 py-1 text-xs rounded flex items-center gap-1",
                                          submission.isCorrect
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                        )}
                                      >
                                        L{submission.level}: {submission.isCorrect ? '✓' : '✗'}
                                        <span className="text-xs opacity-60">
                                          {new Date(submission.timestamp).toLocaleTimeString()}
                                        </span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Challenge Status */}
                              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-4">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      Started: {user.challengeStartTime ? new Date(user.challengeStartTime).toLocaleTimeString() : 'N/A'}
                                    </span>
                                    {user.challengeEndTime && (
                                      <span className="text-gray-600 dark:text-gray-400">
                                        Ends: {new Date(user.challengeEndTime).toLocaleTimeString()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleResetUser(user.id)}
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                      title="Reset Progress"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </FloatingElement>
                  );
                })}
                
                {monitoring.length === 0 && (
                  <FloatingElement delay={0.4}>
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                      <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No active users to monitor</p>
                      <p className="text-sm">Users will appear here when they start challenges</p>
                    </div>
                  </FloatingElement>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Challenge Modal */}
        {showChallengeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-black rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
                  </h3>
                  <button
                    onClick={() => setShowChallengeModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Level */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level
                    </Label>
                    <Input
                      type="number"
                      value={challengeForm.level}
                      onChange={(e) => setChallengeForm({...challengeForm, level: parseInt(e.target.value)})}
                      className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                      min="1"
                      max="10"
                      placeholder="Enter level number"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </Label>
                    <Input
                      type="text"
                      value={challengeForm.title}
                      onChange={(e) => setChallengeForm({...challengeForm, title: e.target.value})}
                      className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                      placeholder="Enter challenge title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </Label>
                    <Textarea
                      value={challengeForm.description}
                      onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                      rows={4}
                      className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                      placeholder="Enter challenge description"
                    />
                  </div>

                  {/* Hint */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hint (Optional)
                    </Label>
                    <Textarea
                      value={challengeForm.hint}
                      onChange={(e) => setChallengeForm({...challengeForm, hint: e.target.value})}
                      rows={2}
                      className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                      placeholder="Enter hint for the challenge"
                    />
                  </div>

                  {/* Flag */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Flag
                    </Label>
                    <Input
                      type="text"
                      value={challengeForm.flag}
                      onChange={(e) => setChallengeForm({...challengeForm, flag: e.target.value})}
                      className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                      placeholder="Enter the correct flag"
                    />
                  </div>

                  <Separator className="my-6 bg-gray-300 dark:bg-gray-700" />

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => setShowChallengeModal(false)}
                      variant="outline"
                      className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <GlowingButton
                      onClick={handleSaveChallenge}
                      variant="primary"
                      className="flex items-center gap-2"
                      disabled={!challengeForm.level || !challengeForm.title || !challengeForm.description || !challengeForm.flag}
                    >
                      <Save className="w-4 h-4" />
                      {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                    </GlowingButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;