import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell,
  Users,
  Settings,
  Briefcase,
  BarChart3,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";
import { useNavigate } from "react-router-dom";
import { NotificationModal } from "@/components/NotificationModal";
import { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
} from "framer-motion";
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  createThemeGradient,
  hexToHsl,
  lightenHsl,
  darkenHsl,
} from "@/lib/theme";

// Animated Number Component
const AnimatedNumber = ({
  value,
  duration = 2,
  decimals = 0,
}: {
  value: number;
  duration?: number;
  decimals?: number;
}) => {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const animation = animate(motionValue, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Number(latest.toFixed(decimals)));
      },
    });

    return animation.stop;
  }, [value, duration, decimals, motionValue]);

  return <>{displayValue}</>;
};

// Animated Gauge Path Component
const AnimatedGaugePath = ({
  score,
  duration = 2,
}: {
  score: number;
  duration?: number;
}) => {
  const motionValue = useMotionValue(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const animation = animate(motionValue, score, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setAnimatedScore(Number(latest.toFixed(0)));
      },
    });

    return animation.stop;
  }, [score, duration, motionValue]);

  // Arc length for semicircle: π * radius = π * 80 ≈ 251.33
  const arcLength = Math.PI * 80;
  // Calculate progress: animated score percentage of arc length
  const progressLength = (animatedScore / 100) * arcLength;

  // Calculate the position of the progress end point
  const angle = Math.PI - (animatedScore / 100) * Math.PI; // Angle in radians
  const endX = 110 + 80 * Math.cos(angle);
  const endY = 110 - 80 * Math.sin(angle);

  return (
    <>
      <path
        d="M 30,110 A 80,80 0 0,1 190,110"
        fill="none"
        stroke="url(#gaugeGradient)"
        strokeWidth="15"
        strokeLinecap="butt"
        strokeDasharray={arcLength}
        strokeDashoffset={arcLength - progressLength}
      />
      {/* Round cap at the progress end */}
      {animatedScore > 0 && (
        <circle cx={endX} cy={endY} r="7.5" fill="url(#gaugeGradient)" />
      )}
    </>
  );
};

// Animated Emoji Component - transitions through sad → neutral → happy over 2 seconds
const AnimatedEmoji = ({
  score,
  duration = 2,
}: {
  score: number;
  duration?: number;
}) => {
  const motionValue = useMotionValue(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const animation = animate(motionValue, score, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setAnimatedScore(Number(latest.toFixed(0)));
      },
    });

    return animation.stop;
  }, [score, duration, motionValue]);

  // Determine which emoji to show based on animated score
  const getEmojiState = () => {
    if (animatedScore <= 30) {
      return "sad";
    } else if (animatedScore <= 70) {
      return "neutral";
    } else {
      return "happy";
    }
  };

  const emojiState = getEmojiState();

  return (
    <AnimatePresence mode="wait">
      {emojiState === "sad" && (
        <motion.svg
          key="sad"
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-7 h-7 text-white absolute"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" x2="9.01" y1="9" y2="9" />
          <line x1="15" x2="15.01" y1="9" y2="9" />
        </motion.svg>
      )}
      {emojiState === "neutral" && (
        <motion.svg
          key="neutral"
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-7 h-7 text-white absolute"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="8" x2="16" y1="15" y2="15" />
          <line x1="9" x2="9.01" y1="9" y2="9" />
          <line x1="15" x2="15.01" y1="9" y2="9" />
        </motion.svg>
      )}
      {emojiState === "happy" && (
        <motion.svg
          key="happy"
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-7 h-7 text-white absolute"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" x2="9.01" y1="9" y2="9" />
          <line x1="15" x2="15.01" y1="9" y2="9" />
        </motion.svg>
      )}
    </AnimatePresence>
  );
};

