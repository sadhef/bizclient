import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const ChallengeContext = createContext();

export const useChallenge = () => {
  return useContext(ChallengeContext);
};

export const ChallengeProvider = ({ children }) => {
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);

  const { currentUser } = useAuth();

  // Fetch challenges
  const fetchChallenges = async () => {
    if (!currentUser || currentUser.status !== 'approved') return;
    
    try {
      setLoading(true);
      const response = await api.get('/challenges');
      setChallenges(response.data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user progress
  const fetchProgress = async () => {
    if (!currentUser || currentUser.status !== 'approved') return;
    
    try {
      const response = await api.get('/progress');
      setUserProgress(response.data.progress || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Start challenge
  const startChallenge = async (challengeId) => {
    try {
      const response = await api.post('/progress', {
        challengeId,
        status: 'in_progress'
      });
      
      // Update progress in state
      setUserProgress(prev => {
        const existing = prev.find(p => p.challengeId === challengeId);
        if (existing) {
          return prev.map(p => p.challengeId === challengeId ? response.data.progress : p);
        } else {
          return [...prev, response.data.progress];
        }
      });
      
      toast.success('Challenge started!');
      return response.data.progress;
    } catch (error) {
      console.error('Error starting challenge:', error);
      toast.error('Failed to start challenge');
      throw error;
    }
  };

  // Submit challenge
  const submitChallenge = async (challengeId, submission) => {
    try {
      const response = await api.patch(`/progress/${challengeId}`, {
        status: 'completed',
        submission,
        completedAt: new Date()
      });
      
      // Update progress in state
      setUserProgress(prev => 
        prev.map(p => p.challengeId === challengeId ? response.data.progress : p)
      );
      
      toast.success('Challenge submitted successfully!');
      return response.data.progress;
    } catch (error) {
      console.error('Error submitting challenge:', error);
      toast.error('Failed to submit challenge');
      throw error;
    }
  };

  // Get progress for specific challenge
  const getProgressForChallenge = (challengeId) => {
    return userProgress.find(p => p.challengeId === challengeId);
  };

  // Calculate user stats
  const getUserStats = () => {
    const completed = userProgress.filter(p => p.status === 'completed').length;
    const inProgress = userProgress.filter(p => p.status === 'in_progress').length;
    const totalPoints = userProgress.reduce((sum, p) => sum + (p.score || 0), 0);
    
    return {
      total: userProgress.length,
      completed,
      inProgress,
      totalPoints,
      completionRate: userProgress.length > 0 ? (completed / userProgress.length) * 100 : 0
    };
  };

  useEffect(() => {
    if (currentUser && currentUser.status === 'approved') {
      fetchChallenges();
      fetchProgress();
    }
  }, [currentUser]);

  const value = {
    challenges,
    userProgress,
    loading,
    currentChallenge,
    setCurrentChallenge,
    fetchChallenges,
    fetchProgress,
    startChallenge,
    submitChallenge,
    getProgressForChallenge,
    getUserStats
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
};