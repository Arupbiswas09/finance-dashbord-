import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfile } from "@/components/UserProfile";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import { NotificationModal } from "@/components/NotificationModal";
import {
  Bell,
  BarChart3,
  Users,
  FileText,
  Mail,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import {
  useDashboardData,
  formatDate,
  getGreeting,
  getActivityTypeLabel,
  getActivityStatusDisplay,
} from "@/hooks/useDashboardData";

/* ─── Animated Counter ─── */
const AnimatedNumber = ({
  value,
  duration = 1.8,
}: {
  value: number;
  duration?: number;
}) => {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const ctrl = animate(mv, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return ctrl.stop;
  }, [value, duration, mv]);

  return <>{display}</>;
};

/* ─── Animated Progress Ring ─── */
const ProgressRing = ({
  value,
  size = 80,
  strokeWidth = 4,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0A0021"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - (value / 100) * circumference,
          }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[15px] font-medium text-[#0A0021] tabular-nums">
          <AnimatedNumber value={value} />
          <span className="text-[10px] text-[#94A3B8]">%</span>
        </span>
      </div>
    </div>
  );
};

/* ─── Stagger ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
} as const;

/* ═══════════════════════════════════════════════════════
   VARIANT C — "CANVAS"
   BizzControl-inspired · Dutch Functional Grid
   Subtle cards · Progress bars · Timeline dots
   Compact but breathable · Warm gray background
   ═══════════════════════════════════════════════════════ */

