import { useAuth } from "@/contexts/AuthContext";
import { buildApiUrl } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoleBadge } from "@/components/RoleBadge";
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Settings,
  Shield,
  Eye,
  BarChart3,
  UserPlus,
  FileCheck,
  AlertCircle,
  ArrowRight,
  Mail,
  Building2,
  Activity,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

interface DashboardStats {
  clients: { total: number; active: number };
  reports: { total: number; completed: number; recent: number };
  newsletters: { total: number; published: number; recent: number };
  integration: { 
    status: string; 
    yuki_connected: boolean;
    email_connected: boolean;
    yuki_last_tested: string | null;
    email_last_tested: string | null;
  };
  system_health: { score: number; status: string };
  organization: { name: string; created_at: string | null };
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  color: string;
}

export function RoleDashboard() {
  const { user, isOwner, isManager, isViewer } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        toast({
          title: "Authentication Required",
          description: "Please log in to access your dashboard.",
          variant: "destructive",
        });
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all dashboard data in parallel
      const [statsResponse, activitiesResponse, actionsResponse] = await Promise.all([
        fetch(buildApiUrl('/api/dashboard/stats'), { headers }),
        fetch(buildApiUrl('/api/dashboard/recent-activity'), { headers }),
        fetch(buildApiUrl('/api/dashboard/quick-actions'), { headers })
      ]);

      // Check for authentication errors
      if (statsResponse.status === 401 || activitiesResponse.status === 401 || actionsResponse.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id_token');
        setError('Session expired. Please log in again.');
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        window.location.href = '/login';
        return;
      }

      if (!statsResponse.ok || !activitiesResponse.ok || !actionsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, activitiesData, actionsData] = await Promise.all([
        statsResponse.json(),
        activitiesResponse.json(),
        actionsResponse.json()
      ]);

      setStats(statsData);
      setActivities(Array.isArray(activitiesData.activities) ? activitiesData.activities : []);
      setQuickActions(Array.isArray(actionsData.actions) ? actionsData.actions : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Failed to load dashboard</h3>
          <p className="text-sm text-muted-foreground">{error || 'Unknown error occurred'}</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'needs_attention': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'published': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Owner Dashboard
  if (isOwner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Hi, {user.full_name || user.email}</h2>
            <p className="text-muted-foreground">
              {t("Full system control and management")}
            </p>
          </div>
          <RoleBadge role="owner" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/clients')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Total Clients")}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clients.total}</div>
              <p className="text-xs text-muted-foreground">{stats.clients.active} active</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/reports')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Total Reports")}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reports.total}</div>
              <p className="text-xs text-muted-foreground">{stats.reports.completed} completed</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/newsletter')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Newsletters")}</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newsletters.total}</div>
              <p className="text-xs text-muted-foreground">{stats.newsletters.published} published</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/organization-settings')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("System Health")}</CardTitle>
              <Shield className={`h-4 w-4 ${getHealthColor(stats.system_health.status)}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.system_health.score}%</div>
              <Progress value={stats.system_health.score} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Integration Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("Integration Status")}
            </CardTitle>
            <CardDescription>{t("External service connections")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Yuki API</span>
                </div>
                <div className="flex items-center gap-2">
                  {stats.integration.yuki_connected ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">{t("Connected")}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">{t("Not Connected")}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t("Email Service")}</span>
                </div>
                <div className="flex items-center gap-2">
                  {stats.integration.email_connected ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">{t("Configured")}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">{t("Not Configured")}</span>
                    </>
                  )}
                </div>
              </div>

              {!stats.integration.yuki_connected || !stats.integration.email_connected ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate('/organization-settings?tab=integration')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t("Configure Integrations")}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("Quick Actions")}</CardTitle>
              <CardDescription>{t("Manage your platform")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((action) => {
                const quickIcons = {
                  FileText,
                  Users,
                  Settings,
                  Mail,
                  Building2,
                  BarChart3,
                  UserPlus,
                } as const;
                type QuickIconName = keyof typeof quickIcons;
                const IconComponent =
                  quickIcons[action.icon as QuickIconName] ?? Settings;
                
                return (
                  <Button 
                    key={action.id}
                    variant="outline" 
                    className="justify-start"
                    onClick={() => navigate(action.url)}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {action.title}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("Recent Activity")}</CardTitle>
              <CardDescription>{t("Latest platform activity")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {activities.length > 0 ? activities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 text-sm">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description} • {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">{t("No recent activity")}</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("System Status")}</CardTitle>
            <CardDescription>{t("System health and integration status")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className={`h-4 w-4 ${stats.integration.yuki_connected ? 'text-green-500' : 'text-red-500'}`} />
              <span>{t("Yuki integration")} {stats.integration.yuki_connected ? t("connected") : t("disconnected")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className={`h-4 w-4 ${stats.integration.email_connected ? 'text-green-500' : 'text-red-500'}`} />
              <span>{t("Email service")} {stats.integration.email_connected ? t("configured") : t("not configured")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className={`h-4 w-4 ${getHealthColor(stats.system_health.status)}`} />
              <span>{t("System health")}: {stats.system_health.status}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span>{stats.reports.recent} {t("reports created this month")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Manager Dashboard
  if (isManager) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Hi, {user.full_name || user.email}</h2>
            <p className="text-muted-foreground">
              {t("Team and transaction management")}
            </p>
          </div>
          <RoleBadge role="manager" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/clients')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Total Clients")}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clients.total}</div>
              <p className="text-xs text-muted-foreground">{stats.clients.active} {t("active")}</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/reports')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Total Reports")}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reports.total}</div>
              <p className="text-xs text-muted-foreground">{stats.reports.recent} {t("this month")}</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/newsletters')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("Newsletters")}</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newsletters.total}</div>
              <p className="text-xs text-muted-foreground">{stats.newsletters.recent} {t("recent")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("Your Actions")}</CardTitle>
              <CardDescription>{t("Manage transactions and reports")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((action) => {
                const adminQuickIcons = {
                  FileText,
                  Users,
                  Settings,
                  Mail,
                  Building2,
                  BarChart3,
                  UserPlus,
                  FileCheck,
                } as const;
                type AdminQuickIconName = keyof typeof adminQuickIcons;
                const IconComponent =
                  adminQuickIcons[action.icon as AdminQuickIconName] ?? Settings;
                
                return (
                  <Button 
                    key={action.id}
                    variant="outline" 
                    className="justify-start"
                    onClick={() => navigate(action.url)}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {action.title}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("Recent Activity")}</CardTitle>
              <CardDescription>{t("Your team's latest actions")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {activities.length > 0 ? activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 text-sm">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description} • {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">{t("No recent activity")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Viewer Dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hi, {user.full_name || user.email}</h2>
          <p className="text-muted-foreground">
            {t("View reports and track performance")}
          </p>
        </div>
        <RoleBadge role="viewer" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/reports')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Available Reports")}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reports.total}</div>
            <p className="text-xs text-muted-foreground">{stats.reports.completed} {t("completed")}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/newsletters')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Newsletters")}</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newsletters.total}</div>
            <p className="text-xs text-muted-foreground">{stats.newsletters.published} {t("published")}</p>
          </CardContent>
        </Card>

        <Card className="cursor-not-allowed opacity-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("System Status")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.system_health.score}%</div>
            <p className="text-xs text-muted-foreground">{stats.system_health.status}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Available Actions")}</CardTitle>
          <CardDescription>{t("Access your permitted features")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {quickActions.map((action) => {
            const viewerQuickIcons = {
              FileText,
              Users,
              Settings,
              Mail,
              Building2,
              BarChart3,
              UserPlus,
              Eye,
            } as const;
            type ViewerQuickIconName = keyof typeof viewerQuickIcons;
            const IconComponent =
              viewerQuickIcons[action.icon as ViewerQuickIconName] ?? Eye;
            
            return (
              <Button 
                key={action.id}
                variant="outline" 
                className="justify-start"
                onClick={() => navigate(action.url)}
              >
                <IconComponent className="mr-2 h-4 w-4" />
                {action.title}
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            );
          })}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t("As a viewer, you have read-only access to reports and dashboards. Contact your manager or owner for additional permissions.")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}