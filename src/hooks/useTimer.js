import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialTime = 0, onTimeExpired = null, isActive = true) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const initialTimeRef = useRef(initialTime);
  const isActiveRef = useRef(isActive);

  // Update refs when props change
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (initialTime !== initialTimeRef.current) {
      initialTimeRef.current = initialTime;
      setTimeRemaining(initialTime);
      startTimeRef.current = Date.now();
    }
  }, [initialTime]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      if (!isActiveRef.current) {
        return;
      }

      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newTimeRemaining = Math.max(0, initialTimeRef.current - elapsedSeconds);
      
      setTimeRemaining(newTimeRemaining);
      
      if (newTimeRemaining <= 0) {
        clearInterval(intervalRef.current);
        if (onTimeExpired) {
          onTimeExpired();
        }
      }
    }, 1000);
  }, [onTimeExpired]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback((newTime = initialTimeRef.current) => {
    stopTimer();
    setTimeRemaining(newTime);
    initialTimeRef.current = newTime;
    startTimeRef.current = Date.now();
  }, [stopTimer]);

  // Auto-start timer when conditions are met
  useEffect(() => {
    if (isActive && initialTime > 0) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [isActive, initialTime, startTimer, stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeRemaining,
    startTimer,
    stopTimer,
    resetTimer,
    isRunning: !!intervalRef.current
  };
};