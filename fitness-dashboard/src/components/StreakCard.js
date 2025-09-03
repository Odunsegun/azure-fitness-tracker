// src/components/StreakCard.js
import React, { useMemo } from "react";
import { loadActivities } from "../utils/storage";
import { demoActivities } from "../utils/demoData";  // ✅ add this

export default function StreakCard() {
  const logs = loadActivities();
  const safeLogs = logs.length ? logs : demoActivities; // ✅ fallback
  const today = new Date();
  const dates = new Set(safeLogs.map((l) => l.date)); // ✅ use safeLogs instead of logs

  // 🔹 Calculate streaks
  const { currentStreak, longestStreak, missedDays } = useMemo(() => {
    let streak = 0,
      maxStreak = 0;
    let missed = 0;

    // Current streak (backwards from today)
    const d = new Date(today);
    while (true) {
      const key = d.toISOString().split("T")[0];
      if (dates.has(key)) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        break;
      }
      d.setDate(d.getDate() - 1);
    }

    // Longest streak + missed days (30 days check)
    let running = 0;
    for (let i = 0; i < 30; i++) {
      const d2 = new Date(today);
      d2.setDate(today.getDate() - i);
      const key = d2.toISOString().split("T")[0];
      if (dates.has(key)) {
        running++;
        maxStreak = Math.max(maxStreak, running);
      } else {
        missed++;
        running = 0;
      }
    }

    return { currentStreak: streak, longestStreak: maxStreak, missedDays: missed };
  }, [logs]);

  // 🔹 Build 7-day grid (Mon–Sun ending today)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    last7.push({
      label: weekDays[d.getDay()],
      done: dates.has(dateStr),
    });
  }

  return (
    <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-xl shadow p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">🔥 Streaks</h2>
      {/* Numeric stats */}
      <p className="text-lg">
        Current Streak: <span className="font-bold">{currentStreak} days</span>
      </p>
      <p className="text-sm opacity-90">Longest Streak: {longestStreak} days</p>
      <p className="text-sm opacity-90">Missed (last 30d): {missedDays} days</p>

      {/* Mini 7-day grid */}
      <div className="grid grid-cols-7 gap-2 mt-4">
        {last7.map((day, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
              day.done ? "bg-white text-orange-600" : "bg-orange-300 opacity-70"
            }`}
          >
            {day.label[0]}
          </div>
        ))}
      </div>
      <p className="text-xs mt-2 opacity-90">Past 7 days</p>
    </div>
  );
}
