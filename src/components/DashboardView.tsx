import React, { useState } from "react";
import { Smile, AlertTriangle, Play, Calendar, User, ArrowUpRight, TrendingUp, Sparkles, Flame, CheckCircle, ChevronRight, HelpCircle, Bell, X, Info, Activity, Clock, ShieldAlert, Download, FileSpreadsheet, FileText, Layers } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { EmployeeProfile, TeamStats, OneOnOneSession, ManagerProfile } from "../types";

interface DashboardViewProps {
  employees: EmployeeProfile[];
  stats: TeamStats;
  onSelectEmployee: (empId: string) => void;
  onNewAnalysisClick: () => void;
  managerProfile: ManagerProfile;
  onProfileClick: () => void;
}

export default function DashboardView({ 
  employees, 
  stats, 
  onSelectEmployee, 
  onNewAnalysisClick,
  managerProfile,
  onProfileClick
}: DashboardViewProps) {
  const [activeModal, setActiveModal] = useState<"health" | "sessions" | "alerts" | "export" | "help" | null>(null);
  const [helpTab, setHelpTab] = useState<"about" | "scores" | "analysis" | "settings">("about");

  // Extract all sessions for listing
  const latestSessions: { employee: EmployeeProfile; session: OneOnOneSession }[] = [];
  
  employees.forEach(emp => {
    // Sort sessions to get latest first
    const sorted = [...emp.sessions].sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length > 0) {
      latestSessions.push({
        employee: emp,
        session: sorted[0]
      });
    }
  });

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSummaryCSV = () => {
    const headers = [
      "社員ID",
      "氏名",
      "役職",
      "メールアドレス",
      "現在のコンディション",
      "バーンアウトリスク(%)",
      "総面談回数",
      "直近1on1実施日",
      "直近総合健康スコア"
    ];

    const rows = employees.map(emp => {
      const sortedSessions = [...emp.sessions].sort((a, b) => b.date.localeCompare(a.date));
      const latestSess = sortedSessions[0];
      const statusText = emp.currentStatus === "healthy" ? "安定" : emp.currentStatus === "warning" ? "要注意" : "要緊急フォロー";
      return [
        emp.id,
        emp.name,
        emp.role,
        emp.email || `${emp.id}@example.com`,
        statusText,
        `${emp.burnoutRisk}%`,
        `${emp.sessions.length}回`,
        latestSess ? latestSess.date : "未実施",
        latestSess ? `${latestSess.overallScore}点` : "未評価"
      ];
    });

    downloadCSV("MindRadar_team_summary.csv", headers, rows);
  };

  const handleExportTrendCSV = () => {
    const headers = [
      "社員ID",
      "氏名",
      "役職",
      "セッションID",
      "実施月",
      "実施日",
      "時間",
      "面談時間(分)",
      "総合スコア(100点満点)",
      "メンタル健康スコア(10点満点)",
      "ストレス度(%)",
      "エンゲージメント度(%)",
      "集中度(%)",
      "疲労度(%)",
      "ポジティブ度(%)",
      "バーンアウトリスク(%)",
      "フォローアップ面談予約状況",
      "検出された感情シグナル",
      "推奨アクション"
    ];

    const rows: string[][] = [];
    employees.forEach(emp => {
      emp.sessions.forEach(sess => {
        const recommendedActionsStr = sess.analysis.recommendedActions ? sess.analysis.recommendedActions.join(" | ") : "";
        const followUpStr = sess.followUpScheduled 
          ? `予約済 (${sess.followUpMeeting?.date || ""} ${sess.followUpMeeting?.time || ""})` 
          : "未予約";
        
        rows.push([
          emp.id,
          emp.name,
          emp.role,
          sess.id,
          sess.month,
          sess.date,
          sess.time,
          sess.duration.toString(),
          sess.overallScore.toString(),
          sess.analysis.mentalScore.toString(),
          `${sess.analysis.stressLevel}%`,
          `${sess.analysis.engagementLevel}%`,
          `${sess.analysis.focusLevel}%`,
          `${sess.analysis.fatigueLevel}%`,
          `${sess.analysis.positiveLevel}%`,
          `${sess.analysis.burnoutRisk}%`,
          followUpStr,
          sess.analysis.detectedSignals,
          recommendedActionsStr
        ]);
      });
    });

    downloadCSV("MindRadar_1on1_sessions_trend.csv", headers, rows);
  };

  // Recharts data format
  const chartData = [
    { name: "10/01", "ポジティブ": 62, "ストレス": 45 },
    { name: "10/10", "ポジティブ": 78, "ストレス": 40 },
    { name: "10/20", "ポジティブ": 68, "ストレス": 48 },
    { name: "今日", "ポジティブ": stats.averageHealthScore, "ストレス": stats.criticalAlertsCount > 0 ? 58 : 32 },
  ];

  const getStatusSmiley = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            😊
          </div>
        );
      case "warning":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            😐
          </div>
        );
      case "critical":
        return (
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg animate-bounce">
            😭
          </div>
        );
    }
  };

  const getStatusBadge = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">安定</span>;
      case "warning":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700">要注意</span>;
      case "critical":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700">要緊急フォロー</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 space-y-8">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center">
        {/* Search */}
        <div className="relative w-96">
          <input
            type="text"
            placeholder="チームメンバーやセッションを検索..."
            className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Notifications & Help & User profile */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveModal("export")}
            className="h-10 px-4 bg-white border border-slate-100 hover:border-brand-200 hover:text-brand-700 hover:bg-brand-50/20 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-150 active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4 text-slate-400 shrink-0" />
            <span>CSVエクスポート</span>
          </button>

          <button 
            onClick={() => setActiveModal("alerts")}
            title="重大アラート一覧を開く"
            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-sm relative transition-all duration-150 active:scale-95"
          >
            <Bell className="w-4 h-4" />
            {stats.criticalAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>
          <button 
            onClick={() => setActiveModal("help")}
            title="システム利用ガイド・FAQを開く"
            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-sm transition-all duration-150 active:scale-95"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <div className="h-8 w-[1px] bg-slate-200" />
          <button 
            onClick={onProfileClick}
            title="プロフィール設定を開く"
            className="flex items-center gap-2 hover:bg-slate-100/60 active:scale-95 px-3 py-1.5 rounded-xl transition-all duration-150 group shrink-0"
          >
            <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-600 transition-colors">
              {managerProfile.name} (Manager)
            </span>
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[11px] font-bold border border-brand-200 group-hover:bg-brand-200/40 group-hover:border-brand-300 transition-all shadow-sm">
              {managerProfile.name.trim().split(/[\s　]+/).pop() || managerProfile.name}
            </div>
          </button>
        </div>
      </div>

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-brand-50/20 to-white border border-teal-500/15 rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl" />
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            おはようございます、{managerProfile.name.trim().split(/[\s　]+/).pop() || managerProfile.name}さん
          </h2>
          
          <div className="bg-white/80 backdrop-blur-md border border-brand-100/50 rounded-2xl p-4 flex items-start gap-3.5 max-w-4xl">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 shrink-0">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">AIエージェントの自動スクリーニング結果</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {stats.criticalAlertsCount > 0 
                  ? `チーム全体の状態は概ね安定していますが、鈴木 翔太さん1名に深刻なバーンアウト(燃え尽き)及び不調の早期兆候が検知されています。AI自律予約による「次回フォローアップ面談」がスケジュールされています。`
                  : `今月実施されたすべての1on1セッションから、極端なバーンアウト不調の兆候は検知されていません。チームの心理的安全スコアは先月対比で上昇傾向にあります。`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Team Health */}
        <div 
          onClick={() => setActiveModal("health")}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-brand-300 hover:ring-4 hover:ring-brand-50 cursor-pointer transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">総合チームヘルススコア</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">{stats.averageHealthScore}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-0.5">
              +2% vs 先月
            </span>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.averageHealthScore}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>エンゲージメントと満足度の集計値</span>
              <span className="text-brand-600 font-bold group-hover:underline">詳細表示 ↗</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Sessions */}
        <div 
          onClick={() => setActiveModal("sessions")}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-brand-300 hover:ring-4 hover:ring-brand-50 cursor-pointer transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">本日のアクティブセッション</span>
              <span className="text-3xl font-bold text-slate-800">{stats.activeSessionsCount}</span>
            </div>
            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              今日
            </span>
          </div>
          
          <div className="mt-6 flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" alt="avatar" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" alt="avatar" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80" alt="avatar" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                <div className="w-6 h-6 rounded-full bg-brand-100 text-[9px] font-bold text-brand-600 border-2 border-white flex items-center justify-center">
                  +9
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">1on1ログ・多角分析同期中</span>
            </div>
            <div className="text-[10px] text-brand-600 font-bold group-hover:underline self-end">
              セッション毎のAIログを表示 ↗
            </div>
          </div>
        </div>

        {/* Card 3: Critical Alerts */}
        <div 
          onClick={() => setActiveModal("alerts")}
          className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:ring-4 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
            stats.criticalAlertsCount > 0 
              ? "bg-rose-50/30 border-rose-100 hover:border-rose-300 hover:ring-rose-50" 
              : "bg-white border-slate-100 hover:border-brand-300 hover:ring-brand-50"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">重大なアラート</span>
              <span className="text-3xl font-bold text-slate-800">
                {String(stats.criticalAlertsCount).padStart(2, "0")}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              stats.criticalAlertsCount > 0 ? "bg-rose-500 text-white animate-pulse" : "bg-slate-100 text-slate-500"
            }`}>
              要対応
            </span>
          </div>
          
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${stats.criticalAlertsCount > 0 ? "text-rose-500" : "text-slate-400"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                stats.criticalAlertsCount > 0 ? "text-rose-600 font-semibold" : "text-slate-400"
              }`}>
                {stats.criticalAlertsCount > 0 ? "高ストレス不調反応が検出されました" : "警告：現在アラートはありません"}
              </span>
            </div>
            <div className={`text-[10px] font-bold group-hover:underline self-end ${
              stats.criticalAlertsCount > 0 ? "text-rose-600" : "text-brand-600"
            }`}>
              推奨対策アクションを表示 ↗
            </div>
          </div>
        </div>
      </div>

      {/* Content Columns: Sentiment Trend Chart (Left) & Recent Analysis List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Line Chart (Takes 2 span) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-base">チーム感情トレンド</h3>
              <p className="text-xs text-slate-400 mt-0.5">言語・聴覚・視覚の統合評価（過去30日間の推移）</p>
            </div>
            <select className="bg-slate-50 border border-slate-100 text-xs text-slate-600 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option>過去30日間</option>
              <option>過去3ヶ月間</option>
            </select>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="ポジティブ" 
                  stroke="#0d9488" 
                  strokeWidth={2.5} 
                  activeDot={{ r: 6 }} 
                  dot={{ strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ストレス" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Recent Analysis List (Takes 1 span) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col">
          <div>
            <h3 className="font-bold text-slate-800 text-base">最近の分析</h3>
            <p className="text-xs text-slate-400 mt-0.5">直近の1on1セッション結果</p>
          </div>

          <div className="flex-1 space-y-3.5">
            {latestSessions.map(({ employee, session }) => {
              const latestMentalScore = session.analysis.mentalScore;
              let bgHoverClass = "hover:bg-emerald-50/10";
              if (employee.currentStatus === "warning") bgHoverClass = "hover:bg-amber-50/10";
              if (employee.currentStatus === "critical") bgHoverClass = "hover:bg-rose-50/10";

              return (
                <div
                  key={employee.id}
                  onClick={() => onSelectEmployee(employee.id)}
                  className={`p-3.5 bg-slate-50/30 border border-slate-100 hover:border-brand-100 rounded-xl flex items-center justify-between cursor-pointer transition-all ${bgHoverClass}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={employee.avatar} 
                      alt={employee.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs text-slate-800 truncate">{employee.name}</h4>
                        {getStatusBadge(employee.currentStatus)}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {session.date} • {session.duration}分
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusSmiley(employee.currentStatus)}
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onSelectEmployee(employees[0]?.id || "emp_1")}
            className="w-full text-center py-2.5 text-xs text-slate-500 hover:text-brand-600 bg-slate-50 hover:bg-brand-50/30 rounded-xl transition-all font-medium"
          >
            全てのセッションを表示
          </button>
        </div>
      </div>

      {/* Bottom Insights Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">リアルタイム・インサイト</h3>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            積極的な対話が増加中
          </span>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            一部でモチベーションの低下 (1名に深刻なサイン)
          </span>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            信頼関係のスコアが向上
          </span>
        </div>
      </div>

      {/* MODAL 1: Team Health Score Details */}
      {activeModal === "health" && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">総合チームヘルススコアの詳細</h3>
                  <p className="text-xs text-slate-400 mt-0.5">当月の1on1から多角分析された心理的健康スコアの内訳</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl">
                  <span className="text-[10px] text-emerald-600 font-bold block uppercase tracking-wider">チーム平均メンタルスコア</span>
                  <span className="text-2xl font-bold text-emerald-800 mt-1 block">8.2 / 10.0</span>
                  <p className="text-[10px] text-emerald-600/80 mt-1 leading-normal">前月比+0.2。全体として安定した信頼関係が継続しています。</p>
                </div>
                <div className="p-4 bg-rose-50/50 border border-rose-100/50 rounded-2xl">
                  <span className="text-[10px] text-rose-600 font-bold block uppercase tracking-wider">アラート検知率</span>
                  <span className="text-2xl font-bold text-rose-800 mt-1 block">12.5 %</span>
                  <p className="text-[10px] text-rose-600/80 mt-1 leading-normal">現在、全メンバー8名中1名に要注意以上の反応を検知。</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">メンバー個別ヘルス一覧</h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                  {employees.map(emp => {
                    const latest = emp.sessions.find(s => s.month === "今月");
                    const overallScore = latest?.overallScore || 80;
                    return (
                      <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-white transition-all bg-white/40">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-800">{emp.name}</span>
                              <span className="text-[10px] text-slate-400">{emp.role}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="w-24 bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    emp.currentStatus === 'critical' ? 'bg-rose-500 animate-pulse' : emp.currentStatus === 'warning' ? 'bg-amber-400' : 'bg-emerald-500'
                                  }`} 
                                  style={{ width: `${overallScore}%` }} 
                                />
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono font-bold">{overallScore}点</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(emp.currentStatus)}
                          <button 
                            onClick={() => { onSelectEmployee(emp.id); setActiveModal(null); }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-xl text-[10px] font-bold text-slate-600 transition-all border border-slate-200 hover:border-brand-100"
                          >
                            詳細 ↗
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Active Sessions Details */}
      {activeModal === "sessions" && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">本日のアクティブセッション詳細</h3>
                  <p className="text-xs text-slate-400 mt-0.5">直近で同期された1on1実施ログと会話分析結果</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-brand-50/50 border border-brand-100 text-[11px] text-brand-800 rounded-xl leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-brand-600 mt-0.5" />
                <span>最新の1on1ログ・多角分析は自動でクラウドに同期され、感情シグナルの検出結果がダッシュボードへリアルタイム反映されます。</span>
              </div>

              <div className="space-y-3">
                {latestSessions.map(({ employee, session }) => {
                  const hasAlert = employee.currentStatus === "critical";
                  return (
                    <div 
                      key={session.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        hasAlert ? "bg-rose-50/20 border-rose-100 hover:border-rose-200" : "bg-white border-slate-100 hover:border-brand-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <img src={employee.avatar} alt={employee.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-800">{employee.name}</span>
                              <span className="text-[10px] text-slate-400">{employee.role}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                              実施日時: {session.date} {session.time} ({session.duration}分)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 block">総合 {session.overallScore}点</span>
                          <span className="text-[10px] text-brand-600 font-bold mt-0.5">メンタル: {session.analysis.mentalScore}/10</span>
                        </div>
                      </div>

                      <div className="mt-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-500 leading-normal">
                        <span className="font-bold text-slate-700 block mb-1">💡 検出されたシグナル:</span>
                        {session.analysis.detectedSignals}
                      </div>

                      <div className="mt-3 flex justify-between items-center pt-2.5 border-t border-slate-100/50">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[9px] font-semibold bg-slate-100 rounded text-slate-600">発言数: {session.transcripts?.length || 0}件</span>
                          {session.followUpScheduled && (
                            <span className="px-2 py-0.5 text-[9px] font-semibold bg-teal-50 text-teal-700 rounded border border-teal-100">フォローアップ予約済</span>
                          )}
                        </div>
                        <button 
                          onClick={() => { onSelectEmployee(employee.id); setActiveModal(null); }}
                          className="text-[10px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                        >
                          分析レポートを見る ↗
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
              <button 
                onClick={() => { setActiveModal(null); onNewAnalysisClick(); }}
                className="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                新規1on1を分析する
              </button>
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Critical Alerts Details */}
      {activeModal === "alerts" && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[85vh] border border-rose-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-rose-50/50 border-b border-rose-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-rose-900 text-base">重大なアラートの詳細</h3>
                  <p className="text-xs text-rose-700/80 mt-0.5">臨床心理モデルに基づき自律検知された高リスク・フォローアップ対象</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {employees.filter(emp => emp.currentStatus === 'critical' || emp.currentStatus === 'warning').length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">現在、警告または緊急フォローが必要なアラートはありません。</p>
                  <p className="text-xs text-slate-400">チームのコンディションは極めて良好です。</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {employees.filter(emp => emp.currentStatus === 'critical' || emp.currentStatus === 'warning').map(emp => {
                    const latest = emp.sessions.find(s => s.month === "今月");
                    if (!latest) return null;
                    
                    return (
                      <div key={emp.id} className="space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-3">
                            <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-full object-cover border-2 border-rose-200 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-800">{emp.name}</h4>
                                <span className="px-2 py-0.5 text-[9px] font-semibold bg-rose-100 text-rose-700 rounded-full">燃え尽きリスク: {emp.burnoutRisk}%</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{emp.role} • 直近スコア: {latest.overallScore}点</p>
                            </div>
                          </div>
                          {getStatusBadge(emp.currentStatus)}
                        </div>

                        {/* Signals */}
                        <div className="p-4 bg-rose-50/50 border border-rose-100/60 rounded-2xl space-y-2">
                          <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            AI自律検知シグナル (バーンアウト初期兆候)
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {latest.analysis.detectedSignals}
                          </p>
                        </div>

                        {/* Multimodal break down */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 block">💬 言語特徴分析</span>
                            <p className="text-[10px] text-slate-600 line-clamp-3 leading-relaxed">{latest.analysis.textAnalysis}</p>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 block">🎵 音声特徴分析</span>
                            <p className="text-[10px] text-slate-600 line-clamp-3 leading-relaxed">{latest.analysis.audioAnalysis}</p>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 block">👁️ 視覚特徴分析</span>
                            <p className="text-[10px] text-slate-600 line-clamp-3 leading-relaxed">{latest.analysis.videoAnalysis}</p>
                          </div>
                        </div>

                        {/* Recommended clinical actions */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">推奨アクション（臨床ケア・アサイン見直し）</span>
                          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
                            {latest.analysis.recommendedActions.map((action, index) => (
                              <div key={index} className="flex gap-2 text-xs text-slate-700 items-start leading-relaxed">
                                <CheckCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <span>{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Next follow up meeting scheduled */}
                        {latest.followUpScheduled && latest.followUpMeeting && (
                          <div className="p-4 bg-teal-50/40 border border-teal-100 rounded-2xl space-y-2.5">
                            <span className="text-[10px] font-bold text-teal-800 flex items-center gap-1.5 uppercase tracking-wider">
                              <Calendar className="w-3.5 h-3.5 text-teal-600" />
                              次回フォローアップ面談（AI自律仮予約済）
                            </span>
                            <div className="space-y-1 text-xs">
                              <p className="font-semibold text-slate-800 text-xs">{latest.followUpMeeting.title}</p>
                              <p className="text-slate-500 text-[11px] mt-1">日時: {latest.followUpMeeting.date} {latest.followUpMeeting.time}</p>
                              <p className="text-slate-500 text-[11px] leading-relaxed mt-1.5 bg-white/70 p-2.5 border border-teal-100/50 rounded-xl">{latest.followUpMeeting.description}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                          <button 
                            onClick={() => { onSelectEmployee(emp.id); setActiveModal(null); }} 
                            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/10 transition-all border border-rose-700"
                          >
                            {emp.name}さんの詳細分析画面へ移動 ↗
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CSV Export Details */}
      {activeModal === "export" && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">チーム分析データのエクスポート</h3>
                  <p className="text-xs text-slate-400 mt-0.5">メンバーの健康指標、1on1履歴、および推移データのCSVダウンロード</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="p-3.5 bg-brand-50/40 border border-brand-100/50 text-[11px] text-brand-800 rounded-xl leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-brand-600 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Excel/Googleスプレッドシート文字化け防止対策済</span>
                  <p className="text-brand-700/90 leading-normal">
                    日本語環境のMicrosoft Excel等で直接開いた際も、文字化け（Mojibake）が起きないよう「BOM（Byte Order Mark）付きUTF-8」形式でエクスポート処理を実行します。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Export Card 1 */}
                <div 
                  onClick={handleExportSummaryCSV}
                  className="bg-slate-50/50 hover:bg-brand-50/10 border border-slate-150 hover:border-brand-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-all">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">メンバー個別ヘルスサマリー</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1">
                        各チームメンバーの現在のステータス、バーンアウトリスク（%）、総面談回数、直近面談日および健康評価スコアのサマリーです。
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                    <span>ファイル: MindRadar_team_summary.csv</span>
                    <span className="text-brand-600 group-hover:underline flex items-center gap-0.5">
                      ダウンロード ↘
                    </span>
                  </div>
                </div>

                {/* Export Card 2 */}
                <div 
                  onClick={handleExportTrendCSV}
                  className="bg-slate-50/50 hover:bg-brand-50/10 border border-slate-150 hover:border-brand-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-all">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">1on1セッション履歴 &amp; 推移詳細</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1">
                        実施されたすべての1on1セッション毎の推移データ。言語・音声・視覚の各マルチモーダル分析スコア、検出されたメンタルシグナル、対策アクション等を含みます。
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                    <span>ファイル: MindRadar_1on1_sessions_trend.csv</span>
                    <span className="text-teal-600 group-hover:underline flex items-center gap-0.5">
                      ダウンロード ↘
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Privacy Disclaimer */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-[10px] text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-600 block mb-1">⚠️ データの取り扱いに関する注意点</span>
                本ファイルには、部下との信頼関係に関わる機微なメンタルヘルススコアや会話分析内容が含まれています。パスワード設定やアクセス制限を行い、組織内の適切なセキュリティ基準に従って安全に管理してください。
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 5: Help & FAQ Guide */}
      {activeModal === "help" && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 flex flex-col h-[85vh] border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">MindRadar 活用・システムガイド</h3>
                  <p className="text-xs text-slate-400 mt-0.5">多角分析1on1エージェントの仕組み、評価基準、機能の使い方ガイド</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1.5 shrink-0 overflow-x-auto">
              <button
                onClick={() => setHelpTab("about")}
                type="button"
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  helpTab === "about"
                    ? "bg-white text-brand-600 shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                }`}
              >
                💡 MindRadarとは
              </button>
              <button
                onClick={() => setHelpTab("scores")}
                type="button"
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  helpTab === "scores"
                    ? "bg-white text-brand-600 shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                }`}
              >
                📊 コンディション判定基準
              </button>
              <button
                onClick={() => setHelpTab("analysis")}
                type="button"
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  helpTab === "analysis"
                    ? "bg-white text-brand-600 shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                }`}
              >
                🧠 分析プロセスと多角技術
              </button>
              <button
                onClick={() => setHelpTab("settings")}
                type="button"
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  helpTab === "settings"
                    ? "bg-white text-brand-600 shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                }`}
              >
                ⚙️ アラートとしきい値設定
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {helpTab === "about" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm">🧠 臨床心理と多角マルチモーダル分析を融合した1on1支援ツール</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      MindRadar（マインドラダー）は、チームメンバーのモチベーション低下や、目に見えにくい「バーンアウト（燃え尽き症候群）」の予兆を科学的にキャッチするための面談支援プラットフォームです。
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      対話時の「言葉使い（言語）」「話し方やトーン（音声）」「表情やしぐさ（視覚）」を総合してマルチモーダル評価し、マネージャーが気づきにくい心理的不調の予兆を早期発見して離職防止を強力にアシストします。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Smile className="w-4 h-4 text-emerald-500" />
                        心理的安全性の担保
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        評価や監視目的ではなく、あくまでマネージャーとメンバーの「対話を豊かにし、離職を防止する」ための寄り添い型AIアシスタントとして設計されています。
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand-500" />
                        AIによる自律ケアプラン
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        臨床メンタルモデルに基づいて、不調が疑われるメンバーに「次にとるべきアクション」を提示し、必要に応じて面談の自動スケジュール仮予約を提案します。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {helpTab === "scores" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">📊 メンバーのコンディション判定基準</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    最新の1on1で分析された各種指標を総合し、各メンバーは自動的に以下の3つの状態に分類されます。
                  </p>

                  <div className="space-y-3 pt-2">
                    {/* Status 1: Healthy */}
                    <div className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-2xl flex gap-3">
                      <div className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold h-fit shrink-0">
                        安定 (Healthy)
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-800">良好なメンタル状態と高いエンゲージメント</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          メンタル健康スコアが高く（通常5.0点以上）、ストレスレベルが低く維持されており、発言や表情にポジティブな兆候が見られます。通常のアサインメントをそのまま継続して問題ありません。
                        </p>
                      </div>
                    </div>

                    {/* Status 2: Warning */}
                    <div className="p-4 border border-amber-100 bg-amber-50/20 rounded-2xl flex gap-3">
                      <div className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold h-fit shrink-0">
                        要注意 (Warning)
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-800">軽度の疲労・モチベーション低下、またはストレスの蓄積</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          メンタル健康スコアが4.0点前後に低下しているか、燃え尽きリスクが50%〜70%に達しています。面談の頻度を増やし、日頃のタスク過重がないか等ヒアリングすることをお勧めします。
                        </p>
                      </div>
                    </div>

                    {/* Status 3: Critical */}
                    <div className="p-4 border border-rose-100 bg-rose-50/20 rounded-2xl flex gap-3">
                      <div className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold h-fit shrink-0">
                        要緊急フォロー
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-800">高ストレス・燃え尽きのリスク（リスク70%超、スコア極端な低下）</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          精神的疲労が極めて高く、自己否定発言や音声による疲労シグナルが顕著です。即座のフォロー面談の自律仮予約、業務量の緊急削減、およびカウンセリング対応を推奨します。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {helpTab === "analysis" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">🧠 多角マルチモーダルAI分析テクノロジー</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    面談中に録音・録画された対話データ（または文字起こしと入力メモ）から、AIエージェントは3つの異なるモダリティを同期分析します。
                  </p>

                  <div className="space-y-4 pt-2">
                    <div className="flex gap-3.5 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs shrink-0 mt-0.5">💬</div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">言語特徴分析 (Text)</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          文字起こしテキストのセンチメント（感情極性）の推移、自己批判的な単語の使用比率、文脈の中の「あきらめ」や「過度な責任感」といった臨床言語パターンの分析を行います。
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3.5 items-start">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs shrink-0 mt-0.5">🎵</div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">音声特徴分析 (Audio/Voice)</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          声のピッチ変動（抑揚のなさ）、発話スピード、溜息、言葉が詰まる頻度、沈黙の長さ、声帯の疲れをパラ言語学的手法で計測し、ストレスと身体的・精神的な疲労度合いを推定します。
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3.5 items-start">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs shrink-0 mt-0.5">👁️</div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">視覚特徴分析 (Visual)</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          微細な表情筋の動き（口角の下がり、眉間の緊張）、視線の定まらない動きや下向きがちなしぐさ、瞬きの回数、うつむく姿勢などから、不安感や強い疲労シグナルを画像解析で捕捉します。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {helpTab === "settings" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">⚙️ ベルマーク通知としきい値カスタマイズの仕組み</h4>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-rose-500" />
                        ベルマーク通知（不調アラート）
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        画面右上の「ベルマーク」は、チーム内で「要注意」または「要緊急フォロー」のメンバーが検出された場合に、赤い通知バッジが点滅して即時確認を促します。クリックすると、アラートを検知されたメンバーとその推奨臨床ケアアクションが一覧で確認可能です。
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-brand-500" />
                        設定のカスタマイズ方法
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        右上の「佐藤 健太 (Manager)」のプロフィールカード、または左メニュー下部のマネージャー欄をクリックすると、設定画面（プロフィール）が開きます。
                      </p>
                      <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-1 pl-1">
                        <li><span className="font-semibold text-slate-700">不調アラート検知しきい値</span>: アラートを発火するメンタルスコア基準（例: 4.0点未満）を調整可能。</li>
                        <li><span className="font-semibold text-slate-700">自動自律予約機能 (Tool Calling)</span>: アラート検知時に次回フォローアップ面談を自律仮予約する機能のON/OFFが可能です。</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
              >
                理解しました
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
