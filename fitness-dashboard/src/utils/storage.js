// src/utils/storage.js
import { demoActivities } from "./demoData";

const KEY = "activities";

export function loadActivities() {
  const saved = JSON.parse(localStorage.getItem(KEY)) || [];
  if (saved.length === 0) {
    // ✅ Seed demo data
    localStorage.setItem(KEY, JSON.stringify(demoActivities));
    return demoActivities;
  }
  return saved;
}

export function saveActivities(logs) {
  localStorage.setItem(KEY, JSON.stringify(logs));
}