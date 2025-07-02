import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiDownload, FiEye, FiPrinter, FiArrowLeft } from 'react-icons/fi';
import api from '../../utils/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Styled Status Select Component with Colors
const StyledStatusSelect = ({ value, onChange, isDark, isCloudStatus = false }) => {
  // Get background color based on value
  const getBackgroundColor = (val) => {
    if (!val) return isDark ? '#374151' : '#ffffff'; // Default gray-700 for dark, white for light
    
    const normalizedVal = val.toUpperCase();
    
    if (isCloudStatus) {
      // Cloud service status colors
      switch (normalizedVal) {
        case 'AUTOMATIC':
          return '#10b981'; // Green (emerald-500)
        case 'MANUAL':
          return '#f59e0b'; // Yellow/Orange (amber-500)
        case 'FAILED':
          return '#ef4444'; // Red (red-500)
        case 'IN PROGRESS':
          return '#3b82f6'; // Blue (blue-500)
        case 'ONLINE':
          return '#10b981'; // Green (emerald-500)
        case 'MAINTENANCE':
          return '#f59e0b'; // Yellow/Orange (amber-500)
        case 'OFFLINE':
          return '#ef4444'; // Red (red-500)
        case 'N/A':
          return '#6b7280'; // Gray (gray-500)
        default:
          return isDark ? '#374151' : '#ffffff';
      }
    } else {
      // Backup server status colors
      switch (normalizedVal) {
        case 'RUNNING':
          return '#10b981'; // Green (emerald-500)
        case 'NOT RUNNING':
          return '#ef4444'; // Red (red-500)
        case 'N/A':
          return '#6b7280'; // Gray (gray-500)
        default:
          return isDark ? '#374151' : '#ffffff';
      }
    }
  };

  // Get text color based on background
  const getTextColor = (val) => {
    if (!val) return isDark ? '#ffffff' : '#000000';
    
    const normalizedVal = val.toUpperCase();
    // Use black text for yellow/orange backgrounds for better readability
    if (normalizedVal === 'MANUAL' || normalizedVal === 'MAINTENANCE') {
      return '#000000';
    }
    // Use white text for colored backgrounds, black for default
    return val ? '#ffffff' : (isDark ? '#ffffff' : '#000000');
  };

  const backgroundColor = getBackgroundColor(value);
  const textColor = getTextColor(value);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        backgroundColor,
        color: textColor,
        fontWeight: value ? 'bold' : 'normal',
        transition: 'all 0.2s ease-in-out'
      }}
      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center ${
        isDark 
          ? 'border-gray-600' 
          : 'border-gray-300'
      }`}
    >
      {isCloudStatus ? (
        <>
          <option value="" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            Select Status
          </option>
          <option value="AUTOMATIC" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
            AUTOMATIC
          </option>
          <option value="MANUAL" style={{ backgroundColor: '#f59e0b', color: '#000000' }}>
            MANUAL
          </option>
          <option value="FAILED" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
            FAILED
          </option>
          <option value="IN PROGRESS" style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}>
            IN PROGRESS
          </option>
          <option value="ONLINE" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
            ONLINE
          </option>
          <option value="MAINTENANCE" style={{ backgroundColor: '#f59e0b', color: '#000000' }}>
            MAINTENANCE
          </option>
          <option value="OFFLINE" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
            OFFLINE
          </option>
          <option value="N/A" style={{ backgroundColor: '#6b7280', color: '#ffffff' }}>
            N/A
          </option>
        </>
      ) : (
        <>
          <option value="" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            Select Status
          </option>
          <option value="RUNNING" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
            RUNNING
          </option>
          <option value="NOT RUNNING" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
            NOT RUNNING
          </option>
          <option value="N/A" style={{ backgroundColor: '#6b7280', color: '#ffffff' }}>
            N/A
          </option>
        </>
      )}
    </select>
  );
};

// Helper functions
const isCloudStatusColumn = (column) => {
  return column === 'Status' || 
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
};

const isBackupWeekdayColumn = (column) => {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Print Preview Component
const CloudPrintPreview = ({ cloudData, backupData }) => {
  const history = useHistory();
  const { isDark } = useTheme();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    // Convert logo to base64 to ensure it loads in print
    const logoCanvas = document.createElement('canvas');
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    logoImg.onload = function() {
      logoCanvas.width = this.width;
      logoCanvas.height = this.height;
      const ctx = logoCanvas.getContext('2d');
      ctx.drawImage(this, 0, 0);
      const logoBase64 = logoCanvas.toDataURL();
      
      generatePrintContent(logoBase64);
    };
    
    logoImg.onerror = function() {
      // If logo fails to load, continue without it
      generatePrintContent(null);
    };
    
    // Try to load logo from multiple possible paths
    logoImg.src = './biztras.png';
    
    // Fallback: if logo doesn't load within 2 seconds, continue without it
    setTimeout(() => {
      if (!logoImg.complete) {
        generatePrintContent(null);
      }
    }, 2000);

    function generatePrintContent(logoBase64) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cloud Infrastructure Status Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #000;
              background: #fff;
            }
            .report-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
            }
            .logo {
              width: 120px;
              height: auto;
              margin-bottom: 15px;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
            .report-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000;
            }
            .report-subtitle {
              font-size: 18px;
              margin-bottom: 8px;
              color: #333;
            }
            .report-date {
              font-size: 14px;
              margin-bottom: 5px;
              color: #666;
            }
            .total-space {
              font-size: 16px;
              margin-top: 10px;
              font-weight: bold;
              color: #333;
            }
            .section-header {
              font-size: 20px;
              font-weight: bold;
              margin: 30px 0 15px 0;
              padding: 8px 12px;
              background-color: #f0f0f0;
              border-left: 4px solid #333;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 10px;
            }
            .report-table th, .report-table td {
              border: 1px solid #000;
              padding: 6px 4px;
              text-align: left;
              vertical-align: top;
            }
            .report-table th {
              background-color: #e0e0e0;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 9px;
            }
            .report-footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 15px;
            }
            .status-automatic, .status-online {
              background-color: #d4edda;
              color: #155724;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 9px;
            }
            .status-manual, .status-maintenance {
              background-color: #fff3cd;
              color: #856404;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 9px;
            }
            .status-failed, .status-offline {
              background-color: #f8d7da;
              color: #721c24;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 9px;
            }
            .status-progress {
              background-color: #d1ecf1;
              color: #0c5460;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 9px;
            }
            .status-na {
              background-color: #e2e6ea;
              color: #383d41;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 9px;
            }
            .status-running {
              background-color: #d1ecf1;
              color: #0c5460;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 9px;
            }
            @page {
              size: A4 landscape;
              margin: 15mm;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            ${logoBase64 ? `<img src="${logoBase64}" alt="BizTras Logo" class="logo" />` : ''}
            <div class="report-title">Cloud Infrastructure Status Report</div>
            <div class="report-subtitle">${cloudData.reportTitle || 'Cloud Status Report'}</div>
            <div class="report-subtitle">${backupData.reportTitle || 'Backup Server Cronjob Status'}</div>
            <div class="report-date">Cloud Services: ${formatDate(cloudData.reportDates?.startDate)} - ${formatDate(cloudData.reportDates?.endDate)}</div>
            <div class="report-date">Backup Servers: ${formatDate(backupData.reportDates?.startDate)} - ${formatDate(backupData.reportDates?.endDate)}</div>
            ${cloudData.totalSpaceUsed ? `<div class="total-space">Total Space Used: ${cloudData.totalSpaceUsed}</div>` : ''}
          </div>
          
          <!-- Cloud Status Section -->
          <div class="section-header">☁️ ${cloudData.reportTitle || 'Cloud Services Status'}</div>
          <table class="report-table">
            <thead>
              <tr>
                ${cloudData.columns.map(col => `<th>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${cloudData.rows.map(row => `
                <tr>
                  ${cloudData.columns.map(column => {
                    const value = row[column] || '';
                    if (isCloudStatusColumn(column)) {
                      const statusClass = value.toLowerCase().includes('automatic') || value.toLowerCase().includes('online') ? 'status-automatic' :
                                         value.toLowerCase().includes('manual') || value.toLowerCase().includes('maintenance') ? 'status-manual' :
                                         value.toLowerCase().includes('failed') || value.toLowerCase().includes('offline') ? 'status-failed' :
                                         value.toLowerCase().includes('progress') ? 'status-progress' :
                                         value.toLowerCase().includes('n/a') ? 'status-na' : '';
                      return `<td><span class="${statusClass}">${value}</span></td>`;
                    }
                    return `<td>${value}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Backup Server Section -->
          <div class="section-header">🗄️ ${backupData.reportTitle || 'Backup Server Cronjob Status'}</div>
          <table class="report-table">
            <thead>
              <tr>
                ${backupData.columns.map(col => `<th>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${backupData.rows.map(row => `
                <tr>
                  ${backupData.columns.map(column => {
                    const value = row[column] || '';
                    if (isBackupWeekdayColumn(column)) {
                      const statusClass = value.toUpperCase() === 'RUNNING' ? 'status-running' :
                                         value.toLowerCase().includes('not running') || value.toLowerCase().includes('failed') ? 'status-failed' :
                                         value.toLowerCase().includes('n/a') ? 'status-na' : '';
                      return `<td><span class="${statusClass}">${value}</span></td>`;
                    }
                    return `<td>${value}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="report-footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Cloud Services: ${cloudData.rows.length} | Backup Servers: ${backupData.rows.length}</p>
            ${cloudData.totalSpaceUsed ? `<p>Total Space Used: ${cloudData.totalSpaceUsed}</p>` : ''}
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => history.push('/cloud-dashboard')}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
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
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPrinter className="mr-2" />
            Print Report
          </button>
        </div>

        {/* Preview content */}
        <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg rounded-lg overflow-hidden`}>
          {/* Header */}
          <div className="text-center py-8 px-6 border-b">
            <img 
              src="./biztras.png" 
              alt="BizTras Logo" 
              className="w-24 h-24 mx-auto mb-4 rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1 className="text-3xl font-bold mb-2">Cloud Infrastructure Status Report</h1>
            <h2 className="text-xl font-semibold mb-2">{cloudData.reportTitle || 'Cloud Status Report'}</h2>
            <h3 className="text-xl font-semibold mb-4">{backupData.reportTitle || 'Backup Server Cronjob Status'}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Cloud Services: {formatDate(cloudData.reportDates?.startDate)} - {formatDate(cloudData.reportDates?.endDate)}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Backup Servers: {formatDate(backupData.reportDates?.startDate)} - {formatDate(backupData.reportDates?.endDate)}
            </p>
            {cloudData.totalSpaceUsed && (
              <p className="text-lg font-semibold text-blue-600">
                Total Space Used: {cloudData.totalSpaceUsed}
              </p>
            )}
          </div>

          {/* Cloud Services Section */}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">☁️ {cloudData.reportTitle || 'Cloud Services Status'}</h3>
            <div className="overflow-x-auto mb-8">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    {cloudData.columns.map((column, index) => (
                      <th
                        key={index}
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {cloudData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {cloudData.columns.map((column, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm">
                          {row[column] || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Backup Servers Section */}
            <h3 className="text-xl font-bold mb-4">🗄️ {backupData.reportTitle || 'Backup Server Cronjob Status'}</h3>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    {backupData.columns.map((column, index) => (
                      <th
                        key={index}
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {backupData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {backupData.columns.map((column, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm">
                          {row[column] || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t text-center ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`}>
            <p className="text-sm mb-2">
              Generated on {new Date().toLocaleString()}
            </p>
            <p className="text-sm">
              Cloud Services: {cloudData.rows.length} | Backup Servers: {backupData.rows.length}
              {cloudData.totalSpaceUsed && ` | Total Space Used: ${cloudData.totalSpaceUsed}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export Dropdown Component
const ExportDropdown = ({ reportData, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  // Export functions
  const exportToExcel = (data, fileName) => {
    try {
      const { cloudData, backupData } = data;
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Cloud Services Sheet
      const cloudWs = XLSX.utils.aoa_to_sheet([cloudData.columns]);
      const cloudRowData = cloudData.rows.map(row => 
        cloudData.columns.map(column => row[column] || '')
      );
      XLSX.utils.sheet_add_aoa(cloudWs, cloudRowData, { origin: 'A2' });
      cloudWs['!cols'] = cloudData.columns.map(() => ({ wch: 18 }));
      XLSX.utils.book_append_sheet(wb, cloudWs, 'Cloud Services');
      
      // Backup Servers Sheet
      const backupWs = XLSX.utils.aoa_to_sheet([backupData.columns]);
      const backupRowData = backupData.rows.map(row => 
        backupData.columns.map(column => row[column] || '')
      );
      XLSX.utils.sheet_add_aoa(backupWs, backupRowData, { origin: 'A2' });
      backupWs['!cols'] = backupData.columns.map(() => ({ wch: 18 }));
      XLSX.utils.book_append_sheet(wb, backupWs, 'Backup Servers');
      
      // Summary Sheet
      const summaryWs = XLSX.utils.aoa_to_sheet([
        ['Report Information'],
        ['Cloud Report Title', cloudData.reportTitle],
        ['Backup Report Title', backupData.reportTitle],
        ['Cloud Start Date', formatDate(cloudData.reportDates?.startDate)],
        ['Cloud End Date', formatDate(cloudData.reportDates?.endDate)],
        ['Backup Start Date', formatDate(backupData.reportDates?.startDate)],
        ['Backup End Date', formatDate(backupData.reportDates?.endDate)],
        ['Total Space Used', cloudData.totalSpaceUsed || 'N/A'],
        ['Generated On', new Date().toLocaleString()],
        ['Cloud Services Count', cloudData.rows.length],
        ['Backup Servers Count', backupData.rows.length]
      ]);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  };

  const exportToCSV = (data, fileName) => {
    try {
      const { cloudData, backupData } = data;
      
      let csvContent = '';
      
      // Metadata
      csvContent += `Report Information\n`;
      csvContent += `Cloud Report Title,${cloudData.reportTitle}\n`;
      csvContent += `Backup Report Title,${backupData.reportTitle}\n`;
      csvContent += `Cloud Start Date,${formatDate(cloudData.reportDates?.startDate)}\n`;
      csvContent += `Cloud End Date,${formatDate(cloudData.reportDates?.endDate)}\n`;
      csvContent += `Backup Start Date,${formatDate(backupData.reportDates?.startDate)}\n`;
      csvContent += `Backup End Date,${formatDate(backupData.reportDates?.endDate)}\n`;
      csvContent += `Total Space Used,${cloudData.totalSpaceUsed || 'N/A'}\n`;
      csvContent += `Generated On,${new Date().toLocaleString()}\n\n`;
      
      // Cloud Services
      csvContent += `Cloud Services\n`;
      csvContent += cloudData.columns.join(',') + '\n';
      cloudData.rows.forEach(row => {
        const rowData = cloudData.columns.map(column => {
          const value = row[column] || '';
          return value.includes(',') ? `"${value}"` : value;
        });
        csvContent += rowData.join(',') + '\n';
      });
      
      csvContent += '\n';
      
      // Backup Servers
      csvContent += `Backup Servers\n`;
      csvContent += backupData.columns.join(',') + '\n';
      backupData.rows.forEach(row => {
        const rowData = backupData.columns.map(column => {
          const value = row[column] || '';
          return value.includes(',') ? `"${value}"` : value;
        });
        csvContent += rowData.join(',') + '\n';
      });
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  };

  const exportToPDF = (data, fileName) => {
    try {
      const { cloudData, backupData } = data;
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Cloud Infrastructure Status Report', 148, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Cloud: ${formatDate(cloudData.reportDates?.startDate)} - ${formatDate(cloudData.reportDates?.endDate)}`, 148, 30, { align: 'center' });
      doc.text(`Backup: ${formatDate(backupData.reportDates?.startDate)} - ${formatDate(backupData.reportDates?.endDate)}`, 148, 35, { align: 'center' });
      
      // Cloud Services Table
      const cloudTableData = cloudData.rows.map(row => 
        cloudData.columns.map(column => row[column] || '')
      );
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Cloud Services', 10, 50);
      
      doc.autoTable({
        head: [cloudData.columns],
        body: cloudTableData,
        startY: 55,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
        margin: { top: 55, right: 10, bottom: 20, left: 10 }
      });
      
      // Backup Servers Table
      const backupTableData = backupData.rows.map(row => 
        backupData.columns.map(column => row[column] || '')
      );
      
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Backup Servers', 10, finalY);
      
      doc.autoTable({
        head: [backupData.columns],
        body: backupTableData,
        startY: finalY + 5,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255] },
        margin: { top: finalY + 5, right: 10, bottom: 20, left: 10 }
      });
      
      doc.save(`${fileName}.pdf`);
      return true;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  };

  const handleExport = async (format) => {
    if (!reportData || isExporting) return;

    try {
      setIsExporting(true);
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `cloud-infrastructure-report-${timestamp}`;

      let success = false;
      switch (format) {
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
          throw new Error('Invalid export format');
      }

      if (success) {
        toast.success(`Report exported to ${format.toUpperCase()} successfully!`);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      id: 'pdf',
      label: 'Export as PDF',
      description: 'Portable Document Format - Best for printing',
      icon: '📄'
    },
    {
      id: 'excel',
      label: 'Export as Excel',
      description: 'Microsoft Excel - Best for data analysis',
      icon: '📊'
    },
    {
      id: 'csv',
      label: 'Export as CSV',
      description: 'Comma Separated Values - Best for data import',
      icon: '📋'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          disabled || isExporting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
      >
        <FiDownload className="mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>

      {isOpen && !disabled && (
        <div className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="py-1">
            {exportOptions.map((option) => {
              return (
                <button
                  key={option.id}
                  onClick={() => handleExport(option.id)}
                  disabled={isExporting}
                  className={`w-full text-left px-4 py-3 text-sm border-b last:border-b-0 ${
                    isDark
                      ? 'hover:bg-gray-700 text-gray-200 border-gray-700'
                      : 'hover:bg-gray-50 text-gray-900 border-gray-100'
                  } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{option.icon}</span>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className={`text-xs mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className={`px-4 py-2 border-t text-xs ${
            isDark 
              ? 'border-gray-700 text-gray-400 bg-gray-750' 
              : 'border-gray-200 text-gray-500 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <span>Cloud: {reportData.cloudData?.rows?.length || 0} services</span>
              <span>Backup: {reportData.backupData?.rows?.length || 0} servers</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Cloud Dashboard Component
const CloudDashboard = () => {
  // Cloud Data State
  const [cloudColumns, setCloudColumns] = useState(['Server', 'Status', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'SSL Expiry', 'Space Used', 'Remarks']);
  const [cloudRows, setCloudRows] = useState([]);
  const [cloudReportTitle, setCloudReportTitle] = useState('Cloud Status Report');
  const [cloudReportDates, setCloudReportDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [cloudTotalSpaceUsed, setCloudTotalSpaceUsed] = useState('');

  // Backup Data State
  const [backupColumns, setBackupColumns] = useState(['Server', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Remarks']);
  const [backupRows, setBackupRows] = useState([]);
  const [backupReportTitle, setBackupReportTitle] = useState('Backup Server Cronjob Status');
  const [backupReportDates, setBackupReportDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Common State
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('cloud'); // 'cloud' or 'backup'
  
  // Column management states
  const [newCloudColumnName, setNewCloudColumnName] = useState('');
  const [newBackupColumnName, setNewBackupColumnName] = useState('');

  const history = useHistory();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  // Check if we're in preview mode
  const isPreviewMode = new URLSearchParams(location.search).get('preview') === 'true';

  // Fetch both cloud and backup data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch cloud data
      const cloudResponse = await api.get('/cloud-report/data');
      if (cloudResponse && cloudResponse.data) {
        const { reportTitle, reportDates, columns, rows, totalSpaceUsed, updatedAt } = cloudResponse.data;
        setCloudReportTitle(reportTitle || 'Cloud Status Report');
        
        // Ensure dates are properly formatted for date inputs
        const cloudDates = reportDates || {};
        setCloudReportDates({
          startDate: cloudDates.startDate ? new Date(cloudDates.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: cloudDates.endDate ? new Date(cloudDates.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        
        setCloudColumns(columns || ['Server', 'Status', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'SSL Expiry', 'Space Used', 'Remarks']);
        setCloudRows(rows || []);
        setCloudTotalSpaceUsed(totalSpaceUsed || '');
        setLastUpdated(updatedAt);
      }

      // Fetch backup data
      const backupResponse = await api.get('/backup-server/data');
      if (backupResponse && backupResponse.data) {
        const { reportTitle, reportDates, columns, rows } = backupResponse.data;
        setBackupReportTitle(reportTitle || 'Backup Server Cronjob Status');
        
        // Ensure dates are properly formatted for date inputs
        const backupDates = reportDates || {};
        setBackupReportDates({
          startDate: backupDates.startDate ? new Date(backupDates.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: backupDates.endDate ? new Date(backupDates.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        
        setBackupColumns(columns || ['Server', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Remarks']);
        setBackupRows(rows || []);
      }
    } catch (err) {
      console.error('Error fetching cloud dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save both datasets
  const saveData = async () => {
    try {
      setSaveLoading(true);
      
      // Save cloud data
      const cloudPayload = {
        reportTitle: cloudReportTitle,
        reportDates: cloudReportDates,
        columns: cloudColumns,
        rows: cloudRows,
        totalSpaceUsed: cloudTotalSpaceUsed
      };
      
      // Save backup data
      const backupPayload = {
        reportTitle: backupReportTitle,
        reportDates: backupReportDates,
        columns: backupColumns,
        rows: backupRows
      };
      
      await Promise.all([
        api.post('/cloud-report/save', cloudPayload),
        api.post('/backup-server/save', backupPayload)
      ]);
      
      toast.success('Cloud dashboard data saved successfully!');
      setLastUpdated(new Date().toISOString());
      return true;
    } catch (err) {
      console.error('Error saving cloud dashboard data:', err);
      toast.error('Failed to save dashboard data');
      return false;
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle date change for cloud
  const handleCloudDateChange = (field, value) => {
    setCloudReportDates({
      ...cloudReportDates,
      [field]: value
    });
  };

  // Handle date change for backup
  const handleBackupDateChange = (field, value) => {
    setBackupReportDates({
      ...backupReportDates,
      [field]: value
    });
  };

  // Cloud Column Management
  const handleAddCloudColumn = () => {
    if (newCloudColumnName.trim() && !cloudColumns.includes(newCloudColumnName.trim())) {
      setCloudColumns([...cloudColumns, newCloudColumnName.trim()]);
      setNewCloudColumnName('');
      toast.success(`Cloud column "${newCloudColumnName}" added successfully!`);
    } else if (cloudColumns.includes(newCloudColumnName.trim())) {
      toast.error('Column already exists!');
    } else {
      toast.error('Please enter a valid column name');
    }
  };

  const handleRemoveCloudColumn = (indexToRemove) => {
    const columnToRemove = cloudColumns[indexToRemove];
    setCloudColumns(cloudColumns.filter((_, index) => index !== indexToRemove));
    
    const updatedRows = cloudRows.map(row => {
      const newRow = { ...row };
      delete newRow[columnToRemove];
      return newRow;
    });
    setCloudRows(updatedRows);
    
    toast.success(`Cloud column "${columnToRemove}" removed successfully!`);
  };

  // Backup Column Management
  const handleAddBackupColumn = () => {
    if (newBackupColumnName.trim() && !backupColumns.includes(newBackupColumnName.trim())) {
      setBackupColumns([...backupColumns, newBackupColumnName.trim()]);
      setNewBackupColumnName('');
      toast.success(`Backup column "${newBackupColumnName}" added successfully!`);
    } else if (backupColumns.includes(newBackupColumnName.trim())) {
      toast.error('Column already exists!');
    } else {
      toast.error('Please enter a valid column name');
    }
  };

  const handleRemoveBackupColumn = (indexToRemove) => {
    const columnToRemove = backupColumns[indexToRemove];
    setBackupColumns(backupColumns.filter((_, index) => index !== indexToRemove));
    
    const updatedRows = backupRows.map(row => {
      const newRow = { ...row };
      delete newRow[columnToRemove];
      return newRow;
    });
    setBackupRows(updatedRows);
    
    toast.success(`Backup column "${columnToRemove}" removed successfully!`);
  };

  // Cloud Row Management
  const handleAddCloudRow = () => {
    const newRow = {};
    cloudColumns.forEach(column => {
      newRow[column] = '';
    });
    setCloudRows([...cloudRows, newRow]);
    toast.success('New cloud service row added successfully!');
  };

  const handleRemoveCloudRow = (indexToRemove) => {
    setCloudRows(cloudRows.filter((_, index) => index !== indexToRemove));
    toast.success('Cloud service row removed successfully!');
  };

  const handleCloudCellChange = (rowIndex, column, value) => {
    const updatedRows = [...cloudRows];
    updatedRows[rowIndex][column] = value;
    setCloudRows(updatedRows);
  };

  // Backup Row Management
  const handleAddBackupRow = () => {
    const newRow = {};
    backupColumns.forEach(column => {
      newRow[column] = '';
    });
    setBackupRows([...backupRows, newRow]);
    toast.success('New backup server row added successfully!');
  };

  const handleRemoveBackupRow = (indexToRemove) => {
    setBackupRows(backupRows.filter((_, index) => index !== indexToRemove));
    toast.success('Backup server row removed successfully!');
  };

  const handleBackupCellChange = (rowIndex, column, value) => {
    const updatedRows = [...backupRows];
    updatedRows[rowIndex][column] = value;
    setBackupRows(updatedRows);
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
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

  // Prepare report data for preview
  const getReportData = () => {
    return {
      cloudData: {
        reportTitle: cloudReportTitle,
        reportDates: cloudReportDates,
        columns: cloudColumns,
        rows: cloudRows,
        totalSpaceUsed: cloudTotalSpaceUsed
      },
      backupData: {
        reportTitle: backupReportTitle,
        reportDates: backupReportDates,
        columns: backupColumns,
        rows: backupRows
      },
      lastUpdated
    };
  };

  // Cell rendering with styled dropdowns
  const renderCloudCell = (row, column, rowIndex) => {
    const isStatusColumn = column === 'Status';
    const isWeekdayColumn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
    const isSSLColumn = column === 'SSL Expiry';

    if (isStatusColumn || isWeekdayColumn) {
      return (
        <StyledStatusSelect
          value={row[column] || ''}
          onChange={(newValue) => handleCloudCellChange(rowIndex, column, newValue)}
          isDark={isDark}
          isCloudStatus={true}
        />
      );
    } else if (isSSLColumn) {
      return (
        <input
          type="date"
          value={row[column] || ''}
          onChange={(e) => handleCloudCellChange(rowIndex, column, e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      );
    } else {
      return (
        <input
          type="text"
          value={row[column] || ''}
          onChange={(e) => handleCloudCellChange(rowIndex, column, e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      );
    }
  };

  const renderBackupCell = (row, column, rowIndex) => {
    const isWeekdayColumn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);

    if (isWeekdayColumn) {
      return (
        <StyledStatusSelect
          value={row[column] || ''}
          onChange={(newValue) => handleBackupCellChange(rowIndex, column, newValue)}
          isDark={isDark}
          isCloudStatus={false}
        />
      );
    } else {
      return (
        <input
          type="text"
          value={row[column] || ''}
          onChange={(e) => handleBackupCellChange(rowIndex, column, e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      );
    }
  };

  // Render preview mode
  if (isPreviewMode) {
    const reportData = getReportData();
    return <CloudPrintPreview cloudData={reportData.cloudData} backupData={reportData.backupData} />;
  }

  // Loading state
  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${
            isDark ? 'border-indigo-400' : 'border-indigo-600'
          } mx-auto`}></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading cloud dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Cloud Infrastructure Dashboard
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage cloud services and backup server configurations
            </p>
          </div>
          
          <div className="flex space-x-3">
            <ExportDropdown 
              reportData={getReportData()} 
              disabled={cloudRows.length === 0 && backupRows.length === 0}
            />
            
            <button
              onClick={togglePreviewMode}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiEye className="mr-2" />
              Preview & Print
            </button>
            
            <button
              onClick={saveData}
              disabled={saveLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                saveLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg mb-6`}>
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('cloud')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === 'cloud'
                  ? isDark
                    ? 'border-b-2 border-indigo-400 text-indigo-400 bg-gray-700'
                    : 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ☁️ Cloud Services ({cloudRows.length})
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === 'backup'
                  ? isDark
                    ? 'border-b-2 border-green-400 text-green-400 bg-gray-700'
                    : 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🗄️ Backup Servers ({backupRows.length})
            </button>
          </div>
        </div>

        {/* Cloud Services Tab */}
        {activeTab === 'cloud' && (
          <>
            {/* Cloud Configuration */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cloud Service Configuration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={cloudReportTitle}
                    onChange={(e) => setCloudReportTitle(e.target.value)}
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
                    value={cloudReportDates.startDate}
                    onChange={(e) => handleCloudDateChange('startDate', e.target.value)}
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
                    value={cloudReportDates.endDate}
                    onChange={(e) => handleCloudDateChange('endDate', e.target.value)}
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
                  <input
                    type="text"
                    value={cloudTotalSpaceUsed}
                    onChange={(e) => setCloudTotalSpaceUsed(e.target.value)}
                    placeholder="e.g., 2.5TB"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Cloud Column Management */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cloud Service Columns
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  type="text"
                  value={newCloudColumnName}
                  onChange={(e) => setNewCloudColumnName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCloudColumn()}
                  placeholder="Enter new column name"
                  className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={handleAddCloudColumn}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Add Column
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {cloudColumns.map((column, index) => (
                  <div key={index} className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    <span>{column}</span>
                    <button
                      onClick={() => handleRemoveCloudColumn(index)}
                      className={`ml-2 text-red-500 hover:text-red-700 focus:outline-none ${
                        isDark ? 'hover:text-red-400' : 'hover:text-red-600'
                      }`}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cloud Data Grid */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6 overflow-x-auto`}>
              <div className="flex justify-between mb-4">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Cloud Services Data
                </h2>
                <button
                  onClick={handleAddCloudRow}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FiPlus className="mr-2" /> Add Service
                </button>
              </div>
              
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                    {cloudColumns.map((column, index) => (
                      <th
                        key={index}
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {cloudRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemoveCloudRow(rowIndex)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                      {cloudColumns.map((column, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                          {renderCloudCell(row, column, rowIndex)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {cloudRows.length === 0 && (
                    <tr>
                      <td 
                        colSpan={cloudColumns.length + 1} 
                        className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        No cloud services configured. Click "Add Service" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Backup Services Tab */}
        {activeTab === 'backup' && (
          <>
            {/* Backup Configuration */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Backup Server Configuration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={backupReportTitle}
                    onChange={(e) => setBackupReportTitle(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
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
                    value={backupReportDates.startDate}
                    onChange={(e) => handleBackupDateChange('startDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
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
                    value={backupReportDates.endDate}
                    onChange={(e) => handleBackupDateChange('endDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Backup Column Management */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Backup Server Columns
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  type="text"
                  value={newBackupColumnName}
                  onChange={(e) => setNewBackupColumnName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBackupColumn()}
                  placeholder="Enter new column name"
                  className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={handleAddBackupColumn}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Add Column
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {backupColumns.map((column, index) => (
                  <div key={index} className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    <span>{column}</span>
                    <button
                      onClick={() => handleRemoveBackupColumn(index)}
                      className={`ml-2 text-red-500 hover:text-red-700 focus:outline-none ${
                        isDark ? 'hover:text-red-400' : 'hover:text-red-600'
                      }`}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup Data Grid */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6 overflow-x-auto`}>
              <div className="flex justify-between mb-4">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Backup Server Data
                </h2>
                <button
                  onClick={handleAddBackupRow}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <FiPlus className="mr-2" /> Add Server
                </button>
              </div>
              
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                    {backupColumns.map((column, index) => (
                      <th
                        key={index}
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {backupRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemoveBackupRow(rowIndex)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                      {backupColumns.map((column, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                          {renderBackupCell(row, column, rowIndex)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {backupRows.length === 0 && (
                    <tr>
                      <td 
                        colSpan={backupColumns.length + 1} 
                        className={`px-6 py-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        No backup servers configured. Click "Add Server" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Footer Info */}
        {lastUpdated && (
          <div className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudDashboard;