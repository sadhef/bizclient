import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiBell, FiSend, FiUsers, FiUser, FiX, FiAlertTriangle, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const PushNotificationManager = ({ onClose }) => {
  const { isDark } = useTheme();
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    targetType: 'all',
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
  const [debugInfo, setDebugInfo] = useState('');

  // Get the correct base URL
  const getBaseURL = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000';
      } else {
        return window.location.origin;
      }
    }
    return '';
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    const baseURL = getBaseURL();
    const debugUrl = `${baseURL}/api/debug/routes`;
    
    try {
      setDebugInfo(`🔍 Testing: ${debugUrl}`);
      console.log('🔍 Testing backend at:', debugUrl);
      
      const response = await fetch(debugUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', [...response.headers.entries()]);
      
      setDebugInfo(prev => prev + `\n📡 Status: ${response.status}`);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('📋 Content-Type:', contentType);
        setDebugInfo(prev => prev + `\n📋 Content-Type: ${contentType}`);
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json();
            console.log('✅ Backend response:', data);
            setDebugInfo(prev => prev + '\n✅ JSON response received');
            setBackendReady(true);
            
            // Fetch users and stats
            fetchUsers();
            fetchNotificationStats();
          } catch (jsonError) {
            console.error('❌ JSON parsing error:', jsonError);
            const text = await response.text();
            console.error('📄 Raw response:', text.substring(0, 500));
            setDebugInfo(prev => prev + `\n❌ JSON parse error: ${jsonError.message}\n📄 Raw: ${text.substring(0, 200)}`);
            throw new Error('Failed to parse JSON response');
          }
        } else {
          const text = await response.text();
          console.error('❌ Non-JSON response:', text.substring(0, 500));
          setDebugInfo(prev => prev + `\n❌ Non-JSON response\n📄 Raw: ${text.substring(0, 200)}`);
          throw new Error('Backend returned non-JSON response');
        }
      } else {
        const text = await response.text();
        console.error(`❌ HTTP ${response.status}:`, text.substring(0, 500));
        setDebugInfo(prev => prev + `\n❌ HTTP ${response.status}\n📄 Raw: ${text.substring(0, 200)}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Backend not ready:', error);
      setDebugInfo(prev => prev + `\n❌ Error: ${error.message}`);
      setBackendReady(false);
      setUsers([]);
      setStats({ totalTokens: 0, activeUsers: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const baseURL = getBaseURL();
    try {
      const response = await fetch(`${baseURL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          console.error('Users endpoint returned non-JSON');
          setUsers([]);
        }
      } else {
        console.error('Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchNotificationStats = async () => {
    const baseURL = getBaseURL();
    try {
      const response = await fetch(`${baseURL}/api/notifications/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('Stats endpoint returned non-JSON');
          setStats({ totalTokens: 0, activeUsers: 0 });
        }
      } else {
        console.error('Failed to fetch stats');
        setStats({ totalTokens: 0, activeUsers: 0 });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ totalTokens: 0, activeUsers: 0 });
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

    if (!backendReady) {
      toast.error('Backend is not ready. Please try again later.');
      return;
    }

    setSending(true);
    const baseURL = getBaseURL();

    try {
      const response = await fetch(`${baseURL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(notification)
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          toast.success(`Notification sent successfully to ${data.sentCount} users`);
        } else {
          toast.success('Notification sent successfully');
        }
        
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
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to send notification';
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          errorMessage = errorData.message || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const sendTestNotification = async () => {
    if (!backendReady) {
      toast.error('Backend is not ready. Please try again later.');
      return;
    }

    setSending(true);
    const baseURL = getBaseURL();
    
    try {
      const response = await fetch(`${baseURL}/api/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          toast.success('Test notification sent to your devices!');
        } else {
          toast.success('Test notification sent to your devices!');
        }
      } else {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to send test notification';
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          errorMessage = errorData.message || errorMessage;
        }
        
        throw new Error(errorMessage);
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
          <button
            onClick={checkBackendStatus}
            className="ml-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Refresh backend status"
          >
            <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
          </button>
          {backendReady && (
            <FiCheck className="ml-2 text-green-500" title="Backend Ready" />
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

      {/* Debug Information */}
      {debugInfo && (
        <div className={`mb-6 p-4 rounded-lg font-mono text-sm ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <h4 className="font-bold mb-2">🔍 Debug Information:</h4>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}

      {/* Backend Status */}
      {!backendReady && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 border-red-400 ${
          isDark ? 'bg-red-900/20' : 'bg-red-50'
        }`}>
          <div className="flex">
            <FiAlertTriangle className="text-red-400 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium">Backend Not Available</h4>
              <p className="text-sm mt-1">
                The notification API endpoints are not responding correctly. Check the debug information above for details.
              </p>
              <button
                onClick={checkBackendStatus}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {backendReady && (
        <>
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

          {/* Send Notification Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Notification Title
              </label>
              <input
                type="text"
                name="title"
                value={notification.title}
                onChange={handleInputChange}
                placeholder="Enter notification title..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Notification Message
              </label>
              <textarea
                name="body"
                value={notification.body}
                onChange={handleInputChange}
                placeholder="Enter notification message..."
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Target Audience
              </label>
              <select
                name="targetType"
                value={notification.targetType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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

            {notification.targetType === 'role' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Role
                </label>
                <select
                  name="role"
                  value={notification.role}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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

            {notification.targetType === 'specific' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Users ({notification.targetUsers.length} selected)
                </label>
                {users.length > 0 ? (
                  <div className={`max-h-40 overflow-y-auto border rounded-lg p-2 ${
                    isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}>
                    {users.map(user => (
                      <label key={user._id} className="flex items-center py-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notification.targetUsers.includes(user._id)}
                          onChange={() => handleUserSelection(user._id)}
                          className="mr-2"
                        />
                        <span className="text-sm">{user.name} ({user.email})</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className={`p-4 text-center border rounded-lg ${
                    isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'
                  }`}>
                    <p className="text-sm opacity-75">No users available</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={sendNotification}
                disabled={sending || !notification.title.trim() || !notification.body.trim() || !backendReady}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Send Notification
                  </>
                )}
              </button>
              
              <button
                onClick={sendTestNotification}
                disabled={sending || !backendReady}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <FiBell className="mr-2" />
                    Test
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PushNotificationManager;