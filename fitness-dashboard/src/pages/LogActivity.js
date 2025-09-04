import React, { useState, useEffect } from "react";
import { saveActivities, loadActivities } from "../utils/storage";

export default function LogActivity() {
  const [form, setForm] = useState({
    type: "",
    duration: "",
    calories: "",
    intensity: "",
    location: "",
    notes: "",
  });
  const [logs, setLogs] = useState([]);

  // Load logs on mount
  useEffect(() => {
    setLogs(loadActivities());
  }, []);

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const logs = loadActivities();
    const newLog = {
      id: Date.now(),
      ...form,
      calories: form.calories || form.duration * 10, // fallback calc
      date: new Date().toISOString().split("T")[0],
    };
    const updated = [newLog, ...logs];
    saveActivities(updated); // ✅ persist to storage
    setLogs(updated); // ✅ refresh list immediately
    setForm({
      type: "",
      duration: "",
      calories: "",
      intensity: "",
      location: "",
      notes: "",
    });
    alert("✅ Activity logged!");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Log Form */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Log New Activity</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select
            className="border rounded p-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            required
          >
            <option value="">Select activity type</option>
            <option value="Run">🏃 Run</option>
            <option value="Walk">🚶 Walk</option>
            <option value="Cycling">🚴 Cycling</option>
            <option value="Swimming">🏊 Swimming</option>
            <option value="Yoga">🧘 Yoga</option>
          </select>

          <input
            type="number"
            placeholder="Duration (minutes)"
            className="border rounded p-2"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            required
          />

          <input
            type="number"
            placeholder="Calories burned (optional)"
            className="border rounded p-2"
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: e.target.value })}
          />

          <div className="flex gap-4">
            {["Low", "Medium", "High"].map((level) => (
              <label key={level} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="intensity"
                  value={level}
                  checked={form.intensity === level}
                  onChange={(e) =>
                    setForm({ ...form, intensity: e.target.value })
                  }
                />
                {level}
              </label>
            ))}
          </div>

          <input
            type="text"
            placeholder="Location (e.g., Gym, Park, Pool)"
            className="border rounded p-2"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <textarea
            placeholder="Notes about the activity..."
            className="border rounded p-2"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <button
            type="submit"
            className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
          >
            Log Activity
          </button>
        </form>
      </div>

      {/* Recent Logs */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500">No activities logged yet.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="p-2">Type</th>
                <th className="p-2">Duration</th>
                <th className="p-2">Calories</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 5).map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="p-2">{log.type}</td>
                  <td className="p-2">{log.duration} min</td>
                  <td className="p-2">{log.calories || "N/A"}</td>
                  <td className="p-2">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
