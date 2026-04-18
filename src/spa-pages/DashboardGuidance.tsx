import React, { useState, useEffect, useMemo } from "react";
import { UserProfile } from "@/components/UserProfile";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import { NotificationModal } from "@/components/NotificationModal";
import {
  Bell, BarChart2, Users, Mail, Settings, Activity, ChevronRight, Sparkles, Clock, Search, ArrowUpRight, TrendingUp, Filter, MessageSquare, Plus, FileText, Share, ArrowLeft, LayoutDashboard, Database, CheckCircle2, ChevronDown, Grid, Star, Compass, Layers, PieChart, BookOpen, Hexagon
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardShellThemePills } from "@/components/DashboardShellThemePills";
import { motion, useMotionValue, animate, useReducedMotion } from "framer-motion";
import {
  useDashboardData, formatDate, getActivityTypeLabel, getActivityStatusDisplay, type DashboardStats
} from "@/hooks/useDashboardData";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell, TooltipProps, ComposedChart
} from "recharts";

// --- Original Helpers ---
function healthToneLabel(score: number): { label: string; chip: string } {
  if (score >= 80) return { label: "In good shape", chip: "Stable" };
  if (score >= 50) return { label: "Room to improve", chip: "Review" };
  return { label: "System is awaiting your first sync", chip: "Action Required" };
}

function integrationsReady(stats: DashboardStats | null): boolean {
  if (!stats) return false;
  return stats.integration.yuki_connected && stats.integration.email_connected;
}

function buildPriorityAlerts(stats: DashboardStats | null) {
  const alerts: { id: string; message: string; tone: "neutral" | "warning" }[] = [];
  if (!stats) return alerts;
  if (integrationsReady(stats) && stats.reports.total === 0) {
    alerts.push({ id: "reports", message: "No reports yet — generate one to capture activity.", tone: "neutral" });
  }
  return alerts.slice(0, 3);
}

function primaryCta(stats: DashboardStats | null): { label: string; path: string } {
  if (!stats) return { label: "Connect integrations", path: "/integration" };
  if (!integrationsReady(stats)) return { label: "Connect integrations", path: "/integration" };
  if (stats.reports.total === 0) return { label: "Generate your first report", path: "/reports" };
  return { label: "Open reports", path: "/reports" };
}

function heroHeadline(stats: DashboardStats | null): string {
  if (!stats || !integrationsReady(stats)) return "Your data pipeline needs setup";
  if (stats.reports.total === 0) return "You're connected — time to report";
  if (stats.reports.total > 0 && stats.newsletters.total === 0) return "Reports are live — keep clients updated";
  return "Your workspace at a glance";
}

function heroSupportingLine(stats: DashboardStats | null): string | null {
  if (!stats || !integrationsReady(stats)) return "Link Yuki and email once — reporting, activity, and AI read from that data.";
  if (stats.reports.total === 0) return "Turn synced balances into a shareable report.";
  if (stats.reports.total > 0 && stats.newsletters.total === 0) return "Optional: brief client updates after milestones.";
  return null;
}

function recommendationAction(stats: DashboardStats | null): { label: string; path: string } {
  if (!stats || !integrationsReady(stats)) return { label: "Start setup", path: "/integration" };
  if (stats.reports.total === 0) return { label: "Start a report", path: "/reports" };
  if (stats.reports.total > 0 && stats.newsletters.total === 0) return { label: "Draft a newsletter", path: "/newsletter" };
  if (stats.clients.active === 0 && stats.clients.total > 0) return { label: "Manage clients", path: "/clients" };
  return { label: "Open AI assistant", path: "/accounting-ai" };
}

function contextualInsight(stats: DashboardStats | null): string {
  if (!stats) return "This panel shows the next step once your workspace has loaded.";
  const yuki = stats.integration.yuki_connected;
  const email = stats.integration.email_connected;
  if (!yuki || !email) return "We found 4 historical reports in your email. Connect Yuki to sync them.";
  if (stats.reports.total === 0 && stats.clients.total > 0) return "Generate a report next to anchor recent work and client context.";
  if (stats.reports.total === 0) return "Create a first report — activity and insights populate from the same ledger.";
  if (stats.reports.total > 0 && stats.newsletters.total === 0) return "Newsletters can follow report milestones without extra meetings.";
  if (stats.clients.active === 0 && stats.clients.total > 0) return "Mark active clients so priorities match who you serve this month.";
  return "Accounting AI reads the same synced figures as your saved reports.";
}

