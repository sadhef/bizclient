import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Button = ({ 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  children,
  ...props 
}) => {
  const { isDark } = useTheme();

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500
      disabled:bg-blue-300 disabled:hover:bg-blue-300
    `,
    secondary: `
      ${isDark ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}
      focus:ring-gray-500
    `,
    success: `
      bg-green-600 text-white hover:bg-green-700 focus:ring-green-500
      disabled:bg-green-300 disabled:hover:bg-green-300
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700 focus:ring-red-500
      disabled:bg-red-300 disabled:hover:bg-red-300
    `,
    warning: `
      bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500
      disabled:bg-yellow-300 disabled:hover:bg-yellow-300
    `,
    outline: `
      border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white
      focus:ring-blue-500 disabled:border-blue-300 disabled:text-blue-300
    `,
    ghost: `
      ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
      focus:ring-gray-500
    `,
    link: `
      text-blue-600 hover:text-blue-700 underline focus:ring-blue-500
      disabled:text-blue-300
    `
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={children ? 'mr-2' : ''}>{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className={children ? 'ml-2' : ''}>{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;