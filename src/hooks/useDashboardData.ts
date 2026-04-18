import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { buildApiUrl, getAuthHeaders, API_ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";
import { isShowcaseMode } from "@/lib/showcaseMode";
import {
  SHOWCASE_DASHBOARD_STATS,
  SHOWCASE_RECENT_ACTIVITY,
} from "@/lib/showcaseMockData";

// Dashboard data types
export interface DashboardStats {
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

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export function useDashboardData() {
  const { user, loading } = useAuth();
  const orgColors = useOrganizationColors();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const headers = getAuthHeaders();

      const [statsResponse, activityResponse] = await Promise.all([
        fetch(buildApiUrl(API_ENDPOINTS.dashboardStats), { headers }),
        fetch(buildApiUrl(API_ENDPOINTS.dashboardActivity), { headers }),
      ]);

      if (!statsResponse.ok || !activityResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData = await statsResponse.json();
      const activityData = await activityResponse.json();

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
  }, [toast]);

  useEffect(() => {
    if (isShowcaseMode()) {
      setDashboardStats(SHOWCASE_DASHBOARD_STATS as unknown as DashboardStats);
      setRecentActivity(
        SHOWCASE_RECENT_ACTIVITY.map((a) => ({ ...a })) as Activity[],
      );
      setLoadingData(false);
      return;
    }
    if (!loading && user) {
      fetchDashboardData();
    }
  }, [loading, user, fetchDashboardData]);

  const firstName = user?.full_name?.split(" ")[0] || "User";

  const isLoading = loading || orgColors.loading || loadingData;

  return {
    user,
    firstName,
    dashboardStats,
    recentActivity,
    orgColors,
    isLoading,
    refetch: fetchDashboardData,
  };
}

// Utility functions
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateLong(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getActivityTypeLabel(type: string) {
  if (type === "report") return "Report";
  if (type === "newsletter") return "Newsletter";
  return type;
}

export function getActivityStatusDisplay(activity: Activity) {
  if (activity.type === "newsletter" && activity.status === "draft") {
    return "Draft";
  }
  if (activity.status === "completed") return "Completed";
  return activity.status;
}