// Dashboard data types
interface DashboardStats {
  clients: {
    total: number;
    active: number;
  };
  reports: {
    total: number;
    completed: number;
    recent: number;
  };
  newsletters: {
    total: number;
    published: number;
    recent: number;
  };
  integration: {
    status: string;
    yuki_connected: boolean;
    email_connected: boolean;
  };
  system_health: {
    score: number;
    status: string;
  };
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const orgColors = useOrganizationColors();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  // Fetch dashboard data
  useEffect(() => {
    if (!loading && user) {
      fetchDashboardData();
    }
  }, [loading, user]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const headers = getAuthHeaders();

      // Fetch stats and activity in parallel
      const [statsResponse, activityResponse] = await Promise.all([
        fetch(buildApiUrl(API_ENDPOINTS.dashboardStats), { headers }),
        fetch(buildApiUrl(API_ENDPOINTS.dashboardActivity), { headers }),
      ]);

      if (!statsResponse.ok || !activityResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData = await statsResponse.json();
      const activityData = await activityResponse.json();

      // Console log system health data from server
      console.log("System Health Data from Server:", statsData.system_health);
      console.log(
        "System Health Score:",
        statsData.system_health?.score ?? "Not available"
      );

      setDashboardStats(statsData);
      setRecentActivity(activityData.activities || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || orgColors.loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Get first name from full name
  const firstName = user?.full_name?.split(" ")[0] || "User";

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get activity type label
  const getActivityTypeLabel = (type: string) => {
    if (type === "report") {
      return "Quarterly Report";
    } else if (type === "newsletter") {
      return "Newsletter draft";
    }
    return type;
  };

  // Get activity status display
  const getActivityStatusDisplay = (activity: Activity) => {
    if (activity.type === "newsletter" && activity.status === "draft") {
      return "0 recipients";
    }
    if (activity.status === "completed") {
      return "Completed";
    }
    return activity.status;
  };

  // Get activity status color
  const getActivityStatusColor = (activity: Activity) => {
    if (activity.type === "newsletter" && activity.status === "draft") {
      return "text-red-500";
    }
    if (activity.status === "completed") {
      return "text-emerald-500";
    }
    return "text-gray-400";
  };

  const bellRefreshIcon = () => {
    return (
      <div className="w-16 h-16 rounded-xl bg-orange flex items-center justify-center">
        <svg
          width="28"
          height="27"
          viewBox="0 0 28 27"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_171_341)">
            <path
              d="M25.5802 14.0971C25.143 14.0452 24.7461 14.355 24.6938 14.7888C24.0383 20.2356 19.3613 24.3432 13.8147 24.3432C8.82592 24.3432 4.54161 21.0204 3.25294 16.3893L4.20704 16.909C4.59312 17.1194 5.07806 16.9793 5.2899 16.5966C5.50194 16.2136 5.36093 15.7326 4.97484 15.5223L2.5275 14.1891C2.14183 13.979 1.6573 14.1185 1.44505 14.5008L0.099054 16.9251C-0.113406 17.3078 0.0271955 17.7888 0.412864 17.9996C0.811201 18.1843 1.26644 18.0935 1.49614 17.6883L1.80808 17.1266C3.38835 22.2681 8.21408 25.9252 13.8147 25.9252C20.1686 25.9252 25.5264 21.2182 26.2774 14.9762C26.3297 14.5424 26.0173 14.1488 25.5802 14.0971Z"
              fill="#FE7710"
            />
            <path
              d="M26.7394 7.80981C26.3352 7.63698 25.8659 7.82176 25.6914 8.22303L25.4401 8.80062C24.6549 6.89624 23.3946 5.19208 21.7714 3.87271C19.5365 2.05567 16.7107 1.05518 13.8146 1.05518C10.9185 1.05518 8.09271 2.05567 5.85762 3.87271C3.65347 5.66442 2.11744 8.16514 1.53261 10.9139C1.44164 11.3413 1.71744 11.7609 2.14839 11.8511C2.57871 11.9414 3.00238 11.668 3.09314 11.2406C3.60342 8.84265 4.94422 6.66059 6.86862 5.09609C8.81918 3.51038 11.2861 2.63718 13.8146 2.63718C16.3429 2.63718 18.8098 3.51038 20.7604 5.09609C22.2596 6.31473 23.4044 7.90848 24.0785 9.687L23.0688 9.25628C22.6642 9.08386 22.195 9.26905 22.021 9.67032C21.847 10.0716 22.0339 10.5367 22.4385 10.7093L25.0038 11.8038C25.4403 11.9828 25.8654 11.7998 26.0513 11.3903L27.156 8.84924C27.3304 8.44817 27.1439 7.98284 26.7394 7.80981Z"
              fill="#FE7710"
            />
            <path
              d="M18.7298 7.67111C18.9587 7.2132 18.9938 6.6941 18.8291 6.20982C18.6644 5.72553 18.3194 5.33394 17.8577 5.10694C16.9045 4.63852 15.745 5.02661 15.2725 5.9719C15.1693 6.17871 15.1057 6.39789 15.0821 6.62077C14.4661 6.56453 13.8399 6.62139 13.233 6.79462C12.0252 7.13904 10.9978 7.91398 10.3402 8.97627L8.18676 12.455C7.89911 12.404 7.60171 12.4252 7.31718 12.5203C6.87212 12.6693 6.5122 12.9811 6.3039 13.3983L6.16184 13.6823C5.73152 14.5438 6.08791 15.5921 6.95665 16.0189L11.6183 18.3099C11.1593 19.257 11.3649 20.3214 12.5562 20.9159C13.6006 21.3415 14.7633 20.9245 15.2148 20.0775L15.7076 20.3195C15.9539 20.4407 16.2193 20.5018 16.4864 20.5018C16.6756 20.5018 16.8656 20.4712 17.0501 20.4094C17.4949 20.2606 17.8548 19.9488 18.0634 19.5314L18.2052 19.2474C18.4137 18.83 18.4459 18.3573 18.2958 17.9158C18.1998 17.6336 18.0366 17.386 17.8214 17.1899L19.3076 13.3834C19.7614 12.2208 19.7605 10.9406 19.3053 9.77881C19.0766 9.19503 18.7429 8.66646 18.3248 8.21431C18.4891 8.06064 18.6266 7.87793 18.7298 7.67111ZM16.9998 6.48708C17.1849 6.48708 17.3348 6.6358 17.3348 6.81914C17.3348 7.00267 17.1849 7.15119 16.9998 7.15119C16.815 7.15119 16.665 7.00247 16.665 6.81914C16.665 6.6358 16.815 6.48708 16.9998 6.48708ZM13.5803 19.5195C13.4756 19.5547 13.3635 19.5471 13.2644 19.4985C13.1653 19.4499 13.0914 19.3658 13.0561 19.262C13.0285 19.1808 13.0274 19.0949 13.0517 19.0146L13.7815 19.3732C13.7315 19.441 13.6621 19.4923 13.5803 19.5195ZM17.8202 12.8122L16.2013 16.9584C15.9734 17.4707 16.1913 18.0771 16.702 18.3284H16.7022C16.7855 18.3725 16.816 18.4632 16.7761 18.5451L16.6341 18.8292C16.5865 18.9116 16.5018 18.9386 16.4158 18.9021L7.66485 14.6015C7.58427 14.5619 7.55104 14.4647 7.59091 14.385L7.73297 14.1009C7.77139 14.0307 7.84595 13.9808 7.95145 14.0278C8.20586 14.1528 8.49413 14.172 8.76328 14.0822C9.01728 13.9971 9.22559 13.8243 9.35414 13.5929L11.6993 9.80414C12.1481 9.07906 12.8495 8.55007 13.674 8.31483C14.4983 8.07959 15.3757 8.15807 16.1441 8.53586C16.1444 8.53586 16.1444 8.53586 16.1446 8.53607C16.1448 8.53607 16.1448 8.53607 16.145 8.53627C16.9136 8.91406 17.508 9.55881 17.8187 10.3519C18.1294 11.1449 18.1298 12.0187 17.8202 12.8122Z"
              fill="#FE7710"
            />
          </g>
          <defs>
            <clipPath id="clip0_171_341">
              <rect width="27.2219" height="27" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-[112px] shrink-0 items-center justify-between px-12 bg-[#f3f4f6]">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="w-10 h-10 rounded-xl bg-white shadow-md hover:bg-gray-50 transition-colors" />
            <div>
              <h1 className="text-[32px] font-normal text-gray-900 leading-tight mb-1.5">
                Hello, {firstName}
              </h1>
              <p className="text-base text-black font-normal">
                Welcome back! Track the progress here.
              </p>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center">
            <LanguageChangeDropdown />
            <Button
              variant="secondary"
              size="icon"
              className="relative hover:bg-gray-50 rounded-full w-8 h-8 ml-2"
              onClick={() => setNotificationOpen(true)}
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
              }}
            >
              <Bell className="h-4 w-4" style={{ color: "#4B5563" }} />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: "#EF4444" }}
              ></span>
            </Button>
            <div className="ml-4">
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Border line with padding */}
        <div className="px-12 bg-[#f3f4f6]">
          <div className="border-b border-gray-300"></div>
        </div>

