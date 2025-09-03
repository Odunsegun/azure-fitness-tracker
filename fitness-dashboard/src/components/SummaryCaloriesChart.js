import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { aggregateLogsByDate } from "../utils/aggregate";

export default function SummaryCaloriesChart({ logs = [], view , goals}) {
  const data = useMemo(() => aggregateLogsByDate(logs, view), [logs, view]);

  // format ticks only for month view
   const tickFormatter = (tick) => {
    if (view === "week") {
      // Already "Mon", "Tue", etc. from aggregate
      return tick;
    }
    if (view === "month") {
      // Only show ticks every ~6 days
      return [1, 7, 13, 19, 25, 30].includes(Number(tick)) ? tick : "";
    }
    if (view === "year") {
      // Abbreviated month names
      return tick; // since aggregate returns "Jan", "Feb", etc.
    }
    return tick;
  };

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="font-semibold mb-4">Calories Trend ({view})</h2>
        {data.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No activity data yet. Log some to see insights!
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={tickFormatter} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} />
              {/* 🔹 Add goal line */}
              <ReferenceLine
                y={goals.dailyCalories}
                stroke="red"
                strokeDasharray="4 4"
                label={{ value: "Goal", position: "right", fill: "red" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
    </div>
  );
}
