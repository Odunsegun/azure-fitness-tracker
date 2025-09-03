// src/components/Navbar.js
import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full bg-gray-50 shadow-sm mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
        {/* Left side: Logo + Menu */}
        <div className="flex items-center space-x-12">
          {/* Logo */}
          <div className="text-xl font-bold flex items-center space-x-2">
            <span className="text-orange-500 text-2xl">🏋️</span>
            <span>FitTrack</span>
          </div>

          {/* Menu */}
          <nav className="flex space-x-8 text-lg font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 ${
                  isActive
                    ? "text-orange-500 border-b-2 border-orange-500 pb-1"
                    : "text-gray-500 hover:text-black"
                }`
              }
            >
              <span>📊</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/log"
              className={({ isActive }) =>
                `flex items-center space-x-2 ${
                  isActive
                    ? "text-orange-500 border-b-2 border-orange-500 pb-1"
                    : "text-gray-500 hover:text-black"
                }`
              }
            >
              <span>➕</span>
              <span>Log Activity</span>
            </NavLink>

            <NavLink
              to="/summary"
              className={({ isActive }) =>
                `flex items-center space-x-2 ${
                  isActive
                    ? "text-orange-500 border-b-2 border-orange-500 pb-1"
                    : "text-gray-500 hover:text-black"
                }`
              }
            >
              <span>📈</span>
              <span>Summary</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center space-x-2 ${
                  isActive
                    ? "text-orange-500 border-b-2 border-orange-500 pb-1"
                    : "text-gray-500 hover:text-black"
                }`
              }
            >
              <span>👤</span>
              <span>Profile</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
