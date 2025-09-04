import React, { useState, useEffect } from "react";
import { usePreferences } from "../context/PreferencesContext";

export default function ProfileBasicInfo() {
  const { prefs } = usePreferences(); // metric | imperial

  const [basicInfo, setBasicInfo] = useState({
    age: 25,
    height: 178, // cm
    weight: 72,  // kg
    activity: "Moderate",
  });
  const [editing, setEditing] = useState(false);

  // Load saved values
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("basicInfo"));
    if (saved) setBasicInfo(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem("basicInfo", JSON.stringify(basicInfo));
    setEditing(false);
  };

  // Convert for display/input
  const displayHeight =
    prefs.units === "imperial"
      ? (basicInfo.height / 2.54).toFixed(1) // cm → in
      : basicInfo.height;

  const displayWeight =
    prefs.units === "imperial"
      ? (basicInfo.weight * 2.20462).toFixed(1) // kg → lbs
      : basicInfo.weight;

  const handleHeightChange = (val) => {
    const numeric = parseFloat(val) || 0;
    setBasicInfo({
      ...basicInfo,
      height: prefs.units === "imperial" ? numeric * 2.54 : numeric, // store as cm
    });
  };

  const handleWeightChange = (val) => {
    const numeric = parseFloat(val) || 0;
    setBasicInfo({
      ...basicInfo,
      weight: prefs.units === "imperial" ? numeric / 2.20462 : numeric, // store as kg
    });
  };

  // 🔹 BMI calculation (always use metric internally)
  const heightM = basicInfo.height / 100;
  const bmi = heightM > 0 ? (basicInfo.weight / (heightM * heightM)).toFixed(1) : null;

  // 🔹 BMI classification
  const bmiCategory = bmi
    ? bmi < 18.5
      ? "Underweight"
      : bmi < 25
      ? "Normal"
      : bmi < 30
      ? "Overweight"
      : "Obese"
    : "N/A";

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Basic Info</h2>

      {editing ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-500">Age</label>
            <input
              type="number"
              value={basicInfo.age}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, age: parseInt(e.target.value) || 0 })
              }
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500">
              Height ({prefs.units === "imperial" ? "in" : "cm"})
            </label>
            <input
              type="number"
              value={displayHeight}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500">
              Weight ({prefs.units === "imperial" ? "lbs" : "kg"})
            </label>
            <input
              type="number"
              value={displayWeight}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500">Activity Level</label>
            <select
              value={basicInfo.activity}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, activity: e.target.value })
              }
              className="w-full border rounded p-2"
            >
              <option>Sedentary</option>
              <option>Light</option>
              <option>Moderate</option>
              <option>Active</option>
              <option>Very Active</option>
            </select>
          </div>

          <div className="col-span-full">
            <button
              onClick={handleSave}
              className="mt-3 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Save Info
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-500">Age</p>
            <p className="text-lg font-semibold">{basicInfo.age}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Height</p>
            <p className="text-lg font-semibold">
              {displayHeight} {prefs.units === "imperial" ? "in" : "cm"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Weight</p>
            <p className="text-lg font-semibold">
              {displayWeight} {prefs.units === "imperial" ? "lbs" : "kg"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Activity Level</p>
            <p className="text-lg font-semibold">{basicInfo.activity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">BMI</p>
            <p className="text-lg font-semibold">
              {bmi} ({bmiCategory})
            </p>
          </div>
          <div className="col-span-full">
            <button
              onClick={() => setEditing(true)}
              className="mt-3 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Edit Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
