import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaClock, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const PendingApproval = () => {
  const { currentUser, logout } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-md w-full">
        <div className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-lg rounded-lg p-8 text-center`}>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <FaClock className="h-6 w-6 text-yellow-600" />
          </div>
          
          <h3 className={`text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-2`}>
            Account Pending Approval
          </h3>
          
          <p className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-500'
          } mb-6`}>
            Thank you for registering, {currentUser?.name}! Your account is currently pending approval from an administrator.
          </p>
          
          <div className={`${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-lg p-4 mb-6`}>
            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Status:</span>
              <span className="flex items-center text-yellow-600">
                <FaClock className="h-4 w-4 mr-1" />
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Registered:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {new Date(currentUser?.registrationTime).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className={`${
            isDark ? 'bg-blue-900' : 'bg-blue-50'
          } border ${
            isDark ? 'border-blue-700' : 'border-blue-200'
          } rounded-lg p-4 mb-6`}>
            <div className="flex">
              <FaEnvelope className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div className="text-left">
                <h4 className={`text-sm font-medium ${
                  isDark ? 'text-blue-300' : 'text-blue-800'
                } mb-1`}>
                  What happens next?
                </h4>
                <p className={`text-sm ${
                  isDark ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  An administrator will review your registration and approve your account. You'll receive an email notification once approved.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;