// --- Custom Reusable Components implementing global style rules ---
const CardContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("rounded-[24px] bg-white border border-[#E5E7EB] shadow-none p-6 flex flex-col relative overflow-hidden", className)}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, trailing }: { children: React.ReactNode, trailing?: React.ReactNode }) => (
  <div className="flex items-start justify-between mb-4 z-20">
    <h3 className="text-[14px] font-semibold text-slate-600">{children}</h3>
    {trailing && <div className="ml-4 flex-shrink-0">{trailing}</div>}
  </div>
);

const DateRangeSelector = () => (
  <button className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 rounded-md px-2 py-1 hover:bg-slate-50 flex items-center gap-1 shadow-sm transition-colors">
    LAST 7 DAYS <ChevronDown className="w-3 h-3 text-slate-400" />
  </button>
);


// --- Aesthetic Mock Datasets for the highly dense grid ---
const aestheticActivityData = [
  { day: "Mon", metrics: 124, baseline: 80 }, { day: "Tue", metrics: 108, baseline: 95 }, 
  { day: "Wed", metrics: 165, baseline: 110 }, { day: "Thu", metrics: 130, baseline: 105 }, 
  { day: "Fri", metrics: 215, baseline: 125, isMax: true }, { day: "Sat", metrics: 180, baseline: 135 }, 
  { day: "Sun", metrics: 155, baseline: 115 }
];

const mockSpendData = [
  { day: "Mon", current: 432, previous: 310 }, { day: "Tue", current: 410, previous: 280 }, { day: "Wed", current: 480, previous: 350 },
  { day: "Thu", current: 380, previous: 310 }, { day: "Fri", current: 590, previous: 450, isMax: true }, { day: "Sat", current: 520, previous: 380 }, { day: "Sun", current: 490, previous: 420 }
];

const mockAssetData = [
  { name: 'USD Core', value: 45, fill: '#1e293b' },
  { name: 'Euro', value: 25, fill: '#64748b' },
  { name: 'Stablecoin', value: 20, fill: '#cbd5e1' },
  { name: 'Volatile', value: 10, fill: '#D4F718' },
];

const mockActivityFallback = [
  { id: 'm1', title: 'Stripe Payout: €450.00', type: 'system', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'completed' },
  { id: 'm2', title: 'Invoice #402', type: 'email', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'pending' },
  { id: 'm3', title: 'Q3 Financial Report Sync', type: 'yuki', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: 'completed' },
  { id: 'm4', title: 'Ledger Audit Generated', type: 'yuki', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'completed' },
];

const mockActivityBars = [
  { day: "Mon", value: 35, fill: "#f1f5f9" }, { day: "Tue", value: 65, fill: "#f1f5f9" }, { day: "Wed", value: 45, fill: "#f1f5f9" },
  { day: "Thu", value: 210, fill: "#D4F718" }, { day: "Fri", value: 130, fill: "#f1f5f9" }, { day: "Sat", value: 90, fill: "#f1f5f9" }, 
  { day: "Sun", value: 85, fill: "#f1f5f9" }
];

export default function DashboardGuidance() {
  const { dashboardStats, recentActivity, isLoading } = useDashboardData();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onMainDashboard = pathname === "/dashboard-modern" || pathname === "/dashboard";
  const [notifOpen, setNotifOpen] = useState(false);

  // Hook processing
  const alerts = useMemo(() => buildPriorityAlerts(dashboardStats), [dashboardStats]);
  const cta = useMemo(() => primaryCta(dashboardStats), [dashboardStats]);
  const headline = useMemo(() => heroHeadline(dashboardStats), [dashboardStats]);
  const heroLine = useMemo(() => heroSupportingLine(dashboardStats), [dashboardStats]);
  const mainInsight = useMemo(() => contextualInsight(dashboardStats), [dashboardStats]);
  
  const healthScore = dashboardStats?.system_health.score ?? 0;
  const toneMeta = healthToneLabel(healthScore);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-slate-800" />
      </div>
    );
  }

  const stats = dashboardStats!;
  const rawStatus = stats.system_health.status?.trim().toLowerCase() || "operational";
  const displayStatus = rawStatus.includes('needs_attention') || rawStatus.includes('needs attention') ? 'requiring attention' : rawStatus;
  
  const displayActivity = recentActivity && recentActivity.length > 0 ? recentActivity : mockActivityFallback;
  
  const healthColor = healthScore >= 80 ? "#D4F718" : healthScore >= 50 ? "#3b82f6" : "#f59e0b"; // 3b82f6 is blue in-progress color

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] overflow-hidden text-slate-800 font-sans selection:bg-[#D4F718] selection:text-black">
      
      {/* ─── SVG DEFINITIONS FOR CHARTS ─── */}
      <svg width="0" height="0" className="absolute z-[-1]">
        <defs>
          <pattern id="diagonalStripes" width="7" height="7" patternTransform="rotate(45)">
            <path d="M0,7 L7,0" stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.8" />
          </pattern>
        </defs>
      </svg>

      {/* ─── FIXED SIDEBAR WITH LABELS ─── */}
      <div className="relative w-[88px] h-full flex-shrink-0 z-50">
        <aside className="absolute top-0 left-0 h-full w-[88px] overflow-y-auto overflow-x-hidden flex flex-col py-6 border-r border-[#E2E8F0] shadow-[2px_0_12px_rgba(0,0,0,0.02)] bg-white">
          <div className="flex flex-col items-center mb-8 shrink-0">
            <div className="w-[52px] h-[52px] bg-slate-900 rounded-2xl flex items-center justify-center text-[#D4F718] shadow-md shrink-0">
              <Hexagon className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="flex flex-col gap-1 w-full px-2 pb-6">
            {/* Active route representation */}
            <button
              onClick={() => navigate("/dashboard-modern")}
              className={cn(
                "w-full h-[60px] rounded-xl flex flex-col items-center justify-center transition-all group shrink-0",
                onMainDashboard
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Compass className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="font-semibold text-[10px] tracking-wide">Dash</span>
            </button>
            <button onClick={() => navigate("/reports")} className="w-full h-[60px] rounded-xl bg-transparent text-slate-500 flex flex-col items-center justify-center transition-all hover:bg-slate-50 hover:text-slate-900 group shrink-0 mt-1">
              <Layers className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="font-semibold text-[10px] tracking-wide">Reports</span>
            </button>
            <button onClick={() => navigate("/newsletter")} className="w-full h-[60px] rounded-xl bg-transparent text-slate-500 flex flex-col items-center justify-center transition-all hover:bg-slate-50 hover:text-slate-900 group shrink-0 mt-1">
              <Mail className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="font-semibold text-[10px] tracking-wide">Publish</span>
            </button>
            <button onClick={() => navigate("/invoices")} className="w-full h-[60px] rounded-xl bg-transparent text-slate-500 flex flex-col items-center justify-center transition-all hover:bg-slate-50 hover:text-slate-900 group shrink-0 mt-1">
              <FileText className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="font-semibold text-[10px] tracking-wide">Invoices</span>
            </button>
            <button onClick={() => navigate("/clients")} className="w-full h-[60px] rounded-xl bg-transparent text-slate-500 flex flex-col items-center justify-center transition-all hover:bg-slate-50 hover:text-slate-900 group shrink-0 mt-1">
              <Users className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="font-semibold text-[10px] tracking-wide">Clients</span>
            </button>
            <button onClick={() => navigate("/accounting-ai")} className="w-full h-[60px] rounded-xl bg-transparent text-slate-500 flex flex-col items-center justify-center transition-all hover:bg-slate-50 hover:text-slate-900 group shrink-0 mt-1 relative">
              <Sparkles className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-[#65A30D]" strokeWidth={1.5} />
              <span className="font-semibold text-[10px] tracking-wide text-slate-700">AI Hub</span>
            </button>
            <button onClick={() => navigate("/integration")} className="w-full h-[60px] rounded-xl bg-transparent text-slate-500 flex flex-col items-center justify-center transition-all hover:bg-slate-50 hover:text-slate-900 group shrink-0 mt-1">
              <Database className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="font-semibold text-[10px] tracking-wide">System</span>
            </button>
            
            <div className="w-10 mx-auto border-t border-slate-200/80 my-2" />
            
            <button onClick={() => navigate("/settings")} className="w-full h-[60px] rounded-xl bg-transparent text-slate-500 flex flex-col items-center justify-center transition-all hover:bg-slate-50 hover:text-slate-900 group shrink-0 mt-1">
              <Settings className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="font-semibold text-[10px] tracking-wide">Config</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col relative bg-[#F8F9FA]">

        {/* TOP NAVIGATION HEADER — theme switcher aligned with Dashboard / Theme 2 / Theme 3 */}
        <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 pr-8 pl-6 py-6 bg-transparent">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <DashboardShellThemePills />
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Theme 3</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 normal-case font-semibold tracking-normal">Guidance</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <LanguageChangeDropdown />
            <button
              onClick={() => setNotifOpen(true)}
              className="relative flex h-11 pl-4 pr-3 items-center justify-center gap-2 rounded-full border border-[#EAEAEA] bg-white text-slate-600 transition-all hover:text-slate-900 shadow-none hover:bg-slate-50"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {alerts.length > 0 ? (
                <span className="bg-[#D4F718] text-slate-900 border border-[#BAE61A] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {alerts.length} Issue{alerts.length > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-slate-300 ring-2 ring-white" />
              )}
            </button>
            <div className="w-11 h-11 rounded-full border border-[#EAEAEA] shadow-none overflow-hidden bg-white">
              <UserProfile />
            </div>
          </div>
        </header>

        <NotificationModal open={notifOpen} onOpenChange={setNotifOpen} />

        {/* MAIN PAGE METRICS */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar flex justify-center">
          <div className="w-full max-w-[1400px]">
            
            {/* Header / Primary Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-10 pl-1">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[34px] font-semibold tracking-tight text-slate-900"
                >
                  {headline}
                </motion.h1>
                {heroLine && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-[14px] text-slate-500 mt-2 font-medium">
                    {heroLine}
                  </motion.p>
                )}
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                {/* ONE PRIMARY ACTION VISIBLE */}
                <button
                  onClick={() => navigate(cta.path)}
                  className="px-8 py-3.5 rounded-full bg-slate-900 border border-slate-900 text-white text-[14px] font-bold shadow-none hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> {cta.label}
                </button>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* == LEFT COLUMN (Readiness & Integration) == */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-4 flex flex-col gap-8">
                
                <CardContainer>
                  <CardTitle>Workspace Readiness</CardTitle>
                  
                  {/* Visual Identifier Graphic border tightened */}
                  <div className="mb-8 mt-2 relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-slate-50 flex items-center justify-center p-6 h-[180px] shadow-none">
                     <svg viewBox="0 0 36 36" className="w-[110px] h-[110px] -rotate-90 relative z-10">
                        <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path stroke={healthColor} strokeDasharray={`${healthScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeLinecap="round" />
                     </svg>
                     <span className="absolute text-[32px] font-light text-slate-800 tracking-tighter">{healthScore}</span>
                  </div>

                  <p className="text-[14px] font-semibold text-slate-900">{toneMeta.label}</p>
                  <p className="text-[13px] text-slate-500 font-medium mt-1 mb-6">System is {displayStatus}</p>

                  <div className="flex flex-col gap-0 border-t border-[#EAEAEA] pt-4">
                    {/* Demoted Integrations to Ghost / Text Actions */}
                    <div className="flex items-center justify-between py-3 group">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100">
                            {stats.integration.yuki_connected ? <CheckCircle2 className="w-[16px] h-[16px] text-[#65A30D]" strokeWidth={2} /> : <Activity className="w-[16px] h-[16px] text-slate-400 group-hover:text-amber-500 transition-colors" strokeWidth={1.5} />}
                         </div>
                         <div>
                           <h4 className="text-[13px] font-bold text-slate-900">Yuki Sync</h4>
                           <p className="text-[11px] text-slate-500 font-medium">{stats.integration.yuki_connected ? 'Active structure' : 'Awaiting sync action'}</p>
                         </div>
                      </div>
                      <button className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-[#65A30D] transition-colors bg-transparent border-none p-0 inline-flex items-center underline decoration-transparent hover:decoration-[#65A30D] underline-offset-4">
                        {stats.integration.yuki_connected ? 'Manage' : 'Connect'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 group">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100">
                            {stats.integration.email_connected ? <CheckCircle2 className="w-[16px] h-[16px] text-[#65A30D]" strokeWidth={2} /> : <Mail className="w-[16px] h-[16px] text-slate-400 group-hover:text-amber-500 transition-colors" strokeWidth={1.5} />}
                         </div>
                         <div>
                           <h4 className="text-[13px] font-bold text-slate-900">Email Gateway</h4>
                           <p className="text-[11px] text-slate-500 font-medium">{stats.integration.email_connected ? 'Connected securely' : 'Setup required'}</p>
                         </div>
                      </div>
                      <button className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-[#65A30D] transition-colors bg-transparent border-none p-0 inline-flex items-center underline decoration-transparent hover:decoration-[#65A30D] underline-offset-4">
                        {stats.integration.email_connected ? 'Options' : 'Setup now'}
                      </button>
                    </div>
                  </div>
                </CardContainer>
              </motion.div>

              {/* == RIGHT DATA GRID (Span 8) == */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                
                {/* UP ROW */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                   
                   {/* Activity Bar Chart (Scaled Numerics) */}
                   <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                     <CardContainer className="h-[360px]">
                        <CardTitle trailing={<DateRangeSelector />}>Activity Focus</CardTitle>
                        
                        <div className="mb-6 z-20 relative">
                          <div className="text-[52px] font-light text-slate-900 tracking-[-0.04em] leading-[1] mt-1 pl-1 drop-shadow-sm">186</div>
                          <p className="text-[12px] text-slate-400 mt-1.5 font-normal">Recorded actions worked this week</p>
                        </div>
                        
                        <div className="flex-1 relative z-20">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockActivityBars} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={45} />
                              <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', fontWeight: 'bold' }} />
                              <Bar dataKey="value" radius={[8, 8, 4, 4]} barSize={16}>
                                {mockActivityBars.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                     </CardContainer>
                   </motion.div>
                   
                   {/* Comparison Area Chart */}
                   <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                     <CardContainer className="h-[360px]">
                        <CardTitle trailing={<DateRangeSelector />}>Revenue Variance</CardTitle>
                        
                        <div className="flex items-center gap-4 mt-2 -mb-2 relative z-20">
                           <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#D4F718]" />
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Revenue</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Baseline</span>
                           </div>
                        </div>

                        <div className="mb-4 z-20 relative mt-4">
                          <div className="text-[52px] font-light text-slate-900 tracking-[-0.04em] leading-[1] mt-1 pl-1">29.48<span className="text-[28px] text-slate-400 font-medium relative -top-3">m</span></div>
                          <p className="text-[12px] text-slate-400 mt-1.5 font-normal">Gross aggregate volume over benchmark</p>
                        </div>
                        
                        <div className="flex-1 relative z-20 -ml-2 -mb-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={aestheticActivityData} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                              <defs>
                                 <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="0%" stopColor="#D4F718" stopOpacity={0.25} />
                                   <stop offset="100%" stopColor="#D4F718" stopOpacity={0} />
                                 </linearGradient>
                                 <linearGradient id="baselineArea" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.06} />
                                   <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                                 </linearGradient>
                              </defs>
                              
                              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                              <YAxis hide />
                              <RechartsTooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none', fontSize:'13px', fontWeight: 600, padding: '10px 14px' }} />
                              
                              <Area type="natural" dataKey="baseline" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#baselineArea)" activeDot={false} dot={false} />
                              <Area type="natural" dataKey="metrics" stroke="#D4F718" strokeWidth={2.5} fill="url(#revenueArea)" activeDot={{ r: 5, fill: "#1e293b", stroke: "#D4F718", strokeWidth: 2 }} dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContainer>
                    </motion.div>
                </div>

                {/* BOTTOM ROW */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                   {/* Total Spend */}
                   <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                     <CardContainer className="h-[280px]">
                        <CardTitle trailing={<DateRangeSelector />}>Total Spend Ledger</CardTitle>
                        
                        <div className="flex items-center gap-4 mt-2 -mb-2 relative z-20">
                           <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#1e293b]" />
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Current</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Previous</span>
                           </div>
                        </div>

                        <div className="flex justify-between items-start mb-2 relative z-20 mt-4">
                          <div>
                            <div className="text-[42px] font-light text-slate-900 tracking-[-0.04em] leading-[1] pl-1 drop-shadow-sm">$278.86</div>
                            <p className="text-[12px] text-slate-400 mt-1.5 font-normal">Aggregated weekly debit volume</p>
                          </div>
                        </div>
                        
                        <div className="flex-1 relative mt-2 -ml-3 -mb-3 z-20">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={mockSpendData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                                <defs>
                                   <linearGradient id="spendArea" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="0%" stopColor="#0f172a" stopOpacity={0.12} />
                                     <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
                                   </linearGradient>
                                </defs>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                <YAxis hide />
                                <RechartsTooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: 'none' }} />
                                <Area type="monotone" dataKey="previous" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" dot={false} activeDot={false} />
                                <Area type="monotone" dataKey="current" stroke="#0f172a" strokeWidth={2} fill="url(#spendArea)" dot={false} activeDot={{ r: 5, fill: "#D4F718", stroke: "#0f172a", strokeWidth: 2 }} />
                             </AreaChart>
                          </ResponsiveContainer>
                        </div>
                     </CardContainer>
                   </motion.div>

                   {/* Asset Split Pie */}
                   <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                     <CardContainer className="h-[280px]">
                        <CardTitle>Virtual Liquidity</CardTitle>
                        
                        <div className="flex-1 flex items-center justify-between gap-8 h-full z-20">
                           <div className="relative w-[45%] h-[140px] shrink-0">
                             <ResponsiveContainer width="100%" height="100%">
                               <RechartsPieChart>
                                 <Pie data={mockAssetData} innerRadius={42} outerRadius={64} paddingAngle={2} dataKey="value" stroke="none" cornerRadius={4}>
                                   {mockAssetData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                 </Pie>
                                 <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #EAEAEA', boxShadow: 'none' }} itemStyle={{ fontWeight: 'bold' }} />
                               </RechartsPieChart>
                             </ResponsiveContainer>
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                               <span className="text-[26px] font-light text-slate-900 tracking-tighter leading-none">{mockAssetData[0].value}%</span>
                               <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Core</span>
                             </div>
                           </div>

                           <div className="flex flex-col gap-2 w-[55%] justify-center pr-2">
                             {mockAssetData.map((asset, i) => (
                               <div key={i} className={`flex items-center justify-between ${i !== mockAssetData.length - 1 ? 'border-b border-slate-100 pb-2' : ''}`}>
                                 <div className="flex items-center gap-2">
                                   <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: asset.fill }} />
                                   <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">{asset.name.split(' ')[0]}</span>
                                 </div>
                                 <span className="text-[12px] font-semibold text-slate-900">{asset.value}%</span>
                               </div>
                             ))}
                           </div>
                        </div>
                     </CardContainer>
                   </motion.div>

                </div>
              </div>
            </div>

            {/* === BOTTOM ROW: Real Recent Activity List === */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 rounded-[24px] bg-white border border-[#EAEAEA] shadow-none p-8 overflow-hidden relative">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-[18px] font-semibold text-slate-900">Log Protocol</h3>
                  <p className="text-[13px] text-slate-500 mt-1 font-medium">Historical audit of system records.</p>
                </div>
                
                {/* Search Bar for transactions */}
                <div className="flex items-center gap-3 w-full sm:w-[320px] relative">
                  <Search className="w-4 h-4 absolute left-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search logs & descriptions..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-full text-[13px] font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4F718] transition-all" 
                  />
                </div>
              </div>

              {displayActivity.length > 0 && (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left font-sans">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-4 pl-6">Identifier</th>
                        <th className="py-4">Source Category</th>
                        <th className="py-4 text-right pr-6">Status Marker</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {displayActivity.slice(0, 5).map(a => (
                        <tr key={a.id} className="transition-all hover:bg-slate-50/50 group">
                          <td className="py-4 pl-6 cursor-pointer">
                            <p className="text-[14px] font-bold text-slate-900 group-hover:text-[#65A30D] group-hover:underline transition-all">{a.title}</p>
                            <p className="text-[12px] text-slate-500 mt-1 font-medium">{formatDate(a.timestamp)}</p>
                          </td>
                          <td className="py-4">
                            <span className="inline-flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-[0.08em]">
                              {a.type}
                            </span>
                          </td>
                          <td className="py-4 text-right pr-6 uppercase tracking-[0.08em]">
                            <span className={`inline-flex items-center gap-2 text-[10px] font-bold ${a.status === 'completed' ? 'text-slate-800' : 'text-slate-400'}`}>
                              <div className={`w-2 h-2 rounded-full shadow-none ${a.status === 'completed' ? 'bg-[#D4F718]' : 'bg-slate-300'}`} />
                              {getActivityStatusDisplay(a)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Proper Pagination / Load More Control */}
              <div className="mt-8 flex justify-center">
                <button className="text-[12px] font-bold text-slate-600 bg-white border border-slate-200 px-8 py-2.5 rounded-full hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm transition-all flex items-center gap-2">
                  Load previous records <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(203, 213, 225, 0.4); border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(203, 213, 225, 0.8); }
      `}</style>
    </div>
  );
}
