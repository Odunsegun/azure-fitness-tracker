import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#eab308", "#ec4899"];

export default function SummaryActivityDistribution({ logs = [], view }) {
  // 🔹 group logs by activity type
  const data = useMemo(() => {
    const grouped = {};

    logs.forEach((log) => {
      if (!log.type) return;
      grouped[log.type] = (grouped[log.type] || 0) + 1; // count sessions
    });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
  }, [logs]);

  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="font-semibold mb-4">Activity Distribution</h2>
        <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
          <p className="text-sm">No activities logged this {view}.</p>
          <p className="text-xs mt-1">Try adding your first one to see progress!</p>
          <button
            onClick={() => window.location.href = "/log"}
            className="mt-3 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
          >
            + Log Activity
          </button>
        </div>
      </div>
    );
  }

   return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="font-semibold mb-4">Activity Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
