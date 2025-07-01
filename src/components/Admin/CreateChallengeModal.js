import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../Common/Modal';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';

const CreateChallengeModal = ({ isOpen, onClose, onChallengeCreated }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    levelNumber: '',
    title: '',
    description: '',
    hint: '',
    flag: '',
    difficulty: 'easy',
    points: 100,
    category: 'algorithms',
    tags: '',
    timeLimit: 60,
    instructions: '',
    resources: '',
    hints: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.levelNumber) newErrors.levelNumber = 'Level number is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.hint.trim()) newErrors.hint = 'Hint is required';
    if (!formData.flag.trim()) newErrors.flag = 'Flag is required';
    if (!formData.points || formData.points < 1) newErrors.points = 'Points must be at least 1';
    if (!formData.timeLimit || formData.timeLimit < 1) newErrors.timeLimit = 'Time limit must be at least 1 minute';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Prepare data for submission
      const challengeData = {
        levelNumber: parseInt(formData.levelNumber),
        title: formData.title.trim(),
        description: formData.description.trim(),
        hint: formData.hint.trim(),
        flag: formData.flag.trim(),
        difficulty: formData.difficulty,
        points: parseInt(formData.points),
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        timeLimit: parseInt(formData.timeLimit),
        content: {
          instructions: formData.instructions.trim(),
          resources: formData.resources ? formData.resources.split('\n').map(r => r.trim()).filter(r => r) : [],
          hints: formData.hints ? formData.hints.split('\n').map(h => h.trim()).filter(h => h) : []
        },
        enabled: true,
        isActive: true
      };
      
      await api.post('/challenges', challengeData);
      
      toast.success('Challenge created successfully!');
      onChallengeCreated();
      handleClose();
    } catch (error) {
      console.error('Error creating challenge:', error);
      const message = error.response?.data?.message || 'Failed to create challenge';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      levelNumber: '',
      title: '',
      description: '',
      hint: '',
      flag: '',
      difficulty: 'easy',
      points: 100,
      category: 'algorithms',
      tags: '',
      timeLimit: 60,
      instructions: '',
      resources: '',
      hints: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Challenge"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Level Number *
            </label>
            <input
              type="number"
              name="levelNumber"
              value={formData.levelNumber}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.levelNumber ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
              } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="1"
            />
            {errors.levelNumber && <p className="text-red-500 text-xs mt-1">{errors.levelNumber}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Points *
            </label>
            <input
              type="number"
              name="points"
              value={formData.points}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.points ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
              } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.points && <p className="text-red-500 text-xs mt-1">{errors.points}</p>}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.title ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
            } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter challenge title"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.description ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
            } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Describe the challenge"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Difficulty *
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="algorithms">Algorithms</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Full Stack</option>
              <option value="databases">Databases</option>
              <option value="security">Security</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Time Limit (minutes) *
            </label>
            <input
              type="number"
              name="timeLimit"
              value={formData.timeLimit}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.timeLimit ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
              } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.timeLimit && <p className="text-red-500 text-xs mt-1">{errors.timeLimit}</p>}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Hint *
          </label>
          <textarea
            name="hint"
            value={formData.hint}
            onChange={handleChange}
            rows={2}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.hint ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
            } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Provide a helpful hint"
          />
          {errors.hint && <p className="text-red-500 text-xs mt-1">{errors.hint}</p>}
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Flag *
          </label>
          <input
            type="text"
            name="flag"
            value={formData.flag}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.flag ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
            } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="flag{example_flag_here}"
          />
          {errors.flag && <p className="text-red-500 text-xs mt-1">{errors.flag}</p>}
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="web, crypto, pwn"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Detailed Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Detailed instructions for solving the challenge"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Resources (one per line)
          </label>
          <textarea
            name="resources"
            value={formData.resources}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="https://example.com/resource1&#10;https://example.com/resource2"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Additional Hints (one per line)
          </label>
          <textarea
            name="hints"
            value={formData.hints}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Additional hint 1&#10;Additional hint 2"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Challenge'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateChallengeModal;