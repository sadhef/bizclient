import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiBell, FiSend, FiUsers, FiUser, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const PushNotificationManager = ({ onClose }) => {
  const { isDark } = useTheme();
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    targetType: 'all', // 'all', 'specific', 'role'
    targetUsers: [],
    role: 'user'
  });
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    totalTokens: 0,
    activeUsers: 0
  });
  const [backendReady, setBackendReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if backend is ready
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/api/debug/routes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBackendReady(true);
        console.log('✅ Backend notification routes are available:', data);
        
        // If backend is ready, fetch users and stats
        fetchUsers();
        fetchNotificationStats();
      } else {
        throw new Error('Backend routes not available');
      }
    } catch (error) {
      console.error('❌ Backend not ready:', error);
      setBackendReady(false);
      
      // Set mock data for demo
      setUsers([
        { _id: '1', name: 'Demo User 1', email: 'user1@example.com' },
        { _id: '2', name: 'Demo User 2', email: 'user2@example.com' }
      ]);
      setStats({
        totalTokens: 5,
        activeUsers: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users, using mock data');
        setUsers([
          { _id: '1', name: 'Demo User 1', email: 'user1@example.com' },
          { _id: '2', name: 'Demo User 2', email: 'user2@example.com' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([
        { _id: '1', name: 'Demo User 1', email: 'user1@example.com' },
        { _id: '2', name: 'Demo User 2', email: 'user2@example.com' }
      ]);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats, using mock data');
        setStats({
          totalTokens: 5,
          activeUsers: 3
        });
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      setStats({
        totalTokens: 5,
        activeUsers: 3
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelection = (userId) => {
    setNotification(prev => ({
      ...prev,
      targetUsers: prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter(id => id !== userId)
        : [...prev.targetUsers, userId]
    }));
  };

  const sendNotification = async () => {
    if (!notification.title.trim() || !notification.body.trim()) {
      toast.error('Please enter both title and message');
      return;
    }

    setSending(true);

    try {
      if (!backendReady) {
        // Simulate sending for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success(`Demo: Notification would be sent to ${
          notification.targetType === 'all' ? 'all users' :
          notification.targetType === 'role' ? `${notification.role} users` :
          `${notification.targetUsers.length} selected users`
        }`);
        
        // Reset form
        setNotification({
          title: '',
          body: '',
          targetType: 'all',
          targetUsers: [],
          role: 'user'
        });
        return;
      }

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(notification)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Notification sent successfully to ${data.sentCount} users`);
        
        // Reset form
        setNotification({
          title: '',
          body: '',
          targetType: 'all',
          targetUsers: [],
          role: 'user'
        });

        // Refresh stats
        fetchNotificationStats();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const sendTestNotification = async () => {
    setSending(true);
    try {
      if (!backendReady) {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Demo: Test notification would be sent to your devices!');
        return;
      }

      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Test notification sent to your devices!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error(error.message || 'Failed to send test notification');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg shadow-lg ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
          <span>Loading notification panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg shadow-lg ${
      isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiBell className="mr-3 text-2xl text-indigo-500" />
          <h2 className="text-2xl font-bold">Push Notifications</h2>
          {!backendReady && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              Demo Mode
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        )}
      </div>

      {/* Backend Status Warning */}
      {!backendReady && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 border-yellow-400 ${
          isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
        }`}>
          <div className="flex">
            <FiAlertTriangle className="text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium">Backend Not Ready</h4>
              <p className="text-sm mt-1">
                The notification API endpoints are not available yet. You can still test the interface in demo mode.
                Deploy the notification routes to enable real functionality.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <div className="flex items-center">
            <FiUsers className="mr-2 text-indigo-500" />
            <div>
              <p className="text-sm opacity-75">Total Registered Devices</p>
              <p className="text-2xl font-bold">{stats.totalTokens}</p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <div className="flex items-center">
            <FiUser className="mr-2 text-green-500" />
            <div>
              <p className="text-sm opacity-75">Active Users</p>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Notification Button */}
      <div className="mb-6">
        <button
          onClick={sendTestNotification}
          disabled={sending}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
            sending
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Sending Test...
            </>
          ) : (
            <>
              <FiBell className="mr-2" />
              Send Test Notification
            </>
          )}
        </button>
      </div>

      {/* Notification Form */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Notification Title
          </label>
          <input
            type="text"
            name="title"
            value={notification.title}
            onChange={handleInputChange}
            placeholder="Enter notification title"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            maxLength={100}
          />
          <p className="text-xs opacity-75 mt-1">
            {notification.title.length}/100 characters
          </p>
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Notification Message
          </label>
          <textarea
            name="body"
            value={notification.body}
            onChange={handleInputChange}
            placeholder="Enter notification message"
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            maxLength={500}
          />
          <p className="text-xs opacity-75 mt-1">
            {notification.body.length}/500 characters
          </p>
        </div>

        {/* Target Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Send To
          </label>
          <select
            name="targetType"
            value={notification.targetType}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Users</option>
            <option value="role">By Role</option>
            <option value="specific">Specific Users</option>
          </select>
        </div>

        {/* Role Selection */}
        {notification.targetType === 'role' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Role
            </label>
            <select
              name="role"
              value={notification.role}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="user">Regular Users</option>
              <option value="admin">Administrators</option>
              <option value="cloud">Cloud Users</option>
            </select>
          </div>
        )}

        {/* Specific Users Selection */}
        {notification.targetType === 'specific' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Users
            </label>
            <div className={`max-h-40 overflow-y-auto border rounded-lg p-3 ${
              isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
            }`}>
              {users.map(user => (
                <label key={user._id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={notification.targetUsers.includes(user._id)}
                    onChange={() => handleUserSelection(user._id)}
                    className="text-indigo-600"
                  />
                  <span className="text-sm">
                    {user.name} ({user.email})
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs opacity-75 mt-1">
              {notification.targetUsers.length} users selected
            </p>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={sendNotification}
          disabled={sending || !notification.title.trim() || !notification.body.trim()}
          className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
            sending || !notification.title.trim() || !notification.body.trim()
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Sending...
            </>
          ) : (
            <>
              <FiSend className="mr-2" />
              Send Notification {!backendReady && '(Demo)'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PushNotificationManager;