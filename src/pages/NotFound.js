import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-violet-600 dark:text-violet-400 opacity-50">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-light-primary dark:text-dark-primary mb-4">
            Page Not Found
          </h2>
          <p className="text-light-secondary dark:text-dark-secondary mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-light-secondary dark:text-dark-secondary">
            Don't worry, even the best CTF players get lost sometimes!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <FiHome className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Fun CTF Reference */}
        <div className="mt-12 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
          <p className="text-sm text-violet-700 dark:text-violet-300">
            🚩 <strong>Fun Fact:</strong> This isn't a hidden flag location! 
            But nice try exploring the application structure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;