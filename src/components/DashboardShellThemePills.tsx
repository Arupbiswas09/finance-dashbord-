import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  isDark?: boolean;
};

/**
 * Shared theme switcher for dashboard shell pages (modern / analytics / guidance).
 * Theme 2 = analytics-modern, Theme 3 = dashboard-guidance; main dashboard = dashboard-modern.
 */
export function DashboardShellThemePills({ isDark = false }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeModern = pathname === "/dashboard-modern" || pathname === "/dashboard";
  const activeAnalytics = pathname === "/analytics-modern";
  const activeGuidance = pathname === "/dashboard-guidance";

  const shell = isDark ? "bg-[#18181b] border-white/5" : "bg-white border-[#E5E7EB]";
  const inactive = isDark
    ? "text-slate-400 hover:bg-white/5"
    : "text-slate-500 hover:bg-slate-50";
  const active = isDark ? "bg-[#D4F718] text-black" : "bg-slate-900 text-white";

  return (
    <div
      className={cn(
        "flex rounded-full p-1 border shadow-sm transition-colors",
        shell,
      )}
    >
      <button
        type="button"
        onClick={() => navigate("/dashboard-modern")}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors",
          activeModern ? active : inactive,
        )}
      >
        <LayoutGrid className="w-4 h-4" /> Dashboard
      </button>
      <button
        type="button"
        onClick={() => navigate("/analytics-modern")}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors ml-1",
          activeAnalytics ? active : inactive,
        )}
      >
        <span
          className={cn(
            "w-0.5 h-3 rounded-full inline-block",
            activeAnalytics && isDark && "bg-black",
            activeAnalytics && !isDark && "bg-blue-400",
            !activeAnalytics && "bg-blue-500",
          )}
        />
        Theme 2
      </button>
      <button
        type="button"
        onClick={() => navigate("/dashboard-guidance")}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors ml-1",
          activeGuidance ? active : inactive,
        )}
      >
        <Sparkles className="w-3.5 h-3.5" /> Theme 3
      </button>
    </div>
  );
}
