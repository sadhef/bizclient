import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'default',
  showReasonInput = false 
}) => {
  const [reason, setReason] = useState('');
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  const getButtonColor = () => {
    switch (type) {
      case 'approve':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'reject':
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'suspend':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'approve':
        return <FaCheck className="h-6 w-6 text-green-600" />;
      case 'reject':
      case 'delete':
        return <FaExclamationTriangle className="h-6 w-6 text-red-600" />;
      case 'suspend':
        return <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />;
      default:
        return <FaExclamationTriangle className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700">
            {getIcon()}
          </div>
          
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mt-4`}>
            {title}
          </h3>
          
          <div className={`mt-2 px-7 py-3 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
            <p className="text-sm">{message}</p>
          </div>

          {showReasonInput && (
            <div className="mt-4 px-7">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Reason (optional):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter reason for rejection..."
              />
            </div>
          )}

          <div className="items-center px-4 py-3">
            <div className="flex space-x-4">
              <button
                onClick={handleConfirm}
                className={`w-full text-white text-base font-medium rounded-md px-4 py-2 transition duration-200 ${getButtonColor()}`}
              >
                Confirm
              </button>
              <button
                onClick={onClose}
                className={`w-full text-base font-medium rounded-md px-4 py-2 transition duration-200 ${
                  isDark 
                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                    : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;