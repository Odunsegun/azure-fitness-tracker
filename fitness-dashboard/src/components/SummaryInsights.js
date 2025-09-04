import React, { useMemo } from "react";

export default function SummaryInsights({ logs = [], view }) {
  const today = new Date();

  // ✅ Load goals from localStorage
  const goals = JSON.parse(localStorage.getItem("profileGoals")) || {
    calories: 500,
    minutes: 300,
    sessions: 4,
  };

  // ✅ Filter logs by current and previous periods
  const { currentLogs, prevLogs } = useMemo(() => {
    if (!logs || logs.length === 0) return { currentLogs: [], prevLogs: [] };

    const current = [];
    const prev = [];

    if (view === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6);

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(today.getDate() - 13);

      logs.forEach((l) => {
        const d = new Date(l.date);
        if (d >= weekAgo) current.push(l);
        else if (d >= twoWeeksAgo && d < weekAgo) prev.push(l);
      });
    }

    if (view === "month") {
      logs.forEach((l) => {
        const d = new Date(l.date);
        if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
          current.push(l);
        } else if (
          d.getMonth() === today.getMonth() - 1 &&
          d.getFullYear() === today.getFullYear()
        ) {
          prev.push(l);
        }
      });
    }

    if (view === "year") {
      logs.forEach((l) => {
        const d = new Date(l.date);
        if (d.getFullYear() === today.getFullYear()) current.push(l);
        else if (d.getFullYear() === today.getFullYear() - 1) prev.push(l);
      });
    }

    return { currentLogs: current, prevLogs: prev };
  }, [logs, view, today]);

  const insights = useMemo(() => {
    if (currentLogs.length === 0) return [`No activity data logged for this ${view}.`];

    const sum = (arr, key) => arr.reduce((s, l) => s + (parseInt(l[key]) || 0), 0);

    const currCalories = sum(currentLogs, "calories");
    const currMinutes = sum(currentLogs, "duration");
    const currSessions = currentLogs.length;

    const prevCalories = sum(prevLogs, "calories");
    const prevMinutes = sum(prevLogs, "duration");

    const avgCalories = currentLogs.length ? Math.round(currCalories / currentLogs.length) : 0;
    const avgMinutes = currentLogs.length ? Math.round(currMinutes / currentLogs.length) : 0;

    // Most active day
    const caloriesByDay = {};
    currentLogs.forEach((log) => {
      const d = new Date(log.date).toLocaleDateString("en-US", { weekday: "long" });
      caloriesByDay[d] = (caloriesByDay[d] || 0) + (parseInt(log.calories) || 0);
    });
    const topDay = Object.entries(caloriesByDay).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Most frequent activity
    const typeCount = {};
    currentLogs.forEach((log) => {
      typeCount[log.type] = (typeCount[log.type] || 0) + 1;
    });
    const topActivity = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Trend calc
    const calcTrend = (curr, prev, label) => {
      if (prev === 0) return `⚡ ${label} tracking started this ${view}!`;
      const diff = ((curr - prev) / prev) * 100;
      return diff >= 0
        ? `⬆️ ${label} up ${diff.toFixed(1)}% vs last ${view}`
        : `⬇️ ${label} down ${Math.abs(diff).toFixed(1)}% vs last ${view}`;
    };

    // ✅ Goal completion insights
    const goalMsgs = [];
    if (goals.calories) {
      const pct = (currCalories / goals.calories) * 100;
      goalMsgs.push(
        pct >= 100
          ? `✅ Calorie goal reached!`
          : `🔥 ${pct.toFixed(0)}% of your calorie goal achieved this ${view}.`
      );
    }
    if (goals.minutes) {
      const pct = (currMinutes / goals.minutes) * 100;
      goalMsgs.push(
        pct >= 100
          ? `✅ Active minutes goal reached!`
          : `⏱️ ${pct.toFixed(0)}% of your active minutes goal achieved this ${view}.`
      );
    }
    if (goals.sessions) {
      const pct = (currSessions / goals.sessions) * 100;
      goalMsgs.push(
        pct >= 100
          ? `✅ Sessions goal completed!`
          : `📅 ${pct.toFixed(0)}% of your sessions goal achieved this ${view}.`
      );
    }

    return [
      `🔥 Avg burn: ${avgCalories} cal per session.`,
      `⏱️ Avg duration: ${avgMinutes} min.`,
      `📅 Most active day: ${topDay}.`,
      `🏆 Most frequent activity: ${topActivity}.`,
      calcTrend(currCalories, prevCalories, "Calories"),
      calcTrend(currMinutes, prevMinutes, "Active minutes"),
      ...goalMsgs, // ✅ add dynamic goal insights
    ];
  }, [currentLogs, prevLogs, view, goals]);

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Insights ({view})</h2>
      <ul className="space-y-2 text-gray-700">
        {insights.map((insight, i) => {
          const isGoal = insight.startsWith("✅") || insight.includes("% of your");
          const isComplete = insight.startsWith("✅");

          const isTrendUp = insight.startsWith("⬆️");
          const isTrendDown = insight.startsWith("⬇️");

          let color = "text-orange-500"; // default
          if (isGoal) color = isComplete ? "text-green-600" : "text-orange-500";
          if (isTrendUp) color = "text-green-600";
          if (isTrendDown) color = "text-red-500";

          return (
            <li key={i} className="flex items-start gap-2">
              <span className={color}>•</span>
              <span className={`${color} font-medium`}>{insight}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
