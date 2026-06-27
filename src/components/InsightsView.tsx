import React from "react";
import { TrendingUp, Users, HeartHandshake, ShieldAlert, Zap, ArrowRight, BookOpen, UserMinus, UserPlus, Sparkles } from "lucide-react";
import { EmployeeProfile } from "../types";

interface InsightsViewProps {
  employees: EmployeeProfile[];
  onSelectEmployee: (empId: string) => void;
}

export default function InsightsView({ employees, onSelectEmployee }: InsightsViewProps) {
  // Find critical/warning and high-engagement candidates
  const highRiskMembers = employees.filter(e => e.currentStatus === "critical" || e.burnoutRisk > 60);
  const cautionMembers = employees.filter(e => e.currentStatus === "warning");
  const healthyMembers = employees.filter(e => e.currentStatus === "healthy" && e.burnoutRisk < 20);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-600" />
          組織心理学・ピープルアナリティクス
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          AIエージェントがチーム全体の相関関係から抽出した、深層エンゲージメントと組織改善インサイト
        </p>
      </div>

      {/* Grid of Analytical Focus Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Block 1: Attention Required (Burnout/Stress) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-4.5 h-4.5" />
            業務負荷軽減・メンタル保護対象メンバー
          </h3>
          <p className="text-xs text-slate-400 leading-normal">
            1on1の言語（ネガティブワード頻出・自責傾向）、聴覚（ため息・発話遅延）、視覚（アイコンタクト喪失・うつむき姿勢）から、過度の心理的負荷または学習性無力感が予測されるメンバーです。
          </p>

          <div className="space-y-3 pt-2">
            {highRiskMembers.map(emp => (
              <div 
                key={emp.id} 
                onClick={() => onSelectEmployee(emp.id)}
                className="p-3.5 bg-rose-50/30 border border-rose-100 rounded-xl flex items-center justify-between cursor-pointer hover:bg-rose-50/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover border border-rose-200" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{emp.name}</span>
                    <span className="text-[10px] text-rose-600 font-semibold">燃え尽きリスク: {emp.burnoutRisk}%</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-400" />
              </div>
            ))}

            {cautionMembers.map(emp => (
              <div 
                key={emp.id} 
                onClick={() => onSelectEmployee(emp.id)}
                className="p-3.5 bg-amber-50/20 border border-amber-100 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-50/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover border border-amber-200" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{emp.name}</span>
                    <span className="text-[10px] text-amber-600 font-semibold">疲労警戒レベル: {emp.burnoutRisk}%</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Block 2: Career Empowerment Candidates */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-teal-700">
            <Zap className="w-4.5 h-4.5" />
            エンパワーメント・キャリア育成対象メンバー
          </h3>
          <p className="text-xs text-slate-400 leading-normal">
            自己効力感、心理的安全性が極めて高く、1on1での自己開示も積極的です。新しい権限の移譲やリーダーシップ獲得に適したキャリア支援最適期を迎えています。
          </p>

          <div className="space-y-3 pt-2">
            {healthyMembers.map(emp => (
              <div 
                key={emp.id} 
                onClick={() => onSelectEmployee(emp.id)}
                className="p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-xl flex items-center justify-between cursor-pointer hover:bg-emerald-50/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover border border-emerald-200" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{emp.name}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">エンゲージメント率: 92%</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Organization Psychology Advice Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-brand-600" />
          組織心理アドバイザリー
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserMinus className="w-4 h-4 text-rose-500" />
              タスクの再分配（ボトルネック緩和）
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              一部のキーパーソン（鈴木さん、山本さん）へのタスク依存度が限界値に達しています。プロジェクト進捗を一部移管し、属人化を組織的に解消してください。
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-teal-500" />
              能動的キャリアコーチング
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              田中さんは現在の役割から一歩進んだ「意思決定」を求めています。マネジメントグループへのファシリテーションオブザーバーアサインを提案します。
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              心理的安全性マインドセット
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              「失敗しても大丈夫」という心理的セーフティネットの確立が急務です。1on1において、進捗チェックより「本人の気持ちの安全」の確保を優先してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
