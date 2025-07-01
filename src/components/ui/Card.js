import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Card = ({ 
  children, 
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  ...props 
}) => {
  const { isDark } = useTheme();

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl'
  };

  const baseClasses = `
    ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    border rounded-lg transition-all duration-200
    ${shadows[shadow]}
    ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
    ${paddings[padding]}
    ${className}
  `;

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

// Card Header Component
const CardHeader = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
};

// Card Title Component
const CardTitle = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} ${className}`}>
      {children}
    </h3>
  );
};

// Card Footer Component
const CardFooter = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Footer = CardFooter;

export default Card;