        {/* Notification Modal */}
        <NotificationModal
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
        />

        {/* Main content */}
        <div className="flex-1 bg-[#f3f4f6] p-10">
          <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Row 1 - 3 columns: [TC+NL | TR | SH] */}
            <div className="grid grid-cols-3 gap-6">
              {/* Column 1: Total Clients + Newsletters (no gap between) */}
              <div className="flex flex-col gap-6">
                {/* Total Clients Card */}
                <Card
                  className="rounded-3xl border-0 shadow-sm overflow-hidden h-[140px] relative"
                  style={{
                    background: createThemeGradient(orgColors.primary),
                  }}
                >
                  {/* Top-left decorative SVG */}
                  <svg
                    className="absolute pointer-events-none"
                    width="100"
                    height="80"
                    viewBox="0 0 120 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMinYMin slice"
                    style={{
                      top: -20,
                      left: 0,
                    }}
                  >
                    <path
                      d="M20 0C8.954 0 0 8.954 0 20V58C6.123 60.764 22.589 63.705 47.584 55.153C73.345 46.340 79.599 26.910 80.619 0H20Z"
                      fill="white"
                      fillOpacity="0.15"
                    />
                  </svg>

                  {/* Bottom-right decorative SVG */}
                  <svg
                    className="absolute pointer-events-none"
                    width="150"
                    height="100"
                    viewBox="0 0 120 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMaxYMax slice"
                    style={{
                      bottom: -45,
                      right: 0,
                    }}
                  >
                    <path
                      d="M120 80C120 68.954 111.046 60 100 60H0C5.385 45 27.877 15 74.769 15C121.661 15 119.231 0 120 0V80Z"
                      fill="white"
                      fillOpacity="0.15"
                    />
                  </svg>

                  <CardContent className="p-8 h-full  flex items-center justify-between relative z-10">
                    <div className="text-white">
                      <h3 className="text-sm font-medium opacity-90 mb-2">
                        Total Clients
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold">
                          <AnimatedNumber
                            value={dashboardStats?.clients.total || 0}
                          />
                        </p>
                        {dashboardStats &&
                          dashboardStats.clients.active > 0 && (
                            <span className="px-3 py-1 bg-emerald-400 rounded-full text-xs font-semibold text-white">
                              {dashboardStats.clients.active} active
                            </span>
                          )}
                      </div>
                    </div>
                    {/* <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-orange-500" strokeWidth={2} />
                    </div> */}
                  </CardContent>
                </Card>

                {/* Newsletters Card - directly below TC with no gap */}
                <Card
                  className="rounded-3xl border-0 shadow-sm overflow-hidden h-[140px] relative"
                  style={{
                    background: createThemeGradient(orgColors.secondary),
                  }}
                >
                  {/* Top-left decorative SVG */}
                  <svg
                    className="absolute pointer-events-none"
                    width="100"
                    height="80"
                    viewBox="0 0 120 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMinYMin slice"
                    style={{
                      top: -20,
                      left: 0,
                    }}
                  >
                    <path
                      d="M20 0C8.954 0 0 8.954 0 20V58C6.123 60.764 22.589 63.705 47.584 55.153C73.345 46.340 79.599 26.910 80.619 0H20Z"
                      fill="white"
                      fillOpacity="0.15"
                    />
                  </svg>

                  {/* Bottom-right decorative SVG */}
                  <svg
                    className="absolute pointer-events-none"
                    width="150"
                    height="100"
                    viewBox="0 0 120 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMaxYMax slice"
                    style={{
                      bottom: -45,
                      right: 0,
                    }}
                  >
                    <path
                      d="M120 80C120 68.954 111.046 60 100 60H0C5.385 45 27.877 15 74.769 15C121.661 15 119.231 0 120 0V80Z"
                      fill="white"
                      fillOpacity="0.15"
                    />
                  </svg>

                  <CardContent className="p-8 h-full flex items-center justify-between relative z-10">
                    <div className="text-white">
                      <h3 className="text-sm font-medium opacity-90 mb-2">
                        Newsletters
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold">
                          <AnimatedNumber
                            value={dashboardStats?.newsletters.total || 0}
                          />
                        </p>
                        {dashboardStats &&
                          dashboardStats.newsletters.published > 0 && (
                            <span className="px-3 py-1 bg-emerald-400 rounded-full text-xs font-semibold text-white">
                              {dashboardStats.newsletters.published} published
                            </span>
                          )}
                      </div>
                    </div>
                    {/* <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-orange-500" strokeWidth={2} />
                    </div> */}
                  </CardContent>
                </Card>
              </div>

              {/* Column 2: Total Reports */}
              <Card className="rounded-3xl border-none bg-white h-80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1),0_8px_16px_-4px_rgba(0,0,0,0.06)]">
                <CardContent className="pt-12 h-full flex flex-col items-center justify-between relative">
                  <div className="w-full text-center">
                    <h3 className="text-lg font-normal text-gray-800">
                      Total Reports
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      <AnimatedNumber
                        value={dashboardStats?.reports.total || 0}
                      />
                    </p>
                    {dashboardStats && dashboardStats.reports.completed > 0 && (
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-semibold">
                        {dashboardStats.reports.completed}%
                      </span>
                    )}
                  </div>
                  {/* Area Chart */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end overflow-hidden rounded-b-3xl">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 350 141"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <clipPath id="roundedBottomClip_448_12">
                          <path d="M0,0 L350,0 L350,129 Q350,141 338,141 L12,141 Q0,141 0,129 Z" />
                        </clipPath>
                        <linearGradient
                          id="paint0_linear_448_12"
                          x1="167.059"
                          y1="-17.5"
                          x2="167.059"
                          y2="164.578"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#E9E3FF" />
                          <stop
                            offset="0.72165"
                            stop-color="#FE7710"
                            stop-opacity="0.05"
                          />
                        </linearGradient>
                        <linearGradient
                          id="paint1_linear_448_12"
                          x1="167"
                          y1="-203"
                          x2="167.059"
                          y2="164.578"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#E9E3FF" />
                          <stop
                            offset="0.72165"
                            stop-color="#FE7710"
                            stop-opacity="0.05"
                          />
                        </linearGradient>
                      </defs>
                      <g clipPath="url(#roundedBottomClip_448_12)">
                        <path
                          d="M28.482 59.0777C19.5053 67.4777 7.53648 60.2444 2.67412 55.5777L-26.5 190.078L357.813 205.078C360.244 143.911 361.965 19.2777 349.397 10.0777C333.688 -1.4223 325.834 20.0777 323.028 26.5777C320.223 33.0777 310.686 38.0777 302.831 36.0777C294.976 34.0777 278.145 59.0777 266.363 65.0777C254.581 71.0777 238.311 38.0777 231.018 32.5777C223.724 27.0778 217.553 39.0777 214.748 38.0777C211.942 37.0777 200.16 5.5777 191.745 6.0777C183.329 6.5777 176.036 36.0777 169.864 32.5777C163.693 29.0778 156.96 55.5777 136.202 73.0777C115.443 90.5777 107.028 6.57772 95.8069 2.57772C84.5861 -1.42228 81.2198 16.0777 69.999 32.5777C58.7782 49.0777 53.7288 36.5777 50.3626 32.5777C46.9963 28.5777 39.7028 48.5777 28.482 59.0777Z"
                          fill="url(#paint0_linear_448_12)"
                          stroke="#FE7710"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M28.482 59.0777C19.5053 67.4777 7.53648 60.2444 2.67412 55.5777L-26.5 190.078L357.813 205.078C360.244 143.911 361.965 19.2777 349.397 10.0777C333.688 -1.4223 325.834 20.0777 323.028 26.5777C320.223 33.0777 310.686 38.0777 302.831 36.0777C294.976 34.0777 278.145 59.0777 266.363 65.0777C254.581 71.0777 238.311 38.0777 231.018 32.5777C223.724 27.0778 217.553 39.0777 214.748 38.0777C211.942 37.0777 200.16 5.5777 191.745 6.0777C183.329 6.5777 176.036 36.0777 169.864 32.5777C163.693 29.0778 156.96 55.5777 136.202 73.0777C115.443 90.5777 107.028 6.57772 95.8069 2.57772C84.5861 -1.42228 81.2198 16.0777 69.999 32.5777C58.7782 49.0777 53.7288 36.5777 50.3626 32.5777C46.9963 28.5777 39.7028 48.5777 28.482 59.0777Z"
                          fill="url(#paint1_linear_448_12)"
                          stroke="#FE7710"
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* Column 3: System Health */}
              <Card className="rounded-3xl border-0 bg-white h-80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1),0_8px_16px_-4px_rgba(0,0,0,0.06)]">
                <CardContent className="p-7 h-full flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    System Health
                  </h2>
                  <div className="relative flex flex-col items-center flex-1 justify-center">
                    {/* Semi-circle gauge */}
                    <div className="relative w-56 h-32 mb-1">
                      <svg className="w-full h-full" viewBox="0 0 220 130">
                        <defs>
                          <linearGradient
                            id="gaugeGradient"
                            x1="0%"
                            y1="0%"
                            x2="120%"
                            y2="0%"
                          >
                            <stop
                              offset="0%"
                              stopColor={orgColors.primary}
                              stopOpacity="0.6"
                            />
                            <stop offset="100%" stopColor={orgColors.primary} />
                          </linearGradient>
                        </defs>
                        {/* Background arc */}
                        <path
                          d="M 30,110 A 80,80 0 0,1 190,110"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="10"
                          strokeLinecap="butt"
                        />
                        {/* Progress arc - dynamic based on score with animation */}
                        <AnimatedGaugePath
                          score={dashboardStats?.system_health.score || 0}
                        />
                      </svg>
                      {/* Theme-colored smiley icon with animated transitions */}
                      <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-[-10px]">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: "#0075ff" }}
                        >
                          <AnimatedEmoji
                            score={dashboardStats?.system_health.score || 0}
                            duration={2}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Gray percentage box */}
                    <div className="w-full bg-gray-100 rounded-2xl px-4 pb-3 pt-2 relative overflow-hidden">
                      {/* Gradient blur overlay - decreasing from top-left to bottom-right */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backdropFilter: "blur(100px)",
                          WebkitBackdropFilter: "blur(100px)",
                          background:
                            "linear-gradient(to bottom right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0) 100%)",
                          maskImage:
                            "linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)",
                          WebkitMaskImage:
                            "linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)",
                        }}
                      />
                      <div className="flex justify-between items-center text-xs text-gray-600 relative z-10">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <div className="text-center relative z-10">
                        <p className="text-3xl font-bold text-gray-900">
                          <AnimatedNumber
                            value={dashboardStats?.system_health.score || 0}
                            decimals={0}
                          />
                          %
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          Based on system
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 2 - 3 columns: [IS | RA (spans 2)] */}
            <div className="grid grid-cols-3 gap-6">
              {/* Column 1: Integration Status */}
              <Card className="rounded-3xl border-0 bg-white h-72 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1),0_8px_16px_-4px_rgba(0,0,0,0.06)]">
                <CardContent className="p-7">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Integration Status
                  </h2>
                  <div className="space-y-4">
                    {/* Yuki API */}
                    <div className="flex items-center gap-4 p-4 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <svg
                          width="29"
                          height="28"
                          viewBox="0 0 29 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19.0729 24.6091H5.8102C5.10034 24.6084 4.41976 24.3324 3.91782 23.8417C3.41587 23.351 3.13355 22.6857 3.13281 21.9918V14.2541C3.13355 13.5601 3.41587 12.8948 3.91782 12.4041C4.41976 11.9134 5.10034 11.6374 5.8102 11.6367H19.0729C19.7828 11.6374 20.4634 11.9134 20.9653 12.4041C21.4673 12.8948 21.7496 13.5601 21.7503 14.2541V21.9918C21.7496 22.6857 21.4673 23.351 20.9653 23.8417C20.4634 24.3324 19.7828 24.6084 19.0729 24.6091ZM5.8102 13.2773C5.5453 13.2776 5.29134 13.3806 5.10404 13.5637C4.91673 13.7468 4.81137 13.9951 4.81107 14.2541V21.9918C4.81137 22.2508 4.91673 22.499 5.10404 22.6821C5.29134 22.8652 5.5453 22.9682 5.8102 22.9685H19.0729C19.3378 22.9682 19.5918 22.8652 19.7791 22.6821C19.9664 22.499 20.0718 22.2508 20.0721 21.9918V14.2541C20.0718 13.9951 19.9664 13.7468 19.7791 13.5637C19.5918 13.3806 19.3378 13.2776 19.0729 13.2773H5.8102Z"
                            fill="#FFBB38"
                          />
                          <path
                            d="M22.8333 20.1917H20.9111C20.6886 20.1917 20.4751 20.1053 20.3178 19.9515C20.1604 19.7976 20.072 19.589 20.072 19.3714C20.072 19.1538 20.1604 18.9452 20.3178 18.7914C20.4751 18.6375 20.6886 18.5511 20.9111 18.5511H22.8333C23.098 18.5505 23.3517 18.4474 23.5387 18.2643C23.7258 18.0812 23.831 17.8331 23.8313 17.5744V9.83664C23.8312 9.57778 23.726 9.32954 23.5389 9.14635C23.3519 8.96315 23.0981 8.85995 22.8333 8.85938H9.57057C9.30568 8.85966 9.05172 8.96266 8.86441 9.14577C8.6771 9.32888 8.57174 9.57714 8.57145 9.83609V12.4567C8.57145 12.6743 8.48304 12.8829 8.32567 13.0368C8.16831 13.1906 7.95487 13.277 7.73232 13.277C7.50977 13.277 7.29633 13.1906 7.13896 13.0368C6.9816 12.8829 6.89319 12.6743 6.89319 12.4567V9.83664C6.89378 9.1426 7.17603 8.47715 7.678 7.98635C8.17996 7.49554 8.86062 7.21947 9.57057 7.21875H22.8333C23.5431 7.21976 24.2234 7.49595 24.7252 7.98673C25.2269 8.47751 25.509 9.14279 25.5096 9.83664V17.5744C25.5088 18.2681 25.2267 18.9333 24.725 19.4239C24.2233 19.9146 23.543 20.1907 22.8333 20.1917Z"
                            fill="#FFBB38"
                          />
                          <path
                            d="M20.9112 18.7464H3.97194C3.74939 18.7464 3.53596 18.6599 3.37859 18.5061C3.22122 18.3523 3.13281 18.1436 3.13281 17.9261V15.1709C3.13281 14.9533 3.22122 14.7447 3.37859 14.5909C3.53596 14.437 3.74939 14.3506 3.97194 14.3506H20.9112C21.1337 14.3506 21.3472 14.437 21.5045 14.5909C21.6619 14.7447 21.7503 14.9533 21.7503 15.1709V17.9261C21.7503 18.1436 21.6619 18.3523 21.5045 18.5061C21.3472 18.6599 21.1337 18.7464 20.9112 18.7464ZM4.81107 17.1057H20.0721V15.9912H4.81107V17.1057Z"
                            fill="#FFBB38"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Yuki API
                        </p>
                        <p
                          className={`font-medium text-xs mt-1 ${
                            dashboardStats?.integration.yuki_connected
                              ? "text-emerald-500"
                              : "text-gray-400"
                          }`}
                        >
                          {dashboardStats?.integration.yuki_connected
                            ? "Completed"
                            : "Not Connected"}
                        </p>
                      </div>
                    </div>

                    {/* Email Services */}
                    <div className="flex items-center gap-4 p-4 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg
                          width="29"
                          height="28"
                          viewBox="0 0 29 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M23.5224 8.38257C23.5083 6.85229 22.8771 5.38927 21.766 4.31126C20.6549 3.23325 19.1536 2.62731 17.5881 2.62507H8.95068C8.73614 2.62237 8.52774 2.6951 8.36345 2.83001C8.19916 2.96492 8.08991 3.15303 8.0556 3.36007L4.99446 22.1288C4.97533 22.2531 4.98382 22.38 5.01934 22.5008C5.05487 22.6215 5.11659 22.7334 5.20032 22.8288C5.28351 22.9265 5.38746 23.0052 5.50493 23.0596C5.62241 23.114 5.75059 23.1428 5.88058 23.1438H9.57723L9.38031 24.3601C9.3594 24.4861 9.36696 24.6151 9.40248 24.738C9.438 24.8609 9.5006 24.9747 9.5859 25.0715C9.6712 25.1682 9.77712 25.2455 9.89623 25.2979C10.0153 25.3504 10.1448 25.3767 10.2754 25.3751H14.4375C14.6507 25.3781 14.858 25.3066 15.0221 25.1735C15.1862 25.0403 15.2963 24.8543 15.3325 24.6488L16.2276 19.3026H19.0471C20.8118 19.2956 22.5019 18.6061 23.7481 17.3846C24.9943 16.1631 25.6951 14.509 25.6975 12.7838V12.5388C25.6966 11.7273 25.499 10.9276 25.1209 10.2052C24.7429 9.48272 24.1951 8.85813 23.5224 8.38257ZM9.71149 4.37507H17.5881C18.5272 4.37789 19.4376 4.69174 20.1707 5.26541C20.9038 5.83908 21.4164 6.63871 21.6249 7.53382C21.2377 7.44504 20.8411 7.40099 20.4434 7.40257H12.9785C12.764 7.39987 12.5556 7.4726 12.3913 7.60751C12.227 7.74242 12.1177 7.93053 12.0834 8.13757L11.5553 11.3751C11.5174 11.6071 11.5752 11.8444 11.7162 12.0348C11.8572 12.2251 12.0698 12.3529 12.3072 12.3901C12.5446 12.4272 12.7873 12.3706 12.9821 12.2328C13.1768 12.0949 13.3075 11.8871 13.3455 11.6551L13.7572 9.13507H20.4613C20.8904 9.13727 21.3153 9.21738 21.7144 9.37132C21.5442 10.7411 20.8682 12.003 19.8133 12.9198C18.7585 13.8366 17.3974 14.3452 15.9859 14.3501H11.8328C11.6196 14.347 11.4122 14.4185 11.2481 14.5517C11.084 14.6848 10.974 14.8709 10.9377 15.0763L9.84575 21.3938H6.92781L9.71149 4.37507ZM23.9073 12.7838C23.905 14.0448 23.3927 15.2538 22.4823 16.1471C21.5718 17.0404 20.337 17.5456 19.0471 17.5526H15.4668C15.2536 17.5495 15.0462 17.621 14.8821 17.7542C14.718 17.8873 14.608 18.0734 14.5717 18.2788L13.6767 23.6251H11.3137L11.5106 22.4088L12.5847 16.1176H15.968C17.639 16.1128 19.2614 15.5678 20.5825 14.5675C21.9036 13.5673 22.8492 12.168 23.2718 10.5876C23.6873 11.157 23.9095 11.8394 23.9073 12.5388V12.7838Z"
                            fill="#396AFF"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Email Services
                        </p>
                        <p
                          className={`font-medium text-xs mt-1 ${
                            dashboardStats?.integration.email_connected
                              ? "text-emerald-500"
                              : "text-gray-400"
                          }`}
                        >
                          {dashboardStats?.integration.email_connected
                            ? "Completed"
                            : "Not Connected"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Column 2-3: Recent Activity - Spans 2 columns */}
              <Card className="rounded-3xl border-0 bg-white h-72 col-span-2 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1),0_8px_16px_-4px_rgba(0,0,0,0.06)]">
                <CardContent className="p-7">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.slice(0, 3).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-4"
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-50">
                            {bellRefreshIcon()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">
                              {activity.title}
                            </p>
                          </div>
                          <div className="text-center px-4">
                            <p className="text-xs text-gray-400">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                          <div className="text-center px-4">
                            <p className="text-xs text-gray-400">
                              {getActivityTypeLabel(activity.type)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-xs font-semibold ${getActivityStatusColor(
                                activity
                              )}`}
                            >
                              {getActivityStatusDisplay(activity)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-400">
                          No recent activity
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 3 - 3 columns: [QA (spans 2) | empty] */}
            <div className="grid grid-cols-3 gap-6">
              {/* Column 1-2: Quick Actions - Spans 2 columns */}
              <Card className="rounded-3xl border-0 bg-white col-span-2 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1),0_8px_16px_-4px_rgba(0,0,0,0.06)]">
                <CardContent className="p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-8">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-5 gap-8">
                    {/* Generate Report */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer">
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.92074 10.2271H1.1367C0.509043 10.2271 0 10.7361 0 11.3638V23.8638C0 24.4909 0.509043 24.9999 1.1367 24.9999H3.92074C4.5484 24.9999 5.05692 24.4909 5.05692 23.8638V11.3638C5.05692 10.7361 4.5484 10.2271 3.92074 10.2271Z"
                            fill="#135290"
                          />
                          <path
                            d="M10.5686 13.6357H7.78453C7.15634 13.6357 6.64783 14.1448 6.64783 14.7724V23.8629C6.64783 24.4911 7.15634 24.9996 7.78453 24.9996H10.5686C11.1962 24.9996 11.7047 24.4905 11.7047 23.8629V14.7724C11.7047 14.1448 11.1962 13.6357 10.5686 13.6357Z"
                            fill="#135290"
                          />
                          <path
                            d="M17.2154 13.6357H14.4313C13.8037 13.6357 13.2952 14.1448 13.2952 14.7724V23.8629C13.2952 24.4911 13.8037 24.9996 14.4313 24.9996H17.2154C17.8436 24.9996 18.3521 24.4905 18.3521 23.8629V14.7724C18.3521 14.1448 17.8436 13.6357 17.2154 13.6357Z"
                            fill="#135290"
                          />
                          <path
                            d="M23.8633 10.2271H21.0793C20.4516 10.2271 19.9431 10.7361 19.9431 11.3638V23.8638C19.9431 24.4914 20.4516 24.9999 21.0793 24.9999H23.8633C24.491 24.9999 25 24.4903 25 23.8638V11.3638C25 10.7361 24.491 10.2271 23.8633 10.2271Z"
                            fill="#135290"
                          />
                          <path
                            d="M12.8314 6.8457V8.89145C13.4506 8.85049 14.1032 8.56007 14.1032 7.87868C14.1032 7.17549 13.3878 6.96964 12.8314 6.8457Z"
                            fill="#135290"
                          />
                          <path
                            d="M11.0521 4.39732C11.0521 4.91434 11.4367 5.21328 12.2117 5.3686V3.51807C11.5074 3.53881 11.0521 3.95264 11.0521 4.39732Z"
                            fill="#135290"
                          />
                          <path
                            d="M12.5 0C9.05372 0 6.25 2.80426 6.25 6.25C6.25 9.69468 9.05372 12.4989 12.5 12.4989C15.9463 12.4989 18.75 9.69468 18.75 6.25C18.75 2.80426 15.9463 0 12.5 0ZM12.8314 9.94628V10.5862C12.8314 10.7622 12.6963 10.9378 12.5197 10.9378C12.3452 10.9378 12.2117 10.7622 12.2117 10.5862V9.94628C10.4654 9.90372 9.59681 8.86011 9.59681 8.04362C9.59681 7.63138 9.84628 7.39309 10.2367 7.39309C11.3941 7.39309 10.4941 8.81915 12.2117 8.89096V6.73138C10.6798 6.45319 9.75213 5.78138 9.75213 4.63457C9.75213 3.22979 10.9202 2.50532 12.2117 2.46489V1.91383C12.2117 1.73777 12.3452 1.56223 12.5197 1.56223C12.6963 1.56223 12.8314 1.73777 12.8314 1.91383V2.46489C13.6367 2.48617 15.2904 2.99149 15.2904 4.00479C15.2904 4.40745 14.9894 4.64468 14.6378 4.64468C13.9654 4.64468 13.975 3.53989 12.8314 3.51862V5.48191C14.1952 5.77181 15.4032 6.17447 15.4032 7.76596C15.4032 9.15 14.3702 9.85213 12.8314 9.94628Z"
                            fill="#135290"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-center text-gray-700 font-medium leading-tight">
                        Generate
                        <br />
                        Report
                      </span>
                    </div>

                    {/* View Clients */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 28 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.3125 14C10.4871 14 12.25 12.2371 12.25 10.0625C12.25 7.88788 10.4871 6.125 8.3125 6.125C6.13788 6.125 4.375 7.88788 4.375 10.0625C4.375 12.2371 6.13788 14 8.3125 14Z"
                            fill="#135290"
                          />
                          <path
                            d="M12.7969 16.1875C11.2569 15.4055 9.55719 15.0938 8.3125 15.0938C5.87453 15.0938 0.875 16.5889 0.875 19.5781V21.875H9.07812V20.9962C9.07812 19.9571 9.51562 18.9153 10.2812 18.0469C10.8921 17.3534 11.7474 16.7098 12.7969 16.1875Z"
                            fill="#135290"
                          />
                          <path
                            d="M18.5938 15.75C15.7462 15.75 10.0625 17.5087 10.0625 21V23.625H27.125V21C27.125 17.5087 21.4413 15.75 18.5938 15.75Z"
                            fill="#135290"
                          />
                          <path
                            d="M18.5938 14C21.2516 14 23.4062 11.8454 23.4062 9.1875C23.4062 6.52963 21.2516 4.375 18.5938 4.375C15.9359 4.375 13.7812 6.52963 13.7812 9.1875C13.7812 11.8454 15.9359 14 18.5938 14Z"
                            fill="#135290"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-center text-gray-700 font-medium leading-tight">
                        View
                        <br />
                        Clients
                      </span>
                    </div>

                    {/* Create Newsletter */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 28 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6.55196 23.3332C6.01452 23.3332 5.56613 23.1535 5.20679 22.7942C4.84746 22.4348 4.6674 21.9861 4.66663 21.4478V6.55184C4.66663 6.01439 4.84668 5.566 5.20679 5.20667C5.5669 4.84734 6.01529 4.66728 6.55196 4.6665H17.3903C17.6485 4.6665 17.8943 4.71706 18.1276 4.81817C18.361 4.91928 18.5624 5.055 18.732 5.22534L22.7745 9.26784C22.944 9.43739 23.0793 9.63884 23.1805 9.87217C23.2816 10.1055 23.3325 10.3513 23.3333 10.6095V21.4478C23.3333 21.9853 23.1536 22.4337 22.7943 22.793C22.435 23.1523 21.9862 23.3324 21.448 23.3332H6.55196ZM17.5 5.83317V9.55717C17.5 9.82395 17.5902 10.0479 17.7706 10.2292C17.9511 10.4104 18.1751 10.5006 18.4426 10.4998H22.1666L17.5 5.83317ZM18.6666 18.6665C18.8323 18.6665 18.9707 18.6105 19.082 18.4985C19.1932 18.3865 19.2492 18.2477 19.25 18.082C19.2507 17.9163 19.1947 17.7779 19.082 17.6667C18.9692 17.5554 18.8307 17.4998 18.6666 17.4998H9.33329C9.16763 17.4998 9.02918 17.5558 8.91796 17.6678C8.80674 17.7798 8.75074 17.9187 8.74996 18.0843C8.74918 18.25 8.80518 18.3884 8.91796 18.4997C9.03074 18.6109 9.16918 18.6665 9.33329 18.6665H18.6666ZM13.4166 10.4998C13.5823 10.4998 13.7207 10.4438 13.832 10.3318C13.9432 10.2198 13.9992 10.081 14 9.91534C14.0007 9.74967 13.9447 9.61123 13.832 9.5C13.7192 9.38878 13.5807 9.33317 13.4166 9.33317H9.33329C9.16763 9.33317 9.02918 9.38917 8.91796 9.50117C8.80674 9.61317 8.75074 9.752 8.74996 9.91767C8.74918 10.0833 8.80518 10.2218 8.91796 10.333C9.03074 10.4442 9.16918 10.4998 9.33329 10.4998H13.4166ZM18.6666 14.5832C18.8323 14.5832 18.9707 14.5272 19.082 14.4152C19.1932 14.3032 19.2492 14.1643 19.25 13.9987C19.2507 13.833 19.1947 13.6946 19.082 13.5833C18.9692 13.4721 18.8307 13.4165 18.6666 13.4165H9.33329C9.16763 13.4165 9.02918 13.4725 8.91796 13.5845C8.80674 13.6965 8.75074 13.8353 8.74996 14.001C8.74918 14.1667 8.80518 14.3051 8.91796 14.4163C9.03074 14.5276 9.16918 14.5832 9.33329 14.5832H18.6666Z"
                            fill="#135290"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-center text-gray-700 font-medium leading-tight">
                        Create
                        <br />
                        Newsletter
                      </span>
                    </div>

                    {/* Integration Settings */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer">
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22.6985 9.41406H22.1678C21.9954 8.87451 21.7778 8.35039 21.5172 7.84683L21.8931 7.47095C22.8045 6.56055 22.7801 5.10156 21.8934 4.21582L20.7845 3.10693C19.8993 2.22056 18.44 2.19487 17.5293 3.10659L17.1532 3.48276C16.6496 3.22222 16.1254 3.00464 15.5859 2.83223V2.30142C15.5859 1.03242 14.5535 0 13.2845 0H11.7155C10.4465 0 9.41406 1.03242 9.41406 2.30142V2.83223C8.87456 3.00459 8.35039 3.22217 7.84683 3.48276L7.471 3.10693C6.56216 2.19702 5.10293 2.21836 4.21592 3.10664L3.10688 4.21558C2.22056 5.10093 2.19492 6.56001 3.10659 7.4707L3.48276 7.84687C3.22217 8.35044 3.00464 8.87451 2.83223 9.41411H2.30146C1.03247 9.41406 0 10.4465 0 11.7155V13.2845C0 14.5535 1.03247 15.5859 2.30146 15.5859H2.83223C3.00464 16.1255 3.22217 16.6496 3.48276 17.1532L3.10688 17.5291C2.19551 18.4395 2.21992 19.8984 3.10659 20.7842L4.21553 21.8931C5.10073 22.7794 6.56001 22.8051 7.47065 21.8934L7.84683 21.5172C8.35039 21.7778 8.87456 21.9954 9.41406 22.1678V22.6986C9.41406 23.9676 10.4465 25 11.7155 25H13.2845C14.5535 25 15.586 23.9676 15.586 22.6986V22.1678C16.1255 21.9954 16.6497 21.7778 17.1532 21.5172L17.5291 21.8931C18.4379 22.803 19.8971 22.7816 20.7841 21.8934L21.8932 20.7844C22.7795 19.899 22.8051 18.4399 21.8935 17.5292L21.5173 17.1531C21.7779 16.6495 21.9954 16.1254 22.1678 15.5858H22.6986C23.9676 15.5858 25 14.5534 25 13.2844V11.7154C25 10.4465 23.9675 9.41406 22.6985 9.41406ZM12.5 17.9395C9.50064 17.9395 7.06055 15.4993 7.06055 12.5C7.06055 9.50068 9.50064 7.06055 12.5 7.06055C15.4994 7.06055 17.9395 9.50068 17.9395 12.5C17.9395 15.4993 15.4994 17.9395 12.5 17.9395Z"
                            fill="#135290"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-center text-gray-700 font-medium leading-tight">
                        Integration
                        <br />
                        Settings
                      </span>
                    </div>

                    {/* Organization Settings */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 3H6.25C5.38805 3 4.5614 3.34241 3.9519 3.9519C3.34241 4.5614 3 5.38805 3 6.25V8.5H14V3ZM15.5 8.5H21V6.25C21 5.38805 20.6576 4.5614 20.0481 3.9519C19.4386 3.34241 18.612 3 17.75 3H15.5V8.5ZM10 10V14H12.022C12.6098 13.0802 13.4197 12.3232 14.3771 11.7989C15.3344 11.2746 16.4085 10.9999 17.5 11C18.7405 10.9981 19.9554 11.3528 21 12.022V10H10ZM3 15.5H11.314C11.1055 16.1462 10.9996 16.821 11 17.5C10.9981 18.7405 11.3528 19.9554 12.022 21H6.25C5.38805 21 4.5614 20.6576 3.9519 20.0481C3.34241 19.4386 3 18.612 3 17.75V15.5ZM8.5 10H3V14H8.5V10ZM14.277 13.976C14.3516 14.2345 14.3733 14.5055 14.3407 14.7726C14.3082 15.0397 14.222 15.2975 14.0875 15.5306C13.953 15.7636 13.7728 15.9671 13.5577 16.1289C13.3427 16.2906 13.0972 16.4073 12.836 16.472L12.252 16.617C12.1579 17.2158 12.1599 17.8258 12.258 18.424L12.798 18.554C13.0616 18.6175 13.3095 18.7339 13.5267 18.8962C13.7439 19.0585 13.9258 19.2632 14.0614 19.4979C14.1971 19.7327 14.2835 19.9926 14.3156 20.2618C14.3477 20.531 14.3247 20.8039 14.248 21.064L14.061 21.695C14.501 22.081 15.001 22.395 15.546 22.617L16.039 22.098C16.2258 21.9015 16.4507 21.745 16.6998 21.6381C16.949 21.5312 17.2173 21.476 17.4885 21.476C17.7597 21.476 18.028 21.5312 18.2772 21.6381C18.5263 21.745 18.7512 21.9015 18.938 22.098L19.437 22.624C19.9779 22.4034 20.4787 22.0949 20.919 21.711L20.721 21.025C20.6464 20.7664 20.6248 20.4954 20.6574 20.2282C20.69 19.961 20.7762 19.7032 20.9109 19.4701C21.0455 19.2371 21.2258 19.0336 21.441 18.8719C21.6561 18.7102 21.9017 18.5935 22.163 18.529L22.746 18.384C22.8401 17.7852 22.8381 17.1752 22.74 16.577L22.2 16.447C21.9365 16.3834 21.6887 16.2669 21.4716 16.1046C21.2545 15.9423 21.0727 15.7375 20.9372 15.5028C20.8017 15.268 20.7153 15.0082 20.6833 14.739C20.6513 14.4698 20.6743 14.197 20.751 13.937L20.937 13.306C20.4967 12.9187 19.9953 12.6071 19.453 12.384L18.96 12.902C18.7732 13.0987 18.5483 13.2553 18.299 13.3623C18.0497 13.4693 17.7813 13.5245 17.51 13.5245C17.2387 13.5245 16.9703 13.4693 16.721 13.3623C16.4717 13.2553 16.2468 13.0987 16.06 12.902L15.562 12.377C15.018 12.597 14.518 12.907 14.079 13.29L14.277 13.976ZM17.5 19C16.7 19 16.05 18.329 16.05 17.5C16.05 16.672 16.7 16 17.5 16C18.3 16 18.95 16.672 18.95 17.5C18.95 18.329 18.3 19 17.5 19Z"
                            fill="#135290"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-center text-gray-700 font-medium leading-tight">
                        Organization
                        <br />
                        Settings
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Column 3: Empty */}
              <div></div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
