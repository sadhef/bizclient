import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useDebounce } from '../../hooks/useDebounce';

const SearchBox = ({ 
  placeholder = 'Search...', 
  value, 
  onChange, 
  onClear,
  debounceMs = 300,
  size = 'md',
  fullWidth = true,
  className = '' 
}) => {
  const { isDark } = useTheme();
  const [internalValue, setInternalValue] = useState(value || '');
  const debouncedValue = useDebounce(internalValue, debounceMs);

  // Call onChange with debounced value
  React.useEffect(() => {
    if (onChange && debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  // Update internal value when external value changes
  React.useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value || '');
    }
  }, [value]);

  const handleChange = (e) => {
    setInternalValue(e.target.value);
  };

  const handleClear = () => {
    setInternalValue('');
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const inputClasses = `
    ${fullWidth ? 'w-full' : ''} pl-10 pr-10 border rounded-lg
    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${isDark 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }
    ${sizes[size]}
    ${className}
  `;

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>

      {/* Input */}
      <input
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className={inputClasses}
      />

      {/* Clear Button */}
      {internalValue && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={handleClear}
            className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBox;