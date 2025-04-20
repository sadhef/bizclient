import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiCloudLightning, FiRefreshCw, FiEye, FiPrinter, FiHardDrive } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';

// Function to determine status color - used throughout the component
const getStatusColor = (status) => {
  if (!status) return { bg: 'bg-gray-200', text: 'text-gray-800' };
  
  status = String(status).toUpperCase().trim();
  
  // Define status colors based on common values
  if (status.includes('AUTOMATIC') || status.includes('SUCCESS') || status.includes('ONLINE')) {
    return { bg: 'bg-green-200', text: 'text-green-800' };
  } else if (status.includes('MANUAL') || status.includes('MAINTENANCE')) {
    return { bg: 'bg-yellow-200', text: 'text-yellow-800' };
  } else if (status.includes('FAILED') || status.includes('ERROR') || status.includes('OFFLINE')) {
    return { bg: 'bg-red-200', text: 'text-red-800' };
  } else if (status.includes('N/A') || status.includes('NOT APPLICABLE')) {
    return { bg: 'bg-purple-200', text: 'text-purple-800' };
  } else if (status.includes('IN PROGRESS') || status.includes('RUNNING')) {
    return { bg: 'bg-pink-200', text: 'text-pink-800' };
  }
  
  // Default color
  return { bg: 'bg-gray-200', text: 'text-gray-800' };
};

// Function to determine status class for printing
const getStatusClass = (status) => {
  if (!status) return 'status-na';
  
  status = String(status).toUpperCase().trim();
  
  if (status.includes('AUTOMATIC') || status.includes('SUCCESS') || status.includes('ONLINE')) {
    return 'status-automatic';
  } else if (status.includes('MANUAL') || status.includes('MAINTENANCE')) {
    return 'status-manual';
  } else if (status.includes('FAILED') || status.includes('ERROR') || status.includes('OFFLINE')) {
    return 'status-failed';
  } else if (status.includes('N/A') || status.includes('NOT APPLICABLE')) {
    return 'status-na';
  } else if (status.includes('IN PROGRESS') || status.includes('RUNNING')) {
    return 'status-inprogress';
  }
  
  return 'status-na'; // Default to N/A styling
};

// Check if a column is a status column - defined globally so it can be used by both components
const isStatusColumn = (column) => {
  return column === 'Status' || 
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
};

