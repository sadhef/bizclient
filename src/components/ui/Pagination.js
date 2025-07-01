import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showInfo = true,
  showSizeSelector = true,
  pageSize = 10,
  onPageSizeChange,
  totalItems = 0,
  className = '' 
}) => {
  const { isDark } = useTheme();

  const getVisiblePages = () => {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const buttonClasses = `
    relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
    border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const activeButtonClasses = `
    ${buttonClasses}
    ${isDark 
      ? 'bg-blue-600 border-blue-600 text-white' 
      : 'bg-blue-600 border-blue-600 text-white'
    }
  `;

  const inactiveButtonClasses = `
    ${buttonClasses}
    ${isDark 
      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
    }
  `;

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 ${className}`}>
      {/* Info and Page Size Selector */}
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        {showInfo && (
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Showing {startItem} to {endItem} of {totalItems} results
          </p>
        )}
        
        {showSizeSelector && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Show:
            </label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={`text-sm rounded border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={inactiveButtonClasses}
        >
          <FaChevronLeft className="h-3 w-3 mr-1" />
          Previous
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex space-x-1">
          {/* First page */}
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className={currentPage === 1 ? activeButtonClasses : inactiveButtonClasses}
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className={`px-2 py-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ...
                </span>
              )}
            </>
          )}

          {/* Visible pages */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={page === currentPage ? activeButtonClasses : inactiveButtonClasses}
            >
              {page}
            </button>
          ))}

          {/* Last page */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className={`px-2 py-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ...
                </span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className={currentPage === totalPages ? activeButtonClasses : inactiveButtonClasses}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Mobile: Current page info */}
        <div className="sm:hidden">
          <span className={`px-4 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {currentPage} / {totalPages}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={inactiveButtonClasses}
        >
          Next
          <FaChevronRight className="h-3 w-3 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;