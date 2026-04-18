import { useState, useEffect, useCallback } from "react";
import { buildApiUrl } from "@/lib/api";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Bell,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Mail,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  Users,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  Share2,
  Maximize2,
  Calendar,
  FileText,
  Brain,
  Settings2,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FINANCIAL_YEAR_PRESETS } from "@/constants/financialYear";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";

interface ClientUser {
  id: number;
  client_id: number;
  name: string;
  role: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

interface Client {
  id: number;
  yuki_administration_id: string;
  name: string;
  address_line?: string;
  postcode?: string;
  city?: string;
  country?: string;
  coc_number?: string;
  vat_number?: string;
  start_date?: string;
  domain_id?: string;
  is_active: boolean;
  primary_email?: string;
  alternative_emails?: string[];
  notes?: string;
  financial_year_start_month?: number; // 1-12, default 1 (January)
  report_summary_prompt?: string;
  report_recommendations_prompt?: string;
  organization_id: number;
  created_at: string;
  updated_at?: string;
  last_synced_at?: string;
  users?: ClientUser[];
}

interface ClientListResponse {
  clients: Client[];
  total: number;
  page: number;
  size: number;
}

interface ClientSyncResponse {
  success: boolean;
  message: string;
  synced_count: number;
  created_count: number;
  updated_count: number;
  deactivated_count: number;
  errors?: string[];
}

const Clients = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const orgColors = useOrganizationColors();
  const [clients, setClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "all"
  >("active");
  const [loadingClients, setLoadingClients] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [clientForUsers, setClientForUsers] = useState<Client | null>(null);
  const [newUser, setNewUser] = useState({ name: "", role: "", email: "" });
  const [organizationDemoMode, setOrganizationDemoMode] =
    useState<boolean>(false);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        status_filter: statusFilter,
        ...(search && { search }),
      });

      const response = await fetch(buildApiUrl(`/api/clients?${params}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      const data: ClientListResponse = await response.json();
      setClients(Array.isArray(data.clients) ? data.clients : []);
      setTotalClients(data.total || 0);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      });
    } finally {
      setLoadingClients(false);
    }
  };

  const syncClients = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(buildApiUrl("/api/clients/sync"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force_sync: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync clients");
      }

      const data: ClientSyncResponse = await response.json();

      if (data.success) {
        toast({
          title: "Sync Successful",
          description: data.message,
        });
        fetchClients(); // Refresh the list
      } else {
        toast({
          title: "Sync Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error syncing clients:", error);
      toast({
        title: "Error",
        description: "Failed to sync clients from Yuki",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const updateClient = async (clientId: number, updates: Partial<Client>) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(buildApiUrl(`/api/clients/${clientId}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update client");
      }

      const updatedClient: Client = await response.json();
      setClients((prev) =>
        prev.map((client) => (client.id === clientId ? updatedClient : client))
      );

      toast({
        title: "Success",
        description: "Client updated successfully",
      });

      return updatedClient;
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEditClient = async () => {
    if (!editingClient) return;

    try {
      await updateClient(editingClient.id, {
        primary_email: editingClient.primary_email,
        alternative_emails: editingClient.alternative_emails,
        notes: editingClient.notes,
        is_active: editingClient.is_active,
        financial_year_start_month:
          editingClient.financial_year_start_month || 1,
        report_summary_prompt: editingClient.report_summary_prompt,
        report_recommendations_prompt:
          editingClient.report_recommendations_prompt,
      });
      setShowEditDialog(false);
      setEditingClient(null);
      // Refresh the client list to reflect status changes
      fetchClients();
    } catch (error) {
      // Error already handled in updateClient
    }
  };

  const handleAddUser = async () => {
    if (!clientForUsers || !newUser.name || !newUser.role || !newUser.email) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/clients/${clientForUsers.id}/users`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: clientForUsers.id,
            name: newUser.name,
            role: newUser.role,
            email: newUser.email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      const addedUser: ClientUser = await response.json();

      // Update the client in the list
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientForUsers.id
            ? { ...client, users: [...(client.users || []), addedUser] }
            : client
        )
      );

      // Update clientForUsers
      setClientForUsers({
        ...clientForUsers,
        users: [...(clientForUsers.users || []), addedUser],
      });

      setNewUser({ name: "", role: "", email: "" });

      toast({
        title: "Success",
        description: "User added successfully",
      });
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!clientForUsers) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/clients/${clientForUsers.id}/users/${userId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Update the client in the list
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientForUsers.id
            ? {
                ...client,
                users: (client.users || []).filter((u) => u.id !== userId),
              }
            : client
        )
      );

      // Update clientForUsers
      setClientForUsers({
        ...clientForUsers,
        users: (clientForUsers.users || []).filter((u) => u.id !== userId),
      });

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  // Fetch organization demo mode status
  const fetchOrganizationStatus = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const orgId =
        (user?.organization as any)?.id || (user as any)?.organization_id;
      const response = await fetch(buildApiUrl(`/api/organizations/${orgId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizationDemoMode(data.demo_mode || false);
      }
    } catch (error) {
      console.error("Error fetching organization status:", error);
    }
  };

  // Debounced search effect - updates the search state and resets to page 1
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setCurrentPage(1); // Reset to page 1 when search changes
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const orgId =
      (user?.organization as any)?.id || (user as any)?.organization_id;
    if (orgId) {
      fetchOrganizationStatus();
    }
  }, [user?.organization, (user as any)?.organization_id]);

  useEffect(() => {
    fetchClients();
  }, [currentPage, search, statusFilter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatAddress = (client: Client) => {
    const parts = [
      client.address_line,
      client.postcode && client.city
        ? `${client.postcode} ${client.city}`
        : client.city,
      client.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-[112px] shrink-0 items-center justify-between px-12 bg-white">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div>
              <div className="flex items-center gap-8 mb-1.5">
                <h1 className="text-[32px] font-normal text-gray-900 leading-tight">
                  Clients
                </h1>
                <Button
                  variant="ghost"
                  onClick={syncClients}
                  disabled={syncing}
                  className="rounded-full border flex items-center gap-2 h-9"
                  size="sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                  />
                  {syncing
                    ? "Syncing..."
                    : organizationDemoMode
                    ? "Sync Demo Data"
                    : "Sync from Yuki"}
                </Button>
              </div>
              <p className="text-base text-black font-normal">
                Manage your organization's clients and sync with Yuki
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
        <div className="px-12 bg-white">
          <div className="border-b border-gray-300"></div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col bg-white overflow-hidden">
          <div className="h-[calc(100vh-8rem)] flex-1 p-10 bg-white overflow-hidden flex flex-col">
            {/* Demo Mode Alert */}
            {organizationDemoMode && (
              <Alert className="mb-4 md:mb-6">
                <Info className="h-3 w-3 md:h-4 md:w-4" />
                <AlertDescription className="text-xs md:text-sm">
                  Demo mode is enabled. The system will use sample data instead
                  of making actual API calls to Yuki.
                  {clients.length === 0 && (
                    <span className="block mt-1">
                      Click "Sync Demo Data" to create sample clients for
                      testing.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Filters - Pill Style Tabs */}
            <div className="bg-[#ECECED] p-1 rounded-full inline-flex items-center gap-2 mb-4 md:mb-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter("active");
                  setCurrentPage(1);
                }}
                className={`rounded-full h-9 px-4 gap-2 transition-opacity ${
                  statusFilter === "active"
                    ? "text-white hover:opacity-90"
                    : "hover:bg-gray-100"
                }`}
                style={
                  statusFilter === "active"
                    ? { backgroundColor: orgColors.primary }
                    : undefined
                }
              >
                <span>Active Only</span>
                <Badge className="bg-red-500 hover:bg-red-500 text-white rounded-full px-2 py-0 h-5 text-xs">
                  {clients.filter((c) => c.is_active).length}
                </Badge>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter("inactive");
                  setCurrentPage(1);
                }}
                className={`rounded-full h-9 px-4 gap-2 transition-opacity ${
                  statusFilter === "inactive"
                    ? "text-white hover:opacity-90"
                    : "hover:bg-gray-100"
                }`}
                style={
                  statusFilter === "inactive"
                    ? { backgroundColor: orgColors.primary }
                    : undefined
                }
              >
                <span>Inactive Only</span>
                <Badge className="bg-red-500 hover:bg-red-500 text-white rounded-full px-2 py-0 h-5 text-xs">
                  {clients.filter((c) => !c.is_active).length}
                </Badge>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className={`rounded-full h-9 px-4 gap-2 transition-opacity ${
                  statusFilter === "all"
                    ? "text-white hover:opacity-90"
                    : "hover:bg-gray-100"
                }`}
                style={
                  statusFilter === "all"
                    ? { backgroundColor: orgColors.primary }
                    : undefined
                }
              >
                <span>All Clients</span>
                <Badge className="bg-red-500 hover:bg-red-500 text-white rounded-full px-2 py-0 h-5 text-xs">
                  {totalClients}
                </Badge>
              </Button>
            </div>

            {/* Toolbar */}
            <div className="bg-[#f9f9fb] p-4 rounded-lg">
              <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <div className="flex items-center gap-2">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_199_3870"
                      maskUnits="userSpaceOnUse"
                      x="4"
                      y="4"
                      width="24"
                      height="24"
                    >
                      <rect x="4" y="4" width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_199_3870)">
                      <path
                        d="M14.4809 25.5C14.2566 25.5 14.0623 25.4246 13.8982 25.274C13.7341 25.1233 13.6354 24.9358 13.6021 24.7115L13.3117 22.4538C13.0437 22.3641 12.7691 22.2384 12.4876 22.0769C12.2062 21.9153 11.9546 21.7422 11.7328 21.5576L9.64437 22.4384C9.43027 22.532 9.21777 22.5429 9.00687 22.4711C8.79597 22.3993 8.63026 22.2647 8.50974 22.0673L7.00594 19.4481C6.89183 19.2506 6.85657 19.0397 6.90017 18.8154C6.94375 18.591 7.05593 18.4102 7.23669 18.2731L9.04439 16.9058C9.02131 16.757 9.00496 16.6077 8.99534 16.4577C8.98573 16.3077 8.98092 16.1583 8.98092 16.0096C8.98092 15.8673 8.98573 15.7227 8.99534 15.5759C9.00496 15.4291 9.02131 15.2686 9.04439 15.0942L7.23669 13.7269C7.05593 13.5897 6.94215 13.4089 6.89537 13.1846C6.84857 12.9602 6.88543 12.7493 7.00594 12.5519L8.50974 9.95195C8.63026 9.75452 8.79437 9.6199 9.00207 9.5481C9.20975 9.4763 9.42064 9.4872 9.63474 9.5808L11.7232 10.452C11.9642 10.2609 12.2216 10.0862 12.4953 9.9279C12.7691 9.76955 13.038 9.6423 13.3021 9.54615L13.6021 7.28848C13.6354 7.06411 13.7341 6.87661 13.8982 6.72598C14.0623 6.57533 14.2566 6.5 14.4809 6.5H17.5097C17.7341 6.5 17.9299 6.57533 18.0972 6.72598C18.2645 6.87661 18.3648 7.06411 18.3982 7.28848L18.6885 9.55578C18.9885 9.66474 19.26 9.79198 19.503 9.9375C19.7459 10.083 19.9911 10.2545 20.2386 10.452L22.3655 9.5808C22.5796 9.4872 22.7905 9.4747 22.9982 9.5433C23.2059 9.61188 23.37 9.74489 23.4905 9.94233L24.9943 12.5519C25.1148 12.7493 25.1517 12.9602 25.1049 13.1846C25.0581 13.4089 24.9443 13.5897 24.7635 13.7269L22.9174 15.123C22.9533 15.2846 22.9728 15.4355 22.976 15.5759C22.9792 15.7163 22.9808 15.8577 22.9808 16C22.9808 16.1359 22.9776 16.274 22.9712 16.4144C22.9648 16.5548 22.9417 16.7154 22.902 16.8962L24.7289 18.2731C24.9097 18.4102 25.0235 18.591 25.0703 18.8154C25.1171 19.0397 25.0802 19.2506 24.9597 19.4481L23.4559 22.0519C23.3354 22.2493 23.1671 22.3849 22.9511 22.4586C22.735 22.5323 22.52 22.5224 22.3059 22.4288L20.2386 21.548C19.9911 21.7455 19.7386 21.9201 19.4809 22.0721C19.2232 22.224 18.9591 22.348 18.6885 22.4442L18.3982 24.7115C18.3648 24.9358 18.2645 25.1233 18.0972 25.274C17.9299 25.4246 17.7341 25.5 17.5097 25.5H14.4809ZM15.0001 24H16.9655L17.3251 21.3211C17.8354 21.1878 18.3017 20.9984 18.7241 20.7529C19.1466 20.5074 19.554 20.1917 19.9463 19.8058L22.4309 20.85L23.4155 19.15L21.2463 17.5154C21.3296 17.2564 21.3863 17.0025 21.4165 16.7538C21.4466 16.5051 21.4616 16.2538 21.4616 16C21.4616 15.7397 21.4466 15.4884 21.4165 15.2461C21.3863 15.0038 21.3296 14.7564 21.2463 14.5038L23.4347 12.85L22.4501 11.15L19.9366 12.2096C19.602 11.8519 19.2011 11.5359 18.7338 11.2615C18.2665 10.9872 17.7937 10.7929 17.3155 10.6788L17.0001 7.99998H15.0155L14.6847 10.6692C14.1745 10.7897 13.7033 10.9743 13.2713 11.2231C12.8392 11.4718 12.427 11.7923 12.0347 12.1846L9.55012 11.15L8.56549 12.85L10.7251 14.4596C10.6418 14.6968 10.5835 14.9436 10.5501 15.2C10.5168 15.4564 10.5001 15.7263 10.5001 16.0096C10.5001 16.2699 10.5168 16.525 10.5501 16.775C10.5835 17.025 10.6386 17.2718 10.7155 17.5154L8.56549 19.15L9.55012 20.85L12.0251 19.8C12.4046 20.1897 12.8104 20.509 13.2424 20.7577C13.6745 21.0064 14.152 21.1974 14.6751 21.3308L15.0001 24ZM16.0116 19C16.8437 19 17.5517 18.708 18.1357 18.124C18.7196 17.54 19.0116 16.832 19.0116 16C19.0116 15.1679 18.7196 14.4599 18.1357 13.876C17.5517 13.292 16.8437 13 16.0116 13C15.1694 13 14.4588 13.292 13.8799 13.876C13.3011 14.4599 13.0117 15.1679 13.0117 16C13.0117 16.832 13.3011 17.54 13.8799 18.124C14.4588 18.708 15.1694 19 16.0116 19Z"
                        fill="#35353A"
                      />
                    </g>
                  </svg>

                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-8 h-9 border border-gray-400 rounded-full bg-[#f6f6f7] text-sm w-48"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    {loadingClients
                      ? "Loading..."
                      : `${(currentPage - 1) * pageSize + 1} - ${Math.min(
                          currentPage * pageSize,
                          totalClients
                        )} of ${totalClients}`}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={currentPage * pageSize >= totalClients}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-black hover:text-gray-600"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-black hover:text-gray-600"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-black hover:text-gray-600"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-black hover:text-gray-600"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Clients Table */}
              <Card className="bg-white">
                <CardContent className="p-0 sm:p-6">
                  {loadingClients ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="mx-auto h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-xs md:text-sm font-medium">
                        No clients found
                      </h3>
                      <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                        {search
                          ? "Try adjusting your search terms."
                          : "Sync with Yuki to import your clients."}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-200 bg-white hover:bg-gray-50">
                            <TableHead className="h-12 px-6 py-3 text-left text-xs font-semibold text-gray-700 w-12">
                              <input
                                type="checkbox"
                                className="rounded border border-gray-300"
                              />
                            </TableHead>
                            <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Name
                            </TableHead>
                            <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Status
                            </TableHead>
                            <TableHead className="hidden md:table-cell h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Location
                            </TableHead>
                            <TableHead className="hidden sm:table-cell h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Contact
                            </TableHead>
                            <TableHead className="hidden lg:table-cell h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              VAT Number
                            </TableHead>
                            <TableHead className="hidden lg:table-cell h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Users
                            </TableHead>
                            <TableHead className="hidden xl:table-cell h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Last Synced
                            </TableHead>
                            <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.map((client) => (
                            <TableRow
                              key={client.id}
                              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedClient(client)}
                            >
                              <TableCell className="px-6 py-4 w-12">
                                <input
                                  type="checkbox"
                                  className="rounded border border-gray-300"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                              <TableCell className="px-4 py-4 font-medium text-sm text-gray-900">
                                <div>
                                  <div className="truncate max-w-[150px] sm:max-w-none">
                                    {client.name}
                                  </div>
                                  {client.coc_number && (
                                    <div className="text-[10px] md:text-xs text-muted-foreground">
                                      CoC: {client.coc_number}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${
                                    client.is_active
                                      ? "bg-[hsl(160,65%,75%)] hover:bg-[hsl(160,65%,70%)] text-gray-800"
                                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                  } border-none text-[10px] md:text-xs`}
                                >
                                  {client.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="text-xs md:text-sm truncate max-w-[150px]">
                                    {formatAddress(client)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {client.primary_email ? (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs md:text-sm truncate max-w-[150px]">
                                      {client.primary_email}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs md:text-sm">
                                    No email
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <span className="text-xs md:text-sm font-mono">
                                  {client.vat_number || "N/A"}
                                </span>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs md:text-sm">
                                    {client.users?.length || 0}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden xl:table-cell">
                                <span className="text-xs md:text-sm text-muted-foreground">
                                  {formatDate(client.last_synced_at)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-3 w-3 md:h-4 md:w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="text-xs md:text-sm"
                                  >
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingClient({ ...client });
                                        setShowEditDialog(true);
                                      }}
                                    >
                                      <span className="hidden sm:inline">
                                        Edit Contact Info
                                      </span>
                                      <span className="sm:hidden">Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setClientForUsers(client);
                                        setShowUsersDialog(true);
                                      }}
                                    >
                                      <Users className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      <span className="hidden sm:inline">
                                        Manage Users
                                      </span>
                                      <span className="sm:hidden">Users</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setSelectedClient(client)}
                                    >
                                      <span className="hidden sm:inline">
                                        View Details
                                      </span>
                                      <span className="sm:hidden">Details</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pagination */}
            {totalClients > pageSize && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
                <div className="text-xs md:text-sm text-muted-foreground">
                  <span className="hidden sm:inline">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalClients)} of{" "}
                    {totalClients} clients
                  </span>
                  <span className="sm:hidden">
                    {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, totalClients)} of{" "}
                    {totalClients}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none text-xs md:text-sm h-8"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage * pageSize >= totalClients}
                    className="flex-1 sm:flex-none text-xs md:text-sm h-8"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Edit Client Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">
              Edit Client Settings
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingClient?.name}
            </DialogDescription>
          </DialogHeader>

          {editingClient && (
            <Tabs defaultValue="contact" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger
                  value="contact"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Contact</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Prompts</span>
                </TabsTrigger>
              </TabsList>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="primary_email"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Primary Email
                    </Label>
                    <Input
                      id="primary_email"
                      type="email"
                      value={editingClient.primary_email || ""}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          primary_email: e.target.value,
                        })
                      }
                      placeholder="client@example.com"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="alternative_emails"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Alternative Emails
                    </Label>
                    <Textarea
                      id="alternative_emails"
                      value={editingClient.alternative_emails?.join("\n") || ""}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          alternative_emails: e.target.value
                            .split("\n")
                            .filter((email) => email.trim()),
                        })
                      }
                      placeholder="One email per line"
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      One email per line for multiple recipients
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="notes"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Internal Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={editingClient.notes || ""}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Add notes about this client..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6 mt-0">
                <div className="space-y-6">
                  {/* Status Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-1">
                      <Label
                        htmlFor="is_active"
                        className="text-sm font-medium"
                      >
                        Client Status
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {editingClient.is_active
                          ? "Active - can generate reports"
                          : "Inactive - hidden by default"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-medium ${
                          editingClient.is_active
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {editingClient.is_active ? "Active" : "Inactive"}
                      </span>
                      <Switch
                        id="is_active"
                        checked={editingClient.is_active}
                        onCheckedChange={(checked) =>
                          setEditingClient({
                            ...editingClient,
                            is_active: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Financial Year */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="financial_year"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Financial Year Start
                    </Label>
                    <Select
                      value={String(
                        editingClient.financial_year_start_month || 1
                      )}
                      onValueChange={(value) =>
                        setEditingClient({
                          ...editingClient,
                          financial_year_start_month: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue>
                          {FINANCIAL_YEAR_PRESETS.find(
                            (p) =>
                              p.value ===
                              (editingClient.financial_year_start_month || 1)
                          )?.label.split(" - ")[0] || "January"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {FINANCIAL_YEAR_PRESETS.map((preset) => {
                          const monthName = preset.label.split(" - ")[0];
                          return (
                            <SelectItem
                              key={preset.value}
                              value={String(preset.value)}
                            >
                              {monthName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Financial year runs for 12 months from the selected month
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* AI Prompts Tab */}
              <TabsContent value="ai" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="report_summary_prompt"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      Executive Summary Instructions
                    </Label>
                    <Textarea
                      id="report_summary_prompt"
                      value={editingClient.report_summary_prompt || ""}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          report_summary_prompt: e.target.value,
                        })
                      }
                      placeholder="E.g., Focus on profitability metrics and use casual, founder-friendly language..."
                      rows={5}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional: Additional instructions for AI-generated
                      executive summary
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label
                      htmlFor="report_recommendations_prompt"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      Strategic Recommendations Instructions
                    </Label>
                    <Textarea
                      id="report_recommendations_prompt"
                      value={editingClient.report_recommendations_prompt || ""}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          report_recommendations_prompt: e.target.value,
                        })
                      }
                      placeholder="E.g., Emphasize cost reduction strategies and revenue diversification..."
                      rows={5}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional: Additional instructions for AI-generated
                      recommendations
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleEditClient} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog
        open={!!selectedClient}
        onOpenChange={() => setSelectedClient(null)}
      >
        <DialogContent className="sm:max-w-[600px] p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">
              {selectedClient?.name}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Client details from Yuki Administration
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="grid gap-3 md:gap-4 py-2 md:py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label className="text-xs md:text-sm font-medium">
                    Yuki Administration ID
                  </Label>
                  <p className="text-xs md:text-sm font-mono text-muted-foreground">
                    {selectedClient.yuki_administration_id}
                  </p>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-medium">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedClient.is_active ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {selectedClient.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-medium">
                    Chamber of Commerce
                  </Label>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {selectedClient.coc_number || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-medium">
                    VAT Number
                  </Label>
                  <p className="text-xs md:text-sm font-mono text-muted-foreground">
                    {selectedClient.vat_number || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-medium">
                    Start Date
                  </Label>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {formatDate(selectedClient.start_date)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-medium">
                    Last Synced
                  </Label>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {formatDate(selectedClient.last_synced_at)}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-xs md:text-sm font-medium">
                  Address
                </Label>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {formatAddress(selectedClient)}
                </p>
              </div>

              {selectedClient.primary_email && (
                <div>
                  <Label className="text-xs md:text-sm font-medium">
                    Primary Email
                  </Label>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {selectedClient.primary_email}
                  </p>
                </div>
              )}

              {selectedClient.alternative_emails &&
                Array.isArray(selectedClient.alternative_emails) &&
                selectedClient.alternative_emails.length > 0 && (
                  <div>
                    <Label className="text-xs md:text-sm font-medium">
                      Alternative Emails
                    </Label>
                    <div className="mt-1 space-y-1">
                      {selectedClient.alternative_emails.map((email, index) => (
                        <p
                          key={index}
                          className="text-xs md:text-sm text-muted-foreground"
                        >
                          {email}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              {selectedClient.notes && (
                <div>
                  <Label className="text-xs md:text-sm font-medium">
                    Notes
                  </Label>
                  <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedClient.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setSelectedClient(null)}
              className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-9"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Users Dialog */}
      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="sm:max-w-[600px] p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">
              Manage Users - {clientForUsers?.name}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Add or remove users associated with this client
            </DialogDescription>
          </DialogHeader>
          {clientForUsers && (
            <div className="grid gap-3 md:gap-4 py-2 md:py-4">
              {/* Add User Form */}
              <div className="border rounded-lg p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-medium mb-3">
                  Add New User
                </h3>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="user_name" className="text-xs md:text-sm">
                      Name
                    </Label>
                    <Input
                      id="user_name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="text-xs md:text-sm h-8 md:h-9"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="user_role" className="text-xs md:text-sm">
                      Role
                    </Label>
                    <Input
                      id="user_role"
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                      placeholder="Accountant"
                      className="text-xs md:text-sm h-8 md:h-9"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="user_email" className="text-xs md:text-sm">
                      Email
                    </Label>
                    <Input
                      id="user_email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      className="text-xs md:text-sm h-8 md:h-9"
                    />
                  </div>
                  <Button
                    onClick={handleAddUser}
                    className="w-full text-xs md:text-sm h-8 md:h-9"
                  >
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              {/* Users List */}
              <div>
                <h3 className="text-xs md:text-sm font-medium mb-3">
                  Current Users ({clientForUsers.users?.length || 0})
                </h3>
                {clientForUsers.users && clientForUsers.users.length > 0 ? (
                  <div className="space-y-2">
                    {clientForUsers.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border rounded-lg gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs md:text-sm truncate">
                            {user.name}
                          </div>
                          <div className="text-[10px] md:text-xs text-muted-foreground truncate">
                            {user.role}
                          </div>
                          <div className="text-[10px] md:text-xs text-muted-foreground truncate">
                            {user.email}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          className="h-8 w-8 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs md:text-sm text-muted-foreground border rounded-lg">
                    No users added yet
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setShowUsersDialog(false);
                setNewUser({ name: "", role: "", email: "" });
              }}
              className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-9"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Clients;
