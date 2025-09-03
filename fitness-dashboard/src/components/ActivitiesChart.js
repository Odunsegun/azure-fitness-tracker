// src/components/ActivitiesChart.js
import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { aggregateLogsByDate } from "../utils/aggregate";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format, eachDayOfInterval } from "date-fns";


// Utility: get days in a specific month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function ActivitiesChart({ logs = [] }) {
  const [view, setView] = useState("month");
  const today = new Date();
  const [range, setRange] = useState(1);
  const [monthOffset, setMonthOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = prev week, etc.


  // Current date pointer (for month navigation)
  const currentDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  // Current week (for daily arrows mode)
  const currentWeekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Decide which dataset to show
  const chartData = useMemo(() => {
    if (view === "month") {
      const daysInMonth = getDaysInMonth(year, month);

      // Generate array of days with default 0s
      const monthData = Array.from({ length: daysInMonth }, (_, i) => ({
        date: i + 1,
        calories: 0,
      }));

      // Merge with logs
      logs.forEach((log) => {
        const d = new Date(log.date);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          monthData[day - 1].calories += parseInt(log.calories) || 0;
        }
      });

      return monthData;
    }
    else if (view === "week") {
      if (range) {
        // Aggregated weeks (2w, 4w, 6w)
        return aggregateLogsByDate(logs, "week", range);
      } else {
        // Daily breakdown for a single week
        const days = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });
        return days.map((day) => {
          const totalCalories = logs
            .filter((log) => format(new Date(log.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
            .reduce((sum, l) => sum + (parseInt(l.calories) || 0), 0);
          return { date: format(day, "MM/dd"), calories: totalCalories };
        });
      }
    }

    // For week / year → use aggregate
    return aggregateLogsByDate(logs, view, range || 1);
  }, [logs, view, range, weekOffset, currentWeekStart, currentWeekEnd, year, month]);

  // Format X-axis ticks
  const tickFormatter = (tick) => {
    if (view === "month") {
      return [1, 7, 13, 19, 25, 30].includes(tick) ? tick : "";
    }
    return tick;
  };

  return (
    <div className="bg-white shadow rounded-xl p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <Calendar className="w-5 h-5 text-orange-500" />
          {view === "week" && !range ? (
            <span>
              {format(currentWeekStart, "MMM d")} - {format(currentWeekEnd, "MMM d, yyyy")}
            </span>
          ) : (
            <span>
              Activities ({view}) {range ? `- Last ${range}${view[0]}` : ""}
            </span>
          )}
        </div>
      </div>
      
      {/* Range controls */}
      {view === "week" && (
        <div className="flex justify-between items-center mb-4 mt-2">
          {/* Aggregated week ranges (left) */}
          <div className="flex gap-2">
            {[1, 2, 4, 6, 10].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2 py-1 rounded ${range === r ? "bg-orange-500 text-white" : "bg-gray-100"}`}
              >
                {r}w
              </button>
            ))}
          </div>

          {/* Daily mode arrows (right) */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setRange(null);
                setWeekOffset((prev) => prev - 1);
              }}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setRange(null);
                setWeekOffset((prev) => (prev < 0 ? prev + 1 : prev));
              }}
              disabled={weekOffset === 0}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {view === "year" && (
        <div className="flex justify-between items-center mt-2 mb-4">
          {/* Year ranges */}
          <div className="flex gap-2">
            {[1, 2, 5].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2 py-1 rounded ${range === r ? "bg-orange-500 text-white" : "bg-gray-100"}`}
              >
                {r}y
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Header with arrows */}
      {view === "month" && (
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span>
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMonthOffset((prev) => prev - 1)}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMonthOffset((prev) => (prev < 0 ? prev + 1 : prev))}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              disabled={monthOffset === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View controls */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-3 text-sm">
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

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tickFormatter={tickFormatter} />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="calories"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
