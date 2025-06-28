import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiCloudLightning, FiServer, FiRefreshCw, FiEye, FiPrinter, FiHardDrive, FiDownload, FiChevronDown, FiFileText, FiFile, FiTable } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Function to determine status color for cloud services
const getCloudStatusColor = (status) => {
  if (!status) return { bg: 'bg-gray-200', text: 'text-gray-800' };
  
  status = String(status).toUpperCase().trim();
  
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
  
  return { bg: 'bg-gray-200', text: 'text-gray-800' };
};

// Function to determine backup status color
const getBackupStatusColor = (status) => {
  if (!status) return { bg: 'bg-gray-200', text: 'text-gray-800' };
  
  status = String(status).toUpperCase().trim();
  
  if (status === 'RUNNING') {
    return { bg: 'bg-green-200', text: 'text-green-800' };
  } else if (status === 'NOT RUNNING') {
    return { bg: 'bg-red-200', text: 'text-red-800' };
  }
  
  return { bg: 'bg-gray-200', text: 'text-gray-800' };
};

// Check if a column is a status column for cloud
const isCloudStatusColumn = (column) => {
  return column === 'Status' || 
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
};

// Check if a column is a weekday column for backup
const isBackupWeekdayColumn = (column) => {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
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
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      return true;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      setIsOpen(false);
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const fileName = `cloud-infrastructure-report-${dateStr}`;
      
      let success = false;
      switch (format) {
        case 'excel':
          success = exportToExcel(reportData, fileName);
          break;
        case 'pdf':
          success = exportToPDF(reportData, fileName);
          break;
        case 'csv':
          success = exportToCSV(reportData, fileName);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      if (success) {
        toast.success(`Successfully exported report as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error(`Export error (${format}):`, error);
      toast.error(`Failed to export as ${format.toUpperCase()}: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      format: 'excel',
      label: 'Export as Excel',
      icon: FiTable,
      description: 'Multi-sheet Excel with cloud and backup data'
    },
    {
      format: 'pdf',
      label: 'Export as PDF',
      icon: FiFileText,
      description: 'Professional PDF format for printing'
    },
    {
      format: 'csv',
      label: 'Export as CSV',
      icon: FiFile,
      description: 'CSV format for data analysis'
    }
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          disabled || isExporting
            ? isDark
              ? 'border-gray-600 text-gray-400 bg-gray-800 cursor-not-allowed'
              : 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
            : isDark
              ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        }`}
      >
        <FiDownload className={`mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
        {isExporting ? 'Exporting...' : 'Export'}
        <FiChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && !isExporting && (
        <div className={`origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${
          isDark ? 'bg-gray-800 ring-gray-700' : 'bg-white'
        }`}>
          <div className="py-1">
            {exportOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className={`group flex items-start w-full px-4 py-3 text-sm hover:bg-opacity-75 transition-colors ${
                    isDark
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="mr-3 mt-0.5 flex-shrink-0" size={16} />
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className={`text-xs mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {option.description}
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

// Print Preview Component
const CloudPrintPreview = ({ cloudData, backupData }) => {
  const history = useHistory();
  const { isDark } = useTheme();

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
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
          }
          .report-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .report-date {
            font-size: 16px;
            margin-bottom: 10px;
          }
          .section-header {
            font-size: 20px;
            font-weight: bold;
            margin: 30px 0 15px 0;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .report-table th, .report-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
          }
          .report-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-running, .status-automatic, .status-success, .status-online {
            background-color: #d1fae5;
            color: #065f46;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
          }
          .status-not-running, .status-failed, .status-error, .status-offline {
            background-color: #fee2e2;
            color: #b91c1c;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
          }
          .status-manual, .status-maintenance {
            background-color: #fef3c7;
            color: #92400e;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
          }
          .status-na {
            background-color: #e0e7ff;
            color: #4338ca;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
          }
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <img src="./biztras.png" alt="BizTras Logo" class="logo" />
          <div class="report-title">Cloud Infrastructure Status Report</div>
          <div class="report-date">Cloud Services: ${formatDate(cloudData.reportDates?.startDate)} - ${formatDate(cloudData.reportDates?.endDate)}</div>
          <div class="report-date">Backup Servers: ${formatDate(backupData.reportDates?.startDate)} - ${formatDate(backupData.reportDates?.endDate)}</div>
          <div style="font-size: 14px; margin-top: 10px;">Total Space Used: ${cloudData.totalSpaceUsed || 'N/A'}</div>
        </div>
        
        <!-- Cloud Status Section -->
        <div class="section-header">☁️ Cloud Services Status</div>
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
                    const statusClass = value.toLowerCase().includes('automatic') || value.toLowerCase().includes('success') || value.toLowerCase().includes('online') ? 'status-automatic' :
                                       value.toLowerCase().includes('manual') || value.toLowerCase().includes('maintenance') ? 'status-manual' :
                                       value.toLowerCase().includes('failed') || value.toLowerCase().includes('error') || value.toLowerCase().includes('offline') ? 'status-failed' :
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
        <div class="section-header">🗄️ Backup Server Cronjob Status</div>
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
                                       value.toUpperCase() === 'NOT RUNNING' ? 'status-not-running' : '';
                    return `<td><span class="${statusClass}">${value}</span></td>`;
                  }
                  return `<td>${value}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>Cloud Services: ${cloudData.rows.length} | Backup Servers: ${backupData.rows.length}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              onClick={() => history.goBack()}
              className={`mr-4 flex items-center ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
              }`}
            >
              <FiArrowLeft className="mr-1" /> Back to Edit
            </button>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <FiCloudLightning className="mr-2" /> Print Preview
            </h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => history.push('/cloud-dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiArrowLeft className="mr-2" /> Back to Edit
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FiPrinter className="mr-2" /> Print Report
            </button>
          </div>
        </div>

        {/* Combined Report Content */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-8`}>
          {/* Report Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Cloud Infrastructure Status Report
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Cloud Services:</strong> {formatDate(cloudData.reportDates?.startDate)} - {formatDate(cloudData.reportDates?.endDate)}
            </p>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Backup Servers:</strong> {formatDate(backupData.reportDates?.startDate)} - {formatDate(backupData.reportDates?.endDate)}
            </p>
            {cloudData.totalSpaceUsed && (
              <p className={`text-md ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                Total Space Used: {cloudData.totalSpaceUsed}
              </p>
            )}
          </div>

          {/* Cloud Services Section */}
          <div className="mb-12">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 flex items-center border-b pb-2`}>
              <FiCloudLightning className="mr-2" /> IDrive Weekly Report
            </h3>
            <div className="overflow-x-auto">
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
                      {cloudData.columns.map((column, colIndex) => {
                        const value = row[column] || '';
                        return (
                          <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {isCloudStatusColumn(column) ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                getCloudStatusColor(value).bg
                              } ${getCloudStatusColor(value).text}`}>
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Backup Servers Section */}
          <div className="mb-8">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 flex items-center border-b pb-2`}>
              <FiServer className="mr-2" /> Backup Server Cronjob Status
            </h3>
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
                      {backupData.columns.map((column, colIndex) => {
                        const value = row[column] || '';
                        return (
                          <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {isBackupWeekdayColumn(column) ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                getBackupStatusColor(value).bg
                              } ${getBackupStatusColor(value).text}`}>
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Footer */}
          <div className={`text-center mt-8 pt-6 border-t ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`}>
            <p className="text-sm">
              Generated on {new Date().toLocaleString()} | 
              Cloud Services: {cloudData.rows.length} | 
              Backup Servers: {backupData.rows.length}
            </p>
          </div>
        </div>
      </div>
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
              <FiCloudLightning className="mr-2" /> Cloud Infrastructure Dashboard
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
            <ExportDropdown 
              reportData={getReportData()} 
              disabled={loading || saveLoading}
            />
            <button
              onClick={togglePreviewMode}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <FiEye className="mr-2" /> Preview Report
            </button>
            <button
              onClick={saveData}
              disabled={saveLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <FiSave className={`mr-2 ${saveLoading ? 'animate-spin' : ''}`} />
              {saveLoading ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg mb-6`}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('cloud')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'cloud'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FiCloudLightning className="inline mr-2" />
                Cloud Services ({cloudRows.length})
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'backup'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FiServer className="inline mr-2" />
                Backup Servers ({backupRows.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Cloud Services Tab */}
        {activeTab === 'cloud' && (
          <>
            {/* Cloud Report Details */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <FiCloudLightning className="mr-2" /> Cloud Services Configuration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage Cloud Columns</h2>
              
              <div className="flex items-end mb-4">
                <div className="flex-grow mr-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    New Column Name
                  </label>
                  <input
                    type="text"
                    value={newCloudColumnName}
                    onChange={(e) => setNewCloudColumnName(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter column name"
                  />
                </div>
                <button
                  onClick={handleAddCloudColumn}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FiPlus className="mr-2" /> Add Column
                </button>
              </div>
              
              <div className="overflow-x-auto mt-4">
                <div className="inline-flex flex-nowrap">
                  {cloudColumns.map((column, index) => (
                    <div 
                      key={index} 
                      className={`min-w-max px-4 py-2 m-1 rounded-md ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      } flex items-center justify-between`}
                    >
                      <span className="mr-2">{column}</span>
                      <button
                        onClick={() => handleRemoveCloudColumn(index)}
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

        {/* Backup Servers Tab */}
        {activeTab === 'backup' && (
          <>
            {/* Backup Report Details */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <FiServer className="mr-2" /> Backup Server Configuration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Report Title
                  </label>
                  <input type="text"
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
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage Backup Columns</h2>
              
              <div className="flex items-end mb-4">
                <div className="flex-grow mr-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    New Column Name
                  </label>
                  <input
                    type="text"
                    value={newBackupColumnName}
                    onChange={(e) => setNewBackupColumnName(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter column name"
                  />
                </div>
                <button
                  onClick={handleAddBackupColumn}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <FiPlus className="mr-2" /> Add Column
                </button>
              </div>
              
              <div className="overflow-x-auto mt-4">
                <div className="inline-flex flex-nowrap">
                  {backupColumns.map((column, index) => (
                    <div 
                      key={index} 
                      className={`min-w-max px-4 py-2 m-1 rounded-md ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      } flex items-center justify-between`}
                    >
                      <span className="mr-2">{column}</span>
                      <button
                        onClick={() => handleRemoveBackupColumn(index)}
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
                          {isBackupWeekdayColumn(column) ? (
                            <select
                              value={row[column] || ''}
                              onChange={(e) => handleBackupCellChange(rowIndex, column, e.target.value)}
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="">Select Status</option>
                              <option value="RUNNING" className="text-green-600">RUNNING</option>
                              <option value="NOT RUNNING" className="text-red-600">NOT RUNNING</option>
                            </select>
                          ) : (
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
                          )}
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
                