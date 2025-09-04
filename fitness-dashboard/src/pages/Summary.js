import React, { useState, useEffect } from "react";
import { loadActivities } from "../utils/storage";
import { demoGoals } from "../utils/demoData"; // ✅ import demoGoals
import { Calendar } from "lucide-react";

import SummaryCaloriesChart from "../components/SummaryCaloriesChart";
import SummaryActivityDistribution from "../components/SummaryActivityDistribution";
import SummaryActiveMinutesChart from "../components/SummaryActiveMinutesChart";
import SummaryTopActivities from "../components/SummaryTopActivities";
import SummaryInsights from "../components/SummaryInsights";
import SummarySessionsChart from "../components/SummarySessionsChart";

import html2canvas from "html2canvas";
import { exportToCSV } from "../utils/export";
// 🔹 helper: filter logs by view (NO goals here, just date filtering)
function filterLogsByView(logs, view) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = today.getMonth();
  const dd = today.getDate();

  if (view === "week") {
    const start = new Date(today);
    start.setDate(dd - 6);
    return logs.filter((l) => new Date(l.date) >= start && new Date(l.date) <= today);
  }

  if (view === "month") {
    return logs.filter((l) => {
      const d = new Date(l.date);
      return d.getFullYear() === yyyy && d.getMonth() === mm;
    });
  }

  if (view === "year") {
    return logs.filter((l) => new Date(l.date).getFullYear() === yyyy);
  }

  return logs;
}

