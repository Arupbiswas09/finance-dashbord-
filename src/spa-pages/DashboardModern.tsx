import React, { useState } from "react";
import { UserProfile } from "@/components/UserProfile";
import { NotificationModal } from "@/components/NotificationModal";
import {
  Bell, FileText, Search, Filter, Calendar, Plus, Share, ChevronLeft, ArrowUpRight, BarChart2,
  MoreHorizontal, MessageSquare, LayoutGrid, Database, Activity, CheckCircle2, Mail, Users, Layers, Settings, Compass, Sparkles, Moon, Sun
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardShellThemePills } from "@/components/DashboardShellThemePills";
import { useDashboardData, formatDate, getActivityStatusDisplay } from "@/hooks/useDashboardData";
import {
  AreaChart, Area, BarChart, Bar, XAxis, ResponsiveContainer, Cell, CartesianGrid, Tooltip
} from "recharts";

// --- Original Helpers ---
function healthToneLabel(score: number): { label: string; chip: string } {
  if (score >= 80) return { label: "In good shape", chip: "Stable" };
  if (score >= 50) return { label: "Room to improve", chip: "Review" };
  return { label: "System is awaiting sync", chip: "Action Required" };
}

// --- Dynamic Tooltips mapping to real operational structures ---
const ActivityTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#D4F718] border border-[#BAE61A] text-slate-800 px-2.5 py-1 flex items-center justify-center rounded-[8px] shadow-md font-bold text-[11px] transform -translate-y-2">
        {payload[0].value.toLocaleString()} events
      </div>
    );
  }
  return null;
};

const ReportTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#D4F718] border border-[#BAE61A] text-slate-800 px-2.5 py-1 flex items-center justify-center rounded-[8px] shadow-md font-bold text-[11px] transform -translate-y-2">
        {payload[0].value.toLocaleString()} reports
      </div>
    );
  }
  return null;
};

