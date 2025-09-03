// src/utils/badges.js

export const badgeRules = [
  {
    id: "calories1000",
    icon: "🔥",
    label: "1000 Calories Burned",
    check: (logs) =>
      logs.reduce((sum, l) => sum + (parseInt(l.calories) || 0), 0) >= 1000,
  },
  {
    id: "first10runs",
    icon: "🏃",
    label: "First 10 Runs",
    check: (logs) =>
      logs.filter((l) => l.type === "Run").length >= 10,
  },
  {
    id: "streak7days",
    icon: "📅",
    label: "7-Day Streak",
    check: (logs) => {
      const dates = new Set(logs.map((l) => l.date));
      let streak = 0,
        maxStreak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        if (dates.has(dateStr)) {
          streak++;
          maxStreak = Math.max(maxStreak, streak);
        } else {
          streak = 0;
        }
      }
      return maxStreak >= 7;
    },
  },
  {
    id: "monthlyGoal",
    icon: "🏆",
    label: "Monthly Goal Reached",
    check: (logs, goals) => {
      const thisMonth = new Date().getMonth();
      const sessionsThisMonth = logs.filter(
        (l) => new Date(l.date).getMonth() === thisMonth
      ).length;
      return goals?.sessions
        ? sessionsThisMonth >= goals.sessions
        : sessionsThisMonth >= 15; // fallback
    },
  },
];
