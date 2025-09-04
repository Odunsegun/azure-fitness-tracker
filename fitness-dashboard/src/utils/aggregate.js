/**
 * Groups activity logs by date depending on view (week, month, year).
 * Returns calories, minutes, and sessions.
 *
 * @param {Array} logs - Array of logs [{ date, calories, duration, ... }]
 * @param {string} view - "week" | "month" | "year"
 * @returns {Array} - Aggregated array for Recharts
 *   [{ date, calories, minutes, sessions }]
 */
// src/utils/aggregate.js
// src/utils/aggregate.js
// src/utils/aggregate.js
export function aggregateLogsByDate(logs = [], view = "month", range = 1) {
  if (!Array.isArray(logs)) return [];

  const today = new Date();
  const grouped = {};

  logs.forEach((log) => {
    const d = new Date(log.date);
    if (isNaN(d)) return;

    let key;
    if (view === "year") {
      // 🔹 Fix: use only month abbreviation (and year if range > 1)
      const month = d.toLocaleDateString("en-US", { month: "short" });
      key = range > 1 ? `${month} ${d.getFullYear()}` : month;
    } else if (view === "month") {
      key = d.getDate(); // day of month
    } else {
      key = d.toLocaleDateString("en-US", { weekday: "short" });
    }

    if (!grouped[key]) {
      grouped[key] = { calories: 0, minutes: 0, sessions: 0 };
    }
    grouped[key].calories += parseInt(log.calories) || 0;
    grouped[key].minutes += parseInt(log.duration) || 0;
    grouped[key].sessions += 1;
  });

  let labels = [];
  if (view === "week") {
    const days = 7 * range;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    }
  } else if (view === "month") {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  } else if (view === "year") {
    if (range === 1) {
      labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    } else {
      const years = Array.from({ length: range }, (_, i) => today.getFullYear() - (range - 1 - i));
      labels = years.flatMap((year) =>
        ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => `${m} ${year}`)
      );
    }
  }

  return labels.map((label) => ({
    date: label,
    calories: grouped[label]?.calories || 0,
    minutes: grouped[label]?.minutes || 0,
    sessions: grouped[label]?.sessions || 0,
  }));
}


