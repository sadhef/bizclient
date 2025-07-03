import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { challengeAPI } from '../../services/api';
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiTarget, 
  FiAward, 
  FiFlag,
  FiClock,
  FiEdit3,
  FiSave,
  FiX,
  FiLock
} from 'react-icons/fi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
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
      
      try {
        const submissionsResponse = await challengeAPI.getSubmissions();
        setSubmissions(submissionsResponse.data.submissions);
      } catch (error) {
        console.error('Error loading submissions:', error);
      }
      
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSuccessRate = () => {
    if (submissions.length === 0) return 0;
    const correctSubmissions = submissions.filter(sub => sub.isCorrect).length;
    return Math.round((correctSubmissions / submissions.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View your account information and challenge progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Account Information
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-700 dark:from-white dark:to-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-white dark:text-black text-xl font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      {user?.username}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <FiUser className="w-5 h-5 text-black dark:text-white" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Username</p>
                      <p className="text-sm font-medium text-black dark:text-white">
                        {user?.username}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FiMail className="w-5 h-5 text-black dark:text-white" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                      <p className="text-sm font-medium text-black dark:text-white">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-5 h-5 text-black dark:text-white" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Member Since</p>
                      <p className="text-sm font-medium text-black dark:text-white">
                        {formatDate(user?.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${
                      user?.isApproved ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                      <p className="text-sm font-medium text-black dark:text-white">
                        {user?.isAdmin ? 'Administrator' : user?.isApproved ? 'Approved' : 'Pending Approval'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Security Settings
                </h2>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    Change Password
                  </button>
                )}
              </div>

              {showPasswordForm ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                      {passwordLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          Save Password
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <FiLock className="w-5 h-5" />
                  <span className="text-sm">Password is hidden for security</span>
                </div>
              )}
            </div>

            {/* Submission History */}
            <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-black dark:text-white mb-6">
                Submission History
              </h2>
              
              {submissions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {submissions.map((submission, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        submission.isCorrect
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          submission.isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <FiFlag className={`w-4 h-4 ${
                            submission.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">
                            Level {submission.level}
                          </p>
                          <p className={`text-xs ${
                            submission.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                          }`}>
                            {submission.isCorrect ? 'Correct' : 'Incorrect'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(submission.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <FiFlag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No submissions yet</p>
                  <p className="text-xs">Start a challenge to see your submission history</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Stats */}
          <div className="space-y-6">
            {/* Challenge Stats */}
            <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Challenge Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiTarget className="w-4 h-4 text-black dark:text-white" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Level</span>
                  </div>
                  <span className="text-sm font-semibold text-black dark:text-white">
                    {challengeStatus?.currentLevel || 1}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiAward className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed Levels</span>
                  </div>
                  <span className="text-sm font-semibold text-black dark:text-white">
                    {challengeStatus?.completedLevels?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiFlag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</span>
                  </div>
                  <span className="text-sm font-semibold text-black dark:text-white">
                    {challengeStatus?.totalAttempts || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                  </div>
                  <span className="text-sm font-semibold text-black dark:text-white">
                    {getSuccessRate()}%
                  </span>
                </div>
              </div>
            </div>

            {/* Achievement Badge */}
            {challengeStatus?.isCompleted && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mb-3">
                    <FiAward className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-black dark:text-white mb-2">
                    CTF Champion!
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    You've completed all challenge levels
                  </p>
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Account Type</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user?.isAdmin 
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {user?.isAdmin ? 'Administrator' : 'User'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user?.isApproved || user?.isAdmin
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {user?.isApproved || user?.isAdmin ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Challenge Access</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user?.isApproved || user?.isAdmin
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {user?.isApproved || user?.isAdmin ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;