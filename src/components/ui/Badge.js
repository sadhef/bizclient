import React from 'react';

const Badge = ({ 
  variant = 'default', 
  size = 'md',
  className = '', 
  children 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    
    // Solid variants
    'solid-default': 'bg-gray-800 text-white',
    'solid-primary': 'bg-blue-600 text-white',
    'solid-success': 'bg-green-600 text-white',
    'solid-warning': 'bg-yellow-600 text-white',
    'solid-danger': 'bg-red-600 text-white',
    'solid-info': 'bg-cyan-600 text-white',
    'solid-purple': 'bg-purple-600 text-white',

    // Outline variants
    'outline-default': 'border-gray-300 text-gray-800 bg-transparent',
    'outline-primary': 'border-blue-300 text-blue-800 bg-transparent',
    'outline-success': 'border-green-300 text-green-800 bg-transparent',
    'outline-warning': 'border-yellow-300 text-yellow-800 bg-transparent',
    'outline-danger': 'border-red-300 text-red-800 bg-transparent',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const baseClasses = `
    inline-flex items-center font-medium rounded-full border
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <span className={baseClasses}>
      {children}
    </span>
  );
};

export default Badge;