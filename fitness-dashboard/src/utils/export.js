// src/utils/export.js
export function exportToCSV(logs) {
  if (!logs || logs.length === 0) return;

  const headers = ["Type", "Duration", "Calories", "Notes", "Date"];
  const rows = logs.map(l => [
    l.type, l.duration, l.calories, l.notes || "", l.date
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + [headers, ...rows].map(r => r.join(",")).join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "activities_summary.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
