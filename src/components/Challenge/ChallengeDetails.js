import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useChallenge } from '../../context/ChallengeContext';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../Common/LoadingSpinner';
import { FaArrowLeft, FaClock, FaTrophy, FaPlay, FaCheck, FaCode, FaUpload } from 'react-icons/fa';

const ChallengeDetails = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState({
    code: '',
    notes: '',
    files: []
  });
  const [timeRemaining, setTimeRemaining] = useState(null);

  const { isDark } = useTheme();
  const { startChallenge, submitChallenge, getProgressForChallenge } = useChallenge();
  const history = useHistory();

  useEffect(() => {
    fetchChallengeDetails();
  }, [id]);

  useEffect(() => {
    let interval;
    if (progress && progress.status === 'in_progress' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            toast.warning('Time is up!');
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [progress, timeRemaining]);

  const fetchChallengeDetails = async () => {
    try {
      const response = await api.get(`/challenges/${id}`);
      setChallenge(response.data.challenge);
      
      const userProgress = getProgressForChallenge(id);
      setProgress(userProgress);
      
      if (userProgress && userProgress.status === 'in_progress') {
        const startTime = new Date(userProgress.startedAt);
        const elapsed = (new Date() - startTime) / 1000;
        const remaining = Math.max(0, (challenge?.timeLimit * 60) - elapsed);
        setTimeRemaining(remaining);
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
      toast.error('Failed to load challenge details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async () => {
    try {
      const newProgress = await startChallenge(id);
      setProgress(newProgress);
      setTimeRemaining(challenge.timeLimit * 60);
    } catch (error) {
      console.error('Error starting challenge:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await submitChallenge(id, submission);
      toast.success('Challenge submitted successfully!');
      history.push('/dashboard');
    } catch (error) {
      console.error('Error submitting challenge:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading challenge..." />;
  }

  if (!challenge) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Challenge not found
          </h2>
          <button
            onClick={() => history.push('/dashboard')}
            className="text-blue-600 hover:text-blue-500"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => history.push('/dashboard')}
            className={`flex items-center text-sm ${
              isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } mb-4`}
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                {challenge.title}
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${
                  getDifficultyColor(challenge.difficulty)
                }`}>
                  {challenge.difficulty}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <FaTrophy className="h-4 w-4 mr-1" />
                  {challenge.points} points
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FaClock className="h-4 w-4 mr-1" />
                  {challenge.timeLimit} minutes
                </div>
              </div>
            </div>
            
            {timeRemaining !== null && progress?.status === 'in_progress' && (
              <div className={`text-right ${
                timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'
              }`}>
                <div className="text-sm">Time Remaining</div>
                <div className="text-2xl font-mono font-bold">
                  {formatTime(timeRemaining)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Challenge Content */}
          <div className="space-y-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                Challenge Description
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                {challenge.description}
              </p>
              
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                Instructions
              </h3>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} prose prose-sm`}
                   dangerouslySetInnerHTML={{ __html: challenge.content?.instructions || '' }}
              />
              
              {challenge.content?.resources && challenge.content.resources.length > 0 && (
                <>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-3 mt-6`}>
                    Resources
                  </h3>
                  <ul className={`list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {challenge.content.resources.map((resource, index) => (
                      <li key={index}>{resource}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {challenge.content?.hints && challenge.content.hints.length > 0 && (
                <>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-3 mt-6`}>
                    Hints
                  </h3>
                  <ul className={`list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {challenge.content.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Submission Area */}
          <div className="space-y-6">
            {!progress || progress.status === 'not_started' ? (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 text-center`}>
                <FaPlay className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Ready to start?
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                  Click the button below to begin this challenge. You'll have {challenge.timeLimit} minutes to complete it.
                </p>
                <button
                  onClick={handleStartChallenge}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Start Challenge
                </button>
              </div>
            ) : progress.status === 'completed' ? (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 text-center`}>
                <FaCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Challenge Completed!
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  You completed this challenge successfully.
                </p>
                {progress.score && (
                  <div className="text-center">
                    <span className="text-2xl font-bold text-green-600">
                      {progress.score}/{challenge.points}
                    </span>
                    <p className="text-sm text-gray-500">points earned</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Submit Your Solution
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Code Solution
                    </label>
                    <textarea
                      value={submission.code}
                      onChange={(e) => setSubmission(prev => ({ ...prev, code: e.target.value }))}
                      rows={10}
                      className={`w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Paste your code here..."
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={submission.notes}
                      onChange={(e) => setSubmission(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Any additional notes about your solution..."
                    />
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !submission.code.trim()}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Solution'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetails;