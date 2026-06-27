import React, { useState } from "react";
import { User, Mail, Building, Clock, ShieldAlert, Check, CheckCircle, Sparkles, Save, Heart, Activity, Settings, CalendarRange } from "lucide-react";
import { ManagerProfile } from "../types";

interface ProfileViewProps {
  profile: ManagerProfile;
  onUpdateProfile: (updated: ManagerProfile) => void;
  teamCount: number;
  averageScore: number;
}

export default function ProfileView({ profile, onUpdateProfile, teamCount, averageScore }: ProfileViewProps) {
  const [formData, setFormData] = useState<ManagerProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setIsSaved(false);
  };

  const handleToggle = (name: keyof ManagerProfile) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
    setIsSaved(false);
  };

  const handleSelectDuration = (duration: number) => {
    setFormData(prev => ({ ...prev, defaultDuration: duration }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("お名前を入力してください。");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("有効なメールアドレスを入力してください。");
      return;
    }

    setErrorMsg(null);
    onUpdateProfile(formData);
    setIsSaved(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-brand-600" />
            管理者プロフィール &amp; 1on1設定
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            マネージャープロフィールの変更、および1on1多角分析AIエージェントの基本動作パラメーター設定
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-sm animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>設定が正常に保存され、ダッシュボードおよびシステム全体に即時反映されました！</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Quick Cards / Preview */}
        <div className="space-y-6 lg:col-span-1">
          {/* Avatar & Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-brand-500 to-teal-400" />
            
            {/* Avatar Circle */}
            <div className="relative mt-10">
              <img
                src={formData.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120"}
                alt={formData.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md relative z-10"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold z-20">
                L
              </div>
            </div>

            <div className="mt-4 space-y-1 relative z-10 w-full">
              <h3 className="font-bold text-slate-800 text-base">{formData.name || "佐藤 健太"}</h3>
              <p className="text-xs text-brand-600 font-semibold">{formData.role || "チームマネージャー"}</p>
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Building className="w-3.5 h-3.5" />
                {formData.department || "開発本部"}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 w-full grid grid-cols-2 gap-4">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">管轄メンバー</span>
                <span className="text-xl font-bold text-slate-700 block mt-1">{teamCount}名</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">チーム平均スコア</span>
                <span className="text-xl font-bold text-teal-600 block mt-1">{averageScore.toFixed(1)}点</span>
              </div>
            </div>

            <div className="mt-6 p-3.5 bg-slate-50 rounded-2xl text-[11px] text-slate-500 leading-relaxed text-left w-full">
              <span className="font-bold text-slate-700 block mb-1">自己紹介/バイオ:</span>
              <p className="line-clamp-4">{formData.bio || "心理的安全性を大切にしています。"}</p>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">AIエージェント統合ステータス</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-500" />
                  自動感情スクリーニング
                </span>
                <span className="text-emerald-600 font-bold">有効</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <CalendarRange className="w-4 h-4 text-teal-500" />
                  カレンダー Tool Calling
                </span>
                <span className={formData.autoScheduleFollowUp ? "text-emerald-600 font-bold" : "text-slate-400 font-medium"}>
                  {formData.autoScheduleFollowUp ? "自動連携中" : "無効"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  アラートトリガー基準
                </span>
                <span className="text-slate-700 font-mono font-semibold">スコア &lt; {formData.alertThreshold}.0点</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Edit forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile form section */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-brand-500" />
              <h3 className="font-bold text-slate-800 text-sm">プロフィール情報</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">お名前</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                  placeholder="佐藤 健太"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">役職</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                  placeholder="チームマネージャー"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">メールアドレス</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-150 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                    placeholder="kenta.sato@example.com"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">所属部門</label>
                <div className="relative">
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-150 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                    placeholder="開発本部・エンジニアリング推進部"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">自己紹介・マネジメントバイオグラフィー</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-slate-50/50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all shadow-sm leading-relaxed"
                  placeholder="部下一人ひとりのコンディションを多角的に把握し、メンタルヘルス不調の早期検知に努めています。"
                />
              </div>
            </div>
          </div>

          {/* AI / 1on1 Preferences form section */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Settings className="w-5 h-5 text-teal-500" />
              <h3 className="font-bold text-slate-800 text-sm">1on1 多角分析AIエージェント設定</h3>
            </div>

            {/* Custom Interactive Presets */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">既定の1on1面談時間</label>
                <div className="grid grid-cols-3 gap-3">
                  {[30, 45, 60].map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => handleSelectDuration(dur)}
                      className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                        formData.defaultDuration === dur
                          ? "bg-brand-500 border-brand-600 text-white shadow-md shadow-brand-500/15"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dur} 分間</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert threshold slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">不調アラート検知しきい値</label>
                  <span className="text-xs font-bold text-rose-600">
                    メンタル健康スコアが {formData.alertThreshold}.0点 未満で検知
                  </span>
                </div>
                <div className="p-4 bg-slate-50/60 border border-slate-100 rounded-2xl flex items-center gap-4">
                  <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                  <input
                    type="range"
                    name="alertThreshold"
                    min="1"
                    max="8"
                    step="1"
                    value={formData.alertThreshold}
                    onChange={handleChange}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                  <span className="text-sm font-mono font-bold text-slate-700 shrink-0 w-8 text-right">
                    {formData.alertThreshold}.0点
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  ※ 1on1文字起こし完了後、臨床心理モデルで評価された部下のメンタルスコアがこのしきい値を下回った場合、ダッシュボード上に即座に重大アラートが発行され、自動的なフォローアップが促されます。
                </p>
              </div>

              {/* Toggle for Auto follow up toolcall */}
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between p-4 bg-slate-50/60 border border-slate-100 rounded-2xl">
                  <div className="space-y-0.5 max-w-[80%]">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
                      フォローアップ面談のAI自律仮押さえ (Tool Calling)
                    </span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      アラートが検出された場合、AIエージェントがカレンダーの空き枠を自動認識し、次回のフォロー面談スロットを自動的に仮確保します。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle("autoScheduleFollowUp")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.autoScheduleFollowUp ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.autoScheduleFollowUp ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Action */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/10 hover:shadow-brand-600/25 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>設定を保存する</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
