import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiCalendar, 
  FiClock, 
  FiCheckCircle,
  FiAlertCircle,
  FiEdit,
  FiTrash2,
  FiBell,
  FiBellOff,
  FiSettings
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';
import TaskCreator from './TaskCreator';
import TaskList from './TaskList';
import NotificationSettings from './NotificationSettings';

const TodoDashboard = () => {
  const { isDark } = useTheme();

  // Simple TaskCalendar placeholder component
  const TaskCalendar = ({ tasks, onTaskEdit, onTaskComplete }) => (
    <div className="p-6">
      <div className="text-center">
        <FiCalendar className={`mx-auto h-16 w-16 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
        <h3 className={`mt-4 text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Calendar View
        </h3>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Calendar view will be implemented in a future update.
        </p>
        <p className={`mt-1 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          For now, use the List View to manage your tasks.
        </p>
      </div>
    </div>
  );

  const [tasks, setTasks] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1
  });
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await api.get(`/cloud/todos?${queryParams}`);
      
      if (response.status === 'success') {
        setTasks(response.tasks);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages
        }));
        
        if (showToast) {
          toast.success('Tasks refreshed successfully');
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.get('/cloud/todos/stats');
      if (response.status === 'success') {
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchTasks();
    fetchStatistics();
  }, [fetchTasks, fetchStatistics]);

  // Handle task creation
  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    setShowTaskCreator(false);
    fetchStatistics();
    toast.success('Task created successfully');
  };

  // Handle task update
  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
    setSelectedTask(null);
    fetchStatistics();
    toast.success('Task updated successfully');
  };

  // Handle task deletion
  const handleTaskDeleted = async (taskId) => {
    try {
      await api.delete(`/cloud/todos/${taskId}`);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      fetchStatistics();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Handle task completion
  const handleTaskCompleted = async (taskId) => {
    try {
      const response = await api.patch(`/cloud/todos/${taskId}/complete`);
      if (response.status === 'success') {
        setTasks(prev => prev.map(task => 
          task._id === taskId ? { ...task, status: 'completed', completedAt: new Date() } : task
        ));
        fetchStatistics();
        toast.success('Task marked as completed');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          toast.success('Notifications enabled successfully');
          // Register for push notifications
          await registerForPushNotifications();
        } else {
          toast.warning('Notifications permission denied');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        toast.error('Failed to enable notifications');
      }
    }
  };

  // Register for push notifications
  const registerForPushNotifications = async () => {
    try {
      // Check if VAPID key is available
      const vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      
      if (!vapidKey) {
        toast.error('Push notifications are not configured. Please contact administrator.');
        return;
      }
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      await api.post('/notifications/subscribe', { subscription });
      toast.success('Push notifications enabled');
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      toast.error('Failed to enable push notifications. Please ensure VAPID keys are configured.');
    }
  };

  // Statistics cards data
  const statsCards = [
    {
      title: 'Total Tasks',
      value: statistics.totalTasks || 0,
      icon: FiCheckCircle,
      color: 'bg-blue-500'
    },
    {
      title: 'Completed',
      value: statistics.completedTasks || 0,
      icon: FiCheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Due Today',
      value: statistics.dueTodayTasks || 0,
      icon: FiClock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Overdue',
      value: statistics.overdueTasks || 0,
      icon: FiAlertCircle,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    } py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Todo Dashboard
              </h1>
              <p className={`mt-1 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Manage your tasks and stay organized
              </p>
            </div>
            
            <div className="flex gap-3">
              {/* Notification permission button */}
              {notificationPermission !== 'granted' && (
                <button
                  onClick={requestNotificationPermission}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  <FiBell className="mr-2" size={20} />
                  Enable Notifications
                </button>
              )}
              
              {/* Notification settings */}
              <button
                onClick={() => setShowNotificationSettings(true)}
                className={`flex items-center px-4 py-2 ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                } border rounded-lg transition`}
              >
                <FiSettings className="mr-2" size={20} />
                Settings
              </button>
              
              {/* Create task button */}
              <button
                onClick={() => setShowTaskCreator(true)}
                className="flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
              >
                <FiPlus className="mr-2" size={20} />
                New Task
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className={`${
                isDark ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow p-6`}
            >
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Status filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Priority filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Sort */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="createdAt-desc">Created (Newest)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'list', label: 'List View', icon: FiCheckCircle },
            { id: 'calendar', label: 'Calendar', icon: FiCalendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <tab.icon className="mr-2" size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow min-h-96`}>
          {activeTab === 'list' && (
            <TaskList
              tasks={tasks}
              loading={loading}
              onTaskEdit={(task) => setSelectedTask(task)}
              onTaskDelete={handleTaskDeleted}
              onTaskComplete={handleTaskCompleted}
              pagination={pagination}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          )}
          
          {activeTab === 'calendar' && (
            <TaskCalendar
              tasks={tasks}
              onTaskEdit={(task) => setSelectedTask(task)}
              onTaskComplete={handleTaskCompleted}
            />
          )}
        </div>

        {/* Task Creator Modal */}
        {showTaskCreator && (
          <TaskCreator
            onClose={() => setShowTaskCreator(false)}
            onTaskCreated={handleTaskCreated}
          />
        )}

        {/* Task Editor Modal */}
        {selectedTask && (
          <TaskCreator
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onTaskUpdated={handleTaskUpdated}
          />
        )}

        {/* Notification Settings Modal */}
        {showNotificationSettings && (
          <NotificationSettings
            onClose={() => setShowNotificationSettings(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TodoDashboard;