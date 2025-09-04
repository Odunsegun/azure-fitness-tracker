// src/components/ProfileGoals.js
import React, { useState, useEffect } from "react";
import { loadActivities } from "../utils/storage";

export default function ProfileGoals({ onSave }) {
  const [editing, setEditing] = useState(false);
  const [goals, setGoals] = useState({
    dailyCalories: 500,
    weeklyMinutes: 300,
    weeklySessions: 4,
  });
  const [logs, setLogs] = useState([]);

  // Load saved goals + logs
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("profileGoals"));
    if (saved) setGoals(saved);
    setLogs(loadActivities());
  }, []);

  const handleSave = () => {
    onSave(goals);
    setEditing(false);
  };

  // Progress calculations
  const totalCaloriesToday = logs
    .filter((l) => l.date === new Date().toISOString().split("T")[0])
    .reduce((sum, l) => sum + (parseInt(l.calories) || 0), 0);

  const totalMinutesThisWeek = logs
    .filter((l) => {
      const d = new Date(l.date);
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      return d >= weekStart;
    })
    .reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);

  const totalSessionsThisWeek = logs.filter((l) => {
    const d = new Date(l.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return d >= weekStart;
  }).length;

  return (
    <div className="bg-white shadow rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">Goals</h2>

      {/* Daily Calories */}
      <div>
        <p className="text-sm text-gray-500">Daily Calorie Goal</p>
        <p className="text-lg font-semibold">
          {totalCaloriesToday}/{goals.dailyCalories} cal
        </p>
        <div className="mt-2 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-orange-500 rounded-full"
            style={{
              width: `${Math.min(
                (totalCaloriesToday / goals.dailyCalories) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Weekly Minutes */}
      <div>
        <p className="text-sm text-gray-500">Weekly Active Minutes</p>
        <p className="text-lg font-semibold">
          {totalMinutesThisWeek}/{goals.weeklyMinutes} min
        </p>
        <div className="mt-2 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-500 rounded-full"
            style={{
              width: `${Math.min(
                (totalMinutesThisWeek / goals.weeklyMinutes) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Weekly Sessions */}
      <div>
        <p className="text-sm text-gray-500">Weekly Sessions</p>
        <p className="text-lg font-semibold">
          {totalSessionsThisWeek}/{goals.weeklySessions}
        </p>
        <div className="mt-2 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-green-500 rounded-full"
            style={{
              width: `${Math.min(
                (totalSessionsThisWeek / goals.weeklySessions) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Edit goals toggle */}
      {editing ? (
        <div className="space-y-2 mt-4">
          <input
            type="number"
            placeholder="Daily Calories"
            value={goals.dailyCalories}
            onChange={(e) =>
              setGoals({ ...goals, dailyCalories: parseInt(e.target.value) })
            }
            className="border rounded p-2 w-full"
          />
          <input
            type="number"
            placeholder="Weekly Minutes"
            value={goals.weeklyMinutes}
            onChange={(e) =>
              setGoals({ ...goals, weeklyMinutes: parseInt(e.target.value) })
            }
            className="border rounded p-2 w-full"
          />
          <input
            type="number"
            placeholder="Weekly Sessions"
            value={goals.weeklySessions}
            onChange={(e) =>
              setGoals({ ...goals, weeklySessions: parseInt(e.target.value) })
            }
            className="border rounded p-2 w-full"
          />
          <button
            onClick={handleSave}
            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          >
            Save Goals
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="mt-3 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
        >
          Edit Goals
        </button>
      )}
    </div>
  );
}
