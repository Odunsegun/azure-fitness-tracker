// src/components/MissedDaysCard.js
import React from "react";

function formatLocalYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // local YYYY-MM-DD
}

export default function MissedDaysCard({ logs }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to local midnight

  // Monday index: 0..6 (Mon..Sun)
  const mondayIndex = (today.getDay() + 6) % 7;

  // Start of *this* week (Monday at local midnight)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - mondayIndex);
  startOfWeek.setHours(0, 0, 0, 0);

  // Build Mon→Sun dates for the current week in local time
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return {
      date: formatLocalYYYYMMDD(d),
      isToday: d.getTime() === today.getTime(),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });

  // Make a fast lookup set of the log dates (assumed in YYYY-MM-DD)
  const logDates = new Set(logs.map((l) => l.date));

  const missedDays = week.filter(({ date }) => !logDates.has(date)).length;

  return (
    <div className="bg-white shadow rounded-xl p-6 mt-6">
      <h2 className="font-semibold mb-4">🗓️ Last 7 Days</h2>

      <p className="text-sm text-gray-600 mb-3">
        {missedDays === 0
          ? "🎉 Perfect! No days missed this week."
          : `❌ ${missedDays} day${missedDays > 1 ? "s" : ""} missed this week`}
      </p>

      <div className="flex gap-3">
        {week.map(({ date, label, isToday }) => {
          const logged = logDates.has(date);
          return (
            <div
              key={date}
              className={`flex flex-col items-center justify-center w-12 h-16 rounded-lg border ${
                logged
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              } ${isToday ? "ring-2 ring-orange-400 ring-offset-2" : ""}`}
              title={date}
            >
              <span className="text-sm">{label[0]}</span>
              <span className="text-xs">{label.slice(1, 3)}</span>
              <span className="mt-1 text-lg">{logged ? "✅" : "❌"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
