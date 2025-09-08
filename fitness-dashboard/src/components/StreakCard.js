// src/components/StreakCard.js
import React, { useMemo } from "react";
import { loadActivities } from "../utils/storage";
import { demoActivities } from "../utils/demoData";

// --- helpers: local date formatting + Monday start
function formatLocalYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const mondayIndex = (d.getDay() + 6) % 7; // 0..6 (Mon..Sun)
  d.setDate(d.getDate() - mondayIndex);
  return d;
}

export default function StreakCard() {
  const logs = loadActivities();
  const safeLogs = logs.length ? logs : demoActivities;

  // Normalize to local date keys once
  const dateKeys = new Set(safeLogs.map((l) => l.date));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { currentStreak, longestStreak, missed30 } = useMemo(() => {
    let streak = 0;
    let maxStreak = 0;
    let missed = 0;

    // Current streak: walk back from today in local time
    const d = new Date(today);
    while (true) {
      const key = formatLocalYYYYMMDD(d);
      if (dateKeys.has(key)) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak + missed in the last 30 days
    let running = 0;
    for (let i = 0; i < 30; i++) {
      const d2 = new Date(today);
      d2.setDate(today.getDate() - i);
      const key = formatLocalYYYYMMDD(d2);
      if (dateKeys.has(key)) {
        running++;
        maxStreak = Math.max(maxStreak, running);
      } else {
        missed++;
        running = 0;
      }
    }

    return { currentStreak: streak, longestStreak: maxStreak, missed30: missed };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeLogs]); // recompute when stored logs change

  // Build current week (Mon→Sun) to match MissedDaysCard
  const startOfWeek = startOfWeekMonday(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const key = formatLocalYYYYMMDD(d);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    return {
      label: label[0], // single-letter like M T W …
      done: dateKeys.has(key),
      isToday: d.getTime() === today.getTime(),
    };
  });

  return (
    <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-xl shadow p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">🔥 Streaks</h2>

      <p className="text-lg">
        Current Streak: <span className="font-bold">{currentStreak} days</span>
      </p>
      <p className="text-sm opacity-90">Longest Streak: {longestStreak} days</p>
      <p className="text-sm opacity-90">Missed (last 30d): {missed30} days</p>

      <div className="grid grid-cols-7 gap-2 mt-4">
        {week.map((day, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium
              ${day.done ? "bg-white text-orange-600" : "bg-orange-300 opacity-80"}
              ${day.isToday ? "ring-2 ring-white ring-offset-2 ring-offset-orange-500" : ""}`}
            title={day.done ? "Logged" : "Missed"}
          >
            {day.label}
          </div>
        ))}
      </div>
      <p className="text-xs mt-2 opacity-90">This week (Mon–Sun)</p>
    </div>
  );
}
