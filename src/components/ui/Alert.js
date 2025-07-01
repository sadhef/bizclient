import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const Alert = ({ 
  variant = 'info', 
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '' 
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: FaInfoCircle,
      iconColor: 'text-blue-400'
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: FaCheckCircle,
      iconColor: 'text-green-400'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: FaExclamationTriangle,
      iconColor: 'text-yellow-400'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: FaExclamationTriangle,
      iconColor: 'text-red-400'
    }
  };

  const { container, icon: Icon, iconColor } = variants[variant];

  return (
    <div className={`p-4 border rounded-lg ${container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${iconColor} hover:bg-black hover:bg-opacity-10`}
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;