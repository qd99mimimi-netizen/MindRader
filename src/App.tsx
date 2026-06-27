import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import EmployeeDetailView from "./components/EmployeeDetailView";
import NewAnalysisView from "./components/NewAnalysisView";
import TeamView from "./components/TeamView";
import InsightsView from "./components/InsightsView";
import ProfileView from "./components/ProfileView";
import { EmployeeProfile, TeamStats, ManagerProfile } from "./types";
import { Settings as SettingsIcon, ShieldCheck, Key, RefreshCw, Cpu, Activity } from "lucide-react";

export default function App() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [currentTab, setCurrentTab] = useState<"dashboard" | "team" | "insights" | "settings" | "new_analysis" | "profile">("dashboard");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeminiActive, setIsGeminiActive] = useState(false);
  const [localAudioUrls, setLocalAudioUrls] = useState<{ [sessionId: string]: string }>({});
  const localAudioUrlsRef = useRef<{ [sessionId: string]: string }>({});

  const [managerProfile, setManagerProfile] = useState<ManagerProfile>(() => {
    const saved = localStorage.getItem("mindradar_manager_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse manager profile", e);
      }
    }
    return {
      name: "佐藤 健太",
      role: "シニアチームマネージャー",
      email: "qd99mimimi@gmail.com",
      department: "開発本部・エンジニアリング推進部",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      bio: "心理的安全性と多角的なシグナル検知を重視したチームマネジメントを実践。部下一人ひとりのコンディションを多角的に分析し、バーンアウトの未然防止に努めています。",
      defaultDuration: 45,
      alertThreshold: 4,
      autoScheduleFollowUp: true,
    };
  });

  const handleUpdateProfile = (updated: ManagerProfile) => {
    setManagerProfile(updated);
    localStorage.setItem("mindradar_manager_profile", JSON.stringify(updated));
  };

  // Load employees and stats from Express API
  const fetchEmployeesData = async () => {
    try {
      const response = await fetch("/api/employees");
      if (response.ok) {
        const data = await response.json();
        
        // Merge client-side local audio Blob URLs back to fetched data so we do not lose them
        const mergedEmployees = data.employees.map((emp: EmployeeProfile) => {
          return {
            ...emp,
            sessions: emp.sessions.map((sess) => {
              const localUrl = localAudioUrlsRef.current[sess.id] || localAudioUrls[sess.id];
              if (localUrl) {
                return {
                  ...sess,
                  audioUrl: localUrl
                };
              }
              return sess;
            })
          };
        });

        setEmployees(mergedEmployees);
        setStats(data.stats);
        
        // Auto-check server Gemini API support
        const healthRes = await fetch("/api/health");
        if (healthRes.ok) {
          setIsGeminiActive(true);
        }
      }
    } catch (err) {
      console.error("Failed to load backend data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
  }, []);

  // Handler to schedule/confirm follow up calendar slots
  const handleConfirmMeeting = async (
    employeeId: string,
    sessionId: string,
    date: string,
    time: string,
    title: string,
    description: string
  ) => {
    try {
      const response = await fetch("/api/schedule-followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          employeeId,
          sessionId,
          date,
          time,
          title,
          description
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employee ? employees.map(e => e.id === employeeId ? data.employee : e) : employees);
        // Refresh full states to reflect calendar locks
        fetchEmployeesData();
      }
    } catch (err) {
      console.error("Failed to confirm meeting on server", err);
    }
  };

  // Nav helper
  const navigateToEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">MindRadar Analytics データベースロード中...</p>
        </div>
      </div>
    );
  }

  // Count criticals for sidebar indicator badge
  const criticalCount = employees.filter(e => e.currentStatus === "critical").length;

  return (
    <div className="flex h-screen bg-white overflow-hidden text-slate-700 antialiased font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar 
        currentTab={selectedEmployeeId ? "team" : currentTab} 
        setCurrentTab={(tab) => {
          setSelectedEmployeeId(null);
          setCurrentTab(tab);
        }}
        criticalCount={criticalCount}
        managerProfile={managerProfile}
      />

      {/* Main Content Render area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/20">
        {selectedEmployeeId ? (
          <EmployeeDetailView
            employee={employees.find(e => e.id === selectedEmployeeId)!}
            onBack={() => setSelectedEmployeeId(null)}
            onConfirmMeeting={handleConfirmMeeting}
          />
        ) : (
          <>
            {currentTab === "dashboard" && stats && (
              <DashboardView
                employees={employees}
                stats={stats}
                onSelectEmployee={navigateToEmployee}
                onNewAnalysisClick={() => setCurrentTab("new_analysis")}
                managerProfile={managerProfile}
                onProfileClick={() => setCurrentTab("profile")}
              />
            )}

            {currentTab === "team" && (
              <TeamView
                employees={employees}
                onSelectEmployee={navigateToEmployee}
              />
            )}

            {currentTab === "insights" && (
              <InsightsView
                employees={employees}
                onSelectEmployee={navigateToEmployee}
              />
            )}

            {currentTab === "new_analysis" && (
              <NewAnalysisView
                employees={employees}
                onAnalysisSuccess={(analyzedEmp) => {
                  const latestSess = analyzedEmp.sessions.find(s => s.month === "今月");
                  if (latestSess && latestSess.audioUrl) {
                    localAudioUrlsRef.current[latestSess.id] = latestSess.audioUrl;
                    setLocalAudioUrls(prev => ({
                      ...prev,
                      [latestSess.id]: latestSess.audioUrl!
                    }));
                  }
                  setEmployees(prev => prev.map(e => e.id === analyzedEmp.id ? analyzedEmp : e));
                  // Delay fetch slightly to let localAudioUrls state settle
                  setTimeout(() => {
                    fetchEmployeesData();
                  }, 100);
                  setSelectedEmployeeId(analyzedEmp.id);
                }}
              />
            )}

            {currentTab === "settings" && (
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Settings Header */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-slate-600" />
                    システム環境・API設定
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">MindRadar AIエンジンの構成ステータスと環境パラメータ</p>
                </div>

                {/* API Status Credentials Box */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Key className="w-4.5 h-4.5 text-brand-600" />
                    Gemini AI 連携ステータス
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Display Card */}
                    <div className="p-4 bg-slate-50 rounded-xl space-y-2.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">APIキー統合ステータス</span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          MindRadar Core 稼働中 (フルスタック)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        APIサーバー、Viteリバースプロキシ(Port:3000)及びデータベースモデルが正常に起動しています。
                      </p>
                    </div>

                    {/* Security Instruction Card */}
                    <div className="p-4 bg-slate-50 rounded-xl space-y-2.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">認証キーセキュア管理</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        API認証キーは、AI Studioのセキュアストレージ（<strong>Settings &gt; Secrets</strong>）より暗号化されてサーバーサイドに直接注入され、ブラウザへのキーの露出を防ぎます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Model Configuration Information card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Cpu className="w-4.5 h-4.5 text-teal-600" />
                    マルチモーダルAI評価基準
                  </h3>
                  <div className="space-y-3.5 text-xs text-slate-600">
                    <p className="leading-relaxed">
                      MindRadarは、上司と部下の対話データを<strong>3つの次元</strong>で多角的にスクリーニングします：
                    </p>
                    <ul className="space-y-2 pl-4 list-disc">
                      <li><strong>Linguistic (言語特徴)</strong>: ネガティブ/ポジティブワード比率、自責傾向、自己開示指数の評価</li>
                      <li><strong>Acoustic (聴覚特徴)</strong>: ピッチ揺らぎ、発話速度遅延（正常値比）、不自然な沈黙、ため息の検知</li>
                      <li><strong>Visual (視覚特徴)</strong>: アイコンタクト低下、骨格トラッキング（うつむき・猫背）、表情輝度指標</li>
                    </ul>
                    <p className="leading-relaxed border-t border-slate-100 pt-4 text-[11px] text-slate-400">
                      ※ メンタル評価スコアが3.0以下に低下した場合は、AIエージェントが自律的にカレンダー仮押さえ用のツール（Tool Calling）を自動トリガーします。
                    </p>
                  </div>
                </div>

              </div>
            )}

            {currentTab === "profile" && (
              <ProfileView
                profile={managerProfile}
                onUpdateProfile={handleUpdateProfile}
                teamCount={employees.length}
                averageScore={stats ? stats.averageHealthScore : 72.5}
              />
            )}
          </>
        )}
      </main>

    </div>
  );
}
