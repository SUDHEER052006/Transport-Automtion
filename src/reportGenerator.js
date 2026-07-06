import * as XLSX from 'xlsx';

export const generateExcelReport = (activityLog, reportDate) => {
  if (!activityLog || activityLog.length === 0) { alert("No activity to report!"); return; }

  const reportData = activityLog.map((log, index) => {
    let meterDifference = '---';
    if (log.outReading && log.inReading) {
        const outVal = parseFloat(log.outReading);
        const inVal = parseFloat(log.inReading);
        if (!isNaN(outVal) && !isNaN(inVal)) meterDifference = parseFloat((inVal - outVal).toFixed(1)); 
    }
    return {
      "S.No": index + 1, "Route Name": log.routeName, "Bus Number": log.busNo || '---',
      "Arrival Time": log.inTime ? (log.inTime.includes(',') ? log.inTime.split(',')[1] : log.inTime) : '---',
      "In Reading (km)": log.inReading || '---',
      "Departure Time": log.outTime ? (log.outTime.includes(',') ? log.outTime.split(',')[1] : log.outTime) : '---',
      "Out Reading (km)": log.outReading || '---', "Meter (km)": meterDifference
    };
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(reportData);
  const wscols = [{wch:6}, {wch:15}, {wch:15}, {wch:15}, {wch:15}, {wch:15}, {wch:15}, {wch:12}];
  worksheet['!cols'] = wscols;
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Bus Log");
  XLSX.writeFile(workbook, `Bus_Report_${reportDate.replace(/[\s,]+/g, '_')}.xlsx`);
};