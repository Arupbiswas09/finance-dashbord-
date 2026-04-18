import type { ComponentType } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  DashboardIcon,
  ReportsIcon,
  AIIcon,
  NewsletterIcon,
  InvoicesIcon,
  ClientsIcon,
  SettingsIcon,
} from "@/components/icons/CustomIcons";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { HelpCard } from "./HelpCard";
import { cn } from "@/lib/utils";

/** Light rail — restrained depth: one cool base + soft floor bloom (premium, not busy) */
const railBackgroundLayers = `
  linear-gradient(180deg, #FDFCFD 0%, #F5F3FA 38%, #EEEBF4 100%),
  radial-gradient(120% 90% at 50% 100%, rgba(92, 88, 153, 0.11), transparent 52%),
  linear-gradient(90deg, rgba(255, 255, 255, 0.7) 0%, transparent 28%)
`;

type NavItem = {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
};

type NavGroup = {
  labelKey: string;
  items: NavItem[];
};

const navigationGroups: NavGroup[] = [
  {
    labelKey: "Sidebar Overview",
    items: [
      { title: "Dashboard", url: "/dashboard-modern", icon: DashboardIcon },
      { title: "Reports", url: "/reports", icon: ReportsIcon },
    ],
  },
  {
    labelKey: "Sidebar Intelligence",
    items: [
      { title: "Accounting AI", url: "/accounting-ai", icon: AIIcon },
      { title: "Newsletter", url: "/newsletter", icon: NewsletterIcon },
    ],
  },
  {
    labelKey: "Sidebar Workspace",
    items: [
      { title: "Invoice", url: "/invoices", icon: InvoicesIcon },
      { title: "Client", url: "/clients", icon: ClientsIcon },
    ],
  },
  {
    labelKey: "Sidebar System",
    items: [{ title: "Settings", url: "/settings", icon: SettingsIcon }],
  },
];

export type AppSidebarVariant = "default" | "canvas" | "guidance";

type AppSidebarProps = {
  /**
   * `canvas` / `guidance` — light rails for premium dashboard shells (ink #0A0021, cool neutrals).
   * `guidance` uses the same visual language as the guidance dashboard (grouped nav, accent rail).
   * `default` keeps the dark branded rail used across the rest of the app.
   */
  variant?: AppSidebarVariant;
};

