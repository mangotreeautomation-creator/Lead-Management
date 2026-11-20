import * as XLSX from 'xlsx';

// Export an array of objects to real Excel (.xlsx) file
export function exportToXlsx(data: any[], filename: string, sheetName: string = 'Sheet1') {
  if (!data || data.length === 0) {
    if (typeof window !== 'undefined') {
      alert('No data available to export.');
    }
    return;
  }

  // Create a new workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns for premium aesthetics
  const maxProps = Object.keys(data[0]);
  worksheet['!cols'] = maxProps.map(key => ({
    wch: Math.max(key.length + 4, 15)
  }));

  // Trigger browser download
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export an array of objects to CSV file
export function exportToCsv(data: any[], filename: string) {
  if (!data || data.length === 0) {
    if (typeof window !== 'undefined') {
      alert('No data available to export.');
    }
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Aliases for uppercase casing
export const exportToXLSX = exportToXlsx;
export const exportToCSV = exportToCsv;
