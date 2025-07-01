import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = true,
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  const { isDark } = useTheme();

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const inputClasses = `
    ${fullWidth ? 'w-full' : ''} border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : isDark 
        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
    }
    ${icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
    ${sizes[size]}
    ${className}
  `;

  return (
    <div className={containerClassName}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
            <span className={error ? 'text-red-400' : 'text-gray-400'}>
              {icon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;