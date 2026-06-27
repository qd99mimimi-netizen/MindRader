export interface TranscriptItem {
  id: string;
  time: string; // e.g., "12:45"
  label: "高ストレス" | "フォーカス" | "通常" | "自己開示" | "沈黙";
  text: string;
  subtext: string; // e.g., "「多分」という語尾に5秒間の沈黙、および視線の下方への逸脱を検知"
}

export interface MultimodalAnalysis {
  textAnalysis: string;   // 言語分析 (発言内容、単語、自己開示)
  audioAnalysis: string;  // 聴覚分析 (声のトーン、スピード、ため息、詰まり)
  videoAnalysis: string;  // 視覚分析 (表情、視線、姿勢)
  detectedSignals: string; // 検出されたシグナル概要
  recommendedActions: string[]; // 推奨アクション
  mentalScore: number;    // メンタルスコア (1〜10、3以下が不調/要フォローアップ)
  stressLevel: number;    // ストレス度 (0〜100%)
  engagementLevel: number; // エンゲージメント (0〜100%)
  focusLevel: number;     // 集中度 (0〜100%)
  fatigueLevel: number;   // 疲労度 (0〜100%)
  positiveLevel: number;  // ポジティブ度 (0〜100%)
  burnoutRisk: number;    // 燃え尽きリスク (0〜100%)
  isActionRequired: boolean; // フォローアップ面談の要否
}

export interface OneOnOneSession {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // e.g., "2026年6月25日"
  time: string; // e.g., "14:00 - 14:45"
  duration: number; // minutes
  month: string; // "先月" or "今月" or "2026-05" etc.
  overallScore: number; // 1-100
  analysis: MultimodalAnalysis;
  transcripts: TranscriptItem[];
  audioUrl?: string;       // Temporary URL for the uploaded audio file (or mock URL)
  audioDuration?: number;  // Precise length of the audio in seconds
  followUpScheduled?: boolean;
  followUpMeeting?: {
    id: string;
    title: string;
    date: string;
    time: string;
    description: string;
    scheduledAt: string;
    toolCallExecuted: boolean;
  };
}

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  currentStatus: "healthy" | "warning" | "critical";
  burnoutRisk: number;
  sessions: OneOnOneSession[];
}

export interface ManagerProfile {
  name: string;
  role: string;
  email: string;
  department: string;
  avatar: string;
  bio: string;
  defaultDuration: number;
  alertThreshold: number;
  autoScheduleFollowUp: boolean;
}

export interface TeamStats {
  averageHealthScore: number; // 0-100
  activeSessionsCount: number;
  criticalAlertsCount: number;
  sentimentTrend: {
    labels: string[];
    positive: number[];
    stress: number[];
  };
}
