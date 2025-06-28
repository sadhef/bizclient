import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FiX, 
  FiSave, 
  FiCalendar, 
  FiClock, 
  FiTag,
  FiAlertCircle,
  FiRepeat
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const TaskCreator = ({ task = null, onClose, onTaskCreated, onTaskUpdated }) => {
  const { isDark } = useTheme();
  const isEditing = !!task;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    reminderTime: '',
    isRecurring: false,
    recurringType: 'weekly',
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
        reminderTime: task.reminderTime ? new Date(task.reminderTime).toISOString().slice(0, 16) : '',
        isRecurring: task.isRecurring || false,
        recurringType: task.recurringType || 'weekly',
        tags: task.tags || []
      });
    }
  }, [task]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      
      if (!isEditing && dueDate <= now) {
        newErrors.dueDate = 'Due date must be in the future';
      }
    }

    if (formData.reminderTime) {
      const reminderTime = new Date(formData.reminderTime);
      const dueDate = new Date(formData.dueDate);
      
      if (reminderTime >= dueDate) {
        newErrors.reminderTime = 'Reminder time must be before due date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const taskData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim())
      };

      let response;
      if (isEditing) {
        response = await api.patch(`/cloud/todos/${task._id}`, taskData);
        if (response.status === 'success' && onTaskUpdated) {
          onTaskUpdated(response.task);
        }
      } else {
        response = await api.post('/cloud/todos', taskData);
        if (response.status === 'success' && onTaskCreated) {
          onTaskCreated(response.task);
        }
      }

      toast.success(isEditing ? 'Task updated successfully' : 'Task created successfully');
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date for date inputs
  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-red-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${
        isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-xl font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" size={16} />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Enter task description (optional)"
            />
          </div>

          {/* Priority */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Priority
            </label>
            <div className="flex space-x-3">
              {priorityOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border ${
                    formData.priority === option.value
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                      : isDark
                        ? 'border-gray-600 hover:bg-gray-700'
                        : 'border-gray-300 hover:bg-gray-50'
                  } transition`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={formData.priority === option.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-3 h-3 rounded-full ${option.color}`} />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Due Date and Reminder Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FiCalendar className="inline mr-1" size={16} />
                Due Date *
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={!isEditing ? getMinDate() : undefined}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } ${errors.dueDate ? 'border-red-500' : ''}`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" size={16} />
                  {errors.dueDate}
                </p>
              )}
            </div>

            {/* Reminder Time */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FiClock className="inline mr-1" size={16} />
                Reminder Time
              </label>
              <input
                type="datetime-local"
                name="reminderTime"
                value={formData.reminderTime}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } ${errors.reminderTime ? 'border-red-500' : ''}`}
              />
              {errors.reminderTime && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" size={16} />
                  {errors.reminderTime}
                </p>
              )}
            </div>
          </div>

          {/* Recurring Task */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="form-checkbox text-violet-600 focus:ring-violet-500"
              />
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FiRepeat className="inline mr-1" size={16} />
                Recurring Task
              </span>
            </label>

            {formData.isRecurring && (
              <div className="mt-3">
                <select
                  name="recurringType"
                  value={formData.recurringType}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <FiTag className="inline mr-1" size={16} />
              Tags
            </label>
            
            {/* Add tag input */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
              >
                Add
              </button>
            </div>

            {/* Display tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-200"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 border rounded-lg transition ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" size={16} />
                  {isEditing ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreator;