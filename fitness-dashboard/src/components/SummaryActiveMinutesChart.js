import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { aggregateLogsByDate } from "../utils/aggregate";


export default function SummaryActiveMinutesChart({ logs = [], view }) {
const data = useMemo(() => aggregateLogsByDate(logs, view), [logs, view]);


  const tickFormatter = (tick) => {
    if (view !== "month") return tick;
    return tick === 1 || tick % 7 === 0 ? tick : "";
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 mt-6">
      <h2 className="font-semibold mb-4">Active Minutes Trend ({view})</h2>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No data yet for this {view}.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={tickFormatter} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="minutes"  // 🔹 now directly uses minutes from aggregator
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}