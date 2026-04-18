import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfile } from "@/components/UserProfile";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import { NotificationModal } from "@/components/NotificationModal";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  animate,
} from "framer-motion";
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

/* ─── Stagger container ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
} as const;

/* ═══════════════════════════════════════════════════════
   VARIANT A — "PRECISION"
   Swiss International Typographic Style
   Rigid grid · 1px borders · Zero shadows · Geometric
   ═══════════════════════════════════════════════════════ */

const DashboardPrecision = () => {
  const {
    firstName,
    dashboardStats,
    recentActivity,
    isLoading,
  } = useDashboardData();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#0A0021] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs tracking-[0.2em] uppercase text-[#64748B]">
            Loading
          </span>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const metrics = [
    {
      label: "CLIENTS",
      value: dashboardStats?.clients.total || 0,
      sub: `${dashboardStats?.clients.active || 0} active`,
    },
    {
      label: "REPORTS",
      value: dashboardStats?.reports.total || 0,
      sub: `${dashboardStats?.reports.completed || 0}% completed`,
    },
    {
      label: "NEWSLETTERS",
      value: dashboardStats?.newsletters.total || 0,
      sub: `${dashboardStats?.newsletters.published || 0} published`,
    },
    {
      label: "SYSTEM HEALTH",
      value: dashboardStats?.system_health.score || 0,
      sub: dashboardStats?.system_health.status || "—",
      suffix: "%",
    },
  ];

  const quickActions = [
    { label: "Generate Report", path: "/reports" },
    { label: "View Clients", path: "/clients" },
    { label: "Create Newsletter", path: "/newsletter" },
    { label: "Integration Settings", path: "/integration" },
    { label: "Organization Settings", path: "/settings" },
  ];

  return (
    <SidebarProvider>
      <AppSidebar variant="canvas" />
      <SidebarInset>
        {/* ── Top Bar ── */}
        <header className="flex h-16 items-center justify-between px-10 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="w-8 h-8 rounded-md border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#64748B] font-medium">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageChangeDropdown />
            <Button
              variant="ghost"
              size="icon"
              className="relative w-8 h-8 rounded-md border border-[#E2E8F0] hover:bg-[#F8FAFC]"
              onClick={() => setNotifOpen(true)}
            >
              <Bell className="h-3.5 w-3.5 text-[#64748B]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0A0021]" />
            </Button>
            <div className="h-6 w-px bg-[#E2E8F0]" />
            <UserProfile />
          </div>
        </header>

        <NotificationModal open={notifOpen} onOpenChange={setNotifOpen} />

        {/* ── Content ── */}
        <div className="flex-1 bg-[#F8FAFC] overflow-auto">
          <motion.div
            className="max-w-[1200px] mx-auto px-10 py-10"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Greeting */}
            <motion.div variants={fadeUp} className="mb-10">
              <h1 className="text-[28px] font-light text-[#0A0021] leading-tight">
                {getGreeting()},{" "}
                <span className="font-medium">{firstName}</span>
              </h1>
              <p className="text-[13px] text-[#64748B] mt-1.5">{today}</p>
            </motion.div>

            {/* ── Metric Strip ── */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-4 border border-[#E2E8F0] divide-x divide-[#E2E8F0] bg-white mb-10"
            >
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="px-6 py-6 group hover:bg-[#F8FAFC] transition-colors"
                >
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#94A3B8] font-medium mb-3">
                    {m.label}
                  </p>
                  <p className="text-[32px] font-light text-[#0A0021] leading-none tabular-nums">
                    <AnimatedNumber value={m.value} />
                    {m.suffix && (
                      <span className="text-[20px] text-[#94A3B8] ml-0.5">
                        {m.suffix}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-2">{m.sub}</p>
                </div>
              ))}
            </motion.div>

            {/* ── Two-Column: Integration + Activity ── */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-3 gap-8 mb-10"
            >
              {/* Integration Status */}
              <div className="col-span-1">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#94A3B8] font-medium mb-4">
                  INTEGRATIONS
                </p>
                <div className="border border-[#E2E8F0] bg-white divide-y divide-[#E2E8F0]">
                  {/* Yuki */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span className="text-[13px] text-[#0A0021] font-medium">
                        Yuki API
                      </span>
                    </div>
                    <span
                      className={`text-[11px] ${
                        dashboardStats?.integration.yuki_connected
                          ? "text-[#10B981]"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {dashboardStats?.integration.yuki_connected
                        ? "Connected"
                        : "Not connected"}
                    </span>
                  </div>
                  {/* Email */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          dashboardStats?.integration.email_connected
                            ? "bg-[#10B981]"
                            : "bg-[#CBD5E1]"
                        }`}
                      />
                      <span className="text-[13px] text-[#0A0021] font-medium">
                        Email Services
                      </span>
                    </div>
                    <span
                      className={`text-[11px] ${
                        dashboardStats?.integration.email_connected
                          ? "text-[#10B981]"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {dashboardStats?.integration.email_connected
                        ? "Connected"
                        : "Not connected"}
                    </span>
                  </div>
                </div>

                {/* System Health Bar */}
                <div className="mt-6">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#94A3B8] font-medium mb-4">
                    SYSTEM HEALTH
                  </p>
                  <div className="border border-[#E2E8F0] bg-white px-5 py-5">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-[24px] font-light text-[#0A0021] tabular-nums">
                        <AnimatedNumber
                          value={dashboardStats?.system_health.score || 0}
                        />
                        <span className="text-[14px] text-[#94A3B8] ml-0.5">
                          %
                        </span>
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        {dashboardStats?.system_health.status}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#E2E8F0] overflow-hidden">
                      <motion.div
                        className="h-full bg-[#0A0021]"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${dashboardStats?.system_health.score || 0}%`,
                        }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="col-span-2">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#94A3B8] font-medium mb-4">
                  RECENT ACTIVITY
                </p>
                <div className="border border-[#E2E8F0] bg-white divide-y divide-[#E2E8F0]">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_100px_100px_90px] px-5 py-3 bg-[#F8FAFC]">
                    <span className="text-[10px] tracking-[0.15em] uppercase text-[#94A3B8] font-medium">
                      Title
                    </span>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-[#94A3B8] font-medium text-center">
                      Date
                    </span>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-[#94A3B8] font-medium text-center">
                      Type
                    </span>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-[#94A3B8] font-medium text-right">
                      Status
                    </span>
                  </div>

                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((a) => (
                      <div
                        key={a.id}
                        className="grid grid-cols-[1fr_100px_100px_90px] px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors"
                      >
                        <span className="text-[13px] text-[#0A0021] font-medium truncate pr-4">
                          {a.title}
                        </span>
                        <span className="text-[12px] text-[#94A3B8] text-center">
                          {formatDate(a.timestamp)}
                        </span>
                        <span className="text-[12px] text-[#94A3B8] text-center">
                          {getActivityTypeLabel(a.type)}
                        </span>
                        <span
                          className={`text-[12px] text-right font-medium ${
                            a.status === "completed"
                              ? "text-[#10B981]"
                              : "text-[#94A3B8]"
                          }`}
                        >
                          {getActivityStatusDisplay(a)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-center">
                      <p className="text-[12px] text-[#94A3B8]">
                        No recent activity
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── Quick Actions ── */}
            <motion.div variants={fadeUp}>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#94A3B8] font-medium mb-4">
                QUICK ACTIONS
              </p>
              <div className="flex items-center gap-6 border-t border-[#E2E8F0] pt-5">
                {quickActions.map((a, i) => (
                  <button
                    key={a.label}
                    onClick={() => navigate(a.path)}
                    className="text-[13px] text-[#0A0021] font-medium underline underline-offset-4 decoration-[#CBD5E1] hover:decoration-[#0A0021] transition-colors"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardPrecision;
