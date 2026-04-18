import { useState, useEffect } from "react";
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
import FullReportEditor from "@/components/FullReportEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import ManualReportDialog from "@/components/ManualReportDialog";
import { ShareReportDialog } from "@/components/ShareReportDialog";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import {
  Filter,
  Plus,
  ChevronDown,
  Settings,
  Trash2,
  Printer,
  Download,
  Share2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User,
  Loader2,
  FileText,
  ArrowLeft,
} from "lucide-react";

interface Client {
  id: number;
  name: string;
  yuki_administration_id: string;
  primary_email: string;
  alternative_emails: string[];
}

interface Report {
  id: number;
  title: string;
  client?: Client;
  client_id?: number;
  client_name?: string;
  report_type: string;
  status: "draft" | "generating" | "completed" | "failed" | "sent";
  period_year: number;
  period_quarter?: number;
  period_display: string;
  summary?: string;
  recommendations?: string;
  notes?: string;
  recipient_emails?: string[];
  bcc_emails?: string[];
  email_subject?: string;
  email_message?: string;
  generated_by_name: string;
  created_at: string;
  updated_at?: string;
  analysis_data?: any;
  processed_data?: any;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const orgColors = useOrganizationColors();

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: 5 },
    (_, i) => currentYear + 1 - i
  );

  // State management
  const [reports, setReports] = useState<Report[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareReportId, setShareReportId] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [openClientCombobox, setOpenClientCombobox] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState<Set<number>>(
    new Set()
  );

  // Generate report form
  const [generateForm, setGenerateForm] = useState({
    client_id: "",
    report_type: "quarterly",
    period_year: new Date().getFullYear(),
    period_quarter: 1,
    title: "",
    recipient_emails: [] as string[],
    bcc_emails: [] as string[],
  });

  useEffect(() => {
    fetchReports();
    fetchClients();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(buildApiUrl("/api/reports"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(Array.isArray(data.reports) ? data.reports : []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch reports",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl("/api/clients?include_all=true&size=1000"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClients(Array.isArray(data.clients) ? data.clients : []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(buildApiUrl(`/api/reports/${reportId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Report deleted successfully",
        });
        fetchReports();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete report");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async (reportId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/reports/${reportId}/download-pdf`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "PDF downloaded successfully",
        });
      } else {
        throw new Error("Failed to download PDF");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (!generateForm.client_id || !generateForm.title) {
        toast({
          title: "Error",
          description: "Please select a client and enter a title",
          variant: "destructive",
        });
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please login again.",
          variant: "destructive",
        });
        return;
      }

      setIsGenerating(true);

      const response = await fetch(buildApiUrl("/api/reports/generate"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generateForm),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Report generated successfully!",
        });
        setShowGenerateDialog(false);
        fetchReports();

        if (data.report_id) {
          const newReport = await fetchReportById(data.report_id);
          if (newReport) {
            setSelectedReport(newReport);
            setViewMode("editor");
          }
        }
      } else {
        const errorText = await response.text();
        let errorMessage = "Failed to generate report";
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.detail || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status}`;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Network error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchReportById = async (reportId: number): Promise<Report | null> => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(buildApiUrl(`/api/reports/${reportId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    }
    return null;
  };

  const handleSaveReport = async (
    reportId: number,
    updatedData: Partial<Report>
  ) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(buildApiUrl(`/api/reports/${reportId}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Report saved successfully",
        });
        fetchReports();

        if (selectedReport && selectedReport.id === reportId) {
          const updatedReport = await fetchReportById(reportId);
          if (updatedReport) {
            setSelectedReport(updatedReport);
          }
        }
      } else {
        throw new Error("Failed to save report");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSendReport = async (reportId: number, emailData: any) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/reports/${reportId}/send`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...emailData,
            include_pdf: true,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Report sent successfully",
        });
        fetchReports();
      } else {
        throw new Error("Failed to send report");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send report",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleViewReport = async (report: Report) => {
    const fullReport = await fetchReportById(report.id);
    if (fullReport) {
      if (
        !fullReport.client &&
        (fullReport.client_id || fullReport.client_name)
      ) {
        fullReport.client = {
          id: fullReport.client_id || 0,
          name: fullReport.client_name || "Unknown Client",
          yuki_administration_id: "",
          primary_email: "",
          alternative_emails: [],
        };
      }
      setSelectedReport(fullReport);
      setViewMode("editor");
    }
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setViewMode("list");
    fetchReports();
  };

  const handleShareReport = (reportId: number) => {
    setShareReportId(reportId);
    setShowShareDialog(true);
  };

  const handleShareSelected = () => {
    if (selectedReportIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one report to share",
        variant: "destructive",
      });
      return;
    }

    if (selectedReportIds.size === 1) {
      // If only one report is selected, share that one
      const reportId = Array.from(selectedReportIds)[0];
      handleShareReport(reportId);
    } else {
      // If multiple reports are selected, share the first one
      // (You might want to change this behavior to share all or show a dialog)
      const reportId = Array.from(selectedReportIds)[0];
      toast({
        title: "Multiple Reports",
        description:
          "Sharing the first selected report. Multiple report sharing coming soon.",
      });
      handleShareReport(reportId);
    }
  };

  const handleToggleReportSelection = (reportId: number) => {
    setSelectedReportIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const handleSelectAllReports = (checked: boolean) => {
    if (checked) {
      setSelectedReportIds(new Set(paginatedReports.map((r) => r.id)));
    } else {
      setSelectedReportIds(new Set());
    }
  };

  const filteredReports = reports.filter((report) => {
    if (!report) return false;

    const clientName = report.client?.name || report.client_name || "";
    const matchesSearch =
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesClient =
      clientFilter === "all" ||
      (report.client?.id || report.client_id)?.toString() === clientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setClientFilter("all");
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed" || status === "sent") {
      return (
        <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 border-0 text-xs font-medium">
          Completed
        </Badge>
      );
    }

    const badgeConfig: Record<string, { className: string; label: string }> = {
      draft: { className: "bg-gray-100 text-gray-700", label: "Draft" },
      generating: {
        className: "bg-blue-100 text-blue-700",
        label: "Generating",
      },
      failed: { className: "bg-red-100 text-red-700", label: "Failed" },
    };

    const config = badgeConfig[status] || badgeConfig.draft;
    return (
      <Badge
        className={`${config.className} hover:${config.className} border-0 text-xs font-medium`}
      >
        {config.label}
      </Badge>
    );
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // If we're in editor mode, show the ReportEditor
  if (viewMode === "editor" && selectedReport) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 overflow-auto">
            <FullReportEditor
              report={selectedReport as any}
              onSave={(updatedData) =>
                handleSaveReport(selectedReport.id, updatedData as any)
              }
              onSend={(emailData) =>
                handleSendReport(selectedReport.id, emailData)
              }
              onDownloadPDF={(reportId) => handleDownloadPDF(reportId)}
              onBack={handleBackToList}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Main reports list view
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="ml-0">
        {/* Header */}
        <header className="flex h-[112px] shrink-0 items-center justify-between px-12 bg-white">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-[32px] font-normal text-gray-900 leading-tight mb-1.5">
                Financial Reports
              </h1>
              <p className="text-base text-black font-normal">
                Generate and merge quarterly financial reports for your clients
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

        <main className="flex-1 bg-white p-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 bg-[#f9f9fb] p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 21 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.5 9.75C15.8848 9.75 20.25 7.73528 20.25 5.25C20.25 2.76472 15.8848 0.75 10.5 0.75C5.11522 0.75 0.75 2.76472 0.75 5.25C0.75 7.73528 5.11522 9.75 10.5 9.75Z"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M0.75 5.25C0.75253 9.76548 3.85614 13.688 8.25 14.729V21C8.25 22.2426 9.25736 23.25 10.5 23.25C11.7426 23.25 12.75 22.2426 12.75 21V14.729C17.1439 13.688 20.2475 9.76548 20.25 5.25"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 ml-2">
                    Filter By
                  </span>
                </div>

                <div className="w-px h-6 bg-gray-200"></div>

                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-[140px] h-9 border-0 bg-transparent font-medium text-gray-700">
                    <SelectValue placeholder="Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="w-px h-6 bg-gray-200"></div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] h-9 border-0 bg-transparent font-medium text-gray-700">
                    <SelectValue placeholder="Report Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="generating">Generating</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <div className="w-px h-6 bg-gray-200"></div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  ↻ Reset Filter
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-9 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: orgColors.primary }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate New Report
                    <div className="w-0.5 h-10 bg-white mx-1"></div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowGenerateDialog(true)}>
                    Automatic Generation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowManualDialog(true)}>
                    Manual Creation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-8 h-9 border border-gray-400 rounded-full bg-[# f6f6f7] text-sm w-48"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    {loading
                      ? "Loading..."
                      : `${startItem} - ${endItem} of ${totalItems}`}
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
                      disabled={currentPage >= totalPages}
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
                      onClick={handleShareSelected}
                      disabled={selectedReportIds.size === 0}
                      title={
                        selectedReportIds.size === 0
                          ? "Select a report to share"
                          : `Share ${selectedReportIds.size} report(s)`
                      }
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

              <Card className="rounded-lg border border-gray-200 shadow-sm bg-white">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-white hover:bg-gray-50">
                        <TableHead className="h-12 px-6 py-3 text-left text-xs font-semibold text-gray-700 w-12">
                          <input
                            type="checkbox"
                            className="rounded border border-gray-300"
                            checked={
                              paginatedReports.length > 0 &&
                              selectedReportIds.size === paginatedReports.length
                            }
                            onChange={(e) =>
                              handleSelectAllReports(e.target.checked)
                            }
                          />
                        </TableHead>
                        <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                          Report
                        </TableHead>
                        <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                          Client
                        </TableHead>
                        <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                          Period
                        </TableHead>
                        <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                          Status
                        </TableHead>
                        <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                          Created
                        </TableHead>
                        <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="px-4 py-8 text-center"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Loading reports...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : paginatedReports.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No reports found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedReports.map((report) => (
                          <TableRow
                            key={report.id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <TableCell className="px-6 py-4 w-12">
                              <input
                                type="checkbox"
                                className="rounded border border-gray-300"
                                checked={selectedReportIds.has(report.id)}
                                onChange={() =>
                                  handleToggleReportSelection(report.id)
                                }
                              />
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div
                                onClick={() => handleViewReport(report)}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                <p
                                  className="text-sm font-semibold text-gray-900 transition-colors"
                                  style={
                                    {
                                      "--hover-color": orgColors.primary,
                                    } as React.CSSProperties
                                  }
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color =
                                      orgColors.primary;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "";
                                  }}
                                >
                                  {report.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {report.report_type}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-900">
                                <svg
                                  width="36"
                                  height="36"
                                  viewBox="0 0 36 36"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="18"
                                    fill="#ECECED"
                                  />
                                  <mask
                                    id="mask0_207_1572"
                                    maskUnits="userSpaceOnUse"
                                    x="6"
                                    y="6"
                                    width="24"
                                    height="24"
                                  >
                                    <rect
                                      x="6"
                                      y="6"
                                      width="24"
                                      height="24"
                                      fill="#D9D9D9"
                                    />
                                  </mask>
                                  <g mask="url(#mask0_207_1572)">
                                    <path
                                      d="M18 17.6923C17.0375 17.6923 16.2135 17.3496 15.5281 16.6642C14.8427 15.9788 14.5 15.1548 14.5 14.1924C14.5 13.2299 14.8427 12.4059 15.5281 11.7205C16.2135 11.0351 17.0375 10.6924 18 10.6924C18.9625 10.6924 19.7864 11.0351 20.4718 11.7205C21.1572 12.4059 21.5 13.2299 21.5 14.1924C21.5 15.1548 21.1572 15.9788 20.4718 16.6642C19.7864 17.3496 18.9625 17.6923 18 17.6923ZM10.5 23.7885V23.0846C10.5 22.5949 10.633 22.1414 10.899 21.7241C11.1651 21.3068 11.5205 20.986 11.9654 20.7616C12.9538 20.277 13.951 19.9135 14.9567 19.6712C15.9625 19.4289 16.9769 19.3078 18 19.3078C19.023 19.3078 20.0375 19.4289 21.0432 19.6712C22.049 19.9135 23.0461 20.277 24.0346 20.7616C24.4794 20.986 24.8349 21.3068 25.1009 21.7241C25.3669 22.1414 25.5 22.5949 25.5 23.0846V23.7885C25.5 24.2103 25.3522 24.5689 25.0567 24.8644C24.7612 25.1599 24.4025 25.3077 23.9808 25.3077H12.0192C11.5974 25.3077 11.2388 25.1599 10.9433 24.8644C10.6478 24.5689 10.5 24.2103 10.5 23.7885ZM12 23.8077H24V23.0846C24 22.8821 23.9413 22.6946 23.824 22.5221C23.7067 22.3497 23.5474 22.209 23.3461 22.1C22.4846 21.6757 21.6061 21.3542 20.7107 21.1356C19.8152 20.917 18.9117 20.8077 18 20.8077C17.0883 20.8077 16.1847 20.917 15.2893 21.1356C14.3938 21.3542 13.5154 21.6757 12.6538 22.1C12.4525 22.209 12.2932 22.3497 12.1759 22.5221C12.0586 22.6946 12 22.8821 12 23.0846V23.8077ZM18 16.1924C18.55 16.1924 19.0208 15.9965 19.4125 15.6049C19.8041 15.2132 20 14.7424 20 14.1924C20 13.6424 19.8041 13.1715 19.4125 12.7799C19.0208 12.3882 18.55 12.1924 18 12.1924C17.45 12.1924 16.9791 12.3882 16.5875 12.7799C16.1958 13.1715 16 13.6424 16 14.1924C16 14.7424 16.1958 15.2132 16.5875 15.6049C16.9791 15.9965 17.45 16.1924 18 16.1924Z"
                                      fill="#35353A"
                                    />
                                  </g>
                                </svg>

                                {report.client?.name ||
                                  report.client_name ||
                                  "Unknown"}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-sm text-gray-900">
                              {report.period_display}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              {getStatusBadge(report.status)}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-sm text-gray-600">
                              {new Date(report.created_at).toLocaleDateString()}{" "}
                              |{" "}
                              {new Date(report.created_at).toLocaleTimeString()}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                                  >
                                    ⋮
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleDownloadPDF(report.id)}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleShareReport(report.id)}
                                  >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteReport(report.id)
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>
              Select a client and configure the report parameters
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Popover
                open={openClientCombobox}
                onOpenChange={setOpenClientCombobox}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="justify-between"
                  >
                    {generateForm.client_id
                      ? clients.find(
                          (client) =>
                            client.id.toString() === generateForm.client_id
                        )?.name
                      : "Select client..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search client..." />
                    <CommandEmpty>No client found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.name}
                            onSelect={() => {
                              setGenerateForm({
                                ...generateForm,
                                client_id: client.id.toString(),
                              });
                              setOpenClientCombobox(false);
                            }}
                          >
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={generateForm.title}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, title: e.target.value })
                }
                placeholder="Q1 2025 Financial Report"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={generateForm.period_year.toString()}
                  onValueChange={(value) =>
                    setGenerateForm({
                      ...generateForm,
                      period_year: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quarter">Quarter</Label>
                <Select
                  value={generateForm.period_quarter.toString()}
                  onValueChange={(value) =>
                    setGenerateForm({
                      ...generateForm,
                      period_quarter: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1</SelectItem>
                    <SelectItem value="2">Q2</SelectItem>
                    <SelectItem value="3">Q3</SelectItem>
                    <SelectItem value="4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Report Dialog */}
      <ManualReportDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
        clients={clients}
        onSuccess={() => {
          setShowManualDialog(false);
          fetchReports();
        }}
      />

      {/* Share Report Dialog */}
      {shareReportId && (
        <ShareReportDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          reportId={shareReportId}
        />
      )}
    </SidebarProvider>
  );
}
