import React from "react";
import { User, ShieldCheck, AlertTriangle, ArrowRight, Activity, Calendar, Award } from "lucide-react";
import { EmployeeProfile } from "../types";

interface TeamViewProps {
  employees: EmployeeProfile[];
  onSelectEmployee: (empId: string) => void;
}

export default function TeamView({ employees, onSelectEmployee }: TeamViewProps) {
  
  const getStatusColor = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "critical":
        return "bg-rose-50 text-rose-700 border-rose-100";
    }
  };

  const getStatusText = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy":
        return "安定";
      case "warning":
        return "要注意";
      case "critical":
        return "要緊急フォロー";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-brand-600" />
          チームメンバー管理
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          メンバーのヘルスステータス、1on1完了状況、および直近のバーンアウト予測一覧
        </p>
      </div>

      {/* Grid of Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp) => {
          const latestSess = [...emp.sessions].sort((a, b) => b.date.localeCompare(a.date))[0];
          
          return (
            <div
              key={emp.id}
              onClick={() => onSelectEmployee(emp.id)}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Profile */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img 
                      src={emp.avatar} 
                      alt={emp.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 group-hover:scale-105 transition-transform" 
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 group-hover:text-brand-600 transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{emp.role}</p>
                    </div>
                  </div>
                  
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(emp.currentStatus)}`}>
                    {getStatusText(emp.currentStatus)}
                  </span>
                </div>

                {/* Burnout risk visual */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-slate-400">バーンアウト予測リスク</span>
                    <span className={emp.burnoutRisk > 60 ? "text-rose-600 font-bold" : "text-slate-700"}>
                      {emp.burnoutRisk}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        emp.currentStatus === "healthy" ? "bg-emerald-500" :
                        emp.currentStatus === "warning" ? "bg-amber-400" : "bg-rose-500"
                      }`}
                      style={{ width: `${emp.burnoutRisk}%` }}
                    />
                  </div>
                </div>

                {/* Session count metadata */}
                {latestSess && (
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      最新: {latestSess.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-slate-300" />
                      スコア: {latestSess.overallScore}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-brand-600 group-hover:text-brand-700 pt-3 border-t border-slate-50/50">
                <span>個別解析ディテールを表示</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
