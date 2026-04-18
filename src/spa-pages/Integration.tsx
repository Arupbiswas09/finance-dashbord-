import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Trash2,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  Users,
  RefreshCw,
  Settings
} from "lucide-react";
import { useAuth, axiosAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface CronJob {
  id: number;
  job_type: string;
  job_name: string;
  description: string;
  frequency: string;
  scheduled_time: string;
  scheduled_day: number | null;
  is_enabled: boolean;
  status: string;
  last_run_at: string | null;
  next_run_at: string | null;
  last_run_status: string | null;
  run_count: number;
  created_at: string;
}

const Integration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [executingJobs, setExecutingJobs] = useState<Set<number>>(new Set());

  // Form state for creating/editing cron jobs
  const [formData, setFormData] = useState({
    job_type: "fetch_clients",
    job_name: "",
    description: "",
    frequency: "weekly",
    scheduled_time: "09:00",
    scheduled_day: 1, // Monday for weekly
    is_enabled: true
  });

  const weekDays = [
    { value: 0, label: "Monday" },
    { value: 1, label: "Tuesday" },
    { value: 2, label: "Wednesday" },
    { value: 3, label: "Thursday" },
    { value: 4, label: "Friday" },
    { value: 5, label: "Saturday" },
    { value: 6, label: "Sunday" }
  ];

  useEffect(() => {
    fetchCronJobs();
  }, []);

  const fetchCronJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosAuth.get("/api/cron-jobs/");
      setCronJobs(response.data.jobs);
    } catch (error) {
      console.error("Error fetching cron jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cron jobs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCronJob = async () => {
    try {
      setLoading(true);

      const payload = {
        ...formData,
        scheduled_day: formData.frequency === "weekly" ? formData.scheduled_day : null
      };

      await axiosAuth.post("/api/cron-jobs/", payload);

      toast({
        title: "Success",
        description: "Cron job created successfully"
      });

      setShowCreateDialog(false);
      fetchCronJobs();
      resetForm();
    } catch (error: any) {
      console.error("Error creating cron job:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create cron job",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCronJob = async (jobId: number) => {
    try {
      await axiosAuth.post(`/api/cron-jobs/${jobId}/toggle`);
      toast({
        title: "Success",
        description: "Cron job toggled successfully"
      });
      fetchCronJobs();
    } catch (error: any) {
      console.error("Error toggling cron job:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to toggle cron job",
        variant: "destructive"
      });
    }
  };

  const handleExecuteCronJob = async (jobId: number) => {
    try {
      setExecutingJobs(prev => new Set(prev).add(jobId));

      const response = await axiosAuth.post(`/api/cron-jobs/${jobId}/execute`);

      toast({
        title: "Success",
        description: response.data.message,
      });

      fetchCronJobs();
    } catch (error: any) {
      console.error("Error executing cron job:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to execute cron job",
        variant: "destructive"
      });
    } finally {
      setExecutingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleDeleteCronJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this cron job?")) {
      return;
    }

    try {
      await axiosAuth.delete(`/api/cron-jobs/${jobId}`);
      toast({
        title: "Success",
        description: "Cron job deleted successfully"
      });
      fetchCronJobs();
    } catch (error: any) {
      console.error("Error deleting cron job:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete cron job",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      job_type: "fetch_clients",
      job_name: "",
      description: "",
      frequency: "weekly",
      scheduled_time: "09:00",
      scheduled_day: 1,
      is_enabled: true
    });
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case "fetch_clients":
        return <Users className="h-4 w-4" />;
      case "generate_reports":
        return <FileText className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "fetch_clients":
        return "Fetch Clients";
      case "generate_reports":
        return "Generate Reports";
      default:
        return type;
    }
  };

  const getFrequencyLabel = (frequency: string, scheduledDay?: number | null) => {
    if (frequency === "daily") {
      return "Daily";
    } else if (frequency === "weekly" && scheduledDay !== null && scheduledDay !== undefined) {
      const day = weekDays.find(d => d.value === scheduledDay);
      return `Weekly (${day?.label || "Unknown"})`;
    } else if (frequency === "monthly") {
      return "Monthly";
    }
    return frequency;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "running":
        return <Badge className="bg-blue-500">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Integration & Automation</h1>
          <p className="text-gray-600 mt-2">
            Configure automated tasks for fetching clients and generating reports
          </p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Automated Scheduling</AlertTitle>
          <AlertDescription>
            Set up automated tasks to fetch clients from Yuki and generate reports at scheduled intervals.
            Tasks will run automatically based on your configured schedule.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Scheduled Tasks</CardTitle>
              <CardDescription>
                Manage automated tasks for your organization
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Automated Task</DialogTitle>
                  <DialogDescription>
                    Configure a new automated task for your organization
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Task Type</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fetch_clients">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Fetch Clients from Yuki
                          </div>
                        </SelectItem>
                        <SelectItem value="generate_reports">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Generate Reports
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_name">Task Name</Label>
                    <Input
                      id="job_name"
                      placeholder="e.g., Weekly Client Sync"
                      value={formData.job_name}
                      onChange={(e) => setFormData({ ...formData, job_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of the task"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.frequency === "weekly" && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduled_day">Day of Week</Label>
                      <Select
                        value={formData.scheduled_day?.toString()}
                        onValueChange={(value) => setFormData({ ...formData, scheduled_day: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {weekDays.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="scheduled_time">Scheduled Time</Label>
                    <Input
                      id="scheduled_time"
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_enabled">Enable Task</Label>
                    <Switch
                      id="is_enabled"
                      checked={formData.is_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCronJob} disabled={loading || !formData.job_name}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent>
            {loading && cronJobs.length === 0 ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">Loading tasks...</p>
              </div>
            ) : cronJobs.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="text-lg font-medium mt-4">No automated tasks</h3>
                <p className="text-gray-500 mt-2">
                  Create your first automated task to get started
                </p>
                <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Runs</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cronJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{job.job_name}</div>
                          {job.description && (
                            <div className="text-sm text-gray-500">{job.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getJobTypeIcon(job.job_type)}
                          {getJobTypeLabel(job.job_type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{getFrequencyLabel(job.frequency, job.scheduled_day)}</div>
                          <div className="text-gray-500">at {job.scheduled_time}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDateTime(job.last_run_at)}</div>
                          {job.last_run_status && (
                            <Badge
                              variant={job.last_run_status === "success" ? "default" : "destructive"}
                              className="mt-1"
                            >
                              {job.last_run_status}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(job.next_run_at)}
                      </TableCell>
                      <TableCell>{job.run_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExecuteCronJob(job.id)}
                            disabled={executingJobs.has(job.id)}
                          >
                            {executingJobs.has(job.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleCronJob(job.id)}
                          >
                            {job.is_enabled ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCronJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Integration;
