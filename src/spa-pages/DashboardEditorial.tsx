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
  duration = 2,
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

/* ─── Stagger ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
} as const;

/* ═══════════════════════════════════════════════════════
   VARIANT B — "EDITORIAL"
   Nordic / Scandinavian Editorial Layout
   Zero cards · Hairline dividers · Large typography
   Maximum negative space · Magazine-like sections
   ═══════════════════════════════════════════════════════ */

const DashboardEditorial = () => {
  const { firstName, dashboardStats, recentActivity, isLoading } =
    useDashboardData();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <motion.div
          className="flex flex-col items-center gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-6 h-6 border border-[#0A0021] border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#94A3B8]">
            Loading
          </span>
        </motion.div>
      </div>
    );
  }

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  });

  const quickActions = [
    { label: "Generate Report", path: "/reports" },
    { label: "View Clients", path: "/clients" },
    { label: "Create Newsletter", path: "/newsletter" },
    { label: "Integration", path: "/integration" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <SidebarProvider>
      <AppSidebar variant="canvas" />
      <SidebarInset>
        {/* ── Minimal Top Bar ── */}
        <header className="flex h-14 items-center justify-between px-12 bg-white">
          <SidebarTrigger className="w-7 h-7 rounded-sm hover:bg-[#F8FAFC] transition-colors text-[#94A3B8]" />
          <div className="flex items-center gap-3">
            <LanguageChangeDropdown />
            <Button
              variant="ghost"
              size="icon"
              className="relative w-7 h-7 rounded-sm hover:bg-[#F8FAFC]"
              onClick={() => setNotifOpen(true)}
            >
              <Bell className="h-3.5 w-3.5 text-[#94A3B8]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#0A0021]" />
            </Button>
            <UserProfile />
          </div>
        </header>

        <NotificationModal open={notifOpen} onOpenChange={setNotifOpen} />

        {/* ── Content ── */}
        <div className="flex-1 bg-white overflow-auto">
          <motion.div
            className="max-w-[780px] mx-auto px-8 py-16"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* ── Hero Greeting ── */}
            <motion.div variants={fadeUp} className="mb-16">
              <h1 className="text-[42px] font-extralight text-[#0A0021] leading-[1.15] tracking-[-0.02em]">
                {getGreeting()},
                <br />
                <span className="font-normal">{firstName}.</span>
              </h1>
              <p className="text-[14px] text-[#94A3B8] mt-4 font-light">
                {dayName}, {dateStr}
              </p>
            </motion.div>

            {/* ── Divider ── */}
            <motion.div
              variants={fadeUp}
              className="h-px bg-[#E2E8F0] mb-12"
            />

            {/* ── Inline Metrics ── */}
            <motion.div
              variants={fadeUp}
              className="flex items-baseline gap-12 mb-12"
            >
              <div>
                <span className="text-[38px] font-light text-[#0A0021] tabular-nums leading-none">
                  <AnimatedNumber
                    value={dashboardStats?.clients.total || 0}
                  />
                </span>
                <span className="text-[13px] text-[#94A3B8] ml-2">
                  clients
                </span>
              </div>
              <span className="text-[#E2E8F0] text-[24px] font-thin select-none">
                ·
              </span>
              <div>
                <span className="text-[38px] font-light text-[#0A0021] tabular-nums leading-none">
                  <AnimatedNumber
                    value={dashboardStats?.reports.total || 0}
                  />
                </span>
                <span className="text-[13px] text-[#94A3B8] ml-2">
                  reports
                </span>
              </div>
              <span className="text-[#E2E8F0] text-[24px] font-thin select-none">
                ·
              </span>
              <div>
                <span className="text-[38px] font-light text-[#0A0021] tabular-nums leading-none">
                  <AnimatedNumber
                    value={dashboardStats?.newsletters.total || 0}
                  />
                </span>
                <span className="text-[13px] text-[#94A3B8] ml-2">
                  newsletters
                </span>
              </div>
            </motion.div>

            {/* ── Divider ── */}
            <motion.div
              variants={fadeUp}
              className="h-px bg-[#E2E8F0] mb-12"
            />

            {/* ── Integrations ── */}
            <motion.div variants={fadeUp} className="mb-12">
              <h2 className="text-[13px] text-[#0A0021] font-medium tracking-[0.04em] mb-6">
                Integrations
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#0A0021] font-light">
                    Yuki API
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[12px] ${
                        dashboardStats?.integration.yuki_connected
                          ? "text-[#10B981]"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {dashboardStats?.integration.yuki_connected
                        ? "Connected"
                        : "Not connected"}
                    </span>
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        dashboardStats?.integration.yuki_connected
                          ? "bg-[#10B981]"
                          : "bg-[#CBD5E1]"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#0A0021] font-light">
                    Email Services
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[12px] ${
                        dashboardStats?.integration.email_connected
                          ? "text-[#10B981]"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {dashboardStats?.integration.email_connected
                        ? "Connected"
                        : "Not connected"}
                    </span>
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        dashboardStats?.integration.email_connected
                          ? "bg-[#10B981]"
                          : "bg-[#CBD5E1]"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Divider ── */}
            <motion.div
              variants={fadeUp}
              className="h-px bg-[#E2E8F0] mb-12"
            />

            {/* ── Recent Activity ── */}
            <motion.div variants={fadeUp} className="mb-12">
              <h2 className="text-[13px] text-[#0A0021] font-medium tracking-[0.04em] mb-6">
                Recent Activity
              </h2>
              {recentActivity.length > 0 ? (
                <div className="space-y-0">
                  {recentActivity.slice(0, 5).map((a, i) => (
                    <div
                      key={a.id}
                      className={`flex items-center justify-between py-4 ${
                        i < Math.min(recentActivity.length, 5) - 1
                          ? "border-b border-[#F1F5F9]"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="text-[12px] text-[#94A3B8] tabular-nums w-16 flex-shrink-0">
                          {formatDate(a.timestamp)}
                        </span>
                        <span className="text-[14px] text-[#0A0021] font-light truncate">
                          {a.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                        <span className="text-[11px] text-[#94A3B8]">
                          {getActivityTypeLabel(a.type)}
                        </span>
                        <span
                          className={`text-[11px] font-medium min-w-[60px] text-right ${
                            a.status === "completed"
                              ? "text-[#10B981]"
                              : "text-[#94A3B8]"
                          }`}
                        >
                          {getActivityStatusDisplay(a)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#94A3B8] font-light py-6">
                  No recent activity to display.
                </p>
              )}
            </motion.div>

            {/* ── Divider ── */}
            <motion.div
              variants={fadeUp}
              className="h-px bg-[#E2E8F0] mb-12"
            />

            {/* ── System Health ── */}
            <motion.div variants={fadeUp} className="mb-12">
              <h2 className="text-[13px] text-[#0A0021] font-medium tracking-[0.04em] mb-6">
                System Health
              </h2>
              <div className="flex items-center gap-6">
                <span className="text-[32px] font-extralight text-[#0A0021] tabular-nums leading-none">
                  <AnimatedNumber
                    value={dashboardStats?.system_health.score || 0}
                  />
                  <span className="text-[18px] text-[#94A3B8]">%</span>
                </span>
                <div className="flex-1">
                  <div className="w-full h-[3px] bg-[#F1F5F9] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#0A0021] rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${dashboardStats?.system_health.score || 0}%`,
                      }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Divider ── */}
            <motion.div
              variants={fadeUp}
              className="h-px bg-[#E2E8F0] mb-10"
            />

            {/* ── Quick Actions ── */}
            <motion.div variants={fadeUp} className="pb-16">
              <div className="flex items-center flex-wrap gap-3">
                {quickActions.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => navigate(a.path)}
                    className="px-5 py-2.5 text-[12px] font-medium text-[#0A0021] border border-[#E2E8F0] rounded-full hover:bg-[#0A0021] hover:text-white hover:border-[#0A0021] transition-all duration-300"
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

export default DashboardEditorial;
