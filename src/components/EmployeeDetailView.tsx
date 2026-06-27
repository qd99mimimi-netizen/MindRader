import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, Share2, Play, Pause, Calendar, Clock, AlertCircle, Check, Info, Sparkles, Flame, UserCheck, Eye, Headphones, FileText, ChevronRight } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { EmployeeProfile, OneOnOneSession, TranscriptItem } from "../types";

interface EmployeeDetailViewProps {
  employee: EmployeeProfile;
  onBack: () => void;
  onConfirmMeeting: (employeeId: string, sessionId: string, date: string, time: string, title: string, description: string) => void;
}

export default function EmployeeDetailView({ employee, onBack, onConfirmMeeting }: EmployeeDetailViewProps) {
  // We want to view "今月" by default, or the latest session
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 100 %
  const [activeTranscriptId, setActiveTranscriptId] = useState<string | null>(null);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0); // inside session in seconds
  
  // Sorted sessions list
  const sortedSessions = [...employee.sessions].sort((a, b) => {
    if (a.month === "今月") return -1;
    if (b.month === "今月") return 1;
    return b.date.localeCompare(a.date);
  });

  const session = sortedSessions[selectedSessionIndex] || sortedSessions[0];

  const [totalDuration, setTotalDuration] = useState(session.audioDuration || (session.duration * 60) || 120);

  // Edit states for calendar仮予約
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [meetingDate, setMeetingDate] = useState("2026-06-30");
  const [meetingTime, setMeetingTime] = useState("11:00 - 11:30");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDesc, setMeetingDesc] = useState("");
  const [meetingConfirmed, setMeetingConfirmed] = useState(false);

  // Parse transcript time representation into seconds matching the playback timeline
  const getTranscriptTimeInSeconds = (t: TranscriptItem, index: number, totalCount: number) => {
    try {
      const parts = t.time.split(":");
      let sec = 0;
      if (parts.length === 2) {
        sec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      }
      
      const originalTotalDuration = session.audioDuration || (session.duration * 60) || 1800;
      const ratio = Math.min(0.95, sec / originalTotalDuration);
      
      if (ratio === 0 && totalCount > 0) {
        return ((index + 1) / (totalCount + 1)) * totalDuration;
      }
      return ratio * totalDuration;
    } catch (_) {
      return ((index + 1) / (totalCount + 1)) * totalDuration;
    }
  };

  // Mount/Stop audio and reset controls when switching session or employee
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsPlaying(false);
    setCurrentPlaybackTime(0);
    setPlaybackProgress(0);
    setActiveTranscriptId(null);

    const dur = session.audioDuration || (session.duration * 60) || 120;
    setTotalDuration(dur);

    if (session?.followUpMeeting) {
      setMeetingTitle(session.followUpMeeting.title);
      setMeetingTime(session.followUpMeeting.time);
      setMeetingDesc(session.followUpMeeting.description);
      setMeetingConfirmed(employee.sessions.find(s => s.id === session.id)?.followUpScheduled || false);
    }

    if (session.audioUrl) {
      const audio = new Audio(session.audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentPlaybackTime(0);
        setPlaybackProgress(0);
      };
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setCurrentPlaybackTime(audio.currentTime);
          setPlaybackProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.onloadedmetadata = () => {
        setTotalDuration(audio.duration);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [session, employee]);

  // Simulated timer when using virtual/no-physical audio (e.g. historical sessions)
  useEffect(() => {
    let interval: any;
    if (isPlaying && !session.audioUrl) {
      interval = setInterval(() => {
        setCurrentPlaybackTime((prev) => {
          const next = prev + 1;
          if (next >= totalDuration) {
            setIsPlaying(false);
            setPlaybackProgress(0);
            return 0;
          }
          setPlaybackProgress((next / totalDuration) * 100);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, session.audioUrl, totalDuration]);

  // Sync current time with active transcript highlight
  useEffect(() => {
    let activeId: string | null = null;
    
    const transcriptTimes = session.transcripts.map((t, idx) => ({
      id: t.id,
      start: getTranscriptTimeInSeconds(t, idx, session.transcripts.length)
    })).sort((a, b) => a.start - b.start);

    for (let i = 0; i < transcriptTimes.length; i++) {
      const current = transcriptTimes[i];
      const next = transcriptTimes[i + 1];
      const start = current.start;
      const end = next ? next.start : Math.max(start + 15, totalDuration);
      
      if (currentPlaybackTime >= start && currentPlaybackTime < end) {
        activeId = current.id;
        break;
      }
    }
    
    setActiveTranscriptId(activeId);
  }, [currentPlaybackTime, session.transcripts, totalDuration]);

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">セッション履歴がありません。</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-xl">戻る</button>
      </div>
    );
  }

  // Radar chart data prep
  const radarData = [
    { subject: "集中度", value: session.analysis.focusLevel ?? 50 },
    { subject: "ポジティブ", value: session.analysis.positiveLevel ?? 50 },
    { subject: "疲労度", value: session.analysis.fatigueLevel ?? 50 },
    { subject: "エンゲージメント", value: session.analysis.engagementLevel ?? 50 },
    { subject: "ストレス", value: session.analysis.stressLevel ?? 50 },
  ];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (session.audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error("Audio play failed", err));
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (percentage: number) => {
    const targetSeconds = (percentage / 100) * totalDuration;
    setCurrentPlaybackTime(targetSeconds);
    setPlaybackProgress(percentage);
    if (session.audioUrl && audioRef.current) {
      audioRef.current.currentTime = targetSeconds;
    }
  };

  const handleConfirm = () => {
    // Call props to save in server state
    const formattedDate = meetingDate.includes("年") ? meetingDate : `${meetingDate.replace(/-/g, "/")} (仮)`;
    onConfirmMeeting(
      employee.id,
      session.id,
      formattedDate,
      meetingTime,
      meetingTitle,
      meetingDesc
    );
    setMeetingConfirmed(true);
    setIsEditingMeeting(false);
  };

  const getHealthBorderClass = (status: string) => {
    if (status === "healthy") return "border-emerald-100 bg-emerald-50/10";
    if (status === "warning") return "border-amber-100 bg-amber-50/10";
    return "border-rose-100 bg-rose-50/10";
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 space-y-6">
      
      {/* Navigation and Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="cursor-pointer hover:text-slate-600" onClick={onBack}>Team</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 font-semibold">Analysis Detail</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {employee.name} の個別解析
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Session Switcher tab */}
          <div className="bg-white border border-slate-100 rounded-xl p-1 flex gap-1 shadow-sm">
            {sortedSessions.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setSelectedSessionIndex(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedSessionIndex === idx
                    ? "bg-brand-500 text-white"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {s.month} ({s.date.replace(/2026年/, "")})
              </button>
            ))}
          </div>

          <button className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all">
            <Download className="w-3.5 h-3.5" />
            レポート出力
          </button>
          <button className="px-4 py-2 bg-brand-600 rounded-xl text-xs font-semibold text-white hover:bg-brand-700 flex items-center gap-1.5 shadow-md shadow-brand-600/10 transition-all">
            <Share2 className="w-3.5 h-3.5" />
            共有
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className={`border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${getHealthBorderClass(employee.currentStatus)}`}>
        <div className="flex items-center gap-4">
          <img src={employee.avatar} alt={employee.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-lg text-slate-800">{employee.name}</h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                employee.currentStatus === "healthy" ? "bg-emerald-100 text-emerald-800" :
                employee.currentStatus === "warning" ? "bg-amber-100 text-amber-800" :
                "bg-rose-100 text-rose-800"
              }`}>
                {employee.currentStatus === "healthy" ? "安定" :
                 employee.currentStatus === "warning" ? "要注意" : "要緊急フォロー"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{employee.role} • {employee.email}</p>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">メンタル評価スコア</span>
            <span className="text-2xl font-bold text-slate-800">{session.analysis.mentalScore} <span className="text-xs font-medium text-slate-400">/ 10</span></span>
          </div>
          <div className="w-[1px] bg-slate-200" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">燃え尽き症候群リスク</span>
            <span className={`text-2xl font-bold block ${session.analysis.burnoutRisk > 60 ? "text-rose-600" : "text-slate-800"}`}>
              {session.analysis.burnoutRisk}%
            </span>
          </div>
        </div>
      </div>

      {/* Radar Chart & AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Radar Chart (Emotional Balance) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">感情バランス解析</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">マルチモーダル指標のバランス</p>
          </div>

          <div className="h-64 flex items-center justify-center w-full">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 550 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} />
                <Radar
                  name={employee.name}
                  dataKey="value"
                  stroke="#0d9488"
                  fill="#0d9488"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats list under radar */}
          <div className="grid grid-cols-5 gap-1 pt-4 border-t border-slate-50 text-center">
            {radarData.map(d => (
              <div key={d.subject}>
                <span className="text-[9px] text-slate-400 block truncate">{d.subject}</span>
                <span className="text-xs font-bold text-slate-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Insights */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              AI解析インサイト
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Gemini-3.5-flash 解析済</span>
          </div>

          {/* Detected Signals */}
          <div className="p-4 bg-teal-50/30 border border-teal-500/10 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
              <Flame className="w-4.5 h-4.5 text-teal-600" />
              <span>検出されたシグナル</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {session.analysis.detectedSignals}
            </p>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span>推奨されるマネージャー・HRアクション</span>
            </div>
            <ul className="space-y-2.5">
              {session.analysis.recommendedActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <div className="w-4 h-4 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Autonomous Follow-up Booking Section (Tool Calling Outcome) */}
          {session.analysis.isActionRequired && session.followUpMeeting && (
            <div className="border border-rose-100 bg-rose-50/20 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
                  <span>🤖 AI自律アクション: フォローアップ予約完了</span>
                </div>
                <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">Tool Calling 実行済</span>
              </div>
              
              <p className="text-[11px] text-slate-500">
                メンタル評価値が不調ライン(3.0以下)に達したため、AIエージェントがカレンダー仮予約関数を実行し、部下のスケジュールにフォローアップ面談を設定しました。
              </p>

              {/* Booking Confirmation Box */}
              {!isEditingMeeting ? (
                <div className="bg-white border border-rose-100 rounded-lg p-3 space-y-2.5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-800">{meetingTitle}</span>
                    {meetingConfirmed ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> 確定済
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">
                        カレンダー仮押さえ中
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {session.followUpMeeting.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {meetingTime}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 border-t border-slate-50 pt-2 leading-normal">
                    {meetingDesc}
                  </p>

                  {!meetingConfirmed && (
                    <div className="flex gap-2 justify-end pt-1">
                      <button 
                        onClick={() => {
                          setIsEditingMeeting(true);
                        }}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 hover:bg-slate-100 font-medium"
                      >
                        予約を編集
                      </button>
                      <button 
                        onClick={handleConfirm}
                        className="px-2.5 py-1 bg-brand-600 text-white rounded text-[10px] font-bold hover:bg-brand-700 flex items-center gap-1"
                      >
                        カレンダー予約を確定
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-sm">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">会議タイトル</label>
                    <input 
                      type="text" 
                      value={meetingTitle} 
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 text-xs rounded p-1.5 focus:outline-brand-500" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">日程</label>
                      <input 
                        type="text" 
                        value={meetingDate} 
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 text-xs rounded p-1.5 focus:outline-brand-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">時間帯</label>
                      <input 
                        type="text" 
                        value={meetingTime} 
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 text-xs rounded p-1.5 focus:outline-brand-500" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">説明（招待メッセージ）</label>
                    <textarea 
                      value={meetingDesc} 
                      onChange={(e) => setMeetingDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-100 text-xs rounded p-1.5 focus:outline-brand-500 leading-normal"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button 
                      onClick={() => setIsEditingMeeting(false)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 font-semibold"
                    >
                      キャンセル
                    </button>
                    <button 
                      onClick={handleConfirm}
                      className="px-2.5 py-1 bg-brand-600 text-white rounded text-[10px] font-bold"
                    >
                      変更を保存して確定
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session Timeline Waveform Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Headphones className="w-4 h-4 text-slate-500" />
              セッション・タイムライン
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">マルチモーダル指標・不調区間の時間的マッピング（クリックでシーク可能）</p>
          </div>
          {session.analysis.isActionRequired && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              高ストレス区間を検出 (12:45 付近)
            </span>
          )}
        </div>

        {/* Timeline Waveform Control */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col md:flex-row items-center gap-5">
          {/* Play/Pause Button */}
          <button 
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-600/20 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </button>
 
          {/* Time display */}
          <div className="text-xs font-mono text-slate-500 min-w-[100px] text-center bg-white border border-slate-100 px-3 py-1.5 rounded-lg shadow-sm">
            {formatTime(currentPlaybackTime)} / {formatTime(totalDuration)}
          </div>
 
          {/* Waveform Visualization */}
          <div className="flex-1 w-full h-16 flex items-center gap-[3px] overflow-hidden relative cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = (clickX / rect.width) * 100;
            handleSeek(percentage);
          }}>
            {/* Waveform bars */}
            {Array.from({ length: 90 }).map((_, idx) => {
              // Higher peaks in mid-sessions. If is critical, add extra jagged high peak around 40-50% mark (high stress)
              let height = 15 + Math.sin(idx * 0.15) * 20 + Math.cos(idx * 0.3) * 10;
              if (idx > 38 && idx < 50 && session.analysis.isActionRequired) {
                height = 50 + Math.sin(idx * 1.5) * 15; // jagged stress wave
              }
              height = Math.max(10, Math.min(60, height));
              
              const isPassed = idx < (playbackProgress / 100) * 90;
              const isStressZone = idx > 38 && idx < 50 && session.analysis.isActionRequired;
 
              return (
                <div 
                  key={idx}
                  className="flex-1 rounded-full transition-all"
                  style={{
                    height: `${height}%`,
                    backgroundColor: isStressZone 
                      ? (isPassed ? "#ef4444" : "#fee2e2") 
                      : (isPassed ? "#0d9488" : "#e2e8f0")
                  }}
                />
              );
            })}
 
            {/* Time pointer line */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-brand-500 z-10 pointer-events-none"
              style={{ left: `${playbackProgress}%` }}
            />
          </div>
        </div>
      </div>
 
      {/* Transcript List Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          重要モーメント・トランスクリプト
        </h4>
        <p className="text-[11px] text-slate-400 mt-0.5">マルチモーダル特徴抽出ログ（クリックでその発言シーンにジャンプ再生）</p>
 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {session.transcripts.map((t, idx) => {
            const isActive = activeTranscriptId === t.id;
            const isAlert = t.label === "高ストレス" || t.label === "沈黙";
            const targetSec = getTranscriptTimeInSeconds(t, idx, session.transcripts.length);
            return (
              <div 
                key={t.id}
                onClick={() => {
                  const percentage = (targetSec / totalDuration) * 100;
                  handleSeek(percentage);
                }}
                className={`p-4 border rounded-xl space-y-3 transition-all cursor-pointer hover:border-brand-400 hover:shadow-sm active:scale-[0.99] group ${
                  isActive 
                    ? "border-brand-500 ring-1 ring-brand-500/30 bg-brand-50/5 shadow-sm" 
                    : (isAlert ? "border-rose-100 bg-rose-50/5 hover:bg-rose-50/10" : "border-slate-100 bg-slate-50/20 hover:bg-slate-50/40")
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-slate-500 font-bold bg-slate-100 group-hover:bg-brand-100 group-hover:text-brand-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all">
                      <Play className="w-2.5 h-2.5 fill-current opacity-0 group-hover:opacity-100 transition-all" />
                      {t.time}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                    t.label === "高ストレス" ? "bg-rose-100 text-rose-800" :
                    t.label === "沈黙" ? "bg-rose-50 text-rose-700" :
                    t.label === "フォーカス" ? "bg-teal-100 text-teal-800" :
                    t.label === "自己開示" ? "bg-brand-100 text-brand-800" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {t.label}
                  </span>
                </div>
                
                <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                  {t.text}
                </p>
 
                {t.subtext && (
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 border-t border-slate-100 pt-2 bg-slate-50/50 p-1.5 rounded">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t.subtext}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
