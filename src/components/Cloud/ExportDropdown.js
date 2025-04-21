import React, { useState, useRef, useEffect } from 'react';
import { FiDownload, FiFilePlus, FiFileText, FiTable, FiX } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { exportToExcel, exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { toast } from 'react-toastify';

const ExportDropdown = ({ reportData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const dropdownRef = useRef(null);
  const { isDark } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle export based on type
  const handleExport = async (type) => {
    if (!reportData || !reportData.columns || !reportData.rows) {
      toast.error('No data available to export');
      setIsOpen(false);
      return;
    }

    setExportType(type);
    setIsExporting(true);

    try {
      const fileName = `cloud-report-${new Date().toISOString().split('T')[0]}`;
      let success = false;

      switch (type) {
        case 'excel':
          success = exportToExcel(reportData, fileName);
          break;
        case 'csv':
          success = exportToCSV(reportData, fileName);
          break;
        case 'pdf':
          success = exportToPDF(reportData, fileName);
          break;
        default:
          throw new Error('Invalid export type');
      }

      if (success) {
        toast.success(`Report exported successfully as ${type.toUpperCase()}`);
      } else {
        throw new Error(`Failed to export as ${type}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportType(null);
      setIsOpen(false);
    }
  };

  // Get icon based on export type
  const getExportIcon = (type) => {
    switch (type) {
      case 'excel':
        return <FiTable className="mr-2" />;
      case 'csv':
        return <FiFileText className="mr-2" />;
      case 'pdf':
        return <FiFilePlus className="mr-2" />;
      default:
        return <FiDownload className="mr-2" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        disabled={isExporting}
        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
          isExporting
            ? 'opacity-50 cursor-not-allowed'
            : isDark
            ? 'text-gray-300 bg-gray-800 border-gray-700 hover:bg-gray-700'
            : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        <FiDownload className={`mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white ring-1 ring-black ring-opacity-5'
          } z-10`}
        >
          <div className="py-1">
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className={`w-full text-left px-4 py-2 text-sm ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              } flex items-center`}
            >
              {exportType === 'excel' && isExporting ? (
                <div className="w-4 h-4 border-t-2 border-b-2 border-current rounded-full animate-spin mr-2"></div>
              ) : (
                <FiTable className="mr-2" />
              )}
              Export as Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className={`w-full text-left px-4 py-2 text-sm ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              } flex items-center`}
            >
              {exportType === 'csv' && isExporting ? (
                <div className="w-4 h-4 border-t-2 border-b-2 border-current rounded-full animate-spin mr-2"></div>
              ) : (
                <FiFileText className="mr-2" />
              )}
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className={`w-full text-left px-4 py-2 text-sm ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              } flex items-center`}
            >
              {exportType === 'pdf' && isExporting ? (
                <div className="w-4 h-4 border-t-2 border-b-2 border-current rounded-full animate-spin mr-2"></div>
              ) : (
                <FiFilePlus className="mr-2" />
              )}
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;