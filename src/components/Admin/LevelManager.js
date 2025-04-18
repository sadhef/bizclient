import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiSave, 
  FiArrowLeft, 
  FiToggleRight, 
  FiToggleLeft, 
  FiHelpCircle, 
  FiCheckCircle,
  FiEdit,
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const LevelManager = () => {
  const { id } = useParams();
  const history = useHistory();
  const { currentUser, isAdmin } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    levelNumber: '',
    title: '',
    description: '',
    hint: '',
    flag: '',
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Load challenge data if in edit mode
  useEffect(() => {
    // Redirect if not logged in as admin
    if (!currentUser || !isAdmin) {
      toast.error('Admin access required');
      history.push('/admin-login');
      return;
    }

    const loadChallenge = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await api.get(`/challenges/${id}`);
          
          if (response.challenge) {
            setFormData({
              levelNumber: response.challenge.levelNumber,
              title: response.challenge.title,
              description: response.challenge.description,
              hint: response.challenge.hint,
              flag: response.challenge.flag,
              enabled: response.challenge.enabled
            });
          }
        } catch (err) {
          console.error('Error loading challenge:', err);
          setError('Failed to load challenge data');
          toast.error('Failed to load challenge data');
        } finally {
          setLoading(false);
        }
      }
    };

    loadChallenge();
  }, [currentUser, isAdmin, id, isEditMode, history]);

  // Handle input changes
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError(''); // Clear error when user types
  };

  // Validate form
  const validateForm = () => {
    if (!formData.levelNumber || isNaN(parseInt(formData.levelNumber))) {
      setError('Level number must be a valid number');
      return false;
    }
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (!formData.flag.trim()) {
      setError('Flag is required');
      return false;
    }
    
    if (!formData.hint.trim()) {
      setError('Hint is required');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare data with correct types
      const challengeData = {
        ...formData,
        levelNumber: parseInt(formData.levelNumber)
      };
      
      if (isEditMode) {
        // Update existing challenge
        await api.patch(`/challenges/${id}`, challengeData);
        toast.success('Challenge updated successfully');
      } else {
        // Create new challenge
        await api.post('/challenges', challengeData);
        toast.success('Challenge created successfully');
      }
      
      // Redirect back to admin dashboard
      history.push('/admin-dashboard');
    } catch (err) {
      console.error('Error saving challenge:', err);
      setError(err.response?.data?.message || 'Failed to save challenge');
      toast.error('Failed to save challenge');
    } finally {
      setLoading(false);
    }
  };

  // Go back to dashboard
  const handleCancel = () => {
    history.push('/admin-dashboard');
  };

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Loading state
  if (loading && isEditMode && !formData.title) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenge data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleCancel}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900 ml-6">
              {isEditMode ? 'Edit Challenge Level' : 'Create New Challenge Level'}
            </h1>
          </div>
          
          <button
            onClick={togglePreview}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showPreview ? (
              <>
                <FiEdit className="mr-2" /> Edit Form
              </>
            ) : (
              <>
                <FiEye className="mr-2" /> Preview
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {showPreview ? (
            // Challenge Preview
            <div className="p-6">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4">Challenge Preview</h2>
              
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                      Level {formData.levelNumber || '?'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      formData.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{formData.title || 'Challenge Title'}</h3>
                
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700">{formData.description || 'Challenge description will appear here.'}</p>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiHelpCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Hint:</strong> {formData.hint || 'Challenge hint will appear here when requested.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Correct Flag:</h4>
                  <code className="block bg-gray-800 text-white p-3 rounded-md font-mono">
                    {formData.flag || 'flag{example_placeholder}'}
                  </code>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
                  <button
                    type="button"
                    onClick={togglePreview}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiEdit className="mr-2" /> Edit Form
                  </button>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <FiSave className="mr-2" />
                          {isEditMode ? 'Update Challenge' : 'Create Challenge'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Challenge Form
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Level Number */}
                <div>
                  <label htmlFor="levelNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Level Number *
                  </label>
                  <input
                    type="number"
                    id="levelNumber"
                    name="levelNumber"
                    value={formData.levelNumber}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter level number (1, 2, 3, etc.)"
                  />
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Challenge Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter challenge title"
                  />
                </div>
              </div>

              {/* Flag */}
              <div>
                <label htmlFor="flag" className="block text-sm font-medium text-gray-700 mb-1">
                  Flag / Answer *
                </label>
                <input
                  type="text"
                  id="flag"
                  name="flag"
                  value={formData.flag}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter flag (e.g., flag{your_flag_text})"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Flag that participants need to find and submit to complete this level.
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Challenge Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter detailed challenge description visible to participants"
                ></textarea>
              </div>

              {/* Hint */}
              <div>
                <label htmlFor="hint" className="block text-sm font-medium text-gray-700 mb-1">
                  Hint *
                </label>
                <textarea
                  id="hint"
                  name="hint"
                  value={formData.hint}
                  onChange={handleChange}
                  rows="3"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter hint to help participants when they're stuck"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  This hint will be shown to participants if they choose to use a hint during the challenge.
                </p>
              </div>

              {/* Enabled Status */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="enabled"
                    name="enabled"
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="enabled" className="font-medium text-gray-700">Enable this challenge</label>
                  <p className="text-gray-500">If enabled, this challenge will be available to participants.</p>
                </div>
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={togglePreview}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiEye className="mr-2" /> Preview
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      {isEditMode ? 'Update Challenge' : 'Create Challenge'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelManager;