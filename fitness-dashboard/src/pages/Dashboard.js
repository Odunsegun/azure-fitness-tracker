import React, { useEffect, useState } from "react";
import { loadActivities, saveActivities } from "../utils/storage";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar"; // ✅ import
import MissedDaysCard from "../components/MissedDaysCard";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Calendar } from "lucide-react"; 

import ActivitiesChart from "../components/ActivitiesChart";
      import StreakCard from "../components/StreakCard";



export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sortKey, setSortKey] = useState("date"); // date | duration | calories
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc
  const [form, setForm] = useState({ type: "", duration: "", notes: "" });
  const [preferences, setPreferences] = useState({ units: "metric", theme: "light",});
  const filteredLogs = logs.filter(
    (log) => filter === "All" || log.type === filter
  );
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (sortKey === "date") {
      valA = new Date(a.date);
      valB = new Date(b.date);
    } else {
      valA = parseInt(valA) || 0;
      valB = parseInt(valB) || 0;
    }

    return sortOrder === "asc" ? valA - valB : valB - valA;
  });
  const demoActivities = [
    { id: 1, type: "Run", duration: 30, calories: 300, notes: "Morning jog", date: "2025-08-01" },
    { id: 2, type: "Walk", duration: 45, calories: 180, notes: "Evening walk", date: "2025-08-02" },
    { id: 3, type: "Cycling", duration: 60, calories: 480, notes: "Hills ride", date: "2025-08-03" },
    { id: 4, type: "Swimming", duration: 30, calories: 270, notes: "Pool laps", date: "2025-08-04" },
  ];



  const totalCalories = logs.reduce((sum, l) => sum + (parseInt(l.calories) || 0), 0);
  const totalMinutes = logs.reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
  const totalActivities = logs.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLog = {
      id: Date.now(),
      ...form,
      calories: parseInt(form.duration) ? parseInt(form.duration) * 10 : 0,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newLog, ...logs];
      setLogs(updated);
      saveActivities(updated);

      setForm({ type: "", duration: "", notes: "" });
  };

  const handleUpdate = (id, field, value) => {
    const updated = logs.map((log) => {
      if (log.id === id) {
        const newLog = { ...log, [field]: value };
        if (field === "duration") {
          newLog.calories = parseInt(value) * 10 || 0; // auto-update calories
        }
        return newLog;
      }
      return log;
    });
    setLogs(updated);
    saveActivities(updated);
  };

  useEffect(() => {
    const saved = loadActivities();
    setLogs(saved.length ? saved : demoActivities);
  }, []);


  // ✅ load preferences & listen for changes
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("preferences"));
    if (saved) setPreferences(saved);

    const handleStorage = (e) => {
      if (e.key === "preferences") {
        const updated = JSON.parse(e.newValue);
        if (updated) setPreferences(updated);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Navbar */}
      <Navbar/>

      {/* StreakCard */}
      <div className="
        bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl 
        p-3 text-sm  // 🔹 default: tighter for <1024px
        flex flex-col items-center text-white text-center
        lg:p-6 lg:text-base  // 🔹 larger again at ≥1024px
      ">
        <StreakCard />
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 lg:grid-cols-3 lg:gap-6 lg:mt-6">

        {/* Calories */}
        <div className="bg-white shadow rounded-xl p-3 flex items-center gap-3 lg:p-6">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-sm text-gray-500">Total Calories</p>
            <p className="text-2xl font-bold">
              {preferences.units === "metric"
                ? `${totalCalories} kcal` // default
                : `${Math.round(totalCalories * 0.239)} Cal`} 
            </p>
          </div>
        </div>

        {/* Active Minutes */}
        <div className="bg-white shadow rounded-xl p-6 flex items-center gap-4">
          <span className="text-3xl">⏱️</span>
          <div>
            <p className="text-sm text-gray-500">Total Active Time</p>
            <p className="text-2xl font-bold">
              {preferences.units === "metric"
                ? `${totalMinutes} min`
                : `${Math.round(totalMinutes / 60)} hrs`}
            </p>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white shadow rounded-xl p-6 flex items-center gap-4">
          <span className="text-3xl">📅</span>
          <div>
            <p className="text-sm text-gray-500">Activities Logged</p>
            <p className="text-2xl font-bold">
              {preferences.units === "metric"
                ? `${totalActivities} sessions`
                : `${totalActivities} workouts`}
            </p>
          </div>
        </div>
      </div>
      
      <MissedDaysCard logs={logs} />
              

      {/* Activities Chart */}
      <div className="bg-white shadow rounded-xl p-6 mt-6">
        <h2 className="font-semibold mb-4">Calories Over Time</h2>
        <ActivitiesChart logs={logs.length ? logs : demoActivities} />
      </div>

      {/* Log Activity Form */}
      <div className="bg-white shadow rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Log Activity</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Activity Type
              </label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="">Select type</option>
                <option value="Run">🏃 Run</option>
                <option value="Walk">🚶 Walk</option>
                <option value="Cycling">🚴 Cycling</option>
                <option value="Swimming">🏊 Swimming</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                placeholder="e.g., 30"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Notes (optional)
              </label>
              <textarea
                placeholder="Any notes about this activity..."
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Log Activity
            </button>
          </form>
      </div>

      {/* Activities Table */}
      <div className="bg-white shadow rounded-xl p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Activities</h2>

          {/* Demo Data Button */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                localStorage.setItem("demoMode", "on");
                window.location.reload();
              }}
              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
            >
              Enable Demo Mode
            </button>

            <button
              onClick={() => {
                localStorage.setItem("demoMode", "off");
                localStorage.setItem("activities", JSON.stringify([]));
                window.location.reload();
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
            >
              Disable Demo Mode
            </button>
          </div>
        </div>

        {/* Filters + Sorting */}
        <div className="flex justify-between items-center mb-4">
          {/* Filter */}
          <div>
            <label className="mr-2 text-gray-600">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded p-2"
            >
              <option value="All">All</option>
              <option value="Run">Run</option>
              <option value="Walk">Walk</option>
              <option value="Cycling">Cycling</option>
              <option value="Swimming">Swimming</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="mr-2 text-gray-600">Sort by:</label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="border rounded p-2 mr-2"
            >
              <option value="date">Date</option>
              <option value="duration">Duration</option>
              <option value="calories">Calories</option>
            </select>
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="px-3 py-1 bg-orange-500 text-white rounded"
            >
              {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="p-2">Type</th>
              <th className="p-2">Duration</th>
              <th className="p-2">Calories</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.length > 0 ? (
              sortedLogs.map((a, i) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    {editingId === a.id ? (
                      <input
                        value={a.type}
                        onChange={(e) => handleUpdate(a.id, "type", e.target.value)}
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      a.type
                    )}
                  </td>
                  <td className="p-2">
                    {editingId === a.id ? (
                      <input
                        type="number"
                        value={a.duration}
                        onChange={(e) => handleUpdate(a.id, "duration", e.target.value)}
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      `${a.duration} min`
                    )}
                  </td>
                  <td className="p-2">{a.calories}</td>
                  <td className="p-2">
                    {editingId === a.id ? (
                      <input
                        value={a.notes}
                        onChange={(e) => handleUpdate(a.id, "notes", e.target.value)}
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      a.notes
                    )}
                  </td>
                  <td className="p-2">{a.date}</td>
                  <td className="p-2 flex gap-2">
                    {editingId === a.id ? (
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-green-600 hover:underline"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingId(a.id)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const updated = logs.filter((log) => log.id !== a.id);
                        setLogs(updated);
                        saveActivities(updated);
                      }}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No activities logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
