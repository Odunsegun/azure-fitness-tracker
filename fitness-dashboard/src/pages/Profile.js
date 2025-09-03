import React, { useState, useEffect } from "react";
import { usePreferences } from "../context/PreferencesContext";
import ProfileHeader from "../components/ProfileHeader";
import ProfileBasicInfo from "../components/ProfileBasicInfo";
import ProfileGoals from "../components/ProfileGoals";
import ProfileAchievements from "../components/ProfileAchievements";

export default function Profile() {
  const [goals, setGoals] = useState({
    dailyCalories: 500,
    weeklyMinutes: 300,
    weeklySessions: 4,
  });

  const { prefs: preferences, setPrefs: setPreferences } = usePreferences();

  // Load saved goals on mount
  useEffect(() => {
    const savedGoals = JSON.parse(localStorage.getItem("profileGoals"));
    if (savedGoals) setGoals(savedGoals);
  }, []);


  const savePreferences = () => {
    // Context effect already persists + applies theme.
    // Keeping this for user feedback.
    alert("✅ Preferences saved!");
  };

  const handleSaveGoals = (newGoals) => {
    localStorage.setItem("profileGoals", JSON.stringify(newGoals));
    setGoals(newGoals);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "profileGoals", newValue: JSON.stringify(newGoals) })
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    setGoals({ dailyCalories: 500, weeklyMinutes: 300, weeklySessions: 4 });
    setPreferences({ units: "metric", theme: "light", sync: false });
    alert("👋 Logged out!");
    window.location.href = "/"; // redirect to homepage/login
  };

  return (
    <div className="p-6 space-y-6">
      {/* SECTION 1: Header */}
      <ProfileHeader />

      {/* Demo Mode Toggle */}
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

      {/* SECTION 2: Basic Info */}
      <ProfileBasicInfo />

      {/* SECTION 3: Goals */}
      <ProfileGoals onSave={handleSaveGoals} />

      {/* SECTION 4: Preferences & Account */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Preferences & Account</h2>

        {/* Units */}
        <select
          className="border rounded p-2"
          value={preferences.units}
          onChange={(e) => setPreferences({ ...preferences, units: e.target.value })}
        >
          <option value="metric">Metric (cm, kg)</option>
          <option value="imperial">Imperial (ft, lbs)</option>
        </select>

        {/* Theme */}
        <button
          onClick={() =>
            setPreferences({
              ...preferences,
              theme: preferences.theme === "light" ? "dark" : "light",
            })
          }
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          {preferences.theme === "light" ? "☀️ Light" : "🌙 Dark"}
        </button>

        {/* Sync */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Sync with Apple Health</p>
          <input
            type="checkbox"
            checked={!!preferences.sync}
            onChange={(e) => setPreferences({ ...preferences, sync: e.target.checked })}
          />
        </div>

        {/* Save */}
        <button
          onClick={savePreferences}
          className="mt-4 w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
        >
          Save Preferences
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.clear();
            setPreferences({ units: "metric", theme: "light", sync: false });
            window.location.href = "/";
          }}
          className="mt-4 w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* SECTION 5: Achievements */}
      <ProfileAchievements goals={goals} />
    </div>
  );
}