const ClientTooltip = ({ active, payload, isDark }: any) => {
  if (active && payload && payload.length >= 2) {
    const prev = payload[0].value;
    const curr = payload[1].value;
    const diff = curr - prev;
    const pct = prev > 0 ? ((diff / prev) * 100).toFixed(0) : 0;
    return (
      <div className={`flex flex-col items-center border shadow-xl px-4 py-2.5 rounded-[16px] min-w-[80px] transform -translate-y-2 ${isDark ? 'bg-[#18181b] border-white/10' : 'bg-white border-slate-100'}`}>
         <div className={`w-8 h-8 ${diff >= 0 ? 'bg-[#D4F718]' : 'bg-red-400'} rounded-full flex items-center justify-center text-[10px] font-extrabold text-slate-900 mb-1.5`}>
            {diff > 0 ? '+' : ''}{pct}%
         </div>
         <span className={`text-[11px] font-bold tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{curr} <span className="opacity-30 font-light mx-1">vs</span> {prev}</span>
      </div>
    );
  }
  return null;
};

// --- Advanced Chart Components ---
const GlowingLatestDot = (props: any) => {
  const { cx, cy, index, stroke } = props;
  if (!cx || !cy) return null;
  if (index === 6) {
    return <circle cx={cx} cy={cy} r={6} fill="#D4F718" stroke="#ffffff" strokeWidth={2} filter="drop-shadow(0px 0px 10px rgba(212,247,24,0.9))" />;
  }
  return <circle cx={cx} cy={cy} r={4} fill="#ffffff" stroke={stroke || "#84cc16"} strokeWidth={1.5} />;
};

// --- Mock Data mapping structurally identical visual curves ---
const mockActivityBars = [
  { day: "Mon", value: 12 }, { day: "Tue", value: 18 }, { day: "Wed", value: 15 },
  { day: "Thu", value: 42 }, { day: "Fri", value: 65, highlight: true },
  { day: "Sat", value: 20 }, { day: "Sun", value: 14 }
];

const mockClientData = [
  { day: "Mon", current: 60, previous: 80 }, { day: "Tue", current: 80, previous: 90 },
  { day: "Wed", current: 150, previous: 110 }, { day: "Thu", current: 120, previous: 100 },
  { day: "Fri", current: 210, previous: 140 }, { day: "Sat", current: 180, previous: 150 },
  { day: "Sun", current: 160, previous: 120 }
];

const mockReportData = [
  { day: "Mon", current: 12 }, { day: "Tue", current: 11 }, { day: "Wed", current: 16 },
  { day: "Thu", current: 13 }, { day: "Fri", current: 34 }, { day: "Sat", current: 20 }, { day: "Sun", current: 21 }
];

const mockActivityFallback = [
  { id: 'm1', title: 'Q3 Financial Report Sync', description: 'Sync completed', type: 'system', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'completed' },
  { id: 'm2', title: 'Client Onboarding #402', description: 'Awaiting documents', type: 'email', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'pending' },
  { id: 'm3', title: 'Yuki Transaction Audit', description: 'Audit passed', type: 'yuki', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: 'completed' },
];

export default function DashboardModern() {
  const { dashboardStats, recentActivity, isLoading } = useDashboardData();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onMainDashboard = pathname === "/dashboard-modern" || pathname === "/dashboard";
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const healthScore = dashboardStats?.system_health.score ?? 0;
  const toneMeta = healthToneLabel(healthScore);
  const stats = dashboardStats;

  const displayActivity = recentActivity && recentActivity.length > 0 ? recentActivity : mockActivityFallback;
  const healthColor = healthScore >= 80 ? "#D4F718" : healthScore >= 50 ? "#3b82f6" : "#f59e0b";

  // Recharts Dynamic Palette Support
  const chartColors = {
    text: isDark ? '#64748b' : '#94a3b8',
    grid: isDark ? '#27272a' : '#e2e8f0',
    lineDark: isDark ? '#ffffff' : '#1f2937',
    lineLight: isDark ? '#3f3f46' : '#cbd5e1',
    barInactive: isDark ? '#27272a' : '#f1f5f9',
    neon: '#D4F718',
    dotFill: isDark ? '#121214' : '#ffffff'
  };

  if (isLoading || !stats) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? 'bg-black' : 'bg-[#F9FAFB]'}`}>
        <div className={`h-6 w-6 animate-spin rounded-full border-2 border-t-transparent ${isDark ? 'border-white' : 'border-slate-800'}`} />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'dark' : ''} h-screen w-full`}>
      <div className={`flex h-full w-full overflow-hidden font-sans relative transition-colors duration-300 ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#FAFAFA] text-slate-800'}`}>
        
        {/* ─── DEFINITIONS ─── */}
        <svg width="0" height="0" className="absolute z-[-1]">
          <defs>

            <pattern id="dotPatternPremium" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
               <circle cx="2" cy="2" r="1.5" fill="#BBF700" opacity={isDark ? "0.2" : "0.40"} />
            </pattern>
            <pattern id="stripePatternSubtle" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke={isDark ? "#3f3f46" : "#94a3b8"} strokeWidth="1" opacity={isDark ? "0.8" : "0.4"}/>
            </pattern>
          </defs>
        </svg>

        {/* ─── SIDEBAR ─── */}
        <div className={`w-[88px] h-full flex-shrink-0 flex flex-col items-center py-6 gap-6 z-50 relative transition-colors duration-300 ${isDark ? 'bg-[#0c0d10] border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.4)]' : 'bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.04)]'}`}>
          <div className="w-11 h-11 bg-[#D4F718] rounded-[14px] flex items-center justify-center mb-2 cursor-pointer shadow-[0_0_15px_rgba(212,247,24,0.3)]">
             <div className="grid grid-cols-2 gap-[3px]">
                <div className="w-2 h-2 rounded-[2px] bg-slate-900"></div>
                <div className="w-2 h-2 rounded-[2px] bg-slate-900 opacity-60"></div>
                <div className="w-2 h-2 rounded-[2px] bg-slate-900 opacity-60"></div>
                <div className="w-2 h-2 rounded-[2px] bg-slate-900 opacity-60"></div>
             </div>
          </div>
          
          <div className="flex flex-col gap-4 items-center w-full">
            <button onClick={() => navigate("/dashboard-modern")} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all relative group cursor-pointer ${onMainDashboard ? (isDark ? 'bg-white text-black shadow-md' : 'bg-slate-800 text-white shadow-md') : (isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50')}`}>
              <Compass className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className={`absolute top-0 right-0 w-2.5 h-2.5 bg-red-400 rounded-full border-[2px] ${isDark ? 'border-white' : 'border-slate-800'}`} />
            </button>
            <button onClick={() => navigate('/reports')} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Layers className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/newsletter')} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Mail className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/clients')} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Users className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/accounting-ai')} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isDark ? 'text-[#D4F718] hover:bg-white/5' : 'text-[#65A30D] hover:bg-slate-50'}`}>
              <Sparkles className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/integration')} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Database className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/settings')} className={`w-11 h-11 rounded-full flex items-center justify-center mt-auto mb-4 transition-colors ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center font-bold text-[13px] border cursor-pointer ${isDark ? 'bg-[#18181b] text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
            A
          </div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          
          <header className={`h-[80px] flex items-center justify-between px-8 shrink-0 border-b border-transparent`}>
            <DashboardShellThemePills isDark={isDark} />

            <div className="flex items-center gap-4">
              
              {/* DARK MODE TOGGLE */}
              <button 
                onClick={() => setIsDark(!isDark)} 
                className={`w-[36px] h-[36px] rounded-full flex items-center justify-center transition-colors border ${isDark ? 'bg-[#18181b] text-[#D4F718] border-white/10 hover:bg-white/10' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="flex -space-x-2 mr-1">
                 <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[10px] font-bold border-2 z-10 transition-colors ${isDark ? 'bg-blue-900/40 text-blue-400 border-[#09090b]' : 'bg-blue-50 text-blue-600 border-[#F3F4F6]'}`}>AJ</div>
                 <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[10px] font-bold border-2 z-20 transition-colors ${isDark ? 'bg-emerald-900/40 text-emerald-400 border-[#09090b]' : 'bg-emerald-50 text-emerald-600 border-[#F3F4F6]'}`}>MK</div>
              </div>
              
              <button className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors border ${isDark ? 'bg-[#18181b] text-slate-300 hover:bg-white/5 border-white/5' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}>
                <Share className="w-3.5 h-3.5" /> Shared
              </button>
              
              <button onClick={() => setNotifOpen(true)} className={`w-[36px] h-[36px] rounded-full flex items-center justify-center relative transition-colors border ${isDark ? 'bg-[#18181b] text-slate-300 hover:bg-white/5 border-white/5' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}>
                <Bell className="w-[16px] h-[16px]" strokeWidth={2} />
                <span className="absolute top-[8px] right-[8px] w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
              
              <div className={`w-[36px] h-[36px] rounded-full border flex flex-col items-center justify-center overflow-hidden transition-colors ${isDark ? 'border-white/10' : 'border-slate-200 bg-white'}`}>
                 <UserProfile />
              </div>
            </div>
          </header>

          <NotificationModal open={notifOpen} onOpenChange={setNotifOpen} />

          <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar relative">
             {/* Premium 1: Massive soft radial glow behind the main section */}
            <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#D4F718] rounded-full blur-[150px] pointer-events-none transition-opacity duration-1000 ${isDark ? 'mix-blend-screen opacity-[0.06]' : 'mix-blend-normal opacity-[0.05]'}`}></div>

            <div className="w-full max-w-[1360px] mx-auto pt-4 relative z-10">
              
              <div className="mb-6 relative z-10">
                <div className={`flex items-center gap-2 text-[12px] font-bold mb-5 tracking-wide uppercase ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                   <span className="flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5" /> Theme 1</span>
                   <span className={`font-light ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>/</span>
                   <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Workspace</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <button className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors ${isDark ? 'bg-[#18181b] text-slate-400 border-white/5 hover:bg-white/5' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                         <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h1 className={`text-[32px] sm:text-[38px] font-light tracking-tight leading-none mb-1 flex items-center gap-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                         AI Command Center
                         <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1.5 relative top-[-4px] border border-transparent shadow-sm ${isDark ? 'bg-[#D4F718]/10 border-[#D4F718]/20 text-[#D4F718]' : 'bg-[#f0fccb] border-[#d9f99d] text-slate-700'}`}>
                           <div className="w-1.5 h-1.5 rounded-full bg-[#D4F718] animate-pulse"></div>
                           Cortex Active
                         </span>
                      </h1>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-3 px-4 py-2 rounded-full ml-1 border shadow-sm transition-colors ${isDark ? 'bg-[#18181b] border-white/5' : 'bg-white border-slate-200'}`}>
                         <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-[#D4F718] text-black' : 'bg-slate-800 text-white'}`}>
                            <Calendar className="w-3 h-3" />
                         </div>
                         <div className={`flex items-center gap-2.5 text-[11px] font-bold tracking-wide transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <span>{formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).split(',')[0]}</span>
                            <span className={`font-light text-[10px] ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>|</span>
                            <span>{formatDate(new Date().toISOString()).split(',')[0]}</span>
                         </div>
                      </div>
                      <button onClick={() => navigate('/reports')} className={`px-5 py-2.5 rounded-full text-[12px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-2 ml-1 transition-colors ${isDark ? 'bg-[#D4F718] text-black hover:brightness-95' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                         <Plus className={`w-3.5 h-3.5 ${isDark ? 'text-slate-900' : 'text-[#D4F718]'}`} strokeWidth={3} /> Create a report
                      </button>
                   </div>
                </div>
              </div>

              {/* === SUBTLE HERO LAYER === */}
              <div className={`mb-6 flex flex-col sm:flex-row items-center justify-between p-4 px-6 rounded-[20px] border shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors ${isDark ? 'bg-[#18181b]/60 border-white/5 backdrop-blur-md' : 'bg-white border-slate-200'}`}>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#D4F718]/10 flex items-center justify-center text-[#9dbd00]">
                       <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                       <h2 className={`text-[14px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Your system is live & learning.</h2>
                       <p className={`text-[12px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cortex AI has successfully automated <span className={`font-bold ${isDark ? 'text-[#D4F718]' : 'text-indigo-600'}`}>182 tasks</span> this week.</p>
                    </div>
                 </div>
                 <button className={`mt-4 sm:mt-0 px-5 py-2 rounded-full text-[12px] font-bold transition-all border ${isDark ? 'bg-white/5 text-white hover:bg-white/10 border-white/10' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'}`}>
                    Review Actions
                 </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                
                {/* === LEFT COLUMN: AI Cortex Neural Engine === */}
                <div className="lg:col-span-3 flex flex-col">
                   <div className={`h-full min-h-[620px] rounded-[24px] p-6 relative overflow-hidden flex flex-col border shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1 ${isDark ? 'bg-[#090a0c] border-white/5 shadow-[inset_0_0_80px_rgba(212,247,24,0.03)]' : 'bg-gradient-to-b from-white to-[#FAFAFA] border-slate-100 shadow-[inset_0_0_80px_rgba(212,247,24,0.08)]'}`}>
                      
                      {/* Premium Animated Holographic Background */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[24px] z-0">
                         {/* Deep mesh gradient base */}
                         <div className={`absolute inset-0 opacity-40 transition-colors duration-1000 ${isDark ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#131b09] via-[#0c0d10] to-[#09090b]' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#f1fae1] via-[#f8fafc] to-white'}`} />
                         
                         {/* Floating dynamic glow orbs */}
                         <div className={`absolute -top-[20%] -left-[20%] w-[80%] h-[80%] rounded-full blur-[80px] opacity-40 animate-[float_12s_ease-in-out_infinite] mix-blend-screen transition-colors ${isDark ? 'bg-[#D4F718]/10' : 'bg-[#D4F718]/30'}`} />
                         <div className={`absolute -bottom-[20%] -right-[20%] w-[90%] h-[90%] rounded-full blur-[100px] opacity-30 animate-[float_16s_ease-in-out_infinite_reverse] mix-blend-screen transition-colors ${isDark ? 'bg-indigo-500/10' : 'bg-blue-300/20'}`} />
                         
                         {/* Subtle grid pattern for technical feel */}
                         <div className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] ${isDark ? 'opacity-100' : 'opacity-0'}`}></div>
                         <rect width="100%" height="100%" fill="url(#dotPatternPremium)" className={`absolute inset-0 mix-blend-overlay ${isDark ? 'opacity-40' : 'opacity-20'}`} />
                      </div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                         <div className="flex items-center justify-between z-20">
                            <h3 className={`text-[15px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Neural Cortex</h3>
                            <button className={`w-8 h-8 rounded-full backdrop-blur shadow-sm border flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white' : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800'}`}>
                               <Activity className="w-3 h-3" />
                            </button>
                         </div>
                         
                         {/* NEXT-GEN AI MOTION GRAPHIC CORE */}
                         <div className="flex flex-col items-center justify-center relative z-20 my-10 h-[190px]">
                             {/* Pulsing core glows */}
                             <div className="absolute w-[140px] h-[140px] rounded-full blur-[50px] bg-[#D4F718] opacity-20 animate-[pulse-glow_4s_ease-in-out_infinite]" />
                             <div className="absolute w-[80px] h-[80px] rounded-full blur-[30px] bg-emerald-400 opacity-20 animate-[pulse-glow_3s_ease-in-out_infinite_1s]" />
                             
                             {/* Rotating Orbital Armillary Rings */}
                             <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                                 {/* Outer faint tech ring */}
                                 <svg viewBox="0 0 100 100" className={`absolute w-full h-full animate-[spin-slow_24s_linear_infinite] ${isDark ? 'text-white/20' : 'text-slate-800/20'}`}>
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 4" />
                                    <circle cx="50" cy="2" r="1.5" fill="currentColor" />
                                    <circle cx="50" cy="98" r="1.5" fill="currentColor" />
                                 </svg>
                                 
                                 {/* Middle dashed rotating left */}
                                 <svg viewBox="0 0 100 100" className={`absolute w-[80%] h-[80%] animate-[spin-reverse_16s_linear_infinite] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="12 18" />
                                 </svg>

                                 {/* Inner aggressive power ring right */}
                                 <svg viewBox="0 0 100 100" className="absolute w-[60%] h-[60%] animate-[spin-slow_8s_linear_infinite] text-[#D4F718] drop-shadow-[0_0_8px_rgba(212,247,24,0.4)]">
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 40" strokeLinecap="round" />
                                 </svg>

                                 {/* Center Glass Hub */}
                                 <div className={`absolute flex flex-col items-center justify-center w-[110px] h-[110px] backdrop-blur-xl rounded-full border shadow-[inset_0_4px_20px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.2)] z-30 transition-colors ${isDark ? 'bg-black/70 border-[#D4F718]/30' : 'bg-white border-slate-200 shadow-xl'}`}>
                                   <div className="w-2.5 h-2.5 rounded-full bg-[#D4F718] animate-[pulse_1.5s_ease-in-out_infinite] mb-2 shadow-[0_0_12px_2px_rgba(212,247,24,0.6)]"></div>
                                   <span className={`text-[13px] font-extrabold uppercase tracking-widest leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>Connected</span>
                                   <span className={`text-[8px] font-bold mt-1 text-center px-4 leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Learning Model</span>
                                 </div>
                             </div>
                         </div>

                         {/* Meaningful AI Status Topology */}
                         <div className="flex-1 w-full px-2 mb-4 flex flex-col gap-3 relative z-20">
                             <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-[4px] h-[12px] rounded-full bg-emerald-400"></div>
                                  <span className={`text-[12px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Model Latency</span>
                                </div>
                                <span className={`text-[12px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>24ms</span>
                             </div>
                             <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-[4px] h-[12px] rounded-full bg-amber-400"></div>
                                  <span className={`text-[12px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Human Approvals</span>
                                </div>
                                <span className={`text-[12px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stats.newsletters.total - stats.newsletters.published || 0}</span>
                             </div>
                         </div>

                         <div className={`mt-auto backdrop-blur-2xl rounded-[24px] p-4 flex flex-col gap-4 border shadow-[0_8px_32px_rgba(0,0,0,0.04)] z-20 transition-colors ${isDark ? 'bg-[#18181b]/80 border-white/5' : 'bg-white/70 border-white'}`}>
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-3">
                                 <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-[#D4F718]/10 text-[#D4F718]' : 'bg-[#EBFBC5] text-slate-800'}`}>
                                    <Database className="w-4 h-4" />
                                 </div>
                                 <div className="pt-0.5">
                                    <h4 className={`text-[12px] font-bold leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>API Connections</h4>
                                    <p className={`text-[10px] font-medium leading-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live system sync status</p>
                                 </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 min-h-[110px]">
                               <div className={`flex-1 rounded-[18px] p-3.5 flex flex-col border shadow-sm relative overflow-hidden group transition-colors ${isDark ? 'bg-[#202024] border-white/5' : 'bg-white border-white'}`}>
                                 <div className="flex items-end gap-1.5 mb-4 z-10 relative">
                                    <span className={`text-[18px] font-medium leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>Yuki</span>
                                    <span className={`text-[9px] font-bold mb-[1px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{stats.integration.yuki_connected ? 'Active' : 'Setup'}</span>
                                 </div>
                                 <div className={`mt-auto h-[44px] w-full rounded-[10px] transition-colors relative z-10 ${stats.integration.yuki_connected ? 'bg-[#D4F718]' : isDark ? 'bg-[#2a2a30]' : 'bg-slate-100'}`}></div>
                               </div>
                               <div className={`flex-1 rounded-[18px] p-3.5 flex flex-col border shadow-sm relative overflow-hidden transition-colors ${isDark ? 'bg-[#202024] border-white/5' : 'bg-white border-white'}`}>
                                 <div className="flex items-end gap-1.5 mb-4 z-10 relative">
                                    <span className={`text-[18px] font-medium leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>Email</span>
                                    <span className={`text-[9px] font-bold mb-[1px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{stats.integration.email_connected ? 'Active' : 'Setup'}</span>
                                 </div>
                                 <div className={`mt-auto h-[44px] w-full rounded-[10px] flex items-end overflow-hidden transition-colors relative z-10 ${!stats.integration.email_connected ? (isDark ? 'bg-[#2a2a30]' : 'bg-slate-50') : (isDark ? 'bg-[#D4F718]/20' : 'bg-[#ecfccb]')}`}>
                                    {stats.integration.email_connected && <div className="h-[26px] w-full bg-[#D4F718] rounded-b-[10px]"></div>}
                                 </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* === MIDDLE COLUMN === */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                   
                   {/* Global Activity Flow */}
                   <div className={`rounded-[24px] p-7 flex flex-col h-[320px] relative border shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-colors ${isDark ? 'bg-[#141416] border-white/5' : 'bg-[#FAFAFA] border-white/80'}`}>
                      <div className="flex items-start justify-between mb-4">
                         <div>
                            <h3 className={`text-[15px] font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Activity This Week</h3>
                            <p className={`text-[12px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tasks successfully automated</p>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <button className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                               <Filter className="w-3.5 h-3.5" />
                            </button>
                         </div>
                      </div>
                      
                      <div className={`text-[44px] font-light tracking-tight leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {mockActivityBars.reduce((acc, curr) => acc + curr.value, 0)}
                      </div>
                      
                      <div className="flex-1 -mx-2 mt-auto relative z-10">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockActivityBars} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
                              <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="4 4" opacity={0.5} />
                              <Tooltip content={<ActivityTooltip />} cursor={{ fill: isDark ? '#ffffff' : '#000000', opacity: 0.05 }} />
                              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#475569', fontWeight: 600 }} dy={8} />
                              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={22}>
                                {mockActivityBars.map((entry, index) => (
                                  <Cell key={index} fill={entry.highlight ? chartColors.neon : chartColors.barInactive} className={`transition-all duration-300 ${entry.highlight ? 'hover:brightness-95' : (isDark ? 'hover:fill-[#3f3f46]' : 'hover:fill-[#e2e8f0]')}`} />
                                ))}
                              </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   {/* Report Output Volume */}
                   <div className={`rounded-[24px] p-7 pb-0 flex flex-col h-[300px] relative border shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-colors ${isDark ? 'bg-[#0f0f11] border-white/5' : 'bg-[#FCFCFC] border-slate-100'}`}>
                      <div className="flex items-start justify-between mb-2 relative z-10">
                         <div>
                            <h3 className={`text-[15px] font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Report Generation</h3>
                            <p className={`text-[12px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Intelligence engine output</p>
                         </div>
                         <button className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                             <ArrowUpRight className="w-3.5 h-3.5" />
                         </button>
                      </div>
                      
                      <div className="relative z-10 mb-3">
                        <div className={`text-[34px] font-light tracking-tight leading-none mb-1 flex items-start gap-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {stats.reports.total || 145}
                        </div>
                        <div className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stats.reports.completed || 118} reports auto-published</div>
                      </div>

                      <div className="flex-1 -mx-0 mt-auto relative z-0">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockReportData} margin={{ top: 10, right: 16, left: 16, bottom: 28 }}>
                               <defs>
                                 <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="0%" stopColor={isDark ? '#D4F718' : '#84cc16'} stopOpacity={isDark ? 0.22 : 0.30}/>
                                   <stop offset="100%" stopColor={isDark ? '#D4F718' : '#84cc16'} stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="4 4" opacity={0.6} />
                               <Tooltip content={<ReportTooltip />} cursor={{ stroke: chartColors.lineLight, strokeWidth: 1, strokeDasharray: '3 3' }} />
                               <XAxis 
                                 dataKey="day" 
                                 axisLine={false} 
                                 tickLine={false} 
                                 tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8', fontWeight: 600 }} 
                                 dy={12}
                                 interval={0}
                               />
                               
                               <Area 
                                 type="monotone" 
                                 dataKey="current" 
                                 stroke={isDark ? '#D4F718' : '#84cc16'}
                                 strokeWidth={2.5} 
                                 fill="url(#colorReport)" 
                                 activeDot={{ r: 6, fill: chartColors.neon, stroke: isDark ? '#09090b' : '#fff', strokeWidth: 2 }} 
                                 dot={<GlowingLatestDot fill={chartColors.lineDark} />} 
                               />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>

                {/* === RIGHT COLUMN === */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                   
                   {/* Client Base Growth */}
                   <div className={`rounded-[24px] p-7 pb-0 flex flex-col h-[320px] border shadow-[0_2px_10px_rgba(0,0,0,0.015)] relative transition-colors ${isDark ? 'bg-[#121214] border-white/5' : 'bg-white border-slate-100'}`}>
                      <div className="flex items-start justify-between mb-4 z-10 relative">
                         <div>
                            <h3 className={`text-[15px] font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Client Engagements</h3>
                            <p className={`text-[12px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active vs Total Roster</p>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-900 text-white'}`}>
                               <Filter className="w-3.5 h-3.5" />
                            </button>
                            <button className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                               <MoreHorizontal className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                      
                      <div className={`text-[44px] font-light tracking-tight leading-none mb-1 z-10 relative pl-1 flex items-baseline ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {stats.clients.total || 185}<span className={`text-[20px] font-medium relative ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>clients</span>
                      </div>
                      
                      <div className="flex-1 -mx-0 mt-2 relative z-0">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockClientData} margin={{ top: 10, right: 16, left: 16, bottom: 28 }}>
                              <defs>
                                <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                                  <line x1="0" y1="0" x2="0" y2="6" stroke={isDark ? '#D4F718' : '#84cc16'} strokeWidth="1" opacity={isDark ? 0.08 : 0.06} />
                                </pattern>
                                <linearGradient id="colorClient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={isDark ? '#D4F718' : '#84cc16'} stopOpacity={isDark ? 0.22 : 0.30}/>
                                  <stop offset="100%" stopColor={isDark ? '#D4F718' : '#84cc16'} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid vertical={true} horizontal={true} stroke={chartColors.grid} strokeDasharray="4 4" opacity={isDark ? 0.4 : 0.6} verticalFill={isDark ? ['#ffffff00', '#ffffff02'] : ['#00000000', '#00000003']} />
                              <Tooltip content={<ClientTooltip isDark={isDark} />} cursor={{ stroke: isDark ? '#3f3f46' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                              <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8', fontWeight: 600 }} 
                                dy={12}
                                interval={0}
                              />
                              
                              <Area type="monotone" dataKey="previous" stroke={isDark ? '#52525b' : '#cbd5e1'} strokeDasharray="4 4" strokeWidth={1.5} fill="none" activeDot={false} dot={<GlowingLatestDot stroke={isDark ? '#52525b' : '#cbd5e1'} />} />
                              <Area type="monotone" dataKey="current" stroke={isDark ? '#D4F718' : '#84cc16'} strokeWidth={2.5} fill="url(#colorClient)" activeDot={{ r: 6, fill: chartColors.neon, stroke: isDark ? '#09090b' : '#fff', strokeWidth: 2 }} dot={<GlowingLatestDot stroke={isDark ? '#D4F718' : '#84cc16'} />} />
                              <Area type="monotone" dataKey="current" stroke="none" fill="url(#diagonalHatch)" activeDot={false} dot={false} />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>


                   {/* Newsletter Coverage */}
                   <div className={`rounded-[24px] p-7 flex flex-col h-[276px] border shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative transition-colors ${isDark ? 'bg-[#101012] border-white/5' : 'bg-[#FAFAFA] border-white/60'}`}>
                      <div className="flex items-start justify-between mb-8">
                         <h3 className={`text-[15px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Newsletter Synthesis</h3>
                         <button className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                            <ArrowUpRight className="w-3.5 h-3.5"/>
                         </button>
                      </div>
                      
                      <div className="mt-8">
                         <p className={`text-[12px] font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Generated Content Reach</p>
                         <div className={`text-[34px] font-light tracking-tight leading-none flex items-start gap-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                           {stats.newsletters.total || 0} <span className={`text-[16px] font-medium mt-1.5 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>campaigns drafted</span>
                         </div>
                         <div className={`text-[11px] font-semibold mt-1.5 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stats.newsletters.published || 0} issues successfully dispatched</div>
                      </div>
                   </div>

                </div>              
              </div>

              {/* ─── AI LOG PROTOCOL FULL WIDTH DATA TABLE ─── */}
              <div className={`mt-2 rounded-[24px] p-8 border shadow-[0_8px_30px_rgba(0,0,0,0.03)] mb-8 transition-colors ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'}`}>
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                       <h3 className={`text-[15px] font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Cortex Event Protocol</h3>
                       <p className={`text-[12px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Historical audit of AI subsystem records.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-2 w-[280px] relative">
                         <Search className={`w-4 h-4 absolute left-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                         <input 
                           type="text" 
                           placeholder="Search logs & descriptions..." 
                           className={`w-full pl-10 pr-4 py-2 border rounded-[12px] text-[12px] font-semibold focus:outline-none transition-all shadow-inner placeholder:transition-colors ${isDark ? 'bg-[#18181b] border-white/5 text-white placeholder-slate-600 hover:bg-[#202024]' : 'bg-[#F8FAFC] border-slate-200 text-slate-800 placeholder:text-slate-400 hover:bg-slate-100'}`} 
                         />
                       </div>
                    </div>
                 </div>

                 {displayActivity.length > 0 && (
                    <div className={`overflow-x-visible rounded-[16px] mt-2 transition-colors`}>
                      <table className="w-full text-left font-sans border-collapse">
                        <thead className={`text-[10px] font-bold uppercase tracking-widest border-b transition-colors ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                          <tr>
                            <th className="py-4 pl-6 font-bold pb-5">Record Identifier</th>
                            <th className="py-4 font-bold pb-5">Source Category</th>
                            <th className="py-4 text-right pr-6 font-bold pb-5">Status Marker</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y transition-colors ${isDark ? 'divide-white/5 bg-transparent' : 'divide-slate-50 bg-transparent'}`}>
                          {displayActivity.map(a => {
                            const RowIcon = a.type === 'system' ? Settings : a.type === 'email' ? Mail : a.type === 'report' ? FileText : Database;
                            return (
                            <tr key={a.id} className={`transition-all duration-300 group cursor-pointer relative z-0 hover:z-10 hover:scale-[1.005] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${isDark ? 'hover:bg-[#1a1a20]' : 'hover:bg-white'}`}>
                              <td className="py-5 pl-4 flex items-center gap-4 rounded-l-[16px]">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${isDark ? 'bg-[#1e1e24] border-white/5 text-slate-400 group-hover:text-[#D4F718] group-hover:bg-[#D4F718]/10 group-hover:border-[#D4F718]/20' : 'bg-slate-50 border-slate-100 text-slate-500 group-hover:bg-[#D4F718]/10 group-hover:text-black group-hover:border-[#D4F718]/30'} transition-all`}>
                                   <RowIcon className="w-4 h-4" />
                                </div>
                                <div>
                                   <p className={`text-[13px] font-bold transition-colors mb-0.5 ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-800'}`}>{a.title}</p>
                                   <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-400'}`}>{formatDate(a.timestamp)}</p>
                                </div>
                              </td>
                              <td className="py-5">
                                <span className={`inline-flex items-center text-[10px] font-bold px-3 py-1.5 rounded-md border shadow-sm uppercase tracking-widest transition-colors ${isDark ? 'bg-[#18181b] text-slate-400 border-white/10 group-hover:border-white/20' : 'bg-white text-slate-500 border-slate-200'}`}>
                                  {a.type}
                                </span>
                              </td>
                              <td className="py-5 text-right pr-6 uppercase tracking-widest rounded-r-[16px]">
                                <span className={`inline-flex items-center gap-2.5 text-[10px] font-bold ${a.status === 'completed' ? (isDark ? 'text-white' : 'text-slate-800') : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
                                  <div className={`w-2 h-2 rounded-full shadow-sm ${a.status === 'completed' ? 'bg-[#D4F718] border border-[#BAE61A] animate-pulse' : (isDark ? 'bg-[#27272a] border-white/10' : 'bg-slate-200 border-slate-300')}`} />
                                  {getActivityStatusDisplay(a)}
                                </span>
                              </td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                 )}
              </div>

            </div>
          </div>
          
        </main>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(203, 213, 225, 0.4); border-radius: 20px; }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(203, 213, 225, 0.8); }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); }
          .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.2); }
          
          /* Premium AI Motion Graphics Keyframes */
          @keyframes spin-slow {
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            100% { transform: rotate(-360deg); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.08); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            33% { transform: translateY(-15px) translateX(10px); }
            66% { transform: translateY(10px) translateX(-15px); }
          }
        `}</style>
      </div>
    </div>
  );
}
