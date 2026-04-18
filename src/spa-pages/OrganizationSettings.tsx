import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfile } from "@/components/UserProfile";
import { Separator } from "@/components/ui/separator";
import CronJobManager from "@/components/CronJobManager";
import PromptManagement from "@/components/PromptManagement";
import {
  Bell,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2,
  Link as LinkIcon,
  Users,
  UserPlus,
  Trash2,
  Settings,
  Edit,
  Mail,
  Info,
  XCircle,
  TestTube,
  Upload,
  Image as ImageIcon,
  Calendar,
  FileText,
} from "lucide-react";
import { useAuth, axiosAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const OrganizationSettings = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Get tab from URL params, default to 'details'
  const activeTab = searchParams.get("tab") || "details";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // Organization Details State
  const [organizationDetails, setOrganizationDetails] = useState({
    name: "",
    description: "",
    alert_email: "",
    org_id: "",
    is_active: true,
    logo_url: null as string | null,
    phone: "",
    website: "",
    address: "",
    primary_email: "",
    calendly_link: "",
    primary_color: "#0ea5e9",
    secondary_color: "#000000",
  });

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Integration State
  const [integrationData, setIntegrationData] = useState({
    yuki_api_endpoint: "",
    yuki_api_key: "",
    yuki_api_key_set: false,
    demo_mode: false,
  });

  // Notification State
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: {
      report_generation: true,
      invoice_reminders: true,
      missing_documents: true,
      weekly_summary: false,
      system_updates: true,
    },
    dashboard_notifications: {
      realtime_updates: true,
      ai_suggestions: true,
      approval_requests: true,
      performance_updates: false,
    },
    integration_notifications: {
      sync_failures: true,
      api_errors: true,
    },
  });

  // Users State
  const [organizationUsers, setOrganizationUsers] = useState([]);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    full_name: "",
    role_name: "viewer",
    password: "",
  });
  const [availableRoles] = useState([
    { name: "admin", label: "Administrator" },
    { name: "manager", label: "Manager" },
    { name: "viewer", label: "Viewer" },
  ]);

  // Email Configuration State
  const [emailConfig, setEmailConfig] = useState({
    email_provider: "gmail" as "gmail" | "outlook",
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    smtp_use_tls: true,
    smtp_use_ssl: false,
    smtp_from_email: "",
    smtp_from_name: "",
    email_configured: false,
    email_last_tested_at: null as string | null,
  });
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");

  // Load organization data on component mount
  useEffect(() => {
    if (user?.organization?.id) {
      loadOrganizationData();
      loadOrganizationUsers();
      loadEmailConfig();
    }
  }, [user]);

  const loadOrganizationData = async () => {
    try {
      if (!user?.organization?.id) return;

      const [integrationRes, orgRes] = await Promise.all([
        axiosAuth.get(`/api/organizations/${user.organization.id}/integration`),
        axiosAuth.get(`/api/organizations/${user.organization.id}`),
      ]);

      setIntegrationData({
        yuki_api_endpoint: integrationRes.data.yuki_api_endpoint || "",
        yuki_api_key: "",
        yuki_api_key_set: integrationRes.data.yuki_api_key_set || false,
        demo_mode: integrationRes.data.demo_mode || false,
      });

      setOrganizationDetails({
        name: orgRes.data.name || "",
        description: orgRes.data.description || "",
        alert_email: integrationRes.data.alert_email || "",
        org_id: orgRes.data.org_id || "",
        is_active: orgRes.data.is_active || true,
        logo_url: orgRes.data.logo_url || null,
        phone: orgRes.data.phone || "",
        website: orgRes.data.website || "",
        address: orgRes.data.address || "",
        primary_email: orgRes.data.primary_email || "",
        calendly_link: orgRes.data.calendly_link || "",
        primary_color: orgRes.data.primary_color || "#0ea5e9",
        secondary_color: orgRes.data.secondary_color || "#000000",
      });

      setNotificationSettings(
        orgRes.data.notification_settings || notificationSettings
      );
    } catch (error) {
      console.error("Failed to load organization data:", error);
    }
  };

  const loadOrganizationUsers = async () => {
    try {
      if (!user?.organization?.id) return;

      const response = await axiosAuth.get(
        `/api/organizations/${user.organization.id}/users`
      );
      setOrganizationUsers(response.data);
    } catch (error) {
      console.error("Failed to load organization users:", error);
      toast({
        title: "Error",
        description: "Failed to load organization users",
        variant: "destructive",
      });
    }
  };

  const loadEmailConfig = async () => {
    try {
      if (!user?.organization?.id) return;

      const response = await axiosAuth.get(
        `/api/organizations/${user.organization.id}/email-config`
      );
      const data = response.data;

      setEmailConfig({
        email_provider: data.email_provider || "gmail",
        smtp_host: data.smtp_host || "smtp.gmail.com",
        smtp_port: data.smtp_port || 587,
        smtp_username: data.smtp_username || "",
        smtp_password: "", // Password is never returned
        smtp_use_tls: true,
        smtp_use_ssl: false,
        smtp_from_email: data.smtp_from_email || "",
        smtp_from_name: data.smtp_from_name || "",
        email_configured: data.email_configured || false,
        email_last_tested_at: data.email_last_tested_at,
      });

      if (data.smtp_username) {
        setTestEmailAddress(data.smtp_username);
      }
    } catch (error) {
      console.error("Failed to load email config:", error);
    }
  };

  const handleEmailProviderChange = (provider: "gmail" | "outlook") => {
    const defaults = {
      gmail: {
        smtp_host: "smtp.gmail.com",
        smtp_port: 587,
        smtp_use_tls: true,
        smtp_use_ssl: false,
      },
      outlook: {
        smtp_host: "smtp-mail.outlook.com",
        smtp_port: 587,
        smtp_use_tls: true,
        smtp_use_ssl: false,
      },
    };

    setEmailConfig({
      ...emailConfig,
      email_provider: provider,
      ...defaults[provider],
    });
  };

  const handleEmailConfigSave = async () => {
    if (!user?.organization?.id) return;

    if (!emailConfig.smtp_username || !emailConfig.smtp_password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosAuth.put(
        `/api/organizations/${user.organization.id}/email-config`,
        emailConfig
      );

      toast({
        title: "Success",
        description: "Email configuration saved successfully",
      });

      // Clear password field after saving
      setEmailConfig({
        ...emailConfig,
        smtp_password: "",
        email_configured: true,
      });

      // Reload email config
      await loadEmailConfig();
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Failed to save email configuration";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!user?.organization?.id) return;

    if (!testEmailAddress) {
      toast({
        title: "Error",
        description: "Please enter a recipient email address",
        variant: "destructive",
      });
      return;
    }

    setTestingEmail(true);
    try {
      await axiosAuth.post(
        `/api/organizations/${user.organization.id}/email-test`,
        {
          recipient_email: testEmailAddress,
        }
      );

      toast({
        title: "Success",
        description: `Test email sent to ${testEmailAddress}`,
      });

      // Reload email config to get updated last tested timestamp
      await loadEmailConfig();
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Failed to send test email";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleDeleteEmailConfig = async () => {
    if (!user?.organization?.id) return;

    if (!confirm("Are you sure you want to delete your email configuration?")) {
      return;
    }

    try {
      await axiosAuth.delete(
        `/api/organizations/${user.organization.id}/email-config`
      );

      toast({
        title: "Success",
        description: "Email configuration deleted successfully",
      });

      // Reset form
      handleEmailProviderChange("gmail");
      setEmailConfig({
        ...emailConfig,
        smtp_username: "",
        smtp_password: "",
        smtp_from_email: "",
        smtp_from_name: "",
        email_configured: false,
        email_last_tested_at: null,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete email configuration",
        variant: "destructive",
      });
    }
  };

  const handleOrganizationDetailsSave = async () => {
    if (!user?.organization?.id) return;

    setLoading(true);
    try {
      // Update organization basic details
      await axiosAuth.put(`/api/organizations/${user.organization.id}`, {
        name: organizationDetails.name,
        description: organizationDetails.description,
        phone: organizationDetails.phone,
        website: organizationDetails.website,
        address: organizationDetails.address,
        primary_email: organizationDetails.primary_email,
        calendly_link: organizationDetails.calendly_link,
        primary_color: organizationDetails.primary_color,
        secondary_color: organizationDetails.secondary_color,
      });

      // Update alert email via integration endpoint
      await axiosAuth.put(
        `/api/organizations/${user.organization.id}/integration`,
        {
          alert_email: organizationDetails.alert_email,
        }
      );

      toast({
        title: "Success",
        description: "Organization details updated successfully",
      });

      await loadOrganizationData(); // Reload to get updated status

      // Trigger organization data refresh across the app
      window.dispatchEvent(new Event("organization-colors-updated"));
      window.dispatchEvent(new Event("organization-data-updated"));
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail ||
          "Failed to update organization details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationSave = async () => {
    if (!user?.organization?.id) return;

    setLoading(true);
    try {
      await axiosAuth.put(
        `/api/organizations/${user.organization.id}/integration`,
        {
          yuki_api_endpoint: integrationData.yuki_api_endpoint,
          yuki_api_key: integrationData.yuki_api_key || undefined,
          demo_mode: integrationData.demo_mode,
        }
      );

      toast({
        title: "Success",
        description: "Integration settings updated successfully",
      });

      await loadOrganizationData(); // Reload to get updated status
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail ||
          "Failed to update integration settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!user?.organization?.id) return;

    setTestingConnection(true);
    try {
      const response = await axiosAuth.post(
        `/api/organizations/${user.organization.id}/yuki/test-connection`
      );

      if (response.data.success) {
        toast({
          title: "Connection Test Successful",
          description:
            response.data.message || "Successfully connected to Yuki API",
        });
      } else {
        toast({
          title: "Connection Test Failed",
          description: response.data.error || "Failed to connect to Yuki API",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Test Failed",
        description:
          error.response?.data?.detail || "Failed to connect to Yuki API",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleNotificationSave = async () => {
    if (!user?.organization?.id) return;

    setLoading(true);
    try {
      await axiosAuth.put(
        `/api/organizations/${user.organization.id}/notifications`,
        {
          notification_settings: notificationSettings,
        }
      );

      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail ||
          "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!user?.organization?.id) return;

    if (!newUserData.email || !newUserData.full_name || !newUserData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newUserData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await axiosAuth.post(
        `/api/organizations/${user.organization.id}/users`,
        newUserData
      );

      toast({
        title: "Success",
        description: "User added successfully",
      });

      setShowAddUserDialog(false);
      setNewUserData({
        email: "",
        full_name: "",
        role_name: "viewer",
        password: "",
      });

      await loadOrganizationUsers(); // Reload users list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    if (!user?.organization?.id) return;

    setLoading(true);
    try {
      await axiosAuth.put(
        `/api/organizations/${user.organization.id}/users/${userId}/role?role_name=${newRole}`
      );

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      await loadOrganizationUsers(); // Reload users list
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!user?.organization?.id) return;

    if (
      !confirm(
        "Are you sure you want to remove this user from the organization?"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axiosAuth.delete(
        `/api/organizations/${user.organization.id}/users/${userId}`
      );

      toast({
        title: "Success",
        description: "User removed successfully",
      });

      await loadOrganizationUsers(); // Reload users list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to remove user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!user?.organization?.id || !logoFile) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(logoFile.type)) {
      toast({
        title: "Error",
        description: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (logoFile.size > maxSize) {
      toast({
        title: "Error",
        description: "File size exceeds 5MB limit",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", logoFile);

      const response = await axiosAuth.post(
        `/api/organizations/${user.organization.id}/logo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });

      // Update organization details with new logo URL
      setOrganizationDetails((prev) => ({
        ...prev,
        logo_url: response.data.logo_url,
      }));
      setLogoFile(null);

      await loadOrganizationData();
      // Refresh user data to update organization logo in navigation bar
      if (refreshUser) {
        await refreshUser();
      }
      // Trigger organization data refresh across the app
      window.dispatchEvent(new Event("organization-logo-updated"));
      window.dispatchEvent(new Event("organization-data-updated"));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoDelete = async () => {
    if (!user?.organization?.id) return;

    if (!confirm("Are you sure you want to delete your organization logo?")) {
      return;
    }

    setUploadingLogo(true);
    try {
      await axiosAuth.delete(`/api/organizations/${user.organization.id}/logo`);

      toast({
        title: "Success",
        description: "Logo deleted successfully",
      });

      setOrganizationDetails((prev) => ({ ...prev, logo_url: null }));
      await loadOrganizationData();
      // Refresh user data to update organization logo in navigation bar
      if (refreshUser) {
        await refreshUser();
      }
      // Trigger organization data refresh across the app
      window.dispatchEvent(new Event("organization-logo-updated"));
      window.dispatchEvent(new Event("organization-data-updated"));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Check if user is admin
  const isAdmin = user?.role?.name === "admin";

  if (!user) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="flex flex-1 items-center justify-end px-4">
              <UserProfile />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-0">
            <Alert>
              <AlertDescription>
                Please log in to access organization settings.
              </AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!isAdmin) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="flex flex-1 items-center justify-end px-4">
              <UserProfile />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-0">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only organization administrators can access organization
                settings.
              </AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
              Organization Settings
            </h1>
          </div>
          <div className="flex flex-1 items-center justify-end px-4">
            <UserProfile />
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-4 md:pt-6">
          <div className="mb-4 md:mb-6">
            <p className="text-sm md:text-base text-muted-foreground">
              Manage {user.organization?.name} settings, integrations, and users
            </p>
          </div>

          <Tabs
            value={activeTab}
            className="space-y-6 md:space-y-8"
            onValueChange={handleTabChange}
          >
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="inline-flex w-full min-w-max md:grid md:grid-cols-6 md:w-full h-auto">
                <TabsTrigger
                  value="details"
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="integration"
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  Integrations
                </TabsTrigger>
                <TabsTrigger
                  value="automation"
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  Automation
                </TabsTrigger>
                <TabsTrigger
                  value="prompts"
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  AI Prompts
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  Users
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Organization Details Tab */}
            <TabsContent value="details">
              <Card className="shadow-card max-w-4xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <CardTitle>Organization Details</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your organization information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload Section */}
                  <div className="border rounded-lg p-6 bg-muted/30">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        {organizationDetails.logo_url ? (
                          <div className="relative group">
                            <img
                              src={organizationDetails.logo_url}
                              alt="Organization Logo"
                              className="w-32 h-32 object-contain rounded-lg border bg-white"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleLogoDelete}
                                disabled={uploadingLogo}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center bg-white">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Organization Logo
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Upload your organization logo. Max size: 5MB.
                            Formats: JPEG, PNG, GIF, WebP
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setLogoFile(file);
                            }}
                            disabled={uploadingLogo}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleLogoUpload}
                            disabled={!logoFile || uploadingLogo}
                            variant="secondary"
                          >
                            {uploadingLogo ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="org_name"
                          className="text-sm font-medium"
                        >
                          Organization Name
                        </Label>
                        <Input
                          id="org_name"
                          value={organizationDetails.name}
                          onChange={(e) =>
                            setOrganizationDetails((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Your Company Name"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="org_description"
                          className="text-sm font-medium"
                        >
                          Description
                        </Label>
                        <Input
                          id="org_description"
                          value={organizationDetails.description}
                          onChange={(e) =>
                            setOrganizationDetails((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Brief description of your organization"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="alert_email"
                          className="text-sm font-medium"
                        >
                          Alert Email
                        </Label>
                        <Input
                          id="alert_email"
                          type="email"
                          value={organizationDetails.alert_email}
                          onChange={(e) =>
                            setOrganizationDetails((prev) => ({
                              ...prev,
                              alert_email: e.target.value,
                            }))
                          }
                          placeholder="admin@company.com"
                          className="h-10"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email address for system alerts and notifications
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={organizationDetails.phone}
                          onChange={(e) =>
                            setOrganizationDetails((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="+1 (555) 123-4567"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="website"
                          className="text-sm font-medium"
                        >
                          Website
                        </Label>
                        <Input
                          id="website"
                          type="url"
                          value={organizationDetails.website}
                          onChange={(e) =>
                            setOrganizationDetails((prev) => ({
                              ...prev,
                              website: e.target.value,
                            }))
                          }
                          placeholder="https://www.example.com"
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Organization ID
                        </Label>
                        <Input
                          value={organizationDetails.org_id}
                          disabled
                          className="bg-muted h-10"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Unique identifier for your organization
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="flex items-center h-10">
                          <Badge
                            variant={
                              organizationDetails.is_active
                                ? "default"
                                : "secondary"
                            }
                            className="h-6"
                          >
                            {organizationDetails.is_active
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="primary_email"
                          className="text-sm font-medium"
                        >
                          Primary Email
                        </Label>
                        <Input
                          id="primary_email"
                          type="email"
                          value={organizationDetails.primary_email}
                          onChange={(e) =>
                            setOrganizationDetails((prev) => ({
                              ...prev,
                              primary_email: e.target.value,
                            }))
                          }
                          placeholder="contact@company.com"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="calendly_link"
                          className="text-sm font-medium"
                        >
                          Booking Link
                        </Label>
                        <Input
                          id="calendly_link"
                          type="url"
                          value={organizationDetails.calendly_link}
                          onChange={(e) =>
                            setOrganizationDetails((prev) => ({
                              ...prev,
                              calendly_link: e.target.value,
                            }))
                          }
                          placeholder="https://calendly.com/your-link or any booking URL"
                          className="h-10"
                        />
                        <p className="text-xs text-muted-foreground">
                          This link will appear as a "Book a Call" button in shared report chats
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="address"
                          className="text-sm font-medium"
                        >
                          Address
                        </Label>
                        <Input
                          id="address"
                          value={organizationDetails.address}
                          onChange={(e) =>
                            setOrganizationDetails((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          placeholder="123 Business St, City, Country"
                          className="h-10"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="primary_color"
                            className="text-sm font-medium"
                          >
                            Primary Color
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="primary_color"
                              type="color"
                              value={organizationDetails.primary_color}
                              onChange={(e) =>
                                setOrganizationDetails((prev) => ({
                                  ...prev,
                                  primary_color: e.target.value,
                                }))
                              }
                              className="h-10 w-16 p-1 cursor-pointer"
                            />
                            <Input
                              value={organizationDetails.primary_color}
                              onChange={(e) =>
                                setOrganizationDetails((prev) => ({
                                  ...prev,
                                  primary_color: e.target.value,
                                }))
                              }
                              placeholder="#0ea5e9"
                              className="h-10 flex-1 font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="secondary_color"
                            className="text-sm font-medium"
                          >
                            Secondary Color
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="secondary_color"
                              type="color"
                              value={organizationDetails.secondary_color}
                              onChange={(e) =>
                                setOrganizationDetails((prev) => ({
                                  ...prev,
                                  secondary_color: e.target.value,
                                }))
                              }
                              className="h-10 w-16 p-1 cursor-pointer"
                            />
                            <Input
                              value={organizationDetails.secondary_color}
                              onChange={(e) =>
                                setOrganizationDetails((prev) => ({
                                  ...prev,
                                  secondary_color: e.target.value,
                                }))
                              }
                              placeholder="#000000"
                              className="h-10 flex-1 font-mono text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <p className="text-sm font-semibold mb-2">
                          Organization Info
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Your organization was created and is managed through
                          this platform. Contact support for advanced
                          configuration options.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleOrganizationDetailsSave}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Organization Details
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integration Tab */}
            <TabsContent value="integration">
              <Tabs defaultValue="yuki" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="yuki">Yuki Integration</TabsTrigger>
                  <TabsTrigger value="email">Email Configuration</TabsTrigger>
                </TabsList>

                {/* Yuki Integration Sub-tab */}
                <TabsContent value="yuki">
                  <Card className="shadow-card max-w-4xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-5 w-5" />
                          <CardTitle>Yuki Integration</CardTitle>
                        </div>
                        <Badge
                          variant={
                            integrationData.yuki_api_key_set
                              ? "default"
                              : "secondary"
                          }
                          className="flex items-center gap-1"
                        >
                          {integrationData.yuki_api_key_set ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Connected
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              Not Connected
                            </>
                          )}
                        </Badge>
                      </div>
                      <CardDescription>
                        Connect to Yuki for automated accounting data
                        synchronization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="yuki_endpoint">API Endpoint</Label>
                          <Input
                            id="yuki_endpoint"
                            value={integrationData.yuki_api_endpoint}
                            onChange={(e) =>
                              setIntegrationData((prev) => ({
                                ...prev,
                                yuki_api_endpoint: e.target.value,
                              }))
                            }
                            placeholder="https://api.yukiworks.be/ws/accounting.asmx"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="yuki_key">API Key</Label>
                          <Input
                            id="yuki_key"
                            type="password"
                            value={integrationData.yuki_api_key}
                            onChange={(e) =>
                              setIntegrationData((prev) => ({
                                ...prev,
                                yuki_api_key: e.target.value,
                              }))
                            }
                            placeholder={
                              integrationData.yuki_api_key_set
                                ? "API key is set (enter new key to change)"
                                : "Enter your Yuki API key"
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Your API key is encrypted and stored securely
                          </p>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label className="font-medium">Demo Mode</Label>
                            <p className="text-sm text-muted-foreground">
                              Use demo data instead of live API calls
                            </p>
                          </div>
                          <Switch
                            checked={integrationData.demo_mode}
                            onCheckedChange={(checked) =>
                              setIntegrationData((prev) => ({
                                ...prev,
                                demo_mode: checked,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {integrationData.demo_mode && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Demo mode is enabled. The system will use sample
                            data instead of making actual API calls to Yuki.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleTestConnection}
                          disabled={testingConnection || loading}
                          variant="outline"
                          className="flex-1"
                        >
                          {testingConnection ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <TestTube className="h-4 w-4 mr-2" />
                              Test Connection
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={handleIntegrationSave}
                          disabled={loading || testingConnection}
                          className="flex-1"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Integration Settings
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Email Configuration Sub-tab */}
                <TabsContent value="email">
                  <Card className="shadow-card max-w-4xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          <CardTitle>Email Configuration</CardTitle>
                        </div>
                        <Badge
                          variant={
                            emailConfig.email_configured
                              ? "default"
                              : "secondary"
                          }
                          className="flex items-center gap-1"
                        >
                          {emailConfig.email_configured ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Configured
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              Not Configured
                            </>
                          )}
                        </Badge>
                      </div>
                      <CardDescription>
                        Configure SMTP settings to send emails from your
                        organization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {emailConfig.email_configured ? (
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div>
                                  <p className="font-medium">
                                    Email is configured
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Provider: {emailConfig.email_provider} |
                                    From: {emailConfig.smtp_from_email}
                                    {emailConfig.email_last_tested_at && (
                                      <>
                                        {" "}
                                        | Last tested:{" "}
                                        {new Date(
                                          emailConfig.email_last_tested_at
                                        ).toLocaleString()}
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteEmailConfig}
                              >
                                Delete Configuration
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Email not configured</AlertTitle>
                          <AlertDescription>
                            Configure your email settings below to start sending
                            newsletters and reports.
                          </AlertDescription>
                        </Alert>
                      )}

                      <Tabs
                        value={emailConfig.email_provider}
                        onValueChange={(v) =>
                          handleEmailProviderChange(v as "gmail" | "outlook")
                        }
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="gmail">Gmail</TabsTrigger>
                          <TabsTrigger value="outlook">Outlook</TabsTrigger>
                        </TabsList>

                        <TabsContent value="gmail" className="space-y-4">
                          <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>Gmail Setup Instructions</AlertTitle>
                            <AlertDescription className="mt-2">
                              <ol className="list-decimal list-inside space-y-2">
                                <li>
                                  Enable 2-Factor Authentication in your Google
                                  Account settings
                                </li>
                                <li>
                                  Generate an App Password:
                                  <ul className="list-disc list-inside ml-4 mt-1">
                                    <li>
                                      Go to{" "}
                                      <a
                                        href="https://myaccount.google.com/apppasswords"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline text-blue-600"
                                      >
                                        Google App Passwords
                                      </a>
                                    </li>
                                    <li>Select "Mail" and your device</li>
                                    <li>
                                      Copy the generated 16-character password
                                    </li>
                                  </ul>
                                </li>
                                <li>Use your Gmail address as the username</li>
                                <li>
                                  Use the App Password (not your regular
                                  password) in the password field below
                                </li>
                              </ol>
                            </AlertDescription>
                          </Alert>
                        </TabsContent>

                        <TabsContent value="outlook" className="space-y-4">
                          <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>Outlook Setup Instructions</AlertTitle>
                            <AlertDescription className="mt-2">
                              <ol className="list-decimal list-inside space-y-2">
                                <li>
                                  Enable 2-Factor Authentication for your
                                  Microsoft Account
                                </li>
                                <li>
                                  Create an App Password:
                                  <ul className="list-disc list-inside ml-4 mt-1">
                                    <li>
                                      Go to{" "}
                                      <a
                                        href="https://account.microsoft.com/security"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline text-blue-600"
                                      >
                                        Microsoft Security
                                      </a>
                                    </li>
                                    <li>Click "Advanced security options"</li>
                                    <li>
                                      Under "App passwords", click "Create a new
                                      app password"
                                    </li>
                                    <li>Copy the generated password</li>
                                  </ul>
                                </li>
                                <li>
                                  Use your Outlook email address as the username
                                </li>
                                <li>
                                  Use the App Password in the password field
                                  below
                                </li>
                              </ol>
                            </AlertDescription>
                          </Alert>
                        </TabsContent>
                      </Tabs>

                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="smtp_host">SMTP Host</Label>
                            <Input
                              id="smtp_host"
                              value={emailConfig.smtp_host}
                              onChange={(e) =>
                                setEmailConfig({
                                  ...emailConfig,
                                  smtp_host: e.target.value,
                                })
                              }
                              disabled
                            />
                          </div>
                          <div>
                            <Label htmlFor="smtp_port">SMTP Port</Label>
                            <Input
                              id="smtp_port"
                              type="number"
                              value={emailConfig.smtp_port}
                              onChange={(e) =>
                                setEmailConfig({
                                  ...emailConfig,
                                  smtp_port: parseInt(e.target.value),
                                })
                              }
                              disabled
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="smtp_username">
                            Email Address / Username *
                          </Label>
                          <Input
                            id="smtp_username"
                            type="email"
                            value={emailConfig.smtp_username}
                            onChange={(e) =>
                              setEmailConfig({
                                ...emailConfig,
                                smtp_username: e.target.value,
                              })
                            }
                            placeholder={
                              emailConfig.email_provider === "gmail"
                                ? "your.email@gmail.com"
                                : "your.email@outlook.com"
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="smtp_password">
                            App Password *{" "}
                            {emailConfig.email_configured &&
                              "(Leave blank to keep current password)"}
                          </Label>
                          <Input
                            id="smtp_password"
                            type="password"
                            value={emailConfig.smtp_password}
                            onChange={(e) =>
                              setEmailConfig({
                                ...emailConfig,
                                smtp_password: e.target.value,
                              })
                            }
                            placeholder="Enter your app password"
                            required={!emailConfig.email_configured}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="smtp_from_email">
                              From Email Address
                            </Label>
                            <Input
                              id="smtp_from_email"
                              type="email"
                              value={
                                emailConfig.smtp_from_email ||
                                emailConfig.smtp_username
                              }
                              onChange={(e) =>
                                setEmailConfig({
                                  ...emailConfig,
                                  smtp_from_email: e.target.value,
                                })
                              }
                              placeholder="sender@example.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="smtp_from_name">
                              From Display Name
                            </Label>
                            <Input
                              id="smtp_from_name"
                              value={emailConfig.smtp_from_name}
                              onChange={(e) =>
                                setEmailConfig({
                                  ...emailConfig,
                                  smtp_from_name: e.target.value,
                                })
                              }
                              placeholder="Your Organization Name"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => loadEmailConfig()}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleEmailConfigSave}
                          disabled={
                            loading ||
                            !emailConfig.smtp_username ||
                            (!emailConfig.email_configured &&
                              !emailConfig.smtp_password)
                          }
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Configuration"
                          )}
                        </Button>
                      </div>

                      {emailConfig.email_configured && (
                        <Card className="mt-6">
                          <CardHeader>
                            <CardTitle>Test Email Configuration</CardTitle>
                            <CardDescription>
                              Send a test email to verify your configuration is
                              working
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex space-x-2">
                              <Input
                                type="email"
                                value={testEmailAddress}
                                onChange={(e) =>
                                  setTestEmailAddress(e.target.value)
                                }
                                placeholder="recipient@example.com"
                                className="flex-1"
                              />
                              <Button
                                onClick={handleTestEmail}
                                disabled={testingEmail || !testEmailAddress}
                                variant="secondary"
                              >
                                {testingEmail ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Test Email
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="shadow-card max-w-4xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <CardTitle>Organization Notification Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure notification preferences for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Notifications</h4>
                    <div className="space-y-3">
                      {[
                        {
                          key: "report_generation",
                          label: "Report generation completed",
                          desc: "Notify when reports are ready",
                        },
                        {
                          key: "invoice_reminders",
                          label: "Invoice payment reminders",
                          desc: "Send payment reminder notifications",
                        },
                        {
                          key: "missing_documents",
                          label: "Missing document alerts",
                          desc: "Alert when documents are missing",
                        },
                        {
                          key: "weekly_summary",
                          label: "Weekly summary digest",
                          desc: "Send weekly activity summaries",
                        },
                        {
                          key: "system_updates",
                          label: "System maintenance updates",
                          desc: "Notify about system updates",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-start justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <Label className="font-medium">{item.label}</Label>
                            <p className="text-sm text-muted-foreground">
                              {item.desc}
                            </p>
                          </div>
                          <Switch
                            checked={
                              notificationSettings.email_notifications[
                                item.key as keyof typeof notificationSettings.email_notifications
                              ]
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                email_notifications: {
                                  ...prev.email_notifications,
                                  [item.key]: checked,
                                },
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Dashboard Notifications</h4>
                    <div className="space-y-3">
                      {[
                        {
                          key: "realtime_updates",
                          label: "Real-time updates",
                          desc: "Show live data updates",
                        },
                        {
                          key: "ai_suggestions",
                          label: "AI suggestion alerts",
                          desc: "Notify about AI recommendations",
                        },
                        {
                          key: "approval_requests",
                          label: "Approval requests",
                          desc: "Alert for pending approvals",
                        },
                        {
                          key: "performance_updates",
                          label: "Performance updates",
                          desc: "Show performance metrics",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-start justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <Label className="font-medium">{item.label}</Label>
                            <p className="text-sm text-muted-foreground">
                              {item.desc}
                            </p>
                          </div>
                          <Switch
                            checked={
                              notificationSettings.dashboard_notifications[
                                item.key as keyof typeof notificationSettings.dashboard_notifications
                              ]
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                dashboard_notifications: {
                                  ...prev.dashboard_notifications,
                                  [item.key]: checked,
                                },
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Integration Notifications</h4>
                    <div className="space-y-3">
                      {[
                        {
                          key: "sync_failures",
                          label: "Synchronization failures",
                          desc: "Alert when data sync fails",
                        },
                        {
                          key: "api_errors",
                          label: "API connection errors",
                          desc: "Notify about API issues",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-start justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <Label className="font-medium">{item.label}</Label>
                            <p className="text-sm text-muted-foreground">
                              {item.desc}
                            </p>
                          </div>
                          <Switch
                            checked={
                              notificationSettings.integration_notifications[
                                item.key as keyof typeof notificationSettings.integration_notifications
                              ]
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                integration_notifications: {
                                  ...prev.integration_notifications,
                                  [item.key]: checked,
                                },
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleNotificationSave}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Notification Settings
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation">
              <div className="max-w-7xl">
                <CronJobManager />
              </div>
            </TabsContent>

            {/* AI Prompts Tab */}
            <TabsContent value="prompts">
              <div className="max-w-7xl">
                <Card className="shadow-card mb-6">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle>AI Prompt Customization</CardTitle>
                    </div>
                    <CardDescription>
                      Customize the AI prompts used for generating reports and
                      newsletters. These prompts control how AWS Bedrock
                      (Claude) generates content for your organization.
                    </CardDescription>
                  </CardHeader>
                </Card>
                {user?.organization?.id ? (
                  <PromptManagement organizationId={user.organization.id} />
                ) : (
                  <Card className="shadow-card">
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center space-y-2">
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="text-gray-600">
                          Loading organization data...
                        </p>
                        <p className="text-sm text-gray-400">
                          User: {user?.email || "Not logged in"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <CardTitle>Organization Users</CardTitle>
                    </div>
                    <Dialog
                      open={showAddUserDialog}
                      onOpenChange={setShowAddUserDialog}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                          <DialogDescription>
                            Add a new user to your organization with a specific
                            role.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="new_email">Email</Label>
                            <Input
                              id="new_email"
                              type="email"
                              value={newUserData.email}
                              onChange={(e) =>
                                setNewUserData((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              placeholder="user@company.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new_full_name">Full Name</Label>
                            <Input
                              id="new_full_name"
                              value={newUserData.full_name}
                              onChange={(e) =>
                                setNewUserData((prev) => ({
                                  ...prev,
                                  full_name: e.target.value,
                                }))
                              }
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new_password">Password</Label>
                            <Input
                              id="new_password"
                              type="password"
                              value={newUserData.password}
                              onChange={(e) =>
                                setNewUserData((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              placeholder="Minimum 8 characters"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new_role">Role</Label>
                            <Select
                              value={newUserData.role_name}
                              onValueChange={(value) =>
                                setNewUserData((prev) => ({
                                  ...prev,
                                  role_name: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableRoles.map((role) => (
                                  <SelectItem key={role.name} value={role.name}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            onClick={handleAddUser}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add User"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <CardDescription>
                    Manage users in your organization and their access levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizationUsers.map((orgUser: any) => (
                        <TableRow key={orgUser.id}>
                          <TableCell className="font-medium">
                            {orgUser.full_name}
                          </TableCell>
                          <TableCell>{orgUser.email}</TableCell>
                          <TableCell>
                            <Select
                              value={orgUser.role}
                              onValueChange={(newRole) =>
                                handleUpdateUserRole(orgUser.id, newRole)
                              }
                              disabled={orgUser.id === user.id || loading}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableRoles.map((role) => (
                                  <SelectItem key={role.name} value={role.name}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                orgUser.is_active ? "default" : "secondary"
                              }
                            >
                              {orgUser.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {orgUser.id !== user.id && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveUser(orgUser.id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default OrganizationSettings;