export function AppSidebar({ variant = "default" }: AppSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const lightRail = variant === "canvas" || variant === "guidance";
  const guidance = variant === "guidance";

  const { t } = useTranslation();

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className={cn(
        "border-none transition-all duration-300",
        lightRail &&
          "text-slate-700 md:shadow-[12px_0_40px_-8px_rgba(10,0,33,0.1),inset_1px_0_0_rgba(255,255,255,0.65)]",
      )}
      collapsible="icon"
      style={
        lightRail
          ? {
              background: railBackgroundLayers,
              borderRight: `1px solid rgba(10, 0, 33, 0.09)`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
            }
          : { background: "#0a0021" }
      }
      mobileSheetClassName={
        lightRail
          ? "border-r border-[rgba(10,0,33,0.08)] bg-[#F5F3FA] text-slate-700 shadow-[8px_0_36px_-6px_rgba(10,0,33,0.12)]"
          : "bg-[#0a0021] text-white"
      }
    >
      {lightRail ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-24 bg-gradient-to-b from-white/70 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-0 w-px bg-gradient-to-b from-transparent via-[#0A0021]/[0.06] to-transparent"
            aria-hidden
          />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-r-3xl">
          <div
            className="absolute -top-10 -right-10 h-72 w-72 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-20 right-0 h-48 w-48 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(147, 197, 253, 0.1) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)",
            }}
          />
        </div>
      )}

      <SidebarHeader
        className={cn(
          "relative z-10 border-none",
          collapsed ? "px-2 py-6" : lightRail ? (guidance ? "px-5 py-6" : "px-5 py-7") : "px-6 py-8",
        )}
      >
        <div className={cn("flex items-center", collapsed ? "justify-center" : lightRail ? "justify-start gap-3" : "justify-center")}>
          {collapsed ? (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl text-[13px] font-bold tracking-tight transition-colors duration-200",
                lightRail
                  ? "bg-[#EDE9F4] text-[#0A0021] ring-1 ring-[#0A0021]/10"
                  : "bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30",
              )}
              aria-hidden
            >
              SA
            </div>
          ) : lightRail ? (
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-[#FAF8FF] to-[#E8E2F4] text-[#0A0021] shadow-[0_4px_14px_rgba(10,0,33,0.08),inset_0_1px_0_rgba(255,255,255,1)] ring-1 ring-[#0A0021]/[0.06]"
                aria-hidden
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#0A0021]">
                  <path
                    d="M12 3L4 8v8l8 5 8-5V8l-8-5z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 12l8-4M12 12L4 8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-[0.45]"
                  />
                </svg>
              </div>
              <div className="min-w-0 text-left leading-tight">
                <div className="text-[17px] font-semibold tracking-[-0.02em] text-[#0A0021]">
                  Smart<span className="font-medium text-[#6B6694]"> Account</span>
                </div>
                <p className="mt-1 text-[11px] font-medium leading-snug tracking-wide text-[#8B87A8]">
                  {t("Sidebar product tagline")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline justify-center gap-0">
              <span className="text-xl font-semibold italic tracking-wide text-blue-400">Smart</span>
              <span className="text-xl font-semibold italic tracking-wide text-white">Account</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <div
        className={cn(
          "relative z-10 h-px shrink-0",
          collapsed ? "mx-2" : lightRail ? "mx-5" : "mx-4",
          lightRail
            ? "bg-gradient-to-r from-transparent via-[#0A0021]/[0.1] to-transparent"
            : "bg-gradient-to-r from-transparent via-blue-500/30 to-transparent",
        )}
      />

      <SidebarContent
        className={cn(
          "relative z-10",
          guidance ? "pt-4" : "pt-5",
          collapsed ? "px-1" : lightRail ? "px-2.5 pb-1" : "px-2 pb-2",
        )}
      >
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup
            key={group.labelKey}
            className={cn("p-0", !collapsed && (lightRail ? "px-1" : "px-1.5"))}
          >
            {!collapsed && (
              <SidebarGroupLabel
                className={cn(
                  "mb-2 h-auto px-3 py-0 font-semibold uppercase tracking-[0.12em]",
                  groupIndex === 0 ? "mt-0.5" : "mt-5",
                  lightRail ? "text-[11px] text-[#8B87A8]" : "text-[10px] text-slate-500 tracking-[0.14em]",
                )}
              >
                {t(group.labelKey)}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className={cn(collapsed ? "items-center gap-2" : "gap-0.5")}>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="h-auto w-full rounded-xl px-0 py-0 transition-all duration-200 hover:bg-transparent data-[active=true]:bg-transparent"
                      >
                        <NavLink
                          to={item.url}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group/nav relative flex w-full items-center overflow-hidden rounded-xl transition-[background-color,box-shadow,color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                            lightRail ? "focus-visible:ring-[#0A0021]/18" : "focus-visible:ring-blue-400/35",
                            collapsed && "flex-col gap-1.5 px-1 py-2.5 justify-center",
                            !collapsed && lightRail &&
                              cn(
                                "flex-row gap-3 px-2.5 py-2.5",
                                active
                                  ? cn(
                                      "z-[1] bg-white/95 text-[#0A0021] backdrop-blur-sm",
                                      "shadow-[0_2px_8px_rgba(10,0,33,0.04),0_12px_28px_-8px_rgba(10,0,33,0.1)]",
                                      "ring-1 ring-[#0A0021]/[0.07]",
                                      "border-l-[3px] border-l-[#5c5899]",
                                    )
                                  : cn(
                                      "text-[#475569] border-l-[3px] border-l-transparent",
                                      "hover:bg-white/55 hover:text-[#0A0021] hover:shadow-[0_2px_12px_rgba(10,0,33,0.04)]",
                                    ),
                              ),
                            !collapsed && !lightRail &&
                              cn(
                                "flex-row gap-3 px-3 py-2.5",
                                active
                                  ? "bg-[#1A1F37] text-white before:absolute before:left-0 before:top-1/2 before:h-9 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-blue-400 before:content-['']"
                                  : "text-gray-300 hover:bg-[#1A1F37]/55 hover:text-white",
                              ),
                            collapsed &&
                              lightRail &&
                              (active
                                ? cn(
                                    "bg-white/95 text-[#0A0021] shadow-[0_4px_16px_rgba(10,0,33,0.08)] ring-1 ring-[#0A0021]/[0.08] border-l-[3px] border-l-[#5c5899]",
                                  )
                                : "text-[#475569] hover:bg-white/50 hover:text-[#0A0021]"),
                            collapsed &&
                              !lightRail &&
                              (active
                                ? "bg-[#1A1F37] text-white ring-1 ring-blue-500/25"
                                : "text-gray-300 hover:bg-[#1A1F37]/50"),
                          )}
                        >
                          <div
                            className={cn(
                              "flex shrink-0 items-center justify-center rounded-xl transition-[background-color,color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                              collapsed ? "h-10 w-10" : lightRail ? "h-9 w-9" : "h-11 w-11",
                              lightRail &&
                                (active
                                  ? "bg-gradient-to-br from-[#EAE4F7] to-[#D9CFEE] text-[#120a2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(92,88,153,0.18)] ring-1 ring-[#5c5899]/25"
                                  : "bg-[rgba(92,88,153,0.08)] text-[#4f4785] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] ring-1 ring-[#0A0021]/[0.04] group-hover/nav:bg-[rgba(92,88,153,0.12)] group-hover/nav:text-[#241852] group-hover/nav:ring-[#5c5899]/14 group-hover/nav:shadow-[0_2px_10px_rgba(92,88,153,0.1)]"),
                              !lightRail &&
                                (active
                                  ? "bg-blue-500 shadow-lg shadow-blue-500/35"
                                  : "bg-[#1A1F37] group-hover/nav:bg-[#232845]"),
                            )}
                          >
                            <item.icon
                              className={cn(
                                "shrink-0 transition-[color,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                                collapsed ? "h-4 w-4" : lightRail ? "h-[18px] w-[18px]" : "h-5 w-5",
                                lightRail &&
                                  (active
                                    ? "text-[#120a2e]"
                                    : "text-[#524a7a] opacity-[0.92] group-hover/nav:text-[#1a1240] group-hover/nav:opacity-100"),
                                !lightRail && (active ? "text-white" : "text-blue-400 group-hover/nav:text-blue-300"),
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-center font-medium transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                              collapsed ? "text-[10px] leading-tight" : lightRail ? "text-[13px] leading-snug tracking-[-0.01em]" : "text-[15px]",
                              lightRail &&
                                (active
                                  ? "font-semibold text-[#0A0021]"
                                  : "text-[#334155] group-hover/nav:text-[#0A0021]"),
                              !lightRail && (active ? "text-white" : "text-gray-300 group-hover/nav:text-white"),
                            )}
                          >
                            {t(item.title)}
                          </span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className={cn("relative z-10 mt-auto pb-2", lightRail ? "px-2.5" : "px-3")}>
          <HelpCard variant={lightRail ? "minimal" : "default"} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
