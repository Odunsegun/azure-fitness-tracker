// src/components/ProfileAchievements.js
import React, { useEffect, useState } from "react";
import { loadActivities } from "../utils/storage";
import { badgeRules } from "../utils/badges";

export default function ProfileAchievements({ goals }) {
  const [logs, setLogs] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    const savedLogs = loadActivities();
    setLogs(savedLogs);

    // Load persisted earned badges
    const savedEarned = JSON.parse(localStorage.getItem("earnedBadges")) || [];

    // Re-check current earned
    const newlyEarned = badgeRules.filter((rule) =>
      rule.check(savedLogs, goals)
    );

    // Merge old + new (dedupe)
    const allEarned = [
      ...savedEarned,
      ...newlyEarned.filter((b) => !savedEarned.find((s) => s.id === b.id)),
    ];

    // Save persistence
    localStorage.setItem("earnedBadges", JSON.stringify(allEarned));

    setEarnedBadges(allEarned);
  }, [goals]);

  // Build a set of earned IDs for easy lookup
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Achievements</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badgeRules.map((badge) => {
          const unlocked = earnedIds.has(badge.id);

          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center rounded-lg p-4 shadow-sm ${
                unlocked ? "bg-gray-50" : "bg-gray-100 opacity-60"
              }`}
            >
              <span className="text-3xl">{badge.icon}</span>
              <p
                className={`mt-2 text-sm font-semibold ${
                  unlocked ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {badge.label}
              </p>
              {!unlocked && (
                <p className="text-xs text-gray-400 mt-1">Locked</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
