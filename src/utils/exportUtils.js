import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data to Excel format
 * @param {Object} reportData - The report data to export
 * @param {string} reportData.reportTitle - The title of the report
 * @param {Object} reportData.reportDates - The date range of the report
 * @param {string[]} reportData.columns - Column headers
 * @param {Array} reportData.rows - Row data
 * @param {string} fileName - Name for the exported file (without extension)
 */
export const exportToExcel = (reportData, fileName = 'cloud-report') => {
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
    XLSX.utils.book_append_sheet(wb, ws, 'Cloud Status');
    
    // Add metadata/summary sheet
    const metaWs = XLSX.utils.aoa_to_sheet([
      ['Report Information'],
      ['Title', reportTitle || 'Cloud Status Report'],
      ['Start Date', formatDate(reportDates?.startDate)],
      ['End Date', formatDate(reportDates?.endDate)],
      ['Total Space Used', totalSpaceUsed || 'N/A'],
      ['Export Date', new Date().toLocaleString()]
    ]);
    
    // Set column widths for metadata
    metaWs['!cols'] = [{ wch: 15 }, { wch: 30 }];
    
    // Add metadata sheet to workbook
    XLSX.utils.book_append_sheet(wb, metaWs, 'Report Info');
    
    // Export workbook
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

/**
 * Export data to CSV format
 * @param {Object} reportData - The report data to export
 * @param {string[]} reportData.columns - Column headers
 * @param {Array} reportData.rows - Row data
 * @param {string} fileName - Name for the exported file (without extension)
 */
export const exportToCSV = (reportData, fileName = 'cloud-report') => {
  try {
    const { columns, rows } = reportData;
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([columns]); // Add headers
    
    // Format each row as an array in the same order as columns
    const rowData = rows.map(row => {
      return columns.map(column => row[column] || '');
    });
    
    // Add rows to the worksheet
    XLSX.utils.sheet_add_aoa(ws, rowData, { origin: 'A2' });
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Export as CSV
    XLSX.writeFile(wb, `${fileName}.csv`, { bookType: 'csv' });
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

/**
 * Export data to PDF format
 * @param {Object} reportData - The report data to export
 * @param {string} reportData.reportTitle - The title of the report
 * @param {Object} reportData.reportDates - The date range of the report
 * @param {string[]} reportData.columns - Column headers
 * @param {Array} reportData.rows - Row data
 * @param {string} fileName - Name for the exported file (without extension)
 */
export const exportToPDF = (reportData, fileName = 'cloud-report') => {
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
    doc.text(reportTitle || 'Cloud Status Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });
    
    // Add date range
    doc.setFontSize(12);
    const dateRange = `${formatDate(reportDates?.startDate)} - ${formatDate(reportDates?.endDate)}`;
    doc.text(dateRange, doc.internal.pageSize.width / 2, 22, { align: 'center' });
    
    // Add total space used if available
    if (totalSpaceUsed) {
      doc.setFontSize(10);
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
      startY: totalSpaceUsed ? 32 : 28,
      headStyles: {
        fillColor: [75, 75, 250],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 255]
      },
      margin: { top: 35 },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        // Style specific columns if needed
        0: { cellWidth: 30 } // Make first column wider
      },
      didDrawPage: (data) => {
        // Add page number at the bottom
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`,
          doc.internal.pageSize.width - 20, 
          doc.internal.pageSize.height - 10
        );
        
        // Add footer
        doc.text(
          `Generated on ${new Date().toLocaleString()}`, 
          20, 
          doc.internal.pageSize.height - 10
        );
      }
    });
    
    // Save the PDF
    doc.save(`${fileName}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

/**
 * Format date for display in exports
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};