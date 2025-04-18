import React, { useState, useEffect, useCallback } from 'react';
import { FiClock, FiAlertCircle } from 'react-icons/fi';
import { formatTimeRemaining } from '../../utils/timer';

/**
 * Countdown timer component with various display options and callback functions
 * 
 * @param {Object} props Component props
 * @param {number} props.initialTime Initial time in seconds
 * @param {function} props.onTimeUp Callback function executed when timer reaches zero
 * @param {function} props.onTick Callback function executed every second with remaining time
 * @param {boolean} props.autoStart Whether timer should start automatically
 * @param {boolean} props.showIcon Whether to show clock icon
 * @param {boolean} props.showWarning Whether to show warning when timer is low
 * @param {number} props.warningThreshold Threshold in seconds for warning display (default: 300)
 * @param {string} props.size Size of the timer ('sm', 'md', 'lg')
 * @param {string} props.className Additional CSS classes
 */
const Timer = ({ 
  initialTime = 3600,
  onTimeUp = () => {},
  onTick = () => {},
  autoStart = true,
  showIcon = true,
  showWarning = true,
  warningThreshold = 300,
  size = 'md',
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [intervalId, setIntervalId] = useState(null);

  // Get size-based classes
  const getSizeClasses = useCallback(() => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-xl font-bold';
      case 'md':
      default:
        return 'text-lg';
    }
  }, [size]);

  // Start the timer
  const startTimer = useCallback(() => {
    if (intervalId !== null) return;
    
    const newIntervalId = setInterval(() => {
      setTimeLeft(prev => {
        const newValue = Math.max(prev - 1, 0);
        onTick(newValue);
        
        if (newValue === 0) {
          clearInterval(newIntervalId);
          setIsRunning(false);
          setIntervalId(null);
          onTimeUp();
        }
        
        return newValue;
      });
    }, 1000);
    
    setIntervalId(newIntervalId);
    setIsRunning(true);
  }, [intervalId, onTick, onTimeUp]);

  // Stop the timer
  const stopTimer = useCallback(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
      setIsRunning(false);
    }
  }, [intervalId]);

  // Reset the timer
  const resetTimer = useCallback((newTime = initialTime) => {
    stopTimer();
    setTimeLeft(newTime);
    if (autoStart) {
      startTimer();
    }
  }, [stopTimer, initialTime, autoStart, startTimer]);

  // Start timer on mount and clear on unmount
  useEffect(() => {
    if (autoStart) {
      startTimer();
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [autoStart, startTimer, intervalId]);

  // Update when initialTime changes
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  const isWarning = showWarning && timeLeft <= warningThreshold;
  const formattedTime = formatTimeRemaining(timeLeft);
  const sizeClasses = getSizeClasses();

  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && (
        <div className="mr-2">
          {isWarning ? (
            <FiAlertCircle className="text-red-500 animate-pulse" />
          ) : (
            <FiClock className="text-indigo-600" />
          )}
        </div>
      )}
      <span 
        className={`font-mono ${sizeClasses} ${
          isWarning ? 'text-red-600 font-bold' : 'text-indigo-800'
        }`}
      >
        {formattedTime}
      </span>
    </div>
  );
};

export default Timer;