// Main Cloud Dashboard component
const CloudDashboard = () => {
  const [columns, setColumns] = useState(['Server', 'Status', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'SSL Expiry', 'Space Used', 'Remarks']);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [reportTitle, setReportTitle] = useState('Weekly Backup Status Report');
  const [reportDates, setReportDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [totalSpaceUsed, setTotalSpaceUsed] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const history = useHistory();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  // Check if we should switch to preview mode based on URL
  useEffect(() => {
    if (location.search === '?preview=true') {
      setIsPreviewMode(true);
    } else {
      setIsPreviewMode(false);
    }
  }, [location]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/cloud-report/data');
      
      if (response && response.data) {
        if (response.data.columns) {
          setColumns(response.data.columns);
        }
        
        if (response.data.rows) {
          setRows(response.data.rows);
        }
        
        if (response.data.reportTitle) {
          setReportTitle(response.data.reportTitle);
        }
        
        if (response.data.reportDates) {
          // Format dates for the date inputs
          const startDate = response.data.reportDates.startDate 
            ? new Date(response.data.reportDates.startDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
            
          const endDate = response.data.reportDates.endDate
            ? new Date(response.data.reportDates.endDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
            
          setReportDates({ startDate, endDate });
        }
        
        // Get total space used if available
        if (response.data.totalSpaceUsed) {
          setTotalSpaceUsed(response.data.totalSpaceUsed);
        }
        
        if (response.data.updatedAt) {
          setLastUpdated(new Date(response.data.updatedAt));
        }
      }
      
      toast.success('Cloud report data loaded successfully');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      setSaveLoading(true);
      
      const data = {
        columns,
        rows,
        reportTitle,
        totalSpaceUsed,
        reportDates: {
          startDate: new Date(reportDates.startDate),
          endDate: new Date(reportDates.endDate)
        }
      };
      
      await api.post('/cloud-report/save', data);
      
      // Update the last updated timestamp
      setLastUpdated(new Date());
      
      toast.success('Data saved successfully');
      return true;
    } catch (err) {
      console.error('Error saving data:', err);
      toast.error('Failed to save data');
      return false;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) {
      toast.warning('Please enter a column name');
      return;
    }
    
    // Add the new column to the columns array
    setColumns([...columns, newColumnName]);
    
    // Update each row to have a value for the new column
    setRows(rows.map(row => ({
      ...row,
      [newColumnName]: ''
    })));
    
    setNewColumnName('');
  };

  const handleRemoveColumn = (columnIndex) => {
    if (columns.length <= 1) {
      toast.warning('Cannot remove the last column');
      return;
    }
    
    const columnToRemove = columns[columnIndex];
    
    // Remove the column from the columns array
    const newColumns = columns.filter((_, index) => index !== columnIndex);
    setColumns(newColumns);
    
    // Remove the column data from each row
    setRows(rows.map(row => {
      const newRow = {...row};
      delete newRow[columnToRemove];
      return newRow;
    }));
  };

  const handleAddRow = () => {
    // Create a new row with empty values for each column
    const newRow = {};
    columns.forEach(column => {
      newRow[column] = '';
    });
    
    setRows([...rows, newRow]);
  };

  const handleRemoveRow = (rowIndex) => {
    setRows(rows.filter((_, index) => index !== rowIndex));
  };

  const handleCellChange = (rowIndex, column, value) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][column] = value;
    setRows(updatedRows);
  };

  const handleDateChange = (field, value) => {
    setReportDates({
      ...reportDates,
      [field]: value
    });
  };
  
  // Toggle between edit and preview modes
  const togglePreviewMode = () => {
    // If we're in edit mode, save before previewing
    if (!isPreviewMode) {
      saveData().then((success) => {
        if (success) {
          history.push('/cloud-dashboard?preview=true');
        }
      });
    } else {
      history.push('/cloud-dashboard');
    }
  };

  // If preview mode is active, render the preview component
  if (isPreviewMode) {
    return (
      <CloudReportPreviewComponent 
        reportData={{
          reportTitle,
          reportDates,
          columns,
          rows,
          lastUpdated
        }}
      />
    );
  }

  if (loading && rows.length === 0) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${
            isDark ? 'border-indigo-400' : 'border-indigo-600'
          } mx-auto`}></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading cloud data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => history.goBack()}
              className={`mr-4 flex items-center ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
              }`}
            >
              <FiArrowLeft className="mr-1" /> Back
            </button>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <FiCloudLightning className="mr-2" /> Cloud Reporting Dashboard
            </h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                isDark
                  ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={togglePreviewMode}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                isDark
                  ? 'border-indigo-600 text-indigo-300 bg-indigo-900/30 hover:bg-indigo-900/50'
                  : 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
              }`}
            >
              <FiEye className="mr-2" />
              Preview & Print
            </button>
            <button
              onClick={saveData}
              disabled={saveLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saveLoading ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Save Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Last Updated Info */}
        {lastUpdated && (
          <div className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'} text-right`}>
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}

        {/* Report Settings */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Report Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Start Date
              </label>
              <input
                type="date"
                value={reportDates.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                End Date
              </label>
              <input
                type="date"
                value={reportDates.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Total Space Used
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiHardDrive className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  value={totalSpaceUsed}
                  onChange={(e) => setTotalSpaceUsed(e.target.value)}
                  placeholder="e.g., 250GB / 1TB"
                  className={`w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Column Management */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage Columns</h2>
          
          <div className="flex items-end mb-4">
            <div className="flex-grow mr-4">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                New Column Name
              </label>
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter column name"
              />
            </div>
            <button
              onClick={handleAddColumn}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="mr-2" /> Add Column
            </button>
          </div>
          
          <div className="overflow-x-auto mt-4">
            <div className="inline-flex flex-nowrap">
              {columns.map((column, index) => (
                <div 
                  key={index} 
                  className={`min-w-max px-4 py-2 m-1 rounded-md ${
                    isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  } flex items-center justify-between`}
                >
                  <span className="mr-2">{column}</span>
                  <button
                    onClick={() => handleRemoveColumn(index)}
                    className={`text-xs p-1 rounded-full ${
                      isDark ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-500'
                    }`}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6 overflow-x-auto`}>
          <div className="flex justify-between mb-4">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Report Data</h2>
            <button
              onClick={handleAddRow}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="mr-2" /> Add Row
            </button>
          </div>
          
          <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Actions
                </th>
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleRemoveRow(rowIndex)}
                      className={`inline-flex items-center p-1 border border-transparent rounded-md text-red-500 ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-red-100'
                      }`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                  {columns.map((column, colIndex) => {
                    const isStatusCol = isStatusColumn(column);
                    const { bg, text } = isStatusCol ? getStatusColor(row[column]) : { bg: '', text: '' };
                    
                    return (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                        {isStatusCol ? (
                          <select
                            value={row[column] || ''}
                            onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                            className={`w-full px-3 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-medium ${bg} ${text}`}
                          >
                            <option value="">Select Status</option>
                            <option value="AUTOMATIC" className="bg-green-200 text-green-800">AUTOMATIC</option>
                            <option value="MANUAL" className="bg-yellow-200 text-yellow-800">MANUAL</option>
                            <option value="FAILED" className="bg-red-200 text-red-800">FAILED</option>
                            <option value="N/A" className="bg-purple-200 text-purple-800">N/A</option>
                            <option value="IN PROGRESS" className="bg-pink-200 text-pink-800">IN PROGRESS</option>
                            <option value="ONLINE" className="bg-green-200 text-green-800">ONLINE</option>
                            <option value="OFFLINE" className="bg-red-200 text-red-800">OFFLINE</option>
                            <option value="MAINTENANCE" className="bg-yellow-200 text-yellow-800">MAINTENANCE</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row[column] || ''}
                            onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                            className={`w-full px-3 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td 
                    colSpan={columns.length + 1} 
                    className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    No data available. Click "Add Row" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// CloudReportPreview component
const CloudReportPreviewComponent = ({ reportData }) => {
    const { 
      reportTitle, 
      reportDates, 
      columns, 
      rows, 
      totalSpaceUsed 
    } = reportData;
    
    const history = useHistory();
    const { isDark } = useTheme();
    const printRef = useRef();
    
    // Function to handle printing with proper styles
    const handlePrint = () => {
      const printStyles = document.createElement('style');
      printStyles.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          body {
            font-family: Arial, sans-serif;
            color: #000;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: landscape;
            margin: 15mm;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 2px solid #000;
          }
          table th, table td {
            border: 1px solid #000;
            padding: 10px;
          }
          th {
            background-color: #f2f2f2 !important;
            color: #000 !important;
            padding: 8px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
          }
          td {
            padding: 8px;
            vertical-align: middle;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #000;
          }
          .print-header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          .print-header p {
            font-size: 16px;
            margin-top: 0;
          }
          .print-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #000;
            font-size: 12px;
            color: #333;
          }
          .space-used {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
          }
          .status-automatic {
            background-color: #d1fae5 !important;
            color: #065f46 !important;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            text-align: center;
            display: inline-block;
            width: 90%;
          }
          .status-manual {
            background-color: #fef3c7 !important;
            color: #92400e !important;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            text-align: center;
            display: inline-block;
            width: 90%;
          }
          .status-failed {
            background-color: #fee2e2 !important;
            color: #b91c1c !important;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            text-align: center;
            display: inline-block;
            width: 90%;
          }
          .status-na {
            background-color: #e0e7ff !important;
            color: #4338ca !important;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            text-align: center;
            display: inline-block;
            width: 90%;
          }
          .status-inprogress {
            background-color: #fce7f3 !important;
            color: #be185d !important;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            text-align: center;
            display: inline-block;
            width: 90%;
          }
        }
      `;
      
      document.head.appendChild(printStyles);
      
      // Trigger the print dialog
      window.print();
      
      // Clean up - remove the style element after printing
      setTimeout(() => {
        document.head.removeChild(printStyles);
      }, 1000);
    };
  
    // Function to handle going back to edit mode
    const handleBackToEdit = () => {
      history.push('/cloud-dashboard');
    };
    
    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };
  
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6 print:bg-white print:p-0`}>
        {/* Toolbar - hidden during print */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 print:hidden">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToEdit}
                className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  isDark
                    ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <FiArrowLeft className="mr-2" />
                Back to Edit
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPrinter className="mr-2" />
                Print Report
              </button>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Preview Mode
            </div>
          </div>
        </div>
        
        {/* Print Area - this content will be printed */}
        <div 
          id="print-area"
          ref={printRef}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none print:p-0 print:max-w-none print:text-black print:bg-white`}
        >
          {/* Report Header */}
          <div className="py-6 px-4 sm:px-6 border-b print-header">
            <h1 className="text-3xl font-bold text-center">{reportTitle || 'Cloud Status Report'}</h1>
            <p className="text-center mt-2">
              {reportDates?.startDate && reportDates?.endDate 
                ? `${formatDate(reportDates.startDate)} - ${formatDate(reportDates.endDate)}`
                : 'Date range not specified'
              }
            </p>
          </div>
          
          {/* Space Used Section */}
          {totalSpaceUsed && (
            <div className="py-4 px-6 border-t text-center space-used">
              <p className="text-lg font-semibold">
                Total Space Used: <span className="text-indigo-600">{totalSpaceUsed}</span>
              </p>
            </div>
          )}
          
          {/* Report Table */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="min-w-full divide-y print:border print:border-collapse">
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th 
                      key={index}
                      className={`px-6 py-3 text-left text-xs font-medium ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-500'
                      } uppercase tracking-wider text-center`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`${isDark ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => {
                      const cellValue = row[column] || 'N/A';
                      // Apply status styling to status-related columns
                      const isStatusCol = isStatusColumn(column);
                      const { bg, text } = isStatusCol ? getStatusColor(cellValue) : { bg: '', text: '' };
                      
                      return (
                        <td 
                          key={colIndex} 
                          className={`px-6 py-4 whitespace-nowrap text-center ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}
                        >
                          {isStatusCol ? (
                            <div 
                              className={`inline-block px-4 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
                            >
                              <span className={getStatusClass(cellValue)}>{cellValue}</span>
                            </div>
                          ) : (
                            cellValue
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td 
                      colSpan={columns.length} 
                      className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Report Footer */}
          <div className="py-4 px-6 border-t text-center print-footer">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  };


export default CloudDashboard;