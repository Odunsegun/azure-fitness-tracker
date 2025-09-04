import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Summary from "./pages/Summary";
import Profile from "./pages/Profile";
import LogActivity from "./pages/LogActivity";
import React, { useEffect } from "react";




function App() {

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("preferences"));
    if (saved?.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem("activities")) || [];
    const demoMode = localStorage.getItem("demoMode");

    // If no logs and no explicit demoMode = "off", load demo
    if (logs.length === 0 && demoMode !== "off") {
      const sample = [
        { id: 1, type: "Run", duration: 30, calories: 300, notes: "Morning jog", date: "2025-08-20" },
        { id: 2, type: "Walk", duration: 45, calories: 180, notes: "Evening walk", date: "2025-08-21" },
        { id: 3, type: "Cycling", duration: 60, calories: 500, notes: "Hill ride", date: "2025-08-22" },
        { id: 4, type: "Swimming", duration: 40, calories: 400, notes: "Pool laps", date: "2025-08-23" },
      ];
      localStorage.setItem("activities", JSON.stringify(sample));
      localStorage.setItem("demoMode", "on");
    }
  }, []);
  
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-50 min-h-screen p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<LogActivity />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
