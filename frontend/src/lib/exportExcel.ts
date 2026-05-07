import * as XLSX from 'xlsx';

export interface ExportSheetData {
  sheetName: string;
  data: any[];
}

export function exportToExcel(sheets: ExportSheetData[], fileName: string) {
  const wb = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
  });

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
