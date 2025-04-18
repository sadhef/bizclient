/**
 * Format seconds into minutes:seconds display format
 * 
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (MM:SS)
 */
export const formatTimeRemaining = (seconds) => {
  if (!seconds && seconds !== 0) return '--:--';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate time remaining based on start time and total time
 * 
 * @param {Date|string} startTime - The start time
 * @param {number} totalTime - Total time allowed in seconds (default: 3600)
 * @returns {number} Seconds remaining
 */
export const calculateTimeRemaining = (startTime, totalTime = 3600) => {
  const now = new Date();
  const start = new Date(startTime);
  const elapsedSeconds = Math.floor((now - start) / 1000);
  
  return Math.max(totalTime - elapsedSeconds, 0);
};

/**
 * Format seconds into a more human-readable format (HH:MM:SS)
 * 
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (HH:MM:SS)
 */
export const formatTimeDetailed = (seconds) => {
  if (!seconds && seconds !== 0) return '--:--:--';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format a date object to a readable date/time string
 * 
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  return d.toLocaleString();
};

/**
 * Get time elapsed since a given date
 * 
 * @param {Date|string} startDate - The start date
 * @returns {number} Seconds elapsed
 */
export const getTimeElapsed = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  
  return Math.floor((now - start) / 1000);
};

/**
 * Create a countdown timer with callback
 * 
 * @param {number} seconds - Starting seconds
 * @param {function} onTick - Callback function for each second
 * @param {function} onComplete - Callback function when timer reaches zero
 * @returns {object} Timer control object with start, pause, resume and stop methods
 */
export const createCountdownTimer = (seconds, onTick, onComplete) => {
  let remainingSeconds = seconds;
  let intervalId = null;
  
  const start = () => {
    if (intervalId) return;
    
    intervalId = setInterval(() => {
      remainingSeconds -= 1;
      
      if (typeof onTick === 'function') {
        onTick(remainingSeconds);
      }
      
      if (remainingSeconds <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    }, 1000);
  };
  
  const pause = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  
  const resume = () => {
    start();
  };
  
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    remainingSeconds = 0;
  };
  
  return {
    start,
    pause,
    resume,
    stop,
    getTimeRemaining: () => remainingSeconds
  };
};