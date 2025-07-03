import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiSearch, FiAlertCircle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl font-black text-black dark:text-white opacity-20">
            404
          </h1>
        </div>

        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-8">
          <FiSearch className="w-10 h-10 text-gray-600 dark:text-gray-400" />
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Don't worry, even the best CTF players get lost sometimes!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <FiHome className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Fun CTF Reference */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                🚩 Fun Fact
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                This isn't a hidden flag location! But nice try exploring the application structure. 
                Real CTF challenges are waiting for you in the challenge section.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <Link 
              to="/dashboard" 
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/challenges" 
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Challenges
            </Link>
            <Link 
              to="/profile" 
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;