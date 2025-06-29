import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { Card } from '../ui';

const NotificationManager = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    url: '',
    targetType: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (showHistory) {
      fetchNotificationHistory();
    }
  }, [showHistory]);

  const fetchNotificationHistory = async () => {
    try {
      const response = await api.get('/push-notifications/history?limit=20');
      setNotifications(response.data.data.notifications);
    } catch (error) {
      console.error('Error fetching notification history:', error);
      toast.error('Failed to fetch notification history');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setIsLoading(true);

    try {
      let endpoint = '/push-notifications/send-to-all';
      
      if (formData.targetType === 'cloud_users') {
        endpoint = '/push-notifications/send-to-cloud-users';
      } else if (formData.targetType === 'regular_users') {
        endpoint = '/push-notifications/send-to-regular-users';
      }

      const response = await api.post(endpoint, {
        title: formData.title,
        message: formData.message,
        url: formData.url || '/dashboard'
      });

      toast.success(`Notification sent successfully! Delivered: ${response.data.data.delivered}, Failed: ${response.data.data.failed}`);
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        url: '',
        targetType: 'all'
      });

      // Refresh history if showing
      if (showHistory) {
        fetchNotificationHistory();
      }

    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTargetTypeLabel = (targetType) => {
    const labels = {
      'all': 'All Users',
      'cloud_users': 'Cloud Users',
      'regular_users': 'Regular Users',
      'specific_users': 'Specific Users'
    };
    return labels[targetType] || targetType;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Push Notifications</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>

      {/* Send Notification Form */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Send Push Notification</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Target Audience *
            </label>
            <select
              name="targetType"
              value={formData.targetType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="all">All Users</option>
              <option value="cloud_users">Cloud Users Only</option>
              <option value="regular_users">Regular Users Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification title"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification message"
              rows={4}
              maxLength={500}
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              {formData.message.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Redirect URL (Optional)
            </label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/dashboard, /challenges, etc."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isLoading ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </Card>

      {/* Notification History */}
      {showHistory && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Notification History</h3>
          
          {notifications.length === 0 ? (
            <p className="text-gray-400">No notifications sent yet.</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="border border-gray-600 rounded-lg p-4 bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{notification.title}</h4>
                    <span className="text-sm text-gray-400">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-2">{notification.message}</p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-400">
                      Target: {getTargetTypeLabel(notification.targetType)}
                    </span>
                    
                    <div className="flex space-x-4">
                      <span className="text-green-400">
                        ✓ {notification.totalDelivered} delivered
                      </span>
                      <span className="text-red-400">
                        ✗ {notification.totalFailed} failed
                      </span>
                      <span className="text-gray-400">
                        Total: {notification.totalSent}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default NotificationManager;