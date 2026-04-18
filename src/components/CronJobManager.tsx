import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DayPickerInput } from "@/components/ui/day-picker-input";
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Trash2,
  Plus,
  Edit,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Users,
  RefreshCw,
  Mail,
} from "lucide-react";
import { axiosAuth } from "@/contexts/AuthContext";
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
  last_run_summary: string | null;  // User-friendly execution summary
  run_count: number;
  created_at: string;
  config?: {
    client_ids?: number[];
    custom_prompt?: string;
  };
}

interface Client {
  id: number;
  name: string;
}

const CronJobManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [executingJobs, setExecutingJobs] = useState<Set<number>>(new Set());
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // Form state for creating/editing cron jobs
  const [formData, setFormData] = useState({
    job_type: "fetch_clients",
    job_name: "",
    description: "",
    frequency: "weekly",
    scheduled_time: "09:00",
    scheduled_day: 0, // Monday for weekly
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
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      // Fetch all clients with a large page size to get the full list
      const response = await axiosAuth.get("/api/clients/?size=1000");
      // Handle different response structures
      const clientData = Array.isArray(response.data) ? response.data : (response.data.clients || []);
      setClients(clientData);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]); // Set to empty array on error
    }
  };

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

  const handleOpenDialog = (job?: CronJob) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        job_type: job.job_type,
        job_name: job.job_name,
        description: job.description || "",
        frequency: job.frequency,
        scheduled_time: job.scheduled_time,
        scheduled_day: job.scheduled_day || 0,
        is_enabled: job.is_enabled
      });
      // Load selected client IDs and custom prompt from config
      setSelectedClientIds(job.config?.client_ids || []);
      setCustomPrompt(job.config?.custom_prompt || "");
    } else {
      setEditingJob(null);
      resetForm();
      setSelectedClientIds([]);
      setCustomPrompt("");
    }
    setShowDialog(true);
  };

  const handleSaveCronJob = async () => {
    try {
      setLoading(true);

      const payload = {
        ...formData,
        scheduled_day: ["weekly", "monthly", "quarterly", "half_yearly"].includes(formData.frequency)
          ? formData.scheduled_day
          : null,
        config: {
          client_ids: selectedClientIds.length > 0 ? selectedClientIds : null,
          custom_prompt: customPrompt ? customPrompt : null
        }
      };

      if (editingJob) {
        await axiosAuth.put(`/api/cron-jobs/${editingJob.id}`, payload);
        toast({
          title: "Success",
          description: "Cron job updated successfully"
        });
      } else {
        await axiosAuth.post("/api/cron-jobs/", payload);
        toast({
          title: "Success",
          description: "Cron job created successfully"
        });
      }

      setShowDialog(false);
      fetchCronJobs();
      resetForm();
      setSelectedClientIds([]);
      setCustomPrompt("");
    } catch (error: any) {
      console.error("Error saving cron job:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save cron job",
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
      scheduled_day: 0,
      is_enabled: true
    });
    setEditingJob(null);
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case "fetch_clients":
        return <Users className="h-4 w-4" />;
      case "generate_reports":
        return <FileText className="h-4 w-4" />;
      case "generate_newsletter":
        return <Mail className="h-4 w-4" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "fetch_clients":
        return "Fetch Clients";
      case "generate_reports":
        return "Generate Reports";
      case "generate_newsletter":
        return "Generate Newsletter";
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
    } else if (frequency === "monthly" && scheduledDay !== null && scheduledDay !== undefined) {
      return `Monthly (Day ${scheduledDay})`;
    } else if (frequency === "quarterly" && scheduledDay !== null && scheduledDay !== undefined) {
      return `Quarterly (Day ${scheduledDay})`;
    } else if (frequency === "half_yearly" && scheduledDay !== null && scheduledDay !== undefined) {
      return `Half-Yearly (Day ${scheduledDay})`;
    } else if (frequency === "monthly") {
      return "Monthly";
    } else if (frequency === "quarterly") {
      return "Quarterly";
    } else if (frequency === "half_yearly") {
      return "Half-Yearly";
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
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getBrowserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  return (
    <div className="space-y-6">
      {/* Timezone Information Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Timezone Information</AlertTitle>
        <AlertDescription className="text-blue-800">
          All cron jobs are scheduled in <strong>CET (Central European Time)</strong>.
          Times are displayed below in your local timezone: <strong>{getBrowserTimezone()}</strong>.
          The scheduled time you enter will be interpreted as CET.
        </AlertDescription>
      </Alert>

      <Alert>
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
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
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
              <Button className="mt-4" onClick={() => handleOpenDialog()}>
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
                        {job.last_run_summary && (
                          <div className="mt-1 text-xs text-gray-600 max-w-xs">
                            {job.last_run_summary}
                          </div>
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
                          title="Run Now"
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
                          onClick={() => handleOpenDialog(job)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleCronJob(job.id)}
                          title={job.is_enabled ? "Disable" : "Enable"}
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
                          title="Delete"
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

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit" : "Create"} Automated Task</DialogTitle>
            <DialogDescription>
              Configure {editingJob ? "this" : "a new"} automated task for your organization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 pb-4">
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
                  <SelectItem value="generate_newsletter">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Generate Newsletter
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

            {formData.job_type === "generate_newsletter" && (
              <div className="space-y-2">
                <Label htmlFor="custom_prompt">Custom Prompt</Label>
                <Textarea
                  id="custom_prompt"
                  placeholder="Enter a custom prompt for newsletter generation (e.g., 'Create a newsletter highlighting top performing clients and key financial trends')"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-gray-500">
                  This prompt will be used to guide the AI in generating the newsletter content.
                </p>
              </div>
            )}

            {formData.job_type === "generate_reports" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Select Clients (Optional)</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Leave empty to generate reports for all clients
                    </p>
                  </div>
                  {clients.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedClientIds.length === clients.length) {
                          setSelectedClientIds([]);
                        } else {
                          setSelectedClientIds(clients.map(c => c.id));
                        }
                      }}
                    >
                      {selectedClientIds.length === clients.length ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                </div>

                <div className="border rounded-lg bg-gray-50 p-4 max-h-64 overflow-y-auto">
                  {clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Users className="h-12 w-12 mb-2" />
                      <p className="text-sm">No clients available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {clients.map((client) => (
                        <label
                          key={client.id}
                          htmlFor={`client-${client.id}`}
                          className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors ${
                            selectedClientIds.includes(client.id)
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-white border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`client-${client.id}`}
                            checked={selectedClientIds.includes(client.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClientIds([...selectedClientIds, client.id]);
                              } else {
                                setSelectedClientIds(selectedClientIds.filter(id => id !== client.id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                          />
                          <span className="text-sm font-medium text-gray-900 flex-1 truncate" title={client.name}>
                            {client.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {selectedClientIds.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="px-3 py-1">
                      {selectedClientIds.length} / {clients.length} clients selected
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value, scheduled_day: value === "weekly" ? 0 : 1 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly (Every 3 Months)</SelectItem>
                  <SelectItem value="half_yearly">Half-Yearly (Every 6 Months)</SelectItem>
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

            {(formData.frequency === "monthly" || formData.frequency === "quarterly" || formData.frequency === "half_yearly") && (
              <div className="space-y-2">
                <Label htmlFor="scheduled_day">Day of Month</Label>
                <DayPickerInput
                  selectedDay={formData.scheduled_day}
                  onSelectDay={(day: number) => setFormData({ ...formData, scheduled_day: day })}
                />
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formData.frequency === "quarterly" && "Job will run every 3 months on the selected day"}
                  {formData.frequency === "half_yearly" && "Job will run every 6 months on the selected day"}
                  {formData.frequency === "monthly" && "Job will run every month on the selected day"}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Scheduled Time (CET)</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
              />
              <p className="text-sm text-gray-500">
                <Clock className="inline h-3 w-3 mr-1" />
                Time will be scheduled in CET (Central European Time)
              </p>
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
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCronJob} disabled={loading || !formData.job_name}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingJob ? "Update" : "Create"} Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CronJobManager;
