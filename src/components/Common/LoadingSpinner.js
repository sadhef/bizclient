import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
      <p className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {text}
      </p>
    </div>
  );
};

export default LoadingSpinner;