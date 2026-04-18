import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Server, 
  Database, 
  Cloud, 
  Shield,
  Key,
  Brain,
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Zap
} from 'lucide-react';
import { buildApiUrl } from '@/lib/api';

interface SystemMetrics {
  cpu_percent: number;
  memory_percent: number;
  memory_available_gb: number;
  disk_percent: number;
  disk_free_gb: number;
}

interface HealthService {
  status: string;
  configured: boolean;
  response_time_ms?: number;
  error?: string;
  region?: string;
  user_pool_id?: string;
  pool_name?: string;
  available_models?: number;
  connection?: boolean;
}

interface HealthStatus {
  timestamp: string;
  server: {
    status: string;
    environment: string;
    uptime_seconds: number;
    uptime_human: string;
    system: SystemMetrics;
  };
  database: HealthService;
  aws_cognito: HealthService;
  aws_bedrock: HealthService;
  aws_secrets_manager: HealthService;
  overall_status: string;
  check_duration_ms: number;
  services_summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    not_configured: number;
  };
}

export default function Health() {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(buildApiUrl('/api/health/detailed'));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setHealthData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchHealthData, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ready':
      case 'alive':
      case 'configured':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
      case 'unhealthy':
      case 'not_ready':
      case 'disconnected':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300';
      case 'degraded':
      case 'not_configured':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string, size = "h-4 w-4") => {
    switch (status) {
      case 'healthy':
      case 'ready':
      case 'alive':
      case 'configured':
        return <CheckCircle className={`${size} text-emerald-600`} />;
      case 'unhealthy':
      case 'not_ready':
      case 'disconnected':
        return <AlertCircle className={`${size} text-red-600`} />;
      default:
        return <Clock className={`${size} text-amber-600`} />;
    }
  };

  const getOverallStatusGradient = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-gradient-to-br from-emerald-500 to-teal-600';
      case 'unhealthy':
        return 'bg-gradient-to-br from-red-500 to-rose-600';
      case 'degraded':
        return 'bg-gradient-to-br from-amber-500 to-orange-600';
      default:
        return 'bg-gradient-to-br from-slate-500 to-slate-600';
    }
  };

  const formatResponseTime = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 100) return `${ms}ms`;
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 mx-auto border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <Activity className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Loading System Health</h3>
                <p className="text-sm text-muted-foreground">Checking all services...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              System Health
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring of all system components
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
              <Badge variant="outline" className="text-xs">
                Last: {lastUpdated.toLocaleTimeString()}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                Auto-refresh
              </Button>
              <Button
                onClick={fetchHealthData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-red-800 dark:text-red-300">Health Check Failed</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {healthData && (
          <>
            {/* Overall Status Hero Card */}
            <Card className="overflow-hidden">
              <div className={`${getOverallStatusGradient(healthData.overall_status)} text-white p-6`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(healthData.overall_status, "h-8 w-8")}
                      <div>
                        <h2 className="text-2xl font-bold">
                          {healthData.overall_status.replace('_', ' ').toUpperCase()}
                        </h2>
                        <p className="text-white/80 text-sm">
                          System Status • Checked {new Date(healthData.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{healthData.services_summary.total}</div>
                      <div className="text-xs text-white/80">Total Services</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-200">{healthData.services_summary.healthy}</div>
                      <div className="text-xs text-white/80">Healthy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-200">{healthData.services_summary.unhealthy}</div>
                      <div className="text-xs text-white/80">Unhealthy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-200">{healthData.services_summary.not_configured}</div>
                      <div className="text-xs text-white/80">Not Config'd</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Environment:</span>
                    <Badge variant="outline">{healthData.server.environment}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="font-mono font-medium">{healthData.server.uptime_human}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Check Time:</span>
                    <span className="font-mono font-medium">{formatResponseTime(healthData.check_duration_ms)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Metrics */}
            {healthData.server.system && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>System Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Cpu className="h-4 w-4 text-blue-500" />
                          <span>CPU Usage</span>
                        </div>
                        <span className="font-mono">{healthData.server.system.cpu_percent?.toFixed(1) || 'N/A'}%</span>
                      </div>
                      <Progress value={healthData.server.system.cpu_percent || 0} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <MemoryStick className="h-4 w-4 text-green-500" />
                          <span>Memory Usage</span>
                        </div>
                        <span className="font-mono">{healthData.server.system.memory_percent?.toFixed(1) || 'N/A'}%</span>
                      </div>
                      <Progress value={healthData.server.system.memory_percent || 0} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <HardDrive className="h-4 w-4 text-purple-500" />
                          <span>Disk Usage</span>
                        </div>
                        <span className="font-mono">{healthData.server.system.disk_percent?.toFixed(1) || 'N/A'}%</span>
                      </div>
                      <Progress value={healthData.server.system.disk_percent || 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Database */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-blue-600" />
                    <span>Database</span>
                    <Badge className={getStatusColor(healthData.database.status)}>
                      {healthData.database.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Connection:</span>
                    <Badge variant={healthData.database.connection ? "default" : "destructive"}>
                      {healthData.database.connection ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Response Time:</span>
                    <span className="text-sm font-mono">
                      {formatResponseTime(healthData.database.response_time_ms)}
                    </span>
                  </div>
                  {healthData.database.error && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                      {healthData.database.error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Authentication Service */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <span>Authentication Service</span>
                    <Badge className={getStatusColor(healthData.aws_cognito.status)}>
                      {healthData.aws_cognito.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Region:</span>
                    <Badge variant="outline" className="text-xs">
                      {healthData.aws_cognito.region}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Response Time:</span>
                    <span className="text-sm font-mono">
                      {formatResponseTime(healthData.aws_cognito.response_time_ms)}
                    </span>
                  </div>
                  {healthData.aws_cognito.pool_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pool:</span>
                      <span className="text-xs font-mono truncate max-w-24">
                        {healthData.aws_cognito.pool_name}
                      </span>
                    </div>
                  )}
                  {healthData.aws_cognito.error && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                      {healthData.aws_cognito.error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Service */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>AI Service</span>
                    <Badge className={getStatusColor(healthData.aws_bedrock.status)}>
                      {healthData.aws_bedrock.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Region:</span>
                    <Badge variant="outline" className="text-xs">
                      {healthData.aws_bedrock.region}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Response Time:</span>
                    <span className="text-sm font-mono">
                      {formatResponseTime(healthData.aws_bedrock.response_time_ms)}
                    </span>
                  </div>
                  {healthData.aws_bedrock.available_models && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Models:</span>
                      <Badge variant="secondary">
                        {healthData.aws_bedrock.available_models}
                      </Badge>
                    </div>
                  )}
                  {healthData.aws_bedrock.error && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                      {healthData.aws_bedrock.error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Secrets Manager */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-emerald-600" />
                    <span>Secrets Manager</span>
                    <Badge className={getStatusColor(healthData.aws_secrets_manager.status)}>
                      {healthData.aws_secrets_manager.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Region:</span>
                    <Badge variant="outline" className="text-xs">
                      {healthData.aws_secrets_manager.region}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Response Time:</span>
                    <span className="text-sm font-mono">
                      {formatResponseTime(healthData.aws_secrets_manager.response_time_ms)}
                    </span>
                  </div>
                  {healthData.aws_secrets_manager.error && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                      {healthData.aws_secrets_manager.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Health Endpoints</span>
                </CardTitle>
                <CardDescription>
                  Direct access to health check endpoints for monitoring tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start" asChild>
                    <a href={buildApiUrl('/health')} target="_blank" rel="noopener noreferrer">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Basic Health
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href={buildApiUrl('/api/health/live')} target="_blank" rel="noopener noreferrer">
                      <Activity className="h-4 w-4 mr-2" />
                      Liveness Probe
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href={buildApiUrl('/api/health/ready')} target="_blank" rel="noopener noreferrer">
                      <Clock className="h-4 w-4 mr-2" />
                      Readiness Probe
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}