export default function Summary() {
  const [view, setView] = useState("month");
  const [goals, setGoals] = useState(demoGoals); // ✅ consistent: dailyCalories, weeklyMinutes, weeklySessions
  const [logs, setLogs] = useState([]);

  const demoActivities = [
    { id: 1, type: "Run", duration: 30, calories: 300, date: "2025-08-01", notes: "Morning jog" },
    { id: 2, type: "Walk", duration: 45, calories: 180, date: "2025-08-02", notes: "Evening walk" },
    { id: 3, type: "Cycling", duration: 60, calories: 480, date: "2025-08-03", notes: "Hills ride" },
    { id: 4, type: "Swimming", duration: 30, calories: 270, date: "2025-08-04", notes: "Pool laps" },
  ];

  const handleExportCSV = () => {
    exportToCSV(logs);
  };

  const handleExportPNG = () => {
    const element = document.querySelector("#summary-container");
    if (!element) return;
    html2canvas(element).then((canvas) => {
      const link = document.createElement("a");
      link.download = "summary.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  // ✅ load goals
  useEffect(() => {
    const savedGoals = JSON.parse(localStorage.getItem("profileGoals"));
    if (savedGoals) {
      setGoals(savedGoals);
    } else {
      localStorage.setItem("profileGoals", JSON.stringify(demoGoals));
      setGoals(demoGoals);
    }

    const handleStorageChange = (e) => {
      if (e.key === "profileGoals") {
        const updated = JSON.parse(e.newValue);
        if (updated) setGoals(updated);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ save goals
  const handleSaveGoals = () => {
    localStorage.setItem("profileGoals", JSON.stringify(goals));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "profileGoals",
        newValue: JSON.stringify(goals),
      })
    );
  };

  // ✅ load activities
  useEffect(() => {
    const saved = loadActivities();
    setLogs(saved.length ? saved : demoActivities);
  }, []);

  // ✅ stats
  const today = new Date().toISOString().split("T")[0];
  const todayCalories = logs
    .filter((l) => l.date === today)
    .reduce((sum, l) => sum + (parseInt(l.calories) || 0), 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekLogs = logs.filter((l) => new Date(l.date) >= weekStart);

  const todayMinutes = weekLogs.reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
  const todaySessions = weekLogs.length;

  // ✅ progress
  const caloriesProgress = Math.min((todayCalories / goals.dailyCalories) * 100, 100);
  const minutesProgress = Math.min((todayMinutes / goals.weeklyMinutes) * 100, 100);
  const sessionsProgress = Math.min((todaySessions / goals.weeklySessions) * 100, 100);

  // ✅ filter logs by current view
  const currentLogs = filterLogsByView(logs.length ? logs : demoActivities, view);

// stats for the current view
const calories = currentLogs.reduce((s, l) => s + (parseInt(l.calories) || 0), 0);
const minutes = currentLogs.reduce((s, l) => s + (parseInt(l.duration) || 0), 0);
const sessions = currentLogs.length;

  return (
    <div className="p-6 space-y-6">
      {/* SECTION 1: Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Summary</h1>
        <div className="flex flex-col lg:flex-col gap-6">
          {/* Row 1: Summary at a Glance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Calories */}
            <div className="bg-white shadow rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-xs text-gray-500 uppercase">Calories Burned</p>
                <p className="text-xl font-bold text-gray-800">{calories}</p>
              </div>
            </div>

            {/* Active Minutes */}
            <div className="bg-white shadow rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="text-xs text-gray-500 uppercase">Active Minutes</p>
                <p className="text-xl font-bold text-gray-800">{minutes}</p>
              </div>
            </div>

            {/* Sessions */}
            <div className="bg-white shadow rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-xs text-gray-500 uppercase">Sessions</p>
                <p className="text-xl font-bold text-gray-800">{sessions}</p>
              </div>
            </div>
          </div>

          {/* Row 2: Demo Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Calendar className="w-5 h-5 text-orange-500" />

            <div className="flex gap-2 ml-2">
              <button
                onClick={() => {
                  const sample = [
                    { id: 1, type: "Run", duration: 30, calories: 300, notes: "Morning jog", date: "2025-08-20" },
                    { id: 2, type: "Walk", duration: 45, calories: 180, notes: "Evening walk", date: "2025-08-21" },
                    { id: 3, type: "Cycling", duration: 60, calories: 500, notes: "Hill ride", date: "2025-08-22" },
                    { id: 4, type: "Swimming", duration: 40, calories: 400, notes: "Pool laps", date: "2025-08-23" },
                  ];
                  setLogs(sample);
                  localStorage.setItem("activities", JSON.stringify(sample));
                }}
                className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
              >
                Load Demo Data
              </button>

              <button
                onClick={() => {
                  setLogs([]);
                  localStorage.setItem("activities", JSON.stringify([]));
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
              >
                Clear Data
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              {["week", "month", "year"].map((option) => (
                <button
                  key={option}
                  onClick={() => setView(option)}
                  className={`px-3 py-1 rounded-md transition ${
                    view === option
                      ? "bg-orange-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: Key Stats Cards */}
      {/* Stats + Controls Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Stat cards (calories, minutes, sessions, goal progress) */}
        <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-xl p-5 flex items-center gap-4">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Calories</p>
              <p className="text-2xl font-bold text-gray-800">{todayCalories}</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-5 flex items-center gap-4">
            <span className="text-3xl">⏱️</span>
            <div>
              <p className="text-xs text-gray-500 uppercase">Active Minutes</p>
              <p className="text-2xl font-bold text-gray-800">{todayMinutes}</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-5 flex items-center gap-4">
            <span className="text-3xl">📅</span>
            <div>
              <p className="text-xs text-gray-500 uppercase">Sessions Logged</p>
              <p className="text-2xl font-bold text-gray-800">{todaySessions}</p>
            </div>
          </div>
        </div>

        {/* Goal Progress stays at the side for ≥1024px, but moves down below on small screens */}
        <div className="col-span-1">
          <div className="bg-white shadow rounded-xl p-5 flex-1">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="text-xs text-gray-500 uppercase">Goal Progress</p>

              {/* Calories */}
              <div className="mt-2">
                <p className="text-xs text-gray-500">Calories (Daily)</p>
                <div className="h-2 bg-gray-200 rounded-full relative">
                  <div
                    className="h-2 bg-orange-500 rounded-full"
                    style={{ width: `${caloriesProgress}%` }}
                  />
                  <span className="absolute right-1 top-[-18px] text-xs font-semibold text-gray-600">
                    {Math.round(caloriesProgress)}%
                  </span>
                </div>
              </div>

              {/* Minutes */}
              <div className="mt-2">
                <p className="text-xs text-gray-500">Active Minutes (Weekly)</p>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${minutesProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {todayMinutes}/{goals.weeklyMinutes} min this week
                </p>
              </div>

              {/* Sessions */}
              <div className="mt-2">
                <p className="text-xs text-gray-500">Sessions (Weekly)</p>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: `${sessionsProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {todaySessions}/{goals.weeklySessions} sessions this week
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 + 4: Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 3: Calories Trend */}
        <SummaryCaloriesChart logs={logs} view={view} goals={goals}/>

        {/* SECTION 4: Activity Distribution */}
        <SummaryActivityDistribution view={view} />
      </div>

      {/* SECTION 5: Active Minutes Trend */}
      <SummaryActiveMinutesChart logs={logs.length ? logs : demoActivities} view={view} />


      <SummarySessionsChart logs={logs.length ? logs : demoActivities} view={view} />


      {/* NEW SECTION: Activity Streak & Calendar */}
      <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Activity Streak</h2>

            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔥</span>
                <div>
                <p className="text-lg font-bold">7-Day Streak</p>
                <p className="text-sm text-gray-500">15 activities logged this month</p>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const isLogged = logs.some((l) => {
                  const d = new Date(l.date);
                  return (
                    d.getDate() === day &&
                    d.getMonth() === new Date().getMonth() &&
                    d.getFullYear() === new Date().getFullYear()
                  );
                });

                return (
                  <div
                    key={i}
                    className={`h-10 w-10 flex items-center justify-center rounded-md text-sm font-semibold 
                    ${isLogged ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

      </div>

      {/* SECTION 6 + 7: Leaderboard + Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SECTION 6: Top Activities */}
        <SummaryTopActivities logs={logs.length ? logs : demoActivities} view={view} />

        {/* Insights */}
        <SummaryInsights logs={logs.length ? logs : demoActivities} view={view} />
      </div>

      {/* 🔹 Export buttons */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={handleExportCSV}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Export CSV
        </button>
        <button
          onClick={handleExportPNG}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Export PNG
        </button>
      </div>
    </div>
  );
}

