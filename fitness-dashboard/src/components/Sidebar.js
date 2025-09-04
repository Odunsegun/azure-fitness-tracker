import React, { useState } from "react";
import { LayoutDashboard, PlusCircle, BarChart3, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Log Activity", path: "/log", icon: <PlusCircle size={20} /> },
    { name: "Summary", path: "/summary", icon: <BarChart3 size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
  ];

  return (
    <div className={`h-screen bg-white shadow-md transition-all duration-300 ${collapsed ? "w-20" : "w-56"}`}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <span className="text-xl font-bold">FitTrack</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-gray-100 rounded">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className="p-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition ${
              pathname === item.path ? "bg-orange-100 text-orange-600 font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
