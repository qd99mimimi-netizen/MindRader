import React from "react";
import { LayoutDashboard, Users, TrendingUp, Settings, Plus, Activity } from "lucide-react";

interface SidebarProps {
  currentTab: "dashboard" | "team" | "insights" | "settings" | "new_analysis" | "profile";
  setCurrentTab: (tab: "dashboard" | "team" | "insights" | "settings" | "new_analysis" | "profile") => void;
  criticalCount: number;
  managerProfile: any;
}

export default function Sidebar({ currentTab, setCurrentTab, criticalCount, managerProfile }: SidebarProps) {
  const menuItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "team" as const, label: "Team", icon: Users },
    { id: "insights" as const, label: "Insights", icon: TrendingUp },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-800 tracking-tight leading-none">MindRadar</h1>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Empathic Precision</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="px-4 py-2">
        <button
          onClick={() => setCurrentTab("new_analysis")}
          className={`w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/10 hover:shadow-brand-600/25 active:scale-[0.98] ${
            currentTab === "new_analysis" ? "ring-2 ring-brand-500 ring-offset-2" : ""
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? "bg-brand-50 text-brand-600 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    isActive ? "text-brand-500" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              
              {item.id === "dashboard" && criticalCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {criticalCount}
                </span>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-brand-600 rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div 
        onClick={() => setCurrentTab("profile")}
        className={`p-4 border-t border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${
          currentTab === "profile" ? "bg-brand-50/50" : ""
        }`}
      >
        <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 hover:shadow-sm border border-slate-100/50 transition-all">
          <img
            src={managerProfile.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"}
            alt={managerProfile.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-800 truncate">{managerProfile.name}</h4>
            <p className="text-[10px] text-slate-400 truncate">{managerProfile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
