// src/components/SummarySessionsChart.js
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SummarySessionsChart({ logs = [], view }) {
  const data = useMemo(() => {
    const grouped = {};

    logs.forEach((log) => {
      const d = new Date(log.date);
      let key;

      if (view === "year") {
        key = d.toLocaleDateString("en-US", { month: "short" }); // Jan, Feb
      } else if (view === "month") {
        key = d.getDate(); // day number
      } else {
        key = d.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue
      }

      grouped[key] = (grouped[key] || 0) + 1; // ✅ count sessions
    });

    return Object.entries(grouped).map(([x, sessions]) => ({
      x,
      sessions,
    }));
  }, [logs, view]);

  const tickFormatter = (tick) => {
    if (view !== "month") return tick;
    return tick === 1 || tick % 7 === 0 ? tick : "";
  };

  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl p-6 mt-6">
        <h2 className="font-semibold mb-4">Sessions Trend ({view})</h2>
        <p className="text-gray-500 text-sm">No sessions logged yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl p-6 mt-6">
      <h2 className="font-semibold mb-4">Sessions Trend ({view})</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" tickFormatter={tickFormatter} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="sessions"
            stroke="#f97316" // 🔶 orange for consistency
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
