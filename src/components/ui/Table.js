import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Table = ({ 
  children, 
  className = '',
  striped = false,
  hover = false,
  ...props 
}) => {
  const { isDark } = useTheme();

  const baseClasses = `
    min-w-full divide-y
    ${isDark ? 'divide-gray-700' : 'divide-gray-200'}
    ${className}
  `;

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className={baseClasses} {...props}>
        {children}
      </table>
    </div>
  );
};

// Table Head Component
const TableHead = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} ${className}`}>
      {children}
    </thead>
  );
};

// Table Body Component
const TableBody = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y ${className}`}>
      {children}
    </tbody>
  );
};

// Table Row Component
const TableRow = ({ children, className = '', hover = false, ...props }) => {
  const { isDark } = useTheme();
  
  const hoverClasses = hover ? (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50') : '';
  
  return (
    <tr className={`${hoverClasses} ${className}`} {...props}>
      {children}
    </tr>
  );
};

// Table Header Cell Component
const TableHeader = ({ children, className = '', ...props }) => {
  const { isDark } = useTheme();
  
  return (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
        isDark ? 'text-gray-300' : 'text-gray-500'
      } ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

// Table Cell Component
const TableCell = ({ children, className = '', ...props }) => {
  const { isDark } = useTheme();
  
  return (
    <td 
      className={`px-6 py-4 whitespace-nowrap text-sm ${
        isDark ? 'text-gray-300' : 'text-gray-900'
      } ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell;

export default Table;