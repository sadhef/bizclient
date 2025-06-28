import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Export combined cloud and backup data to Excel format
 * @param {Object} data - Combined data object
 * @param {Object} data.cloudData - Cloud report data
 * @param {Object} data.backupData - Backup report data
 * @param {string} fileName - Name for the exported file (without extension)
 */
export const exportToExcel = (data, fileName = 'cloud-infrastructure-report') => {
  try {
    const { cloudData, backupData } = data;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create summary sheet with updated titles and total space used
    const summaryData = [
      ['Report Information'],
      ['Cloud Report Title', cloudData.reportTitle || 'Cloud Status Report'],
      ['Backup Report Title', backupData.reportTitle || 'Backup Server Cronjob Status'],
      ['Cloud Start Date', formatDate(cloudData.reportDates?.startDate)],
      ['Cloud End Date', formatDate(cloudData.reportDates?.endDate)],
      ['Backup Start Date', formatDate(backupData.reportDates?.startDate)],
      ['Backup End Date', formatDate(backupData.reportDates?.endDate)],
      ['Total Space Used', cloudData.totalSpaceUsed || 'N/A'],
      ['Generated On', new Date().toLocaleString()],
      ['Cloud Services Count', cloudData.rows.length],
      ['Backup Servers Count', backupData.rows.length]
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Create cloud services sheet
    const cloudHeaders = cloudData.columns;
    const cloudRows = cloudData.rows.map(row => 
      cloudHeaders.map(column => row[column] || '')
    );
    
    const cloudWs = XLSX.utils.aoa_to_sheet([cloudHeaders, ...cloudRows]);
    cloudWs['!cols'] = cloudHeaders.map(() => ({ wch: 15 }));
    XLSX.utils.book_append_sheet(wb, cloudWs, 'Cloud Services');
    
    // Create backup servers sheet
    const backupHeaders = backupData.columns;
    const backupRows = backupData.rows.map(row => 
      backupHeaders.map(column => row[column] || '')
    );
    
    const backupWs = XLSX.utils.aoa_to_sheet([backupHeaders, ...backupRows]);
    backupWs['!cols'] = backupHeaders.map(() => ({ wch: 15 }));
    XLSX.utils.book_append_sheet(wb, backupWs, 'Backup Servers');
    
    // Export workbook
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/**
 * Export combined cloud and backup data to CSV format
 * @param {Object} data - Combined data object
 * @param {Object} data.cloudData - Cloud report data
 * @param {Object} data.backupData - Backup report data
 * @param {string} fileName - Name for the exported file (without extension)
 */
export const exportToCSV = (data, fileName = 'cloud-infrastructure-report') => {
  try {
    const { cloudData, backupData } = data;
    
    let csvContent = '';
    
    // Metadata with updated titles and total space used
    csvContent += `Report Information\n`;
    csvContent += `Cloud Report Title,${cloudData.reportTitle || 'Cloud Status Report'}\n`;
    csvContent += `Backup Report Title,${backupData.reportTitle || 'Backup Server Cronjob Status'}\n`;
    csvContent += `Cloud Start Date,${formatDate(cloudData.reportDates?.startDate)}\n`;
    csvContent += `Cloud End Date,${formatDate(cloudData.reportDates?.endDate)}\n`;
    csvContent += `Backup Start Date,${formatDate(backupData.reportDates?.startDate)}\n`;
    csvContent += `Backup End Date,${formatDate(backupData.reportDates?.endDate)}\n`;
    csvContent += `Total Space Used,${cloudData.totalSpaceUsed || 'N/A'}\n`;
    csvContent += `Generated On,${new Date().toLocaleString()}\n\n`;
    
    // Cloud Services with updated title
    csvContent += `${cloudData.reportTitle || 'Cloud Services'}\n`;
    csvContent += cloudData.columns.join(',') + '\n';
    cloudData.rows.forEach(row => {
      const rowData = cloudData.columns.map(column => {
        const value = row[column] || '';
        return value.includes(',') ? `"${value}"` : value;
      });
      csvContent += rowData.join(',') + '\n';
    });
    
    csvContent += '\n';
    
    // Backup Servers with updated title
    csvContent += `${backupData.reportTitle || 'Backup Servers'}\n`;
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

/**
 * Export combined cloud and backup data to PDF format
 * @param {Object} data - Combined data object
 * @param {Object} data.cloudData - Cloud report data
 * @param {Object} data.backupData - Backup report data
 * @param {string} fileName - Name for the exported file (without extension)
 */
export const exportToPDF = (data, fileName = 'cloud-infrastructure-report') => {
  try {
    const { cloudData, backupData } = data;
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title and headers with updated titles
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Cloud Infrastructure Status Report', 148, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(cloudData.reportTitle || 'Cloud Status Report', 148, 30, { align: 'center' });
    doc.text(backupData.reportTitle || 'Backup Server Cronjob Status', 148, 36, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cloud: ${formatDate(cloudData.reportDates?.startDate)} - ${formatDate(cloudData.reportDates?.endDate)}`, 148, 45, { align: 'center' });
    doc.text(`Backup: ${formatDate(backupData.reportDates?.startDate)} - ${formatDate(backupData.reportDates?.endDate)}`, 148, 50, { align: 'center' });
    
    // Add total space used if available
    if (cloudData.totalSpaceUsed) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Space Used: ${cloudData.totalSpaceUsed}`, 148, 58, { align: 'center' });
    }
    
    // Cloud Services Table
    const cloudTableData = cloudData.rows.map(row => 
      cloudData.columns.map(column => row[column] || '')
    );
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`☁️ ${cloudData.reportTitle || 'Cloud Services'}`, 10, cloudData.totalSpaceUsed ? 70 : 65);
    
    doc.autoTable({
      head: [cloudData.columns],
      body: cloudTableData,
      startY: cloudData.totalSpaceUsed ? 75 : 70,
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
    doc.text(`🗄️ ${backupData.reportTitle || 'Backup Servers'}`, 10, finalY);
    
    doc.autoTable({
      head: [backupData.columns],
      body: backupTableData,
      startY: finalY + 5,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255] },
      margin: { top: finalY + 5, right: 10, bottom: 20, left: 10 }
    });
    
    // Add footer with metadata
    const footerY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleString()}`, 148, footerY, { align: 'center' });
    doc.text(`Cloud Services: ${cloudData.rows.length} | Backup Servers: ${backupData.rows.length}`, 148, footerY + 5, { align: 'center' });
    
    if (cloudData.totalSpaceUsed) {
      doc.text(`Total Space Used: ${cloudData.totalSpaceUsed}`, 148, footerY + 10, { align: 'center' });
    }
    
    doc.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

/**
 * Export single report data to PDF format (legacy support)
 * @param {Object} reportData - The report data to export
 * @param {string} fileName - Name for the exported file (without extension)
 */
export const exportSingleToPDF = (reportData, fileName = 'cloud-report') => {
  try {
    const { reportTitle, reportDates, columns, rows, totalSpaceUsed } = reportData;
    
    // Create new PDF document - landscape mode
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle || 'Cloud Status Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });
    
    // Add date range
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const dateRange = `${formatDate(reportDates?.startDate)} - ${formatDate(reportDates?.endDate)}`;
    doc.text(dateRange, doc.internal.pageSize.width / 2, 22, { align: 'center' });
    
    // Add total space used if available
    if (totalSpaceUsed) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Space Used: ${totalSpaceUsed}`, doc.internal.pageSize.width / 2, 28, { align: 'center' });
    }
    
    // Format data for autotable
    const tableData = rows.map(row => {
      return columns.map(column => row[column] || 'N/A');
    });
    
    // Define table styling
    doc.autoTable({
      head: [columns],
      body: tableData,
      startY: totalSpaceUsed ? 35 : 30,
      styles: { 
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: { 
        fillColor: [66, 66, 66], 
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.5
    });
    
    // Add footer
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleString()}`, doc.internal.pageSize.width / 2, footerY, { align: 'center' });
    doc.text(`Total Records: ${rows.length}`, doc.internal.pageSize.width / 2, footerY + 5, { align: 'center' });
    
    doc.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting single report to PDF:', error);
    throw error;
  }
};

/**
 * Export single report data to Excel format (legacy support)
 * @param {Object} reportData - The report data to export
 * @param {string} fileName - Name for the exported file (without extension)
 */
export const exportSingleToExcel = (reportData, fileName = 'cloud-report') => {
  try {
    const { reportTitle, reportDates, columns, rows, totalSpaceUsed } = reportData;
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([columns]); // Add headers
    
    // Format each row as an array in the same order as columns
    const rowData = rows.map(row => {
      return columns.map(column => row[column] || '');
    });
    
    // Add rows to the worksheet
    XLSX.utils.sheet_add_aoa(ws, rowData, { origin: 'A2' });
    
    // Set column widths
    const colWidths = columns.map(() => ({ wch: 18 })); // Default width for all columns
    ws['!cols'] = colWidths;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report Data');
    
    // Add metadata/summary sheet
    const metaWs = XLSX.utils.aoa_to_sheet([
      ['Report Information'],
      ['Title', reportTitle || 'Cloud Status Report'],
      ['Start Date', formatDate(reportDates?.startDate)],
      ['End Date', formatDate(reportDates?.endDate)],
      ['Total Space Used', totalSpaceUsed || 'N/A'],
      ['Export Date', new Date().toLocaleString()],
      ['Total Records', rows.length]
    ]);
    
    // Set column widths for metadata
    metaWs['!cols'] = [{ wch: 15 }, { wch: 30 }];
    
    // Add metadata sheet to workbook
    XLSX.utils.book_append_sheet(wb, metaWs, 'Report Info');
    
    // Export workbook
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting single report to Excel:', error);
    throw error;
  }
};

/**
 * Export single report data to CSV format (legacy support)
 * @param {Object} reportData - The report data to export
 * @param {string} fileName - Name for the exported file (without extension)
 */
export const exportSingleToCSV = (reportData, fileName = 'cloud-report') => {
  try {
    const { reportTitle, reportDates, columns, rows, totalSpaceUsed } = reportData;
    
    let csvContent = '';
    
    // Add metadata header
    csvContent += `Report Information\n`;
    csvContent += `Title,${reportTitle || 'Cloud Status Report'}\n`;
    csvContent += `Start Date,${formatDate(reportDates?.startDate)}\n`;
    csvContent += `End Date,${formatDate(reportDates?.endDate)}\n`;
    csvContent += `Total Space Used,${totalSpaceUsed || 'N/A'}\n`;
    csvContent += `Export Date,${new Date().toLocaleString()}\n`;
    csvContent += `Total Records,${rows.length}\n\n`;
    
    // Add data
    csvContent += `Data\n`;
    csvContent += columns.join(',') + '\n';
    
    rows.forEach(row => {
      const rowData = columns.map(column => {
        const value = row[column] || '';
        // Escape values that contain commas or quotes
        return value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
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
    console.error('Error exporting single report to CSV:', error);
    throw error;
  }
};

/**
 * Utility function to get export format options
 */
export const getExportOptions = () => {
  return [
    {
      id: 'pdf',
      label: 'PDF',
      description: 'Portable Document Format - Best for printing and sharing',
      icon: '📄',
      mimeType: 'application/pdf'
    },
    {
      id: 'excel',
      label: 'Excel',
      description: 'Microsoft Excel - Best for data analysis',
      icon: '📊',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    {
      id: 'csv',
      label: 'CSV',
      description: 'Comma Separated Values - Best for data import/export',
      icon: '📋',
      mimeType: 'text/csv'
    }
  ];
};

/**
 * Get file size estimate for export
 * @param {Object} data - Data to export
 * @param {string} format - Export format (pdf, excel, csv)
 */
export const getExportSizeEstimate = (data, format = 'pdf') => {
  try {
    let totalRows = 0;
    let totalCells = 0;
    
    if (data.cloudData && data.backupData) {
      // Combined export
      totalRows = data.cloudData.rows.length + data.backupData.rows.length;
      totalCells = (data.cloudData.rows.length * data.cloudData.columns.length) + 
                   (data.backupData.rows.length * data.backupData.columns.length);
    } else {
      // Single export
      totalRows = data.rows ? data.rows.length : 0;
      totalCells = data.rows && data.columns ? data.rows.length * data.columns.length : 0;
    }
    
    // Rough size estimates based on format
    const estimates = {
      csv: Math.max(totalCells * 15, 1024), // ~15 bytes per cell
      excel: Math.max(totalCells * 25 + 5120, 5120), // ~25 bytes per cell + overhead
      pdf: Math.max(totalCells * 35 + 10240, 10240) // ~35 bytes per cell + overhead
    };
    
    const sizeInBytes = estimates[format] || estimates.pdf;
    
    // Convert to readable format
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${Math.round(sizeInBytes / 1024)} KB`;
    } else {
      return `${Math.round(sizeInBytes / (1024 * 1024) * 10) / 10} MB`;
    }
  } catch (error) {
    console.error('Error estimating export size:', error);
    return 'Unknown';
  }
};

/**
 * Validate export data before processing
 * @param {Object} data - Data to validate
 */
export const validateExportData = (data) => {
  const errors = [];
  
  if (data.cloudData && data.backupData) {
    // Combined export validation
    if (!data.cloudData.columns || !Array.isArray(data.cloudData.columns)) {
      errors.push('Cloud data columns are missing or invalid');
    }
    if (!data.cloudData.rows || !Array.isArray(data.cloudData.rows)) {
      errors.push('Cloud data rows are missing or invalid');
    }
    if (!data.backupData.columns || !Array.isArray(data.backupData.columns)) {
      errors.push('Backup data columns are missing or invalid');
    }
    if (!data.backupData.rows || !Array.isArray(data.backupData.rows)) {
      errors.push('Backup data rows are missing or invalid');
    }
  } else {
    // Single export validation
    if (!data.columns || !Array.isArray(data.columns)) {
      errors.push('Data columns are missing or invalid');
    }
    if (!data.rows || !Array.isArray(data.rows)) {
      errors.push('Data rows are missing or invalid');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};