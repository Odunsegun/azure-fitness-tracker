// src/components/SummaryTopActivities.js
import React, { useMemo } from "react";

// 🔹 Activity emoji map
const activityIcons = {
  Run: "🏃",
  Walk: "🚶",
  Cycling: "🚴",
  Swimming: "🏊",
  Yoga: "🧘",
  Gym: "🏋️",
  Other: "⚡",
};

export default function SummaryTopActivities({ logs = [], view }) {
  // 🔹 Aggregate logs by activity type
  const topActivities = useMemo(() => {
    const grouped = {};

    logs.forEach((log) => {
      const type = log.type || "Other";
      grouped[type] = grouped[type] || { count: 0, minutes: 0 };
      grouped[type].count += 1;
      grouped[type].minutes += parseInt(log.duration) || 0;
    });

    const arr = Object.entries(grouped).map(([type, { count, minutes }]) => ({
      type,
      count,
      minutes,
    }));
    arr.sort((a, b) => b.count - a.count || b.minutes - a.minutes);
    return arr.slice(0, 5); // top 5
  }, [logs]);

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="font-semibold mb-4">🏅 Top Activities ({view})</h2>

      {topActivities.length === 0 ? (
        <p className="text-gray-500 text-sm">No activities logged yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topActivities.map((a, idx) => (
            <div
              key={a.type}
              className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col gap-2"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-orange-500">
                    #{idx + 1}
                  </span>
                  <span className="text-2xl">
                    {activityIcons[a.type] || "⚡"}
                  </span>
                  <span className="font-medium">{a.type}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {a.count} sessions
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-orange-500 rounded-full"
                    style={{
                      width: `${Math.min((a.minutes / topActivities[0].minutes) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{a.minutes} min</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
