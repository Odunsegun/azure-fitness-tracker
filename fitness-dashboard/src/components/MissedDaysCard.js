// src/components/MissedDaysCard.js
import React from "react";

export default function MissedDaysCard({ logs }) {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const logDates = new Set(logs.map((l) => l.date));

  const missedDays = last7Days.filter((d) => !logDates.has(d)).length;

  return (
    <div className="bg-white shadow rounded-xl p-6 mt-6">
      <h2 className="font-semibold mb-4">🗓️ Last 7 Days</h2>

      {/* ✅ Summary */}
      <p className="text-sm text-gray-600 mb-3">
        {missedDays === 0
          ? "🎉 Perfect! No days missed this week."
          : `❌ ${missedDays} day${missedDays > 1 ? "s" : ""} missed this week`}
      </p>

      {/* ✅ Day grid */}
      <div className="flex gap-3">
        {last7Days.map((date) => {
          const day = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
          const logged = logDates.has(date);

          return (
            <div
              key={date}
              className={`flex flex-col items-center justify-center w-12 h-16 rounded-lg ${
                logged ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              <span className="text-sm">{day[0]}</span>
              <span className="text-xs">{day.slice(1, 3)}</span>
              <span className="mt-1 text-lg">{logged ? "✅" : "❌"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
