export const formatTimeRemaining = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  export const calculateTimeRemaining = (startTime, totalTime = 3600) => {
    const now = new Date();
    const start = new Date(startTime);
    const elapsedSeconds = Math.floor((now - start) / 1000);
    return Math.max(totalTime - elapsedSeconds, 0);
  };