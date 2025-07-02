import React from 'react';

const LoadingSpinner = ({ size = 'default', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin`} />
      {message && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );
};

export const FullPageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-light-primary dark:bg-dark-primary flex items-center justify-center">
    <LoadingSpinner size="large" message={message} />
  </div>
);

export const InlineLoader = ({ message }) => (
  <div className="flex items-center justify-center py-4">
    <LoadingSpinner size="small" message={message} />
  </div>
);

export default LoadingSpinner;