const DashboardCanvas = () => {
  const { firstName, dashboardStats, recentActivity, isLoading } =
    useDashboardData();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-7 h-7 border-2 border-[#0A0021] border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] tracking-[0.2em] uppercase text-[#94A3B8]">
            Loading
          </span>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Clients",
      value: dashboardStats?.clients.total || 0,
      sub: `${dashboardStats?.clients.active || 0} active`,
      progress:
        dashboardStats?.clients.total && dashboardStats?.clients.active
          ? Math.round(
              (dashboardStats.clients.active / dashboardStats.clients.total) *
                100
            )
          : 0,
      icon: Users,
    },
    {
      label: "Reports",
      value: dashboardStats?.reports.total || 0,
      sub: `${dashboardStats?.reports.completed || 0}% completed`,
      progress: dashboardStats?.reports.completed || 0,
      icon: BarChart3,
    },
    {
      label: "Newsletters",
      value: dashboardStats?.newsletters.total || 0,
      sub: `${dashboardStats?.newsletters.published || 0} published`,
      progress:
        dashboardStats?.newsletters.total && dashboardStats?.newsletters.published
          ? Math.round(
              (dashboardStats.newsletters.published /
                dashboardStats.newsletters.total) *
                100
            )
          : 0,
      icon: Mail,
    },
  ];

  const quickActions = [
    {
      label: "Generate Report",
      desc: "Create new report",
      path: "/reports",
      icon: BarChart3,
    },
    {
      label: "View Clients",
      desc: "Manage client list",
      path: "/clients",
      icon: Users,
    },
    {
      label: "Newsletter",
      desc: "Draft newsletter",
      path: "/newsletter",
      icon: FileText,
    },
    {
      label: "Settings",
      desc: "Configure system",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar variant="canvas" />
      <SidebarInset>
        {/* ── Header ── */}
        <header className="flex h-[72px] items-center justify-between px-8 bg-white border-b border-[#EEF2F6]">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#EEF2F6] transition-colors text-[#64748B]" />
            <div>
              <h1 className="text-[16px] font-medium text-[#0A0021] leading-tight">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Overview & insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <LanguageChangeDropdown />
            <Button
              variant="ghost"
              size="icon"
              className="relative w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#EEF2F6]"
              onClick={() => setNotifOpen(true)}
            >
              <Bell className="h-3.5 w-3.5 text-[#64748B]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0A0021]" />
            </Button>
            <div className="h-7 w-px bg-[#EEF2F6]" />
            <UserProfile />
          </div>
        </header>

        <NotificationModal open={notifOpen} onOpenChange={setNotifOpen} />

        {/* ── Content ── */}
        <div className="flex-1 bg-[#F1F5F9] overflow-auto">
          <motion.div
            className="max-w-[1100px] mx-auto px-8 py-8"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* ── Metric Cards Row ── */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-3 gap-5 mb-6"
            >
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="bg-white rounded-xl px-6 py-5 border border-[#EEF2F6] hover:border-[#CBD5E1] transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wider">
                        {m.label}
                      </p>
                      <p className="text-[28px] font-light text-[#0A0021] leading-tight mt-1 tabular-nums">
                        <AnimatedNumber value={m.value} />
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] flex items-center justify-center group-hover:bg-[#0A0021] transition-colors">
                      <m.icon className="w-4 h-4 text-[#94A3B8] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <div className="w-full h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#0A0021] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${m.progress}%` }}
                      transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-2">{m.sub}</p>
                </div>
              ))}
            </motion.div>

            {/* ── Two-Column: Activity + Sidebar ── */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-[1fr_300px] gap-5 mb-6"
            >
              {/* Activity Timeline */}
              <div className="bg-white rounded-xl border border-[#EEF2F6] px-6 py-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[13px] font-medium text-[#0A0021]">
                    Recent Activity
                  </h2>
                  <span className="text-[11px] text-[#94A3B8]">
                    Last 7 days
                  </span>
                </div>

                {recentActivity.length > 0 ? (
                  <div className="space-y-0">
                    {recentActivity.slice(0, 5).map((a, i) => (
                      <div key={a.id} className="flex items-start gap-4 group">
                        {/* Timeline dot + line */}
                        <div className="flex flex-col items-center pt-1.5">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              a.status === "completed"
                                ? "bg-[#0A0021]"
                                : "bg-[#CBD5E1]"
                            }`}
                          />
                          {i < Math.min(recentActivity.length, 5) - 1 && (
                            <div className="w-px h-full min-h-[32px] bg-[#EEF2F6] mt-1" />
                          )}
                        </div>

                        {/* Content */}
                        <div
                          className={`flex-1 pb-5 ${
                            i < Math.min(recentActivity.length, 5) - 1
                              ? "border-b border-[#F8FAFC]"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-[13px] text-[#0A0021] font-medium truncate">
                                {a.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[11px] text-[#94A3B8] tabular-nums">
                                  {formatDate(a.timestamp)}
                                </span>
                                <span className="text-[11px] text-[#CBD5E1]">
                                  ·
                                </span>
                                <span className="text-[11px] text-[#94A3B8]">
                                  {getActivityTypeLabel(a.type)}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                                a.status === "completed"
                                  ? "bg-[#F0FDF4] text-[#10B981]"
                                  : "bg-[#F8FAFC] text-[#94A3B8]"
                              }`}
                            >
                              {getActivityStatusDisplay(a)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-[12px] text-[#94A3B8]">
                      No recent activity
                    </p>
                  </div>
                )}
              </div>

              {/* Right Sidebar: Health + Integration */}
              <div className="flex flex-col gap-5">
                {/* System Health Card */}
                <div className="bg-white rounded-xl border border-[#EEF2F6] px-6 py-5">
                  <h2 className="text-[13px] font-medium text-[#0A0021] mb-5">
                    System Health
                  </h2>
                  <div className="flex items-center justify-center mb-4">
                    <ProgressRing
                      value={dashboardStats?.system_health.score || 0}
                      size={88}
                      strokeWidth={5}
                    />
                  </div>
                  <p className="text-[11px] text-[#94A3B8] text-center">
                    {dashboardStats?.system_health.status || "—"}
                  </p>
                </div>

                {/* Integration Status Card */}
                <div className="bg-white rounded-xl border border-[#EEF2F6] px-6 py-5">
                  <h2 className="text-[13px] font-medium text-[#0A0021] mb-4">
                    Integrations
                  </h2>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#64748B]">
                        Yuki API
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            dashboardStats?.integration.yuki_connected
                              ? "bg-[#10B981]"
                              : "bg-[#CBD5E1]"
                          }`}
                        />
                        <span
                          className={`text-[11px] ${
                            dashboardStats?.integration.yuki_connected
                              ? "text-[#10B981]"
                              : "text-[#94A3B8]"
                          }`}
                        >
                          {dashboardStats?.integration.yuki_connected
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="h-px bg-[#F8FAFC]" />
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#64748B]">
                        Email Services
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            dashboardStats?.integration.email_connected
                              ? "bg-[#10B981]"
                              : "bg-[#CBD5E1]"
                          }`}
                        />
                        <span
                          className={`text-[11px] ${
                            dashboardStats?.integration.email_connected
                              ? "text-[#10B981]"
                              : "text-[#94A3B8]"
                          }`}
                        >
                          {dashboardStats?.integration.email_connected
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Quick Actions ── */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-4 gap-4"
            >
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className="bg-white rounded-xl border border-[#EEF2F6] px-5 py-4 text-left hover:border-[#0A0021] hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] group-hover:bg-[#0A0021] flex items-center justify-center transition-colors">
                      <a.icon className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-white transition-colors" />
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-[#CBD5E1] group-hover:text-[#0A0021] transition-colors" />
                  </div>
                  <p className="text-[12px] font-medium text-[#0A0021]">
                    {a.label}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    {a.desc}
                  </p>
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardCanvas;
