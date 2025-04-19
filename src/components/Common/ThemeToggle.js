import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors ${className} ${
        theme === 'dark' 
          ? 'bg-violet-800/30 hover:bg-violet-700/50 text-yellow-300' 
          : 'bg-violet-100 hover:bg-violet-200 text-violet-700'
      }`}
    >
      {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
    </button>
  );
};

export default ThemeToggle;