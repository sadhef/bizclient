import React, { useState } from 'react';
import { 
  FiEdit, 
  FiTrash2, 
  FiCheck, 
  FiClock, 
  FiCalendar,
  FiTag,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const TaskList = ({ 
  tasks, 
  loading, 
  onTaskEdit, 
  onTaskDelete, 
  onTaskComplete,
  pagination,
  onPageChange
}) => {
  const { isDark } = useTheme();
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Completed' };
      case 'in-progress':
        return { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'In Progress' };
      case 'cancelled':
        return { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-900/30', label: 'Cancelled' };
      default:
        return { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Pending' };
    }
  };

  // Check if task is overdue
  const isOverdue = (task) => {
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === -1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle task selection
  const handleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task._id));
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading tasks...
        </p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center">
        <FiCalendar className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
        <h3 className={`mt-4 text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          No tasks found
        </h3>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Create your first task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Bulk actions */}
      {selectedTasks.length > 0 && (
        <div className={`mb-4 p-4 rounded-lg border ${
          isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {selectedTasks.length} task(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Implement bulk complete
                  selectedTasks.forEach(taskId => onTaskComplete(taskId));
                  setSelectedTasks([]);
                }}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition"
              >
                Complete
              </button>
              <button
                onClick={() => {
                  // Implement bulk delete
                  selectedTasks.forEach(taskId => onTaskDelete(taskId));
                  setSelectedTasks([]);
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <input
            type="checkbox"
            checked={selectedTasks.length === tasks.length}
            onChange={handleSelectAll}
            className="form-checkbox text-violet-600 focus:ring-violet-500"
          />
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Select All
          </span>
        </div>

        {/* Tasks */}
        {tasks.map((task) => {
          const statusInfo = getStatusInfo(task.status);
          const taskOverdue = isOverdue(task);

          return (
            <div
              key={task._id}
              className={`p-4 border rounded-lg transition hover:shadow-md ${
                isDark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'
              } ${taskOverdue ? 'border-red-300 dark:border-red-700' : ''}`}
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task._id)}
                  onChange={() => handleTaskSelection(task._id)}
                  className="form-checkbox text-violet-600 focus:ring-violet-500 mt-1"
                />

                {/* Priority indicator */}
                <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(task.priority)}`} />

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  {/* Title and status */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-medium truncate ${
                      isDark ? 'text-white' : 'text-gray-900'
                    } ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                      {task.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      {taskOverdue && (
                        <FiAlertCircle className="text-red-500" size={16} />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className={`text-sm mb-3 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    } ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                      {task.description}
                    </p>
                  )}

                  {/* Due date and tags */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      {/* Due date */}
                      <div className={`flex items-center ${
                      taskOverdue ? 'text-red-600 dark:text-red-400' : isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <FiClock className="mr-1" size={14} />
                        {formatDate(task.dueDate)}
                      </div>

                      {/* Reminder time */}
                      {task.reminderTime && (
                        <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <FiCalendar className="mr-1" size={14} />
                          Reminder: {formatDate(task.reminderTime)}
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <FiTag size={14} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                        <div className="flex space-x-1">
                          {task.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              +{task.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => onTaskComplete(task._id)}
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition"
                      title="Mark as completed"
                    >
                      <FiCheck size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onTaskEdit(task)}
                    className={`p-2 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-lg transition`}
                    title="Edit task"
                  >
                    <FiEdit size={16} />
                  </button>
                  
                  <button
                    onClick={() => onTaskDelete(task._id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                    title="Delete task"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing page {pagination.page} of {pagination.totalPages}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`flex items-center px-3 py-2 rounded-lg border transition ${
                pagination.page === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FiChevronLeft className="mr-1" size={16} />
              Previous
            </button>
            
            <span className={`px-4 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {pagination.page} / {pagination.totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`flex items-center px-3 py-2 rounded-lg border transition ${
                pagination.page === pagination.totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
              <FiChevronRight className="ml-1" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;