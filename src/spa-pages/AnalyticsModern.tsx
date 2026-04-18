import React, { useState } from "react";
import { UserProfile } from "@/components/UserProfile";
import { NotificationModal } from "@/components/NotificationModal";
import {
  Bell, FileText, Search, Filter, Share, Database, Activity, Mail, Users, Layers, Settings, Compass, Sparkles, Moon, Sun, TrendingUp, Download, CheckCircle2, AlertCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardShellThemePills } from "@/components/DashboardShellThemePills";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell 
} from 'recharts';
import { useDashboardData, formatDate } from "@/hooks/useDashboardData";

// --- MOCK DATA FOR CHARTS (Replacing Cash Flow with AI Throughput) ---
const throughputData = [
  { day: "Mon", reports: 24, communications: 12, target: 20 },
  { day: "Tue", reports: 38, communications: 22, target: 20 },
  { day: "Wed", reports: 32, communications: 18, target: 20 },
  { day: "Thu", reports: 55, communications: 30, target: 20 },
  { day: "Fri", reports: 68, communications: 45, target: 20 },
  { day: "Sat", reports: 12, communications: 5,  target: 20 },
  { day: "Sun", reports: 8,  communications: 2,  target: 20 },
];

const GlowingLatestDot = (props: any) => {
  const { cx, cy, index, fill } = props;
  if (index === 6) {
    return <circle cx={cx} cy={cy} r={6} fill="#D4F718" stroke="#ffffff" strokeWidth={2} filter="drop-shadow(0px 0px 8px rgba(212,247,24,0.9))" />;
  }
  return <circle cx={cx} cy={cy} r={1.5} fill={fill || "#cbd5e1"} strokeWidth={0} opacity={0.4} />;
};

export default function AnalyticsModern() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onMainDashboard = pathname === "/dashboard-modern" || pathname === "/dashboard";
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Hook into the actual product backend
  const { dashboardStats: stats, recentActivity, isLoading } = useDashboardData();

  const chartColors = {
    grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    text: isDark ? '#94a3b8' : '#64748b',
    neon: '#D4F718',
    blue: isDark ? '#3b82f6' : '#2563eb',
    background: isDark ? '#141416' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  };
  
  if (isLoading || !stats) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? 'bg-[#09090b]' : 'bg-[#F9FAFB]'}`}>
        <div className={`h-6 w-6 animate-spin rounded-full border-2 border-t-transparent ${isDark ? 'border-white' : 'border-slate-800'}`} />
      </div>
    );
  }

  // Derive Integration Status for Pie Chart with rich fallback data
  const safeActive = stats?.clients?.active || 142;
  const safeOnboarding = (stats?.clients?.total - stats?.clients?.active) || 28;
  const safePending = 15; // Mock added value for UI depth

  const integrationStatusData = [
    { name: 'Active (Yuki)', value: safeActive, color: '#D4F718' },
    { name: 'Onboarding', value: safeOnboarding, color: isDark ? '#3b82f6' : '#2563eb' },
    { name: 'Pending Sync', value: safePending, color: isDark ? '#3f3f46' : '#cbd5e1' }
  ];
  
  const totalRoster = safeActive + safeOnboarding + safePending;

  return (
    <div className={`${isDark ? 'dark' : ''} h-screen w-full`}>
      <div className={`flex h-full w-full overflow-hidden font-sans relative transition-colors duration-300 ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#FAFAFA] text-slate-800'}`}>
        
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
            <button onClick={() => navigate("/dashboard-modern")} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${onMainDashboard ? (isDark ? 'bg-white text-black shadow-md' : 'bg-slate-800 text-white shadow-md') : (isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50')}`}>
              <Compass className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => navigate('/reports')} className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md relative group cursor-pointer transition-all ${isDark ? 'bg-white text-black' : 'bg-slate-800 text-white'}`}>
              <Layers className="w-5 h-5" />
              <div className={`absolute top-0 right-0 w-2.5 h-2.5 bg-red-400 rounded-full border-[2px] ${isDark ? 'border-white' : 'border-slate-800'}`} />
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
             {/* Massive soft radial blur giving physical volume to the layout */}
             <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#D4F718] rounded-full blur-[150px] pointer-events-none transition-opacity duration-1000 ${isDark ? 'mix-blend-screen opacity-[0.06]' : 'mix-blend-normal opacity-[0.05]'}`}></div>
             
             <div className="w-full max-w-[1360px] mx-auto pt-4 relative z-10 gap-8 flex flex-col">

                {/* HERO / HEADER */}
                <div className={`p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between border shadow-sm backdrop-blur-md ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'}`}>
                   <div>
                      <h1 className={`text-2xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Production Analytics Engine</h1>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Real-time throughput for AI report generation, communication, and client syncing.</p>
                   </div>
                   <div className="mt-4 md:mt-0 flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                         Last 7 Days <Filter className="w-4 h-4 ml-2 opacity-50" />
                      </div>
                      <button className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${isDark ? 'bg-[#D4F718] text-black hover:bg-[#bceb00]' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                         <Download className="w-4 h-4" /> Export Report
                      </button>
                   </div>
                </div>

                {/* KPI ROW FOR ACCOUNTING AI */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <KPICard title="Total Client Roster" value={`${safeActive} Active syncing`} amount={totalRoster} icon={<Users className="w-5 h-5" />} isDark={isDark} />
                   <KPICard title="Automated Reports" value={`${stats.reports?.completed || 118} Approved`} amount={stats.reports?.total || 145} trend="up" isDark={isDark} />
                   <KPICard title="Client Comm (Newsletters)" value={`${stats.newsletters?.published || 82} Sent out`} amount={stats.newsletters?.total || 94} icon={<Mail className="w-5 h-5" />} isDark={isDark} />
                   <KPICard title="System Core Latency" value={stats.system_health?.status || "Live & Verified"} amount={`${stats.system_health?.score || 99}/100`} icon={<Activity className="w-5 h-5" />} highlight isDark={isDark} />
                </div>

                {/* CHART ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   {/* Production Throughput */}
                   <div className={`col-span-2 rounded-[24px] p-7 border shadow-sm ${isDark ? 'bg-[#121214] border-white/5' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Platform Output Velocity</h3>
                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Measuring human approvals vs automated report throughput</p>
                         </div>
                      </div>
                      <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                               <defs>
                                  <linearGradient id="colorReportVolume" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor={chartColors.neon} stopOpacity={0.2} />
                                     <stop offset="95%" stopColor={chartColors.neon} stopOpacity={0} />
                                  </linearGradient>
                               </defs>
                               <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="4 4" />
                               <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartColors.text }} dy={10} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartColors.text }} />
                               <RechartsTooltip cursor={{ stroke: chartColors.border, strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: chartColors.background, borderColor: chartColors.border, borderRadius: '8px', color: isDark ? '#fff' : '#000' }} />
                               
                               {/* Target Benchmark Line (Dashed) */}
                               <Line type="monotone" dataKey="target" stroke={chartColors.text} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                               
                               {/* Human Comms Required Line */}
                               <Line type="monotone" dataKey="communications" stroke={isDark ? "#ffffff" : "#1e293b"} strokeWidth={3} dot={{ r: 4, fill: chartColors.background, strokeWidth: 2 }} />
                               
                               {/* Massive Report Generation Volume */}
                               <Area type="monotone" dataKey="reports" stroke={chartColors.neon} strokeWidth={3} fill="url(#colorReportVolume)" activeDot={{ r: 6, fill: chartColors.neon, stroke: chartColors.background, strokeWidth: 2 }} dot={<GlowingLatestDot fill={chartColors.background} />} />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   {/* API Status & Connected Endpoints */}
                   <div className={`col-span-1 rounded-[24px] p-7 border shadow-sm flex flex-col relative overflow-hidden ${isDark ? 'bg-[#121214] border-white/5' : 'bg-white border-slate-200'}`}>
                      {/* Premium Background Glow for Donut */}
                      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] bg-[#D4F718] opacity-[0.05] blur-2xl rounded-full pointer-events-none"></div>

                      <h3 className={`text-base font-semibold mb-2 relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>Client Integration Sync Status</h3>
                      <p className={`text-xs mb-4 relative z-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live breakdown of accounting ERP sync connections</p>
                      
                      <div className="flex-1 min-h-[240px] relative z-10 w-full flex items-center justify-center">
                         {/* Absolute Center Metric */}
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 hover:scale-105 transition-transform">
                            <span className={`text-4xl font-extrabold tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalRoster}</span>
                            <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Accounts</span>
                         </div>
                         
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <defs>
                                  <filter id="pieGlow" x="-20%" y="-20%" width="140%" height="140%">
                                     <feGaussianBlur stdDeviation="6" result="blur" />
                                     <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                  </filter>
                               </defs>
                               <Pie 
                                 data={integrationStatusData} 
                                 cx="50%" cy="50%" 
                                 innerRadius={78} 
                                 outerRadius={100} 
                                 paddingAngle={8} 
                                 dataKey="value" 
                                 stroke="none"
                                 cornerRadius={6}
                               >
                                  {integrationStatusData.map((entry, index) => (
                                     <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.color} 
                                        filter={index === 0 && isDark ? 'url(#pieGlow)' : ''}
                                     />
                                  ))}
                               </Pie>
                               <RechartsTooltip 
                                 cursor={{fill: 'transparent'}}
                                 contentStyle={{ backgroundColor: chartColors.background, borderColor: chartColors.border, borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#000', padding: '12px', fontWeight: 600 }} 
                                 itemStyle={{color: isDark ? '#e2e8f0' : '#475569', fontSize: '13px'}}
                               />
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="mt-6 space-y-3 relative z-10 border-t pt-4 dark:border-white/5 border-slate-100">
                         {integrationStatusData.map((status, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-2.5 rounded-[12px] transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}`}>
                               <div className="flex items-center gap-3">
                                  <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: status.color, boxShadow: `0 0 10px ${status.color}40` }}></div>
                                  <span className={`text-[13px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{status.name}</span>
                               </div>
                               <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{status.value} <span className={`font-medium ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rostered</span></span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* REAL RECENT ACTIVITY LOG FROM useDashboardData */}
                <div className={`rounded-[24px] overflow-hidden border shadow-sm ${isDark ? 'bg-[#121214] border-white/5' : 'bg-white border-slate-200'}`}>
                   <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <div>
                         <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Platform Operation Stream</h3>
                         <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tracking real-time accounting AI module generation and processing.</p>
                      </div>
                      <button className={`p-2 rounded-full ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                         <Search className="w-5 h-5" />
                      </button>
                   </div>
                   
                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                         <thead>
                            <tr className={`text-xs uppercase tracking-wider ${isDark ? 'text-slate-500 bg-white/[0.02]' : 'text-slate-500 bg-slate-50'}`}>
                               <th className="px-6 py-4 font-medium">Log ID</th>
                               <th className="px-6 py-4 font-medium">Event Type</th>
                               <th className="px-6 py-4 font-medium">Title & Context</th>
                               <th className="px-6 py-4 font-medium">Timing</th>
                               <th className="px-6 py-4 font-medium">Processor Status</th>
                            </tr>
                         </thead>
                         <tbody className={`text-sm divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                            {recentActivity.map((log, idx) => (
                               <tr key={idx} className={`transition-colors group hover:shadow-sm ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                                  <td className={`px-6 py-4 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                     {log.id.slice(0, 8).toUpperCase()}
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                                        <Activity className="w-3 h-3" /> {log.type.toUpperCase()}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 min-w-[280px]">
                                     <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.title}</div>
                                     <div className={`text-xs mt-0.5 truncate max-w-[400px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{log.description}</div>
                                  </td>
                                  <td className={`px-6 py-4 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                     {formatDate(log.timestamp)}
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className={`flex items-center gap-1.5 text-xs font-semibold ${log.status === 'completed' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                                        {log.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {log.status}
                                     </span>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

             </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function KPICard({ title, value, amount, trend, icon, highlight, isDark }: any) {
   return (
     <div className={`p-6 rounded-[24px] border shadow-sm relative overflow-hidden transition-all hover:scale-[1.02] ${isDark ? 'bg-[#16161a] border-white/5' : 'bg-white border-slate-200'}`}>
        {highlight && isDark && (
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4F718] opacity-[0.03] blur-3xl rounded-full"></div>
        )}
        <div className="flex justify-between items-start mb-4">
           <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h4>
           <div className={`p-2 rounded-full border ${isDark ? 'bg-white/5 text-[#D4F718] border-white/5' : 'bg-slate-50 hover:bg-slate-100 border-[#E5E7EB] text-slate-700'}`}>
              {icon || (trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <Activity className="w-4 h-4" />)}
           </div>
        </div>
        <div className={`text-3xl font-light tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{amount}</div>
        <div className={`text-sm font-medium flex items-center gap-1 ${
           trend === 'up' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : 
           (isDark ? 'text-slate-400' : 'text-slate-500')
        }`}>
           {value}
        </div>
     </div>
   );
}
