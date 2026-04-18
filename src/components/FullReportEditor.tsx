import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildApiUrl, getAuthHeaders } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { UserProfile } from "@/components/UserProfile";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, StaggerReveal } from "@/components/ScrollReveal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AIRegenerateDialog from "@/components/AIRegenerateDialog";
import { YukiRawDataModal } from "@/components/YukiRawDataModal";
import { TranslationDialog } from "@/components/TranslationDialog";
import { ShareReportDialog } from "@/components/ShareReportDialog";
import {
  Eye,
  Edit,
  Download,
  Mail,
  Save,
  Plus,
  Minus,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  FileText,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  ArrowLeft,
  Brain,
  RefreshCw,
  Database,
  Calendar,
  Table,
  AlertTriangle,
  Languages,
  MoreVertical,
  Loader2,
  Share2,
  Send,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Line,
  LineChart,
  Area,
  AreaChart,
  LabelList,
} from "recharts";

interface ClientUser {
  id: number;
  client_id: number;
  name: string;
  role: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

interface ReportData {
  id: number;
  title: string;
  period_quarter: number;
  is_demo: boolean;
  period_year: number;
  client: {
    id: number;
    name: string;
    primary_email: string;
    alternative_emails: string[];
    report_summary_prompt?: string;
    report_recommendations_prompt?: string;
    users?: ClientUser[];
  } | null;
  client_name?: string;
  period_display: string;
  summary: string;
  vat_closure_status?: string;
  analysis_data: {
    financial_summary: any;
    quarterly_breakdown: any;
    comparison_analysis: any;
    trends: any;
    recommendations: string[];
    chart_data: any;
    comparison_data: any;

    // NEW FIELDS
    quarterly_yoy_comparison?: {
      current_quarter_label: string;
      previous_year_quarter_label: string;
      current_metrics: any;
      previous_year_metrics: any;
      yoy_growth_revenue: number;
      yoy_growth_expenses: number;
      yoy_growth_profit: number;
    };
    ytd_comparison?: {
      current_ytd_label: string;
      previous_ytd_label: string;
      current_ytd_metrics: any;
      previous_ytd_metrics: any;
      ytd_growth_revenue: number;
      ytd_growth_expenses: number;
      ytd_growth_profit: number;
    };
    current_year_quarterly_pl?: Array<{
      quarter: string;
      revenue: number;
      expenses: number;
      gross_profit: number;
      net_profit: number;
      profit_margin: number;
    }>;
    spike_decline_analysis?: {
      spikes: Array<{
        code: string;
        description: string;
        previous: number;
        current: number;
        change_percent: number;
      }>;
      declines: Array<any>;
    };
    rule_based_recommendations?: Array<{
      type: string;
      title: string;
      message: string;
      data?: any;
    }>;
  } | null;
  processed_data: any;
  raw_data?: {
    all_quarters?: Array<{
      quarter: number;
      quarter_label: string;
      year: number;
      quarterly_summary: {
        total_revenue: number;
        total_expenses: number;
        gross_profit: number;
        net_profit: number;
        profit_margin: number;
        ebitda: number;
        gross_margin: number;
      };
      categorized_accounts: {
        revenue: Array<{
          code: string;
          description: string;
          amount: number;
        }>;
        expenses: Array<{
          code: string;
          description: string;
          amount: number;
        }>;
      };
    }>;
  };
  recipient_emails: string[];
  bcc_emails: string[];
  email_subject: string;
  email_message: string;
}

interface FullReportEditorProps {
  report: ReportData;
  onSave: (updatedReport: Partial<ReportData>) => Promise<void>;
  onSend: (emailData: any) => Promise<void>;
  onDownloadPDF: (reportId: number) => Promise<void>;
  onBack: () => void;
  isReadOnly?: boolean;
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Helper function to calculate growth percentage
const calculateGrowth = (
  current: number,
  previous: number
): { value: number; display: string; colorClass: string } => {
  if (previous === 0 || !previous) {
    return {
      value: 0,
      display: "N/A",
      colorClass: "text-gray-600 border-gray-200 bg-gray-50",
    };
  }
  const growth = ((current - previous) / Math.abs(previous)) * 100;
  const display =
    growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
  const colorClass =
    growth >= 0
      ? "text-green-600 border-green-200 bg-green-50"
      : "text-red-600 border-red-200 bg-red-50";
  return { value: growth, display, colorClass };
};

export const FullReportEditor: React.FC<FullReportEditorProps> = ({
  report,
  onSave,
  onSend,
  onDownloadPDF,
  onBack,
  isReadOnly = false,
}) => {
  const orgColors = useOrganizationColors();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isGeneratingPDF, setGeneratingPDF] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [editingChart, setEditingChart] = useState<string | null>(null);
  const [showYukiRawDataModal, setShowYukiRawDataModal] = useState(false);
  const [showTranslationDialog, setShowTranslationDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Graph toggle states - track which graphs are showing table view
  const [showRevenueTable, setShowRevenueTable] = useState(false);
  const [showExpensesTable, setShowExpensesTable] = useState(false);
  const [showTrendsTable, setShowTrendsTable] = useState(false);
  const [showEbitdaTable, setShowEbitdaTable] = useState(false);
  const [showPLTable, setShowPLTable] = useState(false);

  // Translation states for in-place typing effect
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatingLanguage, setTranslatingLanguage] = useState<string>("");
  const [isTypingSummary, setIsTypingSummary] = useState(false);
  const [isTypingRecommendations, setIsTypingRecommendations] = useState(false);
  const [typingProgress, setTypingProgress] = useState(0);

  // Individual section edit states
  const [editingSummary, setEditingSummary] = useState(false);
  const [editingRecommendations, setEditingRecommendations] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingEmailConfig, setEditingEmailConfig] = useState(false);

  // AI regeneration states for inline sections
  const [regeneratingSummary, setRegeneratingSummary] = useState(false);
  const [regeneratingRecommendations, setRegeneratingRecommendations] =
    useState(false);
  const [summaryPrompt, setSummaryPrompt] = useState("");
  const [recommendationsPrompt, setRecommendationsPrompt] = useState("");

  // Load client's saved prompts when component mounts
  useEffect(() => {
    if (report.client?.report_summary_prompt) {
      setSummaryPrompt(report.client.report_summary_prompt);
    }
    if (report.client?.report_recommendations_prompt) {
      setRecommendationsPrompt(report.client.report_recommendations_prompt);
    }
  }, [
    report.client?.report_summary_prompt,
    report.client?.report_recommendations_prompt,
  ]);

  // Chart edit states were removed: charts are display-only
  const [editingQuarterlyPLChart, setEditingQuarterlyPLChart] = useState(false);

  // Report content state
  // Helper function to filter and clean recommendations
  const filterRecommendations = (recs: string[]): string[] => {
    if (!recs || !Array.isArray(recs)) return [];

    return recs
      .map((rec) => rec.trim())
      .filter((rec) => {
        if (!rec) return false;

        const lowerRec = rec.toLowerCase();

        // Skip introductory/meta text
        if (
          lowerRec.includes("here are") &&
          lowerRec.includes("recommendations")
        )
          return false;
        if (
          lowerRec.includes("based on") &&
          lowerRec.includes("financial data")
        )
          return false;
        if (rec.startsWith("**") && rec.endsWith("**")) return false; // Section headers
        if (rec.length < 20) return false; // Too short
        if (rec.endsWith(":") && rec.length < 50) return false; // Category headers like "Revenue Optimization:"

        return true;
      })
      .map((rec) => {
        // Remove leading numbers (1., 2., etc)
        if (rec && /^\d+\./.test(rec)) {
          return rec.replace(/^\d+\.\s*/, "").trim();
        }
        return rec;
      });
  };

  const [reportTitle, setReportTitle] = useState(report.title);
  const [reportSummary, setReportSummary] = useState(report.summary || "");
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Backend already combines rule-based + strategic into analysis_data.recommendations
  // Only combine from separate sources if recommendations array is missing (backward compatibility for old reports)
  const backendCombinedRecommendations =
    report.analysis_data?.recommendations || [];
  const ruleBasedRecs = report.analysis_data?.rule_based_recommendations || [];

  let combinedRecommendations: string[] = [];

  // If backend already provided combined recommendations, use them directly (new reports)
  if (backendCombinedRecommendations.length > 0) {
    // Backend already combined: rule-based (first) + strategic (last 5)
    // Just filter and use as-is
    combinedRecommendations = filterRecommendations(
      backendCombinedRecommendations
    );
  } else {
    // Backward compatibility: old reports might have them separated, combine manually
    // Rule-based should come FIRST, then the strategic recommendations
    if (ruleBasedRecs.length > 0) {
      for (const ruleRec of ruleBasedRecs) {
        const ruleRecString = `${ruleRec.title || "Recommendation"}: ${ruleRec.message || ""
          }`;
        combinedRecommendations.push(ruleRecString);
      }
    }
    // Note: Old reports might not have strategic recommendations in a separate field
    // This is handled by the backend now, so this branch is mainly for very old reports
  }

  const [recommendations, setRecommendations] = useState(
    combinedRecommendations
  );

  // Rule-based recommendations state (kept for backward compatibility but not used in UI anymore)
  const [ruleBasedRecommendations] =
    useState<
      Array<{ type: string; title: string; message: string; data?: any }>
    >(ruleBasedRecs);

  // Prepare comprehensive chart data
  const prepareChartData = () => {
    const { financial_summary, comparison_data } = report.analysis_data || {};
    const previous_quarter = comparison_data?.previous_quarter;

    // Enhanced revenue comparison with more categories - use actual data
    const revenueComparisonData = [
      {
        name: "Revenue",
        current: financial_summary?.total_revenue || 0,
        previous: previous_quarter?.total_revenue || 0,
        change: previous_quarter?.total_revenue
          ? `${(
            ((financial_summary?.total_revenue -
              previous_quarter?.total_revenue) /
              previous_quarter?.total_revenue) *
            100
          ).toFixed(1)}%`
          : "0%",
      },
      {
        name: "Expenses",
        current: financial_summary?.total_expenses || 0,
        previous: previous_quarter?.total_expenses || 0,
        change: previous_quarter?.total_expenses
          ? `${(
            ((financial_summary?.total_expenses -
              previous_quarter?.total_expenses) /
              previous_quarter?.total_expenses) *
            100
          ).toFixed(1)}%`
          : "0%",
      },
      {
        name: "Net Profit",
        current: financial_summary?.net_profit || 0,
        previous: previous_quarter?.net_profit || 0,
        change: previous_quarter?.net_profit
          ? `${(
            ((financial_summary?.net_profit - previous_quarter?.net_profit) /
              previous_quarter?.net_profit) *
            100
          ).toFixed(1)}%`
          : "0%",
      },
      {
        name: "Gross Profit",
        current: financial_summary?.gross_profit || 0,
        previous: previous_quarter?.gross_profit || 0,
        change: previous_quarter?.gross_profit
          ? `${(
            ((financial_summary?.gross_profit -
              previous_quarter?.gross_profit) /
              previous_quarter?.gross_profit) *
            100
          ).toFixed(1)}%`
          : "0%",
      },
    ];

    // Comprehensive expense breakdown - use actual data when available
    const total_expenses = financial_summary?.total_expenses || 0;

    // Try to use actual expense breakdown from backend if available
    const backendExpenseData =
      report.analysis_data?.chart_data?.expenseBreakdown;
    const expenseBreakdownData =
      backendExpenseData && backendExpenseData.length > 0
        ? backendExpenseData.map((item: any, index: number) => ({
          name: item.category || item.name,
          value: item.amount || item.value,
          percentage: item.percentage,
          color: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
            "#06b6d4",
            "#f97316",
          ][index % 8],
        }))
        : total_expenses > 0
          ? [
            {
              name: "Salaries & Benefits",
              value: Math.round(total_expenses * 0.496),
              color: "#3b82f6",
              percentage: 49.6,
            },
            {
              name: "Office & Administrative",
              value: Math.round(total_expenses * 0.144),
              color: "#10b981",
              percentage: 14.4,
            },
            {
              name: "Professional Services",
              value: Math.round(total_expenses * 0.131),
              color: "#f59e0b",
              percentage: 13.1,
            },
            {
              name: "Marketing & Sales",
              value: Math.round(total_expenses * 0.104),
              color: "#ef4444",
              percentage: 10.4,
            },
            {
              name: "IT & Technology",
              value: Math.round(total_expenses * 0.071),
              color: "#8b5cf6",
              percentage: 7.1,
            },
            {
              name: "Travel & Entertainment",
              value: Math.round(total_expenses * 0.037),
              color: "#06b6d4",
              percentage: 3.7,
            },
            {
              name: "Other Operating",
              value: Math.round(total_expenses * 0.017),
              color: "#f97316",
              percentage: 1.7,
            },
          ]
          : [];

    // Quarterly trend data for line chart - use all available quarters from current_year_quarterly_pl if present
    let quarterlyTrendData: any[] = [];
    const current_quarter_label = `Q${report.period_quarter} ${report.period_year}`;
    const quarterlyPL = report.analysis_data?.current_year_quarterly_pl;
    if (Array.isArray(quarterlyPL) && quarterlyPL.length > 0) {
      // Always include all quarters, including Q1
      quarterlyTrendData = quarterlyPL.map((q) => ({
        quarter: q.quarter,
        revenue: q.revenue || 0,
        expenses: q.expenses || 0,
        profit: q.net_profit || 0,
      }));
    } else {
      // Fallback: previous + current only
      if (previous_quarter) {
        const prev_q =
          report.period_quarter > 1 ? report.period_quarter - 1 : 4;
        const prev_y =
          report.period_quarter > 1
            ? report.period_year
            : report.period_year - 1;
        quarterlyTrendData.push({
          quarter: `Q${prev_q} ${prev_y}`,
          revenue: previous_quarter.total_revenue || 0,
          expenses: previous_quarter.total_expenses || 0,
          profit: previous_quarter.net_profit || 0,
        });
      }
      if (financial_summary) {
        quarterlyTrendData.push({
          quarter: current_quarter_label,
          revenue: financial_summary.total_revenue || 0,
          expenses: financial_summary.total_expenses || 0,
          profit: financial_summary.net_profit || 0,
        });
      }
    }

    // EBITDA trend data
    const ebitdaTrendData = [] as any[];
    if (previous_quarter) {
      const prev_q = report.period_quarter > 1 ? report.period_quarter - 1 : 4;
      const prev_y =
        report.period_quarter > 1 ? report.period_year : report.period_year - 1;
      ebitdaTrendData.push({
        quarter: `Q${prev_q} ${prev_y}`,
        ebitda: previous_quarter.ebitda || 0,
      });
    }
    if (financial_summary) {
      ebitdaTrendData.push({
        quarter: current_quarter_label,
        ebitda: financial_summary.ebitda || 0,
      });
    }

    // Expense comparison data - top expense categories compared quarter over quarter
    const expenseComparisonData =
      report.analysis_data?.chart_data?.expenseComparison || [];

    // Quarterly P&L data for the current year
    const quarterlyPLData =
      report.analysis_data?.current_year_quarterly_pl?.map((quarter) => ({
        quarter: quarter.quarter,
        revenue: quarter.revenue,
        expenses: quarter.expenses,
        gross_profit: quarter.gross_profit,
        net_profit: quarter.net_profit,
        profit_margin: quarter.profit_margin,
      })) || [];

    return {
      revenueComparisonData,
      expenseComparisonData,
      expenseBreakdownData,
      quarterlyTrendData,
      quarterlyPLData,
      ebitdaTrendData,
    };
  };

  // Chart data state
  const [chartData, setChartData] = useState(() => {
    // Try to load saved chart data first
    if (report.analysis_data?.chart_data) {
      const backendData = report.analysis_data.chart_data;

      // Generate colors for all expense accounts
      const generateColor = (index: number) => {
        const colors = [
          "#1b477b",
          "#bd48ad",
          "#1fd65f",
          "#e2ac52",
          "#e44646",
          "#ec4899",
          "#06b6d4",
          "#f97316",
          "#84cc16",
          "#a855f7",
          "#14b8a6",
          "#f43f5e",
          "#6366f1",
          "#eab308",
          "#22c55e",
          "#d946ef",
          "#0ea5e9",
          "#fb923c",
          "#4ade80",
          "#c084fc",
          "#2dd4bf",
          "#fb7185",
          "#818cf8",
          "#fbbf24",
        ];
        return colors[index % colors.length];
      };

      // Transform expense breakdown from backend format to frontend format
      const transformedExpenseBreakdown =
        backendData.expenseBreakdown?.map((item: any, index: number) => ({
          name: item.category || item.name,
          value: item.amount || item.value,
          percentage: item.percentage,
          color: generateColor(index),
        })) || [];

      // Prepare a safe EBITDA trend: use backend if present, otherwise build from quarterly PL when available, else fallback current/previous
      let safeEbitdaTrend = backendData.ebitdaTrend;
      if (
        !safeEbitdaTrend ||
        (Array.isArray(safeEbitdaTrend) && safeEbitdaTrend.length === 0)
      ) {
        // Try to build from current_year_quarterly_pl if present
        const pl = report.analysis_data?.current_year_quarterly_pl as
          | any[]
          | undefined;
        if (pl && Array.isArray(pl) && pl.length > 0) {
          safeEbitdaTrend = pl.map((q) => ({
            quarter: q.quarter,
            ebitda: q.ebitda || 0,
          }));
        } else {
          // Fallback to prev + current only
          const fallback: any[] = [];
          const prev_q_num =
            report.period_quarter > 1 ? report.period_quarter - 1 : 4;
          const prev_y_num =
            report.period_quarter > 1
              ? report.period_year
              : report.period_year - 1;
          if (report.analysis_data?.comparison_data?.previous_quarter) {
            fallback.push({
              quarter: `Q${prev_q_num} ${prev_y_num}`,
              ebitda:
                report.analysis_data?.comparison_data?.previous_quarter
                  ?.ebitda || 0,
            });
          }
          if (report.analysis_data?.financial_summary) {
            fallback.push({
              quarter: `Q${report.period_quarter} ${report.period_year}`,
              ebitda: report.analysis_data?.financial_summary?.ebitda || 0,
            });
          }
          safeEbitdaTrend = fallback;
        }
      }

      return {
        revenueComparison: backendData.revenueComparison || [],
        expenseComparison: backendData.expenseComparison || [],
        expenseBreakdown: transformedExpenseBreakdown,
        quarterlyTrend: backendData.quarterlyTrend || [],
        ebitdaTrend: safeEbitdaTrend || [],
        quarterlyPL:
          backendData.quarterlyPL ||
          report.analysis_data?.current_year_quarterly_pl ||
          [],
        revenue_chart_description: backendData.revenue_chart_description || "",
        expense_chart_description: backendData.expense_chart_description || "",
        financial_trends_description:
          backendData.financial_trends_description || "",
        ebitda_trend_description: backendData.ebitda_trend_description || "",
      };
    }

    // Fall back to default data
    const {
      revenueComparisonData,
      expenseComparisonData,
      expenseBreakdownData,
      quarterlyTrendData,
      quarterlyPLData,
      ebitdaTrendData,
    } = prepareChartData();
    return {
      revenueComparison: revenueComparisonData,
      expenseComparison: expenseComparisonData,
      expenseBreakdown: expenseBreakdownData,
      quarterlyTrend: quarterlyTrendData,
      ebitdaTrend: ebitdaTrendData,
      quarterlyPL: quarterlyPLData,
      revenue_chart_description: "",
      expense_chart_description: "",
      financial_trends_description: "",
      ebitda_trend_description: "",
    };
  });

  // Helper function to safely get client emails
  const getClientEmails = () => {
    const emails = [];

    // Check for primary email
    if (report.client?.primary_email) {
      emails.push(report.client.primary_email);
    }

    // Check for alternative emails
    if (
      report.client?.alternative_emails &&
      Array.isArray(report.client.alternative_emails)
    ) {
      emails.push(...report.client.alternative_emails);
    }

    return emails.filter(Boolean);
  };

  // Helper function to transform chart data to backend format
  const transformChartDataToBackendFormat = (chartData: any) => {
    return {
      ...chartData,
      expenseBreakdown:
        chartData.expenseBreakdown?.map((item: any) => ({
          category: item.name || item.category,
          amount: item.value || item.amount,
          percentage: item.percentage,
        })) || [],
      ebitdaTrend: chartData.ebitdaTrend || [],
    };
  };

  // Email state - Initialize with client emails if no recipient emails are set
  const [recipientEmails, setRecipientEmails] = useState<string[]>(() => {
    if (report.recipient_emails && report.recipient_emails.length > 0) {
      return report.recipient_emails;
    }
    const clientEmails = getClientEmails();
    return clientEmails.length > 0 ? clientEmails : [""];
  });
  const [bccEmails, setBccEmails] = useState<string[]>(report.bcc_emails || []);

  // Update recipient emails when report data changes
  useEffect(() => {
    if (!report.recipient_emails || report.recipient_emails.length === 0) {
      const clientEmails = getClientEmails();
      if (clientEmails.length > 0) {
        setRecipientEmails(clientEmails);
      }
    }
  }, [report.client?.primary_email, report.client?.alternative_emails]);
  const [emailSubject, setEmailSubject] = useState(
    report.email_subject ||
    `Financial Report - ${report.client?.name || report.client_name || "Client"
    } - ${report.period_display}`
  );
  const [emailMessage, setEmailMessage] = useState(
    report.email_message ||
    `Dear ${report.client?.name || report.client_name || "Client"
    } team,\n\nPlease find attached your financial report for ${report.period_display
    }.\n\nBest regards,\nYour Accounting Team`
  );
  const [generatingMessage, setGeneratingMessage] = useState(false);

  // AI Regeneration state
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect helper
  const typewriterEffect = (
    text: string,
    setter: (value: string) => void,
    speed: number = 15
  ) => {
    setIsTyping(true);
    let index = 0;
    setter(""); // Clear existing text

    const interval = setInterval(() => {
      if (index < text.length) {
        setter(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return interval;
  };

  const generateAIMessage = async () => {
    setGeneratingMessage(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/reports/${report.id}/generate-message`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setEmailMessage(data.message);
        setEmailSubject(data.suggested_subject || emailSubject);
        toast({
          title: "Success",
          description: "AI message generated successfully!",
        });
      } else {
        throw new Error(data.error || "Failed to generate AI message");
      }
    } catch (error) {
      console.error("Error generating AI message:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI message",
        variant: "destructive",
      });
    } finally {
      setGeneratingMessage(false);
    }
  };

  const handleRegenerateResults = (results: any) => {
    // Apply regenerated content based on what was generated
    if (results.title) {
      setReportTitle(results.title);
    }
    if (results.summary) {
      setReportSummary(results.summary);
    }
    if (results.recommendations && Array.isArray(results.recommendations)) {
      setRecommendations(filterRecommendations(results.recommendations));
    }
    if (results.email_subject) {
      setEmailSubject(results.email_subject);
    }
    if (results.email_message) {
      setEmailMessage(results.email_message);
    }

    toast({
      title: "Success",
      description: "AI regeneration applied successfully!",
    });
  };

  // Inline AI regeneration for Executive Summary
  const handleRegenerateSummary = async () => {
    if (!summaryPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt for regeneration",
      });
      return;
    }

    setRegeneratingSummary(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/reports/${report.id}/regenerate-section`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: "summary",
            prompt: summaryPrompt.trim(),
            current_data: {
              summary: reportSummary,
              financial_data: report.analysis_data,
              client_name: report.client?.name || report.client_name,
              period: report.period_display,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate summary");
      }

      if (data.summary) {
        // Backend has already saved the summary, just update UI
        // Show typewriter effect
        typewriterEffect(data.summary, setReportSummary, 15);
        setSummaryPrompt("");
        setEditingSummary(false);

        // Show success message after typewriter effect completes
        setTimeout(() => {
          toast({
            title: "Success",
            description:
              "Executive Summary regenerated and saved successfully!",
          });
        }, data.summary.length * 15 + 500); // Wait for typewriter + small buffer
      }
    } catch (error) {
      console.error("Error regenerating summary:", error);
      toast({
        title: "Error",
        description: `Failed to regenerate summary: ${error instanceof Error ? error.message : "Unknown error"
          }`,
        variant: "destructive",
      });
    } finally {
      setRegeneratingSummary(false);
    }
  };

  // Inline AI regeneration for Strategic Recommendations
  const handleRegenerateRecommendations = async () => {
    if (!recommendationsPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt for regeneration",
      });
      return;
    }

    setRegeneratingRecommendations(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/reports/${report.id}/regenerate-section`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: "recommendations",
            prompt: recommendationsPrompt.trim(),
            current_data: {
              recommendations: recommendations,
              financial_data: report.analysis_data,
              client_name: report.client?.name || report.client_name,
              period: report.period_display,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate recommendations");
      }

      if (data.recommendations && Array.isArray(data.recommendations)) {
        // Backend has already saved the recommendations, just update UI
        const filteredRecs = filterRecommendations(data.recommendations);
        setRecommendations(filteredRecs);
        setRecommendationsPrompt("");
        setEditingRecommendations(false);

        toast({
          title: "Success",
          description:
            "Strategic Recommendations regenerated and saved successfully!",
        });
      }
    } catch (error) {
      console.error("Error regenerating recommendations:", error);
      toast({
        title: "Error",
        description: `Failed to regenerate recommendations: ${error instanceof Error ? error.message : "Unknown error"
          }`,
        variant: "destructive",
      });
    } finally {
      setRegeneratingRecommendations(false);
    }
  };

  // Save prompts to client for future use
  const handleSaveSummaryPromptToClient = async () => {
    if (!summaryPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Prompt is empty. Cannot save.",
      });
      return;
    }

    if (!report.client?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No client linked to this report.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/clients/${report.client.id}`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            report_summary_prompt: summaryPrompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save prompt to client");
      }

      toast({
        title: "Success",
        description:
          "Summary prompt saved to client! It will be used for future reports.",
      });
    } catch (error) {
      console.error("Error saving summary prompt:", error);
      toast({
        title: "Error",
        description: `Failed to save prompt: ${error instanceof Error ? error.message : "Unknown error"
          }`,
        variant: "destructive",
      });
    }
  };

  const handleSaveRecommendationsPromptToClient = async () => {
    if (!recommendationsPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Prompt is empty. Cannot save.",
      });
      return;
    }

    if (!report.client?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No client linked to this report.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/clients/${report.client.id}`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            report_recommendations_prompt: recommendationsPrompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save prompt to client");
      }

      toast({
        title: "Success",
        description:
          "Recommendations prompt saved to client! It will be used for future reports.",
      });
    } catch (error) {
      console.error("Error saving recommendations prompt:", error);
      toast({
        title: "Error",
        description: `Failed to save prompt: ${error instanceof Error ? error.message : "Unknown error"
          }`,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Filter out empty emails to prevent 422 validation errors
      const validRecipientEmails = recipientEmails.filter(
        (email) => email && email.trim() !== ""
      );
      const validBccEmails = bccEmails.filter(
        (email) => email && email.trim() !== ""
      );

      await onSave({
        title: reportTitle,
        summary: reportSummary,
        recipient_emails: validRecipientEmails,
        bcc_emails: validBccEmails,
        email_subject: emailSubject,
        email_message: emailMessage,
        analysis_data: {
          ...report.analysis_data,
          recommendations,
          // Rule-based recommendations are now included in recommendations list
          chart_data: transformChartDataToBackendFormat(chartData), // Save chart data in backend format
        } as any,
      });
      setIsEditing(false);
      setEditingChart(null); // Close any open chart editors
    } catch (error) {
      console.error("Error saving report:", error);
    } finally {
      setSaving(false);
    }
  };

  // Helper function to toggle edit state and automatically save when closing edit mode
  const handleEditToggleWithSave = async (
    currentEditState: boolean,
    setEditState: (state: boolean) => void
  ) => {
    if (currentEditState) {
      // If currently editing, save first, then close edit mode
      await handleSave();
    }
    setEditState(!currentEditState);
  };

  const handleSendReport = async () => {
    console.log("handleSendReport called");
    console.log("Email data:", {
      recipient_emails: recipientEmails,
      bcc_emails: bccEmails,
      email_subject: emailSubject,
      email_message: emailMessage,
    });

    // Validation
    if (
      recipientEmails.length === 0 ||
      recipientEmails.every((email) => !email.trim())
    ) {
      toast({
        title: "No Recipients",
        description: "Please add at least one recipient email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidRecipients = recipientEmails.filter(
      (email) => email.trim() && !emailRegex.test(email.trim())
    );
    if (invalidRecipients.length > 0) {
      toast({
        title: "Invalid Email",
        description: `Invalid email address: ${invalidRecipients[0]}`,
        variant: "destructive",
      });
      return;
    }

    setSendingReport(true);
    try {
      await onSend({
        recipient_emails: recipientEmails.filter((email) => email.trim()),
        bcc_emails: bccEmails.filter((email) => email.trim()),
        email_subject: emailSubject,
        email_message: emailMessage,
        include_pdf: true,
      });
      setShowSendDialog(false);
      toast({
        title: "Report Sent",
        description: "The report has been sent successfully.",
      });
    } catch (error) {
      console.error("Error sending report:", error);
      toast({
        title: "Send Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReport(false);
    }
  };

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      await onDownloadPDF(report.id);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Typing effect function
  const typeText = (
    text: string,
    setText: (text: string) => void,
    onComplete: () => void
  ) => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setText(text.substring(0, currentIndex));
        setTypingProgress((currentIndex / text.length) * 100);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTypingProgress(100);
        onComplete();
      }
    }, 10); // 10ms per character for faster typing
  };

  // Handle in-place translation with typing effect
  const handleInPlaceTranslation = async (targetLanguage: string) => {
    const languageNames: { [key: string]: string } = {
      en: "English",
      fr: "French",
      nl: "Dutch",
      es: "Spanish",
    };

    setIsTranslating(true);
    setTranslatingLanguage(languageNames[targetLanguage]);
    setTypingProgress(0);

    try {
      const response = await fetch(
        buildApiUrl(`/api/reports/${report.id}/translate`),
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            target_language: targetLanguage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const translatedData = await response.json();
      console.log("Translation received:", translatedData);

      // Store the translated data
      const translatedSummary = translatedData.summary || reportSummary;
      const translatedRecs = filterRecommendations(
        translatedData.recommendations || []
      );

      // First, type the summary
      setIsTypingSummary(true);
      typeText(translatedSummary, setReportSummary, () => {
        setIsTypingSummary(false);

        // Then, type recommendations one by one
        setIsTypingRecommendations(true);

        // Type recommendations with delay between each
        let recIndex = 0;
        const typeNextRecommendation = () => {
          if (recIndex < translatedRecs.length) {
            const currentRecs = translatedRecs.slice(0, recIndex + 1);
            setRecommendations(currentRecs);
            recIndex++;
            setTimeout(typeNextRecommendation, 200); // 200ms delay between recommendations
          } else {
            setIsTypingRecommendations(false);
            setIsTranslating(false);
            setTypingProgress(0);

            // Backend already saved the translation at lines 1473-1477 in reports.py
            // Just show success message
            toast({
              title: "Translation Complete & Saved",
              description: `Report translated to ${languageNames[targetLanguage]} and saved in database`,
            });
          }
        };

        typeNextRecommendation();
      });
    } catch (error) {
      console.error("Error translating report:", error);
      toast({
        title: "Translation Failed",
        description: "Failed to translate report content",
        variant: "destructive",
      });
      setIsTranslating(false);
      setIsTypingSummary(false);
      setIsTypingRecommendations(false);
      setTypingProgress(0);
    }
  };

  const handleTranslationComplete = (translatedData: any) => {
    // Update the report data with translated content
    setReportSummary(translatedData.summary || reportSummary);
    setRecommendations(
      filterRecommendations(translatedData.recommendations || recommendations)
    );
  };

  const addRecipientEmail = () => {
    setRecipientEmails([...recipientEmails, ""]);
  };

  const removeRecipientEmail = (index: number) => {
    setRecipientEmails(recipientEmails.filter((_, i) => i !== index));
  };

  const updateRecipientEmail = (index: number, value: string) => {
    const updated = [...recipientEmails];
    updated[index] = value;
    setRecipientEmails(updated);
  };

  const addBccEmail = () => {
    setBccEmails([...bccEmails, ""]);
  };

  const removeBccEmail = (index: number) => {
    setBccEmails(bccEmails.filter((_, i) => i !== index));
  };

  const updateBccEmail = (index: number, value: string) => {
    const updated = [...bccEmails];
    updated[index] = value;
    setBccEmails(updated);
  };

  const addRecommendation = () => {
    setRecommendations([...recommendations, ""]);
  };

  const removeRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  const updateRecommendation = (index: number, value: string) => {
    const updated = [...recommendations];
    updated[index] = value;
    setRecommendations(updated);
  };

  // Editing helpers removed: charts are display-only and driven from report.analysis_data/chart_data

  // Helper to filter spikes/declines to only 6XXXX/2XXXX
  const filterSignificantAccountChanges = (spikeDeclineAnalysis: any) => {
    if (!spikeDeclineAnalysis) return { spikes: [], declines: [] };
    const codeFilter = (item: any) =>
      typeof item.code === "string" &&
      (item.code.startsWith("6") || item.code.startsWith("2"));
    return {
      spikes: Array.isArray(spikeDeclineAnalysis.spikes)
        ? spikeDeclineAnalysis.spikes.filter(codeFilter)
        : [],
      declines: Array.isArray(spikeDeclineAnalysis.declines)
        ? spikeDeclineAnalysis.declines.filter(codeFilter)
        : [],
    };
  };

  // Reusable Data Table Component
  const DataTable: React.FC<{
    data: any[];
    columns: Array<{
      key: string;
      label: string;
      format?: (value: any) => string;
    }>;
  }> = ({ data, columns }) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">No data available</div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                    {col.format
                      ? col.format(row[col.key])
                      : row[col.key]?.toString() || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Combined Header Bar with Image and SVG Decorations */}
      <div className="sticky top-0 z-50">
        {/* Unified Header Section */}
        <div
          className="relative overflow-hidden mx-2 my-2 rounded-xl"
          style={{ backgroundColor: '#302160' }}
        >
          {/* Background Image - Stretched to fill container */}
          <div className="absolute inset-0 opacity-50 pointer-events-none overflow-hidden ">
            <img
              src="/anim-bg.png"
              alt="Report Animation"
              className="w-full h-full object-cover object-bottom"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "bottom",
              }}
            />
          </div>

          {/* Decorative Wave Pattern */}
          <div className="absolute inset-0 opacity-10"></div>

          {/* Header Controls Bar */}
          <header className="relative z-10 flex h-20 shrink-0 items-center gap-2 px-4">
            {!isReadOnly && (
              <>
                <SidebarTrigger className="-ml-1 text-white" />
                <Separator
                  orientation="vertical"
                  className="mr-2 h-4 bg-white/30"
                />
              </>
            )}
            <Button
              variant="secondary"
              onClick={onBack}
              className="flex items-center gap-2 text-sm hover:bg-gray-50 h-8 px-3 rounded-full bg-white border border-gray-200"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
                color: "#111827",
              }}
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" style={{ color: "#3D52A0" }} />
              <span className="font-semibold" style={{ color: "#111827" }}>
                Back to Reports
              </span>
            </Button>
            <div className="ml-auto flex items-center space-x-4">
              <LanguageChangeDropdown />
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E5E7EB",
                }}
              >
                <Bell className="h-4 w-4" style={{ color: "#3D52A0" }} />
              </Button>
              <UserProfile />
            </div>
          </header>

          {/* Spacer for visual balance */}
          <div className="relative h-16"></div>
        </div>

        {/* Report Title Card - Overlapping the gradient */}
        <div className="relative -mt-8 pb-6 z-40">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Icon and Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Report Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-[#1e3a8a] rounded-lg flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_211_1412)">
                        <path
                          d="M2.5 13C5.43 9.5205 8.092 7.517 9.3065 6.694C9.7035 6.4245 10.227 6.5125 10.5285 6.8855C11.1011 7.59891 11.653 8.32872 12.1835 9.074C12.5875 9.64 13.44 9.658 13.8875 9.126C15.9555 6.67 18.7505 4.25 18.7505 4.25"
                          stroke="white"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M21.188 5.66142C21.52 4.04392 21.5165 2.61792 21.4885 1.94642C21.4848 1.83232 21.4378 1.72391 21.3571 1.64314C21.2764 1.56237 21.1681 1.51529 21.054 1.51142C19.8082 1.46513 18.5612 1.56599 17.339 1.81192C16.9625 1.88892 16.838 2.34942 17.109 2.62092L20.379 5.89092C20.651 6.16242 21.111 6.03742 21.188 5.66142ZM2.6335 22.4799C2.0695 22.4614 1.6375 22.1204 1.5805 21.5594C1.535 21.1194 1.5 20.4659 1.5 19.4999C1.5 18.5339 1.536 17.8799 1.58 17.4404C1.6375 16.8794 2.0695 16.5384 2.6335 16.5194C2.967 16.5084 3.4135 16.4999 4 16.4999C4.5865 16.4999 5.033 16.5084 5.3665 16.5199C5.9305 16.5384 6.3625 16.8794 6.4195 17.4404C6.4645 17.8804 6.5 18.5339 6.5 19.4999C6.5 20.4659 6.464 21.1199 6.42 21.5594C6.3625 22.1204 5.9305 22.4614 5.3665 22.4804C5.0325 22.4914 4.5865 22.4999 4 22.4999C3.4135 22.4999 2.967 22.4914 2.6335 22.4799ZM18.7785 22.4669C18.1285 22.4269 17.677 21.9579 17.63 21.3084C17.566 20.4279 17.5 18.8334 17.5 15.9999C17.5 13.1664 17.566 11.5719 17.63 10.6914C17.677 10.0419 18.1285 9.57242 18.7785 9.53292C19.0935 9.51342 19.495 9.49992 20 9.49992C20.505 9.49992 20.9065 9.51342 21.2215 9.53292C21.8715 9.57292 22.323 10.0419 22.37 10.6914C22.434 11.5719 22.5 13.1664 22.5 15.9999C22.5 18.8334 22.434 20.4279 22.37 21.3084C22.323 21.9579 21.8715 22.4274 21.2215 22.4669C20.9065 22.4864 20.5055 22.4999 20 22.4999C19.495 22.4999 19.0935 22.4864 18.7785 22.4669ZM10.75 22.4759C10.118 22.4484 9.6565 22.0259 9.6035 21.3959C9.549 20.7469 9.5 19.6929 9.5 17.9999C9.5 16.3069 9.549 15.2529 9.6035 14.6039C9.6565 13.9739 10.118 13.5514 10.7495 13.5239C11.1661 13.5068 11.583 13.4988 12 13.4999C12.521 13.4999 12.931 13.5099 13.25 13.5239C13.882 13.5514 14.3435 13.9739 14.3965 14.6039C14.451 15.2529 14.5 16.3069 14.5 17.9999C14.5 19.6929 14.451 20.7469 14.3965 21.3959C14.3435 22.0259 13.882 22.4484 13.2505 22.4759C12.931 22.4899 12.521 22.4999 12 22.4999C11.5832 22.5009 11.1664 22.4929 10.75 22.4759Z"
                          stroke="white"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_211_1412">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>

                  {/* Title and Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {editingTitle ? (
                        <Input
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          className="text-base md:text-lg font-semibold border-none p-0 h-auto bg-transparent focus:bg-white rounded-md"
                        />
                      ) : (
                        <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                          {reportTitle}
                        </h1>
                      )}
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTitle(!editingTitle)}
                          className="text-gray-500 hover:text-gray-700 shrink-0 h-7 w-7 p-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs text-gray-500">
                        {report.client?.name ||
                          report.client_name ||
                          "Unknown Client"}{" "}
                        | {report.period_display}
                      </p>
                      {report.vat_closure_status &&
                        report.vat_closure_status !== "N/A" && (
                          <Badge
                            variant={
                              report.vat_closure_status === "Closed"
                                ? "default"
                                : "secondary"
                            }
                            className={`text-xs ${report.vat_closure_status === "Closed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              }`}
                          >
                            VAT: {report.vat_closure_status}
                          </Badge>
                        )}

                      {/* Translation Loading Indicator */}
                      {isTranslating && (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 animate-pulse">
                          <Languages className="w-3 h-3 mr-1" />
                          <span className="text-xs font-medium">
                            {isTypingSummary && "Translating Summary..."}
                            {isTypingRecommendations &&
                              "Translating Recommendations..."}
                            {!isTypingSummary &&
                              !isTypingRecommendations &&
                              `Fetching ${translatingLanguage}...`}
                          </span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons - Combined Pill */}
                {!isReadOnly && (
                  <div className="flex items-center flex-shrink-0 bg-[#1e3a8a] hover:bg-[#1e40af] rounded-full h-9 overflow-hidden transition-colors">
                    {/* Send Button */}
                    <Dialog
                      open={showSendDialog}
                      onOpenChange={setShowSendDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="bg-transparent hover:bg-transparent text-white rounded-none h-9 px-4 gap-2 border-0 shadow-none"
                          size="sm"
                        >
                          <Send className="w-4 h-4" />
                          <span className="hidden sm:inline">Send</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Send Financial Report</DialogTitle>
                        </DialogHeader>
                        <SendReportDialog
                          recipientEmails={recipientEmails}
                          bccEmails={bccEmails}
                          emailSubject={emailSubject}
                          emailMessage={emailMessage}
                          onRecipientsChange={setRecipientEmails}
                          onBccChange={setBccEmails}
                          onSubjectChange={setEmailSubject}
                          onMessageChange={setEmailMessage}
                          onSend={handleSendReport}
                          onAddRecipient={addRecipientEmail}
                          onRemoveRecipient={removeRecipientEmail}
                          onUpdateRecipient={updateRecipientEmail}
                          onAddBcc={addBccEmail}
                          onRemoveBcc={removeBccEmail}
                          onUpdateBcc={updateBccEmail}
                          clientName={
                            report.client?.name ||
                            report.client_name ||
                            "Client"
                          }
                          clientUsers={report.client?.users || []}
                          onClose={() => setShowSendDialog(false)}
                          isSending={sendingReport}
                        />
                      </DialogContent>
                    </Dialog>

                    {/* Divider */}
                    <div className="w-0.5 h-10 bg-white"></div>

                    {/* More Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="bg-transparent hover:bg-transparent text-white border-0 rounded-none h-9 w-9 p-0"
                          size="sm"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={() => setShowShareDialog(true)}
                        >
                          <Share2 className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="text-blue-600">Share Report</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleDownloadPDF}
                          disabled={isGeneratingPDF}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {isGeneratingPDF
                            ? "Generating PDF..."
                            : "Download PDF"}
                        </DropdownMenuItem>

                        {!report.is_demo && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setShowYukiRawDataModal(true)}
                            >
                              <Database className="w-4 h-4 mr-2 text-indigo-600" />
                              <span className="text-indigo-600">
                                View Raw Data
                              </span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Modern Layout */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6 lg:space-y-8 relative">
        {/* Translation Loading Overlay - Only covers main content area */}
        {isTranslating && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-start justify-center rounded-2xl pt-12 md:pt-20">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-md mx-4 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto animate-pulse">
                  <Languages className="w-10 h-10 text-orange-600 animate-bounce" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Translating to {translatingLanguage}...
              </h3>
              <p className="text-gray-600 mb-6">
                Please wait while we translate your report content
              </p>

              {/* Progress indicator */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                  <span className="text-gray-700">
                    {isTypingSummary && "Translating Summary..."}
                    {isTypingRecommendations &&
                      "Translating Recommendations..."}
                    {!isTypingSummary &&
                      !isTypingRecommendations &&
                      "Fetching Translation..."}
                  </span>
                </div>

                {typingProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${typingProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hero Section with Executive Summary */}
        <ScrollReveal direction="up" distance={30} duration={0.6}>
          {isReadOnly ? (
            /* Read-only layout: Summary on left, metrics on right */
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Executive Summary */}
              <div className="flex-1 lg:w-1/2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Executive Summary
                </h2>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  Key insights from your financial performance
                </p>
                <div className="relative">
                  {isTypingSummary && (
                    <div className="absolute top-0 right-0 flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                      <Languages className="w-3 h-3" />
                      <span>
                        Typing {translatingLanguage}...{" "}
                        {Math.round(typingProgress)}%
                      </span>
                    </div>
                  )}
                  {(() => {
                    const summaryText =
                      reportSummary ||
                      `Financial report for Q${report?.period_quarter || 1} ${report?.period_year || 2024
                      }. Analysis pending - please regenerate the report to see AI-generated insights based on actual financial data.`;
                    const truncateLength = 400;
                    const shouldTruncate = summaryText.length > truncateLength;
                    const displayText =
                      shouldTruncate && !isSummaryExpanded
                        ? summaryText.slice(0, truncateLength).trim() + "..."
                        : summaryText;

                    return (
                      <>
                        <p className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                          {displayText}
                          {isTypingSummary && (
                            <span className="inline-block w-0.5 h-5 bg-orange-600 ml-1 animate-pulse" />
                          )}
                        </p>
                        {shouldTruncate && (
                          <button
                            onClick={() =>
                              setIsSummaryExpanded(!isSummaryExpanded)
                            }
                            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {isSummaryExpanded ? "Read less" : "Read more"}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Right: Financial Metrics Cards */}
              <div className="lg:w-1/2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      {(() => {
                        const currentRevenue =
                          report.analysis_data?.financial_summary
                            ?.total_revenue || 0;
                        const prevRevenue =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.total_revenue || 0;
                        const growth = calculateGrowth(
                          currentRevenue,
                          prevRevenue
                        );
                        return prevRevenue > 0 ? (
                          <Badge
                            variant="outline"
                            className={`${growth.colorClass} text-xs px-1.5 py-0`}
                          >
                            {growth.display}
                          </Badge>
                        ) : null;
                      })()}
                    </div>
                    <h3 className="text-xs font-medium text-gray-600 mb-1">
                      Total Revenue
                    </h3>
                    <p className="text-lg font-bold text-gray-900 break-words">
                      €
                      {(
                        report.analysis_data?.financial_summary
                          ?.total_revenue || 0
                      ).toLocaleString()}
                    </p>
                    <div className="mt-1">
                      {(() => {
                        const prevRevenue =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.total_revenue || 0;
                        return prevRevenue > 0 ? (
                          <p className="text-xs text-gray-400">
                            Last Quarter: €{prevRevenue.toLocaleString()}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <BarChart3 className="w-4 h-4 text-orange-600" />
                      </div>
                      {(() => {
                        const currentExpenses =
                          report.analysis_data?.financial_summary
                            ?.total_expenses || 0;
                        const prevExpenses =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.total_expenses || 0;
                        if (prevExpenses === 0) return null;
                        const percentChange =
                          ((currentExpenses - prevExpenses) / prevExpenses) *
                          100;
                        const display =
                          percentChange >= 0
                            ? `+${percentChange.toFixed(1)}%`
                            : `${percentChange.toFixed(1)}%`;
                        const colorClass =
                          percentChange >= 0
                            ? "text-red-600 border-red-200 bg-red-50"
                            : "text-green-600 border-green-200 bg-green-50";
                        return (
                          <Badge
                            variant="outline"
                            className={`${colorClass} text-xs px-1.5 py-0`}
                          >
                            {display}
                          </Badge>
                        );
                      })()}
                    </div>
                    <h3 className="text-xs font-medium text-gray-600 mb-1">
                      Total Expenses
                    </h3>
                    <p className="text-lg font-bold text-gray-900 break-words">
                      €
                      {(
                        report.analysis_data?.financial_summary
                          ?.total_expenses || 0
                      ).toLocaleString()}
                    </p>
                    <div className="mt-1">
                      {(() => {
                        const prevExpenses =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.total_expenses || 0;
                        return prevExpenses > 0 ? (
                          <p className="text-xs text-gray-400">
                            Last Quarter: €{prevExpenses.toLocaleString()}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <PieChart className="w-4 h-4 text-green-600" />
                      </div>
                      {(() => {
                        const currentProfit =
                          report.analysis_data?.financial_summary?.net_profit ||
                          0;
                        const prevProfit =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.net_profit || 0;
                        const growth = calculateGrowth(
                          currentProfit,
                          prevProfit
                        );
                        return prevProfit !== 0 ? (
                          <Badge
                            variant="outline"
                            className={`${growth.colorClass} text-xs px-1.5 py-0`}
                          >
                            {growth.display}
                          </Badge>
                        ) : null;
                      })()}
                    </div>
                    <h3 className="text-xs font-medium text-gray-600 mb-1">
                      Net Profit
                    </h3>
                    <p className="text-lg font-bold text-gray-900 break-words">
                      €
                      {(
                        report.analysis_data?.financial_summary?.net_profit || 0
                      ).toLocaleString()}
                    </p>
                    <div className="mt-1">
                      {(() => {
                        const prevProfit =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.net_profit || 0;
                        return prevProfit !== 0 ? (
                          <p className="text-xs text-gray-400">
                            Last Quarter: €{prevProfit.toLocaleString()}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-indigo-100 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                      </div>
                      {(() => {
                        const currentEbitda =
                          report.analysis_data?.financial_summary?.ebitda || 0;
                        const prevEbitda =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.ebitda || 0;
                        if (prevEbitda === 0) return null;
                        const percentChange =
                          ((currentEbitda - prevEbitda) /
                            Math.abs(prevEbitda)) *
                          100;
                        const display =
                          percentChange >= 0
                            ? `+${percentChange.toFixed(1)}%`
                            : `${percentChange.toFixed(1)}%`;
                        const colorClass =
                          percentChange >= 0
                            ? "text-green-600 border-green-200 bg-green-50"
                            : "text-red-600 border-red-200 bg-red-50";
                        return (
                          <Badge
                            variant="outline"
                            className={`${colorClass} text-xs px-1.5 py-0`}
                          >
                            {display}
                          </Badge>
                        );
                      })()}
                    </div>
                    <h3 className="text-xs font-medium text-gray-600 mb-1">
                      EBITDA
                    </h3>
                    <p className="text-lg font-bold text-gray-900 break-words">
                      €
                      {(
                        report.analysis_data?.financial_summary?.ebitda || 0
                      ).toLocaleString()}
                    </p>
                    <div className="mt-1">
                      {(() => {
                        const prevEbitda =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.ebitda || 0;
                        return prevEbitda !== 0 ? (
                          <p className="text-xs text-gray-400">
                            Last Quarter: €{prevEbitda.toLocaleString()}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-teal-100 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-teal-600" />
                      </div>
                      {(() => {
                        const currentGrossMargin =
                          report.analysis_data?.financial_summary
                            ?.gross_margin || 0;
                        const prevGrossMargin =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.gross_margin || 0;
                        if (prevGrossMargin === 0) return null;
                        const percentChange =
                          ((currentGrossMargin - prevGrossMargin) /
                            Math.abs(prevGrossMargin)) *
                          100;
                        const display =
                          percentChange >= 0
                            ? `+${percentChange.toFixed(1)}%`
                            : `${percentChange.toFixed(1)}%`;
                        const colorClass =
                          percentChange >= 0
                            ? "text-green-600 border-green-200 bg-green-50"
                            : "text-red-600 border-red-200 bg-red-50";
                        return (
                          <Badge
                            variant="outline"
                            className={`${colorClass} text-xs px-1.5 py-0`}
                          >
                            {display}
                          </Badge>
                        );
                      })()}
                    </div>
                    <h3 className="text-xs font-medium text-gray-600 mb-1">
                      Gross Margin
                    </h3>
                    <p className="text-lg font-bold text-gray-900 break-words">
                      €
                      {(
                        report.analysis_data?.financial_summary?.gross_margin ||
                        0
                      ).toLocaleString()}
                    </p>
                    <div className="mt-1">
                      {(() => {
                        const prevGrossMargin =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.gross_margin || 0;
                        return prevGrossMargin !== 0 ? (
                          <p className="text-xs text-gray-400">
                            Last Quarter: €{prevGrossMargin.toLocaleString()}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      </div>
                      {(() => {
                        const currentMargin =
                          report.analysis_data?.financial_summary
                            ?.profit_margin || 0;
                        const prevMargin =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.profit_margin || 0;
                        if (prevMargin === 0) return null;
                        const marginChange = currentMargin - prevMargin;
                        const display =
                          marginChange >= 0
                            ? `+${marginChange.toFixed(1)}pp`
                            : `${marginChange.toFixed(1)}pp`;
                        const colorClass =
                          marginChange >= 0
                            ? "text-green-600 border-green-200 bg-green-50"
                            : "text-red-600 border-red-200 bg-red-50";
                        return (
                          <Badge
                            variant="outline"
                            className={`${colorClass} text-xs px-1.5 py-0`}
                          >
                            {display}
                          </Badge>
                        );
                      })()}
                    </div>
                    <h3 className="text-xs font-medium text-gray-600 mb-1">
                      Profit Margin
                    </h3>
                    <p className="text-lg font-bold text-gray-900 break-words">
                      {(
                        report.analysis_data?.financial_summary
                          ?.profit_margin || 0
                      ).toFixed(1)}
                      %
                    </p>
                    <div className="mt-1">
                      {(() => {
                        const prevMargin =
                          report.analysis_data?.comparison_data
                            ?.previous_quarter?.profit_margin || 0;
                        return prevMargin > 0 ? (
                          <p className="text-xs text-gray-400">
                            Last Quarter: {prevMargin.toFixed(1)}%
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Editable layout: Original stacked design */
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 md:p-6 lg:p-8 border border-blue-200/50">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 md:mb-6">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Executive Summary
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">
                    Key insights from your financial performance
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!editingSummary && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSummary(true);
                        // Auto-fill client's custom prompt if it exists
                        if (report.client?.report_summary_prompt) {
                          setSummaryPrompt(report.client.report_summary_prompt);
                        }
                      }}
                      className="border-gray-200 border-2 rounded-full text-xs md:text-sm flex-1 sm:flex-none"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.95997 9.13697L10.846 6.03797C11.178 4.87797 12.822 4.87797 13.154 6.03797L14.039 9.13697C14.095 9.33301 14.2001 9.51153 14.3442 9.6557C14.4884 9.79988 14.6669 9.90493 14.863 9.96097L17.962 10.846C19.122 11.178 19.122 12.822 17.962 13.154L14.863 14.039C14.6669 14.095 14.4884 14.2001 14.3442 14.3442C14.2001 14.4884 14.095 14.6669 14.039 14.863L13.154 17.962C12.822 19.122 11.178 19.122 10.846 17.962L9.96097 14.863C9.90493 14.6669 9.79988 14.4884 9.6557 14.3442C9.51153 14.2001 9.33301 14.095 9.13697 14.039L6.03797 13.154C4.87797 12.822 4.87797 11.178 6.03797 10.846L9.13697 9.96097C9.33301 9.90493 9.51153 9.79988 9.6557 9.6557C9.79988 9.51153 9.90493 9.33301 9.96097 9.13697"
                          fill="black"
                          fillOpacity="0.16"
                        />
                        <path
                          d="M9.96001 14.863L10.846 17.962C11.178 19.122 12.822 19.122 13.154 17.962L14.039 14.863C14.095 14.667 14.2001 14.4884 14.3443 14.3443C14.4884 14.2001 14.667 14.095 14.863 14.039L17.962 13.154C19.122 12.822 19.122 11.178 17.962 10.846L14.863 9.96101C14.667 9.90498 14.4884 9.79992 14.3443 9.65575C14.2001 9.51158 14.095 9.33305 14.039 9.13701L13.154 6.03801C12.822 4.87801 11.178 4.87801 10.846 6.03801L9.96101 9.13701C9.90498 9.33305 9.79992 9.51158 9.65575 9.65575C9.51158 9.79992 9.33305 9.90498 9.13701 9.96101L6.03801 10.846C4.87801 11.178 4.87801 12.822 6.03801 13.154L9.13701 14.039C9.33305 14.095 9.51158 14.2001 9.65575 14.3443C9.79992 14.4884 9.90498 14.667 9.96101 14.863M4.43001 19.716L4.80601 21.224C4.85601 21.426 5.14401 21.426 5.19401 21.224L5.57101 19.716C5.57984 19.681 5.59799 19.649 5.62351 19.6235C5.64904 19.598 5.68101 19.5798 5.71601 19.571L7.22401 19.194C7.42601 19.144 7.42601 18.857 7.22401 18.806L5.71601 18.429C5.68101 18.4202 5.64904 18.402 5.62351 18.3765C5.59799 18.351 5.57984 18.319 5.57101 18.284L5.19401 16.776C5.14401 16.574 4.85601 16.574 4.80601 16.776L4.42901 18.284C4.42018 18.319 4.40204 18.351 4.37651 18.3765C4.35098 18.402 4.31902 18.4202 4.28401 18.429L2.77601 18.806C2.57401 18.856 2.57401 19.143 2.77601 19.194L4.28401 19.571C4.31902 19.5798 4.35098 19.598 4.37651 19.6235C4.40204 19.649 4.42118 19.681 4.43001 19.716ZM18.43 5.71601L18.806 7.22401C18.856 7.42601 19.143 7.42601 19.194 7.22401L19.571 5.71601C19.5798 5.68101 19.598 5.64904 19.6235 5.62351C19.649 5.59799 19.681 5.57984 19.716 5.57101L21.224 5.19401C21.426 5.14401 21.426 4.85601 21.224 4.80601L19.716 4.42901C19.681 4.42018 19.649 4.40204 19.6235 4.37651C19.598 4.35098 19.5798 4.31902 19.571 4.28401L19.194 2.77601C19.144 2.57401 18.857 2.57401 18.806 2.77601L18.429 4.28401C18.4202 4.31902 18.402 4.35098 18.3765 4.37651C18.351 4.40204 18.319 4.42018 18.284 4.42901L16.776 4.80601C16.574 4.85601 16.574 5.14401 16.776 5.19401L18.284 5.57101C18.319 5.57984 18.351 5.59799 18.3765 5.62351C18.402 5.64904 18.4212 5.68101 18.43 5.71601Z"
                          stroke="#135290"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span className="hidden sm:inline">AI Regenerate</span>
                      <span className="sm:hidden">AI</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleEditToggleWithSave(
                        editingSummary,
                        setEditingSummary
                      )
                    }
                    className="border-gray-200  border-2 rounded-full text-xs md:text-sm flex-1 sm:flex-none"
                    disabled={isSaving}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 19H6.425L16.2 9.225L14.775 7.8L5 17.575V19ZM3 21V16.75L16.2 3.575C16.4 3.39167 16.621 3.25 16.863 3.15C17.105 3.05 17.359 3 17.625 3C17.891 3 18.1493 3.05 18.4 3.15C18.6507 3.25 18.8673 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.771 5.4 20.863 5.65C20.955 5.9 21.0007 6.15 21 6.4C21 6.66667 20.9543 6.921 20.863 7.163C20.7717 7.405 20.6257 7.62567 20.425 7.825L7.25 21H3ZM15.475 8.525L14.775 7.8L16.2 9.225L15.475 8.525Z"
                        fill="#135290"
                      />
                    </svg>

                    {editingSummary
                      ? isSaving
                        ? "Saving..."
                        : "Save"
                      : "Edit"}
                  </Button>
                </div>
              </div>

              {editingSummary ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={reportSummary}
                      onChange={(e) => setReportSummary(e.target.value)}
                      placeholder="Enter executive summary highlighting key financial insights, performance trends, and strategic recommendations..."
                      rows={6}
                      className="w-full bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400 resize-none"
                      disabled={isTyping}
                    />
                    {isTyping && (
                      <div className="absolute top-2 right-2 flex items-center gap-2 text-purple-600 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-medium">AI Typing...</span>
                      </div>
                    )}
                  </div>

                  {/* Inline AI Regenerate Section - Always visible when editing */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-purple-200 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <Label className="text-sm font-medium text-gray-700">
                        AI Regenerate Executive Summary
                      </Label>
                    </div>
                    <Textarea
                      value={summaryPrompt}
                      onChange={(e) => setSummaryPrompt(e.target.value)}
                      placeholder="Additional instructions (combined with default prompt): E.g., Focus on profitability metrics and use casual language..."
                      rows={3}
                      className="resize-none border-purple-200 focus:border-purple-400"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleRegenerateSummary}
                        disabled={
                          regeneratingSummary ||
                          isTyping ||
                          !summaryPrompt.trim()
                        }
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {regeneratingSummary ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : isTyping ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Typing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                      {summaryPrompt && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSaveSummaryPromptToClient}
                            disabled={regeneratingSummary || isTyping}
                            className="border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save Prompt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSummaryPrompt("")}
                            disabled={regeneratingSummary || isTyping}
                          >
                            Clear
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-blue-200/50 relative">
                  {/* Translation typing indicator */}
                  {isTypingSummary && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                      <Languages className="w-3 h-3" />
                      <span>
                        Typing {translatingLanguage}...{" "}
                        {Math.round(typingProgress)}%
                      </span>
                    </div>
                  )}

                  <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
                    {reportSummary ||
                      `Financial report for Q${report?.period_quarter || 1} ${report?.period_year || 2024
                      }. Analysis pending - please regenerate the report to see AI-generated insights based on actual financial data.`}
                    {isTypingSummary && (
                      <span className="inline-block w-0.5 h-5 bg-orange-600 ml-1 animate-pulse" />
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollReveal>

        {/* Financial Metrics Dashboard - Only show for non-read-only mode */}
        {!isReadOnly && (
          <StaggerReveal staggerDelay={0.1} threshold={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  {(() => {
                    const currentRevenue =
                      report.analysis_data?.financial_summary?.total_revenue ||
                      0;
                    const prevRevenue =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.total_revenue || 0;
                    const growth = calculateGrowth(currentRevenue, prevRevenue);
                    return prevRevenue > 0 ? (
                      <Badge
                        variant="outline"
                        className={`${growth.colorClass} text-xs px-1.5 py-0`}
                      >
                        {growth.display}
                      </Badge>
                    ) : null;
                  })()}
                </div>
                <h3 className="text-xs font-medium text-gray-600 mb-1">
                  Total Revenue
                </h3>
                <p className="text-lg md:text-xl font-bold text-gray-900 break-words">
                  €
                  {(
                    report.analysis_data?.financial_summary?.total_revenue || 0
                  ).toLocaleString()}
                </p>
                <div className="mt-1">
                  {(() => {
                    const prevRevenue =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.total_revenue || 0;
                    return prevRevenue > 0 ? (
                      <p className="text-xs text-gray-400">
                        Last Quarter: €{prevRevenue.toLocaleString()}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                  </div>
                  {(() => {
                    const currentExpenses =
                      report.analysis_data?.financial_summary?.total_expenses ||
                      0;
                    const prevExpenses =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.total_expenses || 0;

                    if (prevExpenses === 0) return null;

                    const percentChange =
                      ((currentExpenses - prevExpenses) / prevExpenses) * 100;
                    const display =
                      percentChange >= 0
                        ? `+${percentChange.toFixed(1)}%`
                        : `${percentChange.toFixed(1)}%`;
                    const colorClass =
                      percentChange >= 0
                        ? "text-red-600 border-red-200 bg-red-50"
                        : "text-green-600 border-green-200 bg-green-50";

                    return (
                      <Badge
                        variant="outline"
                        className={`${colorClass} text-xs px-1.5 py-0`}
                      >
                        {display}
                      </Badge>
                    );
                  })()}
                </div>
                <h3 className="text-xs font-medium text-gray-600 mb-1">
                  Total Expenses
                </h3>
                <p className="text-lg md:text-xl font-bold text-gray-900 break-words">
                  €
                  {(
                    report.analysis_data?.financial_summary?.total_expenses || 0
                  ).toLocaleString()}
                </p>
                <div className="mt-1">
                  {(() => {
                    const prevExpenses =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.total_expenses || 0;
                    return prevExpenses > 0 ? (
                      <p className="text-xs text-gray-400">
                        Last Quarter: €{prevExpenses.toLocaleString()}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <PieChart className="w-4 h-4 text-green-600" />
                  </div>
                  {(() => {
                    const currentProfit =
                      report.analysis_data?.financial_summary?.net_profit || 0;
                    const prevProfit =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.net_profit || 0;
                    const growth = calculateGrowth(currentProfit, prevProfit);
                    return prevProfit !== 0 ? (
                      <Badge
                        variant="outline"
                        className={`${growth.colorClass} text-xs px-1.5 py-0`}
                      >
                        {growth.display}
                      </Badge>
                    ) : null;
                  })()}
                </div>
                <h3 className="text-xs font-medium text-gray-600 mb-1">
                  Net Profit
                </h3>
                <p className="text-lg md:text-xl font-bold text-gray-900 break-words">
                  €
                  {(
                    report.analysis_data?.financial_summary?.net_profit || 0
                  ).toLocaleString()}
                </p>
                <div className="mt-1">
                  {(() => {
                    const prevProfit =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.net_profit || 0;
                    return prevProfit !== 0 ? (
                      <p className="text-xs text-gray-400">
                        Last Quarter: €{prevProfit.toLocaleString()}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                  </div>
                  {(() => {
                    const currentEbitda =
                      report.analysis_data?.financial_summary?.ebitda || 0;
                    const prevEbitda =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.ebitda || 0;

                    if (prevEbitda === 0) return null;

                    const percentChange =
                      ((currentEbitda - prevEbitda) / Math.abs(prevEbitda)) *
                      100;
                    const display =
                      percentChange >= 0
                        ? `+${percentChange.toFixed(1)}%`
                        : `${percentChange.toFixed(1)}%`;
                    const colorClass =
                      percentChange >= 0
                        ? "text-green-600 border-green-200 bg-green-50"
                        : "text-red-600 border-red-200 bg-red-50";

                    return (
                      <Badge
                        variant="outline"
                        className={`${colorClass} text-xs px-1.5 py-0`}
                      >
                        {display}
                      </Badge>
                    );
                  })()}
                </div>
                <h3 className="text-xs font-medium text-gray-600 mb-1">
                  EBITDA
                </h3>
                <p className="text-lg md:text-xl font-bold text-gray-900 break-words">
                  €
                  {(
                    report.analysis_data?.financial_summary?.ebitda || 0
                  ).toLocaleString()}
                </p>
                <div className="mt-1">
                  {(() => {
                    const prevEbitda =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.ebitda || 0;
                    return prevEbitda !== 0 ? (
                      <p className="text-xs text-gray-400">
                        Last Quarter: €{prevEbitda.toLocaleString()}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-teal-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                  </div>
                  {(() => {
                    const currentGrossMargin =
                      report.analysis_data?.financial_summary?.gross_margin ||
                      0;
                    const prevGrossMargin =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.gross_margin || 0;

                    if (prevGrossMargin === 0) return null;

                    const percentChange =
                      ((currentGrossMargin - prevGrossMargin) /
                        Math.abs(prevGrossMargin)) *
                      100;
                    const display =
                      percentChange >= 0
                        ? `+${percentChange.toFixed(1)}%`
                        : `${percentChange.toFixed(1)}%`;
                    const colorClass =
                      percentChange >= 0
                        ? "text-green-600 border-green-200 bg-green-50"
                        : "text-red-600 border-red-200 bg-red-50";

                    return (
                      <Badge
                        variant="outline"
                        className={`${colorClass} text-xs px-1.5 py-0`}
                      >
                        {display}
                      </Badge>
                    );
                  })()}
                </div>
                <h3 className="text-xs font-medium text-gray-600 mb-1">
                  Gross Margin
                </h3>
                <p className="text-lg md:text-xl font-bold text-gray-900 break-words">
                  €
                  {(
                    report.analysis_data?.financial_summary?.gross_margin || 0
                  ).toLocaleString()}
                </p>
                <div className="mt-1">
                  {(() => {
                    const prevGrossMargin =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.gross_margin || 0;
                    return prevGrossMargin !== 0 ? (
                      <p className="text-xs text-gray-400">
                        Last Quarter: €{prevGrossMargin.toLocaleString()}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  {(() => {
                    const currentMargin =
                      report.analysis_data?.financial_summary?.profit_margin ||
                      0;
                    const prevMargin =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.profit_margin || 0;

                    if (prevMargin === 0) return null;

                    const marginChange = currentMargin - prevMargin;
                    const display =
                      marginChange >= 0
                        ? `+${marginChange.toFixed(1)}pp`
                        : `${marginChange.toFixed(1)}pp`;
                    const colorClass =
                      marginChange >= 0
                        ? "text-green-600 border-green-200 bg-green-50"
                        : "text-red-600 border-red-200 bg-red-50";

                    return (
                      <Badge
                        variant="outline"
                        className={`${colorClass} text-xs px-1.5 py-0`}
                      >
                        {display}
                      </Badge>
                    );
                  })()}
                </div>
                <h3 className="text-xs font-medium text-gray-600 mb-1">
                  Profit Margin
                </h3>
                <p className="text-lg md:text-xl font-bold text-gray-900 break-words">
                  {(
                    report.analysis_data?.financial_summary?.profit_margin || 0
                  ).toFixed(1)}
                  %
                </p>
                <div className="mt-1">
                  {(() => {
                    const prevMargin =
                      report.analysis_data?.comparison_data?.previous_quarter
                        ?.profit_margin || 0;
                    return prevMargin > 0 ? (
                      <p className="text-xs text-gray-400">
                        Last Quarter: {prevMargin.toFixed(1)}%
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </StaggerReveal>
        )}

        {/* Charts Section with Modern Design */}
        <div className="space-y-8">
          {/* Revenue Comparison Chart - Full Width */}
          <ScrollReveal direction="up" distance={40} duration={0.7} delay={0.1}>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quarterly Revenue
                  </h3>
                  <p className="text-sm text-gray-600">Revenue by quarter</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRevenueTable(!showRevenueTable)}
                    className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer group"
                    title={showRevenueTable ? "Show Chart" : "Show Data Table"}
                  >
                    {showRevenueTable ? (
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Table className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {showRevenueTable ? (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <th key={q.quarter} className="text-right py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                                {q.quarter}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white border-b border-gray-100">
                            <td className="py-2 px-4 text-gray-800 font-medium">Revenue</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <td className="py-2 px-4 text-gray-800 font-medium">Expenses</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-white border-b border-gray-100">
                            <td className="py-2 px-4 text-gray-800 font-medium">Net Profit</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-2 px-4 text-gray-800 font-medium">Profit Margin</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                {(q.profit_margin || 0).toFixed(2)}%
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="h-96 cursor-pointer"
                      onClick={() => setShowRevenueTable(true)}
                      title="Click to view data table"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData.quarterlyPL || []}
                          margin={{ top: 50, right: 30, left: 40, bottom: 60 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="quarter"
                            stroke="#6b7280"
                            fontSize={14}
                          />
                          <YAxis stroke="#6b7280" fontSize={14} />
                          <Tooltip
                            formatter={(value: number) => [
                              `€${value.toLocaleString()}`,
                              "",
                            ]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                          />
                          <Bar
                            dataKey="revenue"
                            fill="#135290"
                            name="Revenue"
                            radius={[6, 6, 0, 0]}
                            barSize={60}
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          >
                            <LabelList
                              dataKey="revenue"
                              position="top"
                              formatter={(value: number) =>
                                `€${value.toLocaleString()}`
                              }
                              style={{
                                fontSize: "11px",
                                fill: "#374151",
                                fontWeight: "500",
                              }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI-Generated Chart Description */}
              {chartData.revenue_chart_description && (
                <div className="mt-6 p-4 bg-[#edf3ff] rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#edf3ff] rounded-lg flex-shrink-0 mt-0.5">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.6667 0C5.22667 0 0 5.22667 0 11.6667C0 18.1067 5.22667 23.3333 11.6667 23.3333C18.1067 23.3333 23.3333 18.1067 23.3333 11.6667C23.3333 5.22667 18.1067 0 11.6667 0ZM11.6667 17.5C11.025 17.5 10.5 16.975 10.5 16.3333V11.6667C10.5 11.025 11.025 10.5 11.6667 10.5C12.3083 10.5 12.8333 11.025 12.8333 11.6667V16.3333C12.8333 16.975 12.3083 17.5 11.6667 17.5ZM12.8333 8.16667H10.5V5.83333H12.8333V8.16667Z"
                          fill="#135290"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-3">
                        Revenue Analysis
                      </h4>
                      <div className="space-y-3">
                        {(() => {
                          const cleanText = chartData.revenue_chart_description
                            .replace(/\n+/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                          const hasBullets = cleanText.includes('•');
                          const items = hasBullets
                            ? cleanText.split('•').filter((item: string) => item.trim().length > 10)
                            : cleanText.split(/\.\s+/).filter((item: string) => item.trim().length > 20);
                          return items.map((item: string, index: number) => (
                            <div key={index} className="relative pl-6">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#135290]"></div>
                              <p className="text-sm text-gray-900 leading-relaxed">{item.trim()}</p>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Expense Comparison Chart - Full Width */}
          <ScrollReveal
            direction="up"
            distance={40}
            duration={0.7}
            delay={0.15}
          >
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quarterly Expenses
                  </h3>
                  <p className="text-sm text-gray-600">Expenses by quarter</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowExpensesTable(!showExpensesTable)}
                    className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer group"
                    title={showExpensesTable ? "Show Chart" : "Show Data Table"}
                  >
                    {showExpensesTable ? (
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Table className="w-5 h-5 text-purple-600" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {showExpensesTable ? (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50">
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Expense Category</th>
                            {(report.raw_data?.all_quarters || []).map((q: any) => (
                              <th key={q.quarter_label} className="text-right py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                                {q.quarter_label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Get all unique expense codes across all quarters */}
                          {(() => {
                            const allQuarters = report.raw_data?.all_quarters || [];
                            const expenseMap = new Map<string, { code: string; description: string; values: Map<string, number> }>();

                            // Build map of all expenses across quarters
                            allQuarters.forEach((q: any) => {
                              (q.categorized_accounts?.expenses || []).forEach((exp: any) => {
                                if (!expenseMap.has(exp.code)) {
                                  expenseMap.set(exp.code, { code: exp.code, description: exp.description, values: new Map() });
                                }
                                expenseMap.get(exp.code)!.values.set(q.quarter_label, exp.amount);
                              });
                            });

                            // Sort by code and render rows
                            return Array.from(expenseMap.values())
                              .sort((a, b) => a.code.localeCompare(b.code))
                              .map((expense, idx) => (
                                <tr key={expense.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="py-2 px-4 text-gray-800">
                                    <span className="font-medium">{expense.code}</span>
                                    <span className="text-gray-500 ml-2">{expense.description}</span>
                                  </td>
                                  {allQuarters.map((q: any) => (
                                    <td key={q.quarter_label} className="py-2 px-4 text-right text-gray-700">
                                      €{(expense.values.get(q.quarter_label) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  ))}
                                </tr>
                              ));
                          })()}
                          {/* Total row */}
                          <tr className="bg-gray-200 font-semibold border-t-2 border-gray-400">
                            <td className="py-2 px-4 text-gray-900">Total Expenses</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-900">
                                €{(q.expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="h-96 cursor-pointer"
                      onClick={() => setShowExpensesTable(true)}
                      title="Click to view data table"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData.quarterlyPL || []}
                          margin={{ top: 50, right: 30, left: 40, bottom: 60 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="quarter"
                            stroke="#6b7280"
                            fontSize={14}
                          />
                          <YAxis stroke="#6b7280" fontSize={14} />
                          <Tooltip
                            formatter={(value: number) => [
                              `€${value.toLocaleString()}`,
                              "",
                            ]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                          />
                          <Bar
                            dataKey="expenses"
                            fill="#fe7710"
                            name="Expenses"
                            radius={[6, 6, 0, 0]}
                            barSize={60}
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          >
                            <LabelList
                              dataKey="expenses"
                              position="top"
                              formatter={(value: number) =>
                                `€${value.toLocaleString()}`
                              }
                              style={{
                                fontSize: "11px",
                                fill: "#374151",
                                fontWeight: "500",
                              }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI-Generated Chart Description */}
              {chartData.expense_chart_description && (
                <div className="mt-6 p-4 bg-[#fff2e8] rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#fff2e8] rounded-lg flex-shrink-0 mt-0.5">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.6667 0C5.22667 0 0 5.22667 0 11.6667C0 18.1067 5.22667 23.3333 11.6667 23.3333C18.1067 23.3333 23.3333 18.1067 23.3333 11.6667C23.3333 5.22667 18.1067 0 11.6667 0ZM11.6667 17.5C11.025 17.5 10.5 16.975 10.5 16.3333V11.6667C10.5 11.025 11.025 10.5 11.6667 10.5C12.3083 10.5 12.8333 11.025 12.8333 11.6667V16.3333C12.8333 16.975 12.3083 17.5 11.6667 17.5ZM12.8333 8.16667H10.5V5.83333H12.8333V8.16667Z"
                          fill="#fe7710"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-3">
                        Expense Analysis
                      </h4>
                      <div className="space-y-3">
                        {(() => {
                          const cleanText = chartData.expense_chart_description
                            .replace(/\n+/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                          const hasBullets = cleanText.includes('•');
                          const items = hasBullets
                            ? cleanText.split('•').filter((item: string) => item.trim().length > 10)
                            : cleanText.split(/\.\s+/).filter((item: string) => item.trim().length > 20);
                          return items.map((item: string, index: number) => (
                            <div key={index} className="relative pl-6">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fe7710]"></div>
                              <p className="text-sm text-gray-900 leading-relaxed">{item.trim()}</p>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Expense Breakdown Chart - Full Width */}
          <ScrollReveal direction="up" distance={40} duration={0.7} delay={0.2}>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Expense Breakdown
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cost distribution by category
                  </p>
                </div>
                <div className="flex items-center gap-2"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div className="h-96 flex items-center justify-center relative">
                  {/* Subtle 3D shadow backdrop */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: "290px",
                      height: "290px",
                      background:
                        "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 50%)",
                      boxShadow:
                        "0 20px 60px -10px rgba(0, 0, 0, 0.15), 0 10px 30px -5px rgba(0, 0, 0, 0.1), inset 0 -5px 20px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    className="relative z-10"
                  >
                    <RechartsPieChart>
                      <defs>
                        <filter
                          id="pieShadow"
                          x="-20%"
                          y="-20%"
                          width="140%"
                          height="140%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="4"
                            stdDeviation="8"
                            floodOpacity="0.15"
                          />
                        </filter>
                      </defs>
                      <Pie
                        data={chartData.expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        innerRadius={70}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        style={{ filter: "url(#pieShadow)" }}
                      >
                        {chartData.expenseBreakdown.map(
                          (entry: { color: string }, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(
                          value: number,
                          name: string,
                          props: any
                        ) => [
                            `€${value.toLocaleString()} (${props.payload.percentage.toFixed(
                              1
                            )}%)`,
                            props.payload.name,
                          ]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          padding: "12px",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div
                  className="h-96 overflow-y-auto pr-2"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#9ca3af #f3f4f6",
                  }}
                >
                  <div className="space-y-2">
                    {chartData.expenseBreakdown.map(
                      (
                        item: {
                          color: string;
                          name: string;
                          value: number;
                          percentage: number;
                        },
                        index: number
                      ) => (
                      <div
                        key={index}
                        className="group relative flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-all hover:shadow-sm cursor-default"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white group-hover:ring-blue-100 transition-all"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-700 truncate font-medium group-hover:text-blue-900">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 ml-2 flex-shrink-0">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-blue-900">
                            €{item.value.toLocaleString()}
                          </span>
                          <span className="text-sm font-semibold text-gray-600 w-14 text-right group-hover:text-blue-800">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>

                        {/* Full name tooltip on hover */}
                        {item.name.length > 20 && (
                          <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block">
                            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                              {item.name}
                              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Financial Trends - Full Width */}
        <ScrollReveal direction="up" distance={40} duration={0.7} delay={0.25}>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Financial Performance Trends
                </h3>
                <p className="text-sm text-gray-600">
                  Quarterly progression analysis
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTrendsTable(!showTrendsTable)}
                  className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors cursor-pointer group"
                  title={showTrendsTable ? "Show Chart" : "Show Data Table"}
                >
                  {showTrendsTable ? (
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Table className="w-5 h-5 text-green-600" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showTrendsTable ? (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-x-auto">
                    {/* Financial Performance Trends Table */}
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                          {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                            <th key={q.quarter} className="text-right py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                              {q.quarter}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="py-2 px-4 text-gray-800 font-medium">Revenue</td>
                          {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                            <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                              €{(q.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2 px-4 text-gray-800 font-medium">Expenses</td>
                          {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                            <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                              €{(q.expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-2 px-4 text-gray-800 font-medium">Net Profit</td>
                          {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                            <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                              €{(q.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2 px-4 text-gray-800 font-medium">Gross Profit</td>
                          {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                            <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                              €{(q.gross_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-2 px-4 text-gray-800 font-medium">Profit Margin</td>
                          {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                            <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                              {(q.profit_margin || 0).toFixed(1)}%
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className="h-96 cursor-pointer"
                    onClick={() => setShowTrendsTable(true)}
                    title="Click to view data table"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={
                          chartData.quarterlyPL ||
                          report.analysis_data?.current_year_quarterly_pl ||
                          chartData.quarterlyTrend
                        }
                        margin={{ top: 50, right: 30, left: 40, bottom: 60 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorExpenses"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ef4444"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ef4444"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorNetProfit"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="quarter"
                          stroke="#6b7280"
                          fontSize={14}
                        />
                        <YAxis stroke="#6b7280" fontSize={14} />
                        <Tooltip
                          formatter={(value: number) => [
                            `€${value.toLocaleString()}`,
                            "",
                          ]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#4064ff"
                          strokeWidth={3}
                          fill="url(#colorRevenue)"
                          fillOpacity={0.6}
                          name="Revenue"
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                          animationBegin={0}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          stroke="#ebaf78"
                          strokeWidth={3}
                          fill="url(#colorExpenses)"
                          fillOpacity={0.6}
                          name="Expenses"
                          dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                          animationBegin={200}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        />
                        <Area
                          type="monotone"
                          dataKey="net_profit"
                          stroke="#10b981"
                          strokeWidth={3}
                          fill="url(#colorNetProfit)"
                          fillOpacity={0.6}
                          name="Net Profit"
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                          animationBegin={400}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {chartData.financial_trends_description && (
              <div className="mt-6 p-4 bg-[#edf3ff] rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-[#edf3ff] rounded-lg flex-shrink-0 mt-0.5">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.6667 0C5.22667 0 0 5.22667 0 11.6667C0 18.1067 5.22667 23.3333 11.6667 23.3333C18.1067 23.3333 23.3333 18.1067 23.3333 11.6667C23.3333 5.22667 18.1067 0 11.6667 0ZM11.6667 17.5C11.025 17.5 10.5 16.975 10.5 16.3333V11.6667C10.5 11.025 11.025 10.5 11.6667 10.5C12.3083 10.5 12.8333 11.025 12.8333 11.6667V16.3333C12.8333 16.975 12.3083 17.5 11.6667 17.5ZM12.8333 8.16667H10.5V5.83333H12.8333V8.16667Z"
                        fill="#135290"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold mb-3">
                      Financial Performance Analysis
                    </h4>
                    <div className="space-y-3">
                      {chartData.financial_trends_description
                        .replace(/\n+/g, ' ')
                        .replace(/\s+/g, ' ')
                        .split(/\.\s+/)
                        .filter((item: string) => item.trim().length > 20)
                        .map((item: string, index: number) => (
                          <div key={index} className="relative pl-6">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#135290]"></div>
                            <p className="text-sm text-gray-900 leading-relaxed">{item.trim()}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* EBITDA Trend - Full Width */}
        {chartData.ebitdaTrend && chartData.ebitdaTrend.length > 0 && (
          <ScrollReveal direction="up" distance={40} duration={0.7} delay={0.3}>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    EBITDA Trend
                  </h3>
                  <p className="text-sm text-gray-600">
                    Quarterly EBITDA progression
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEbitdaTable(!showEbitdaTable)}
                    className="p-2 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors cursor-pointer group"
                    title={showEbitdaTable ? "Show Chart" : "Show Data Table"}
                  >
                    {showEbitdaTable ? (
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Table className="w-5 h-5 text-indigo-600" />
                    )}
                  </button>
                </div>
              </div>
              <AnimatePresence mode="wait">
                {showEbitdaTable ? (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-x-auto">
                      {/* EBITDA Trend Table */}
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                            {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                              <th key={q.quarter} className="text-right py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                                {q.quarter}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="py-2 px-4 text-gray-800 font-medium">EBITDA</td>
                            {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.ebitda || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-2 px-4 text-gray-800 font-medium">Revenue</td>
                            {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-white">
                            <td className="py-2 px-4 text-gray-800 font-medium">Expenses</td>
                            {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-2 px-4 text-gray-800 font-medium">Net Profit</td>
                            {(chartData.quarterlyPL || report.analysis_data?.current_year_quarterly_pl || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="h-96 cursor-pointer"
                      onClick={() => setShowEbitdaTable(true)}
                      title="Click to view data table"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData.ebitdaTrend}
                          margin={{ top: 50, right: 30, left: 40, bottom: 60 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorEbitda"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#4f46e5"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#4f46e5"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="quarter"
                            stroke="#6b7280"
                            fontSize={14}
                          />
                          <YAxis stroke="#6b7280" fontSize={14} />
                          <Tooltip
                            formatter={(value: number) => [
                              `€${(value as number).toLocaleString()}`,
                              "EBITDA",
                            ]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="ebitda"
                            stroke="#135290"
                            strokeWidth={3}
                            fill="url(#colorEbitda)"
                            fillOpacity={0.6}
                            name="EBITDA"
                            dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {chartData.ebitda_trend_description && (
                <div className="mt-6 p-4 bg-[#edf3ff] rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#edf3ff] rounded-lg flex-shrink-0 mt-0.5">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.6667 0C5.22667 0 0 5.22667 0 11.6667C0 18.1067 5.22667 23.3333 11.6667 23.3333C18.1067 23.3333 23.3333 18.1067 23.3333 11.6667C23.3333 5.22667 18.1067 0 11.6667 0ZM11.6667 17.5C11.025 17.5 10.5 16.975 10.5 16.3333V11.6667C10.5 11.025 11.025 10.5 11.6667 10.5C12.3083 10.5 12.8333 11.025 12.8333 11.6667V16.3333C12.8333 16.975 12.3083 17.5 11.6667 17.5ZM12.8333 8.16667H10.5V5.83333H12.8333V8.16667Z"
                          fill="#135290"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-3">
                        EBITDA Analysis
                      </h4>
                      <div className="space-y-3">
                        {chartData.ebitda_trend_description
                          .replace(/\n+/g, ' ')
                          .replace(/\s+/g, ' ')
                          .split(/\.\s+/)
                          .filter((item: string) => item.trim().length > 20)
                          .map((item: string, index: number) => (
                            <div key={index} className="relative pl-6">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#135290]"></div>
                              <p className="text-sm text-gray-900 leading-relaxed">{item.trim()}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Quarterly P&L Comparison - Full Width */}
        {chartData.quarterlyPL && chartData.quarterlyPL.length > 0 && (
          <ScrollReveal
            direction="up"
            distance={40}
            duration={0.7}
            delay={0.35}
          >
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quarterly P&L Comparison - {report.period_year}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Revenue, expenses, and profitability by quarter
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPLTable(!showPLTable)}
                    className="p-2 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors cursor-pointer group"
                    title={showPLTable ? "Show Chart" : "Show Data Table"}
                  >
                    {showPLTable ? (
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Table className="w-5 h-5 text-indigo-600" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {showPLTable ? (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-x-auto">
                      {/* P&L Comparison Table */}
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <th key={q.quarter} className="text-right py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                                {q.quarter}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="py-2 px-4 text-gray-800 font-medium">Revenue</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-2 px-4 text-gray-800 font-medium">Expenses</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-white">
                            <td className="py-2 px-4 text-gray-800 font-medium">Gross Profit</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.gross_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-2 px-4 text-gray-800 font-medium">Net Profit</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-white">
                            <td className="py-2 px-4 text-gray-800 font-medium">EBITDA</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                €{(q.ebitda || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-2 px-4 text-gray-800 font-medium">Profit Margin</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                {(q.profit_margin || 0).toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-white">
                            <td className="py-2 px-4 text-gray-800 font-medium">Gross Margin</td>
                            {(chartData.quarterlyPL || []).map((q: any) => (
                              <td key={q.quarter} className="py-2 px-4 text-right text-gray-700">
                                {(q.gross_margin || 0).toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="h-96 cursor-pointer"
                      onClick={() => setShowPLTable(true)}
                      title="Click to view data table"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData.quarterlyPL}
                          margin={{ top: 50, right: 30, left: 40, bottom: 60 }}
                          barSize={60}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="quarter"
                            stroke="#6b7280"
                            fontSize={14}
                          />
                          <YAxis stroke="#6b7280" fontSize={14} />
                          <Tooltip
                            formatter={(value: number, name: string) => {
                              if (name === "profit_margin") {
                                return [
                                  `${value.toFixed(1)}%`,
                                  "Profit Margin",
                                ];
                              }
                              return [
                                `€${value.toLocaleString()}`,
                                name === "revenue"
                                  ? "Revenue"
                                  : name === "expenses"
                                    ? "Expenses"
                                    : "Net Profit",
                              ];
                            }}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            wrapperStyle={{
                              paddingTop: "20px",
                              fontSize: "12px",
                            }}
                            iconType="rect"
                            layout="horizontal"
                          />
                          <Bar
                            dataKey="revenue"
                            fill="#135290"
                            name="Revenue"
                            radius={[12, 12, 0, 0]}
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          >
                            <LabelList
                              dataKey="revenue"
                              position="top"
                              formatter={(value: number) =>
                                `€${value.toLocaleString()}`
                              }
                              style={{
                                fontSize: "11px",
                                fill: "#374151",
                                fontWeight: "500",
                              }}
                            />
                          </Bar>
                          <Bar
                            dataKey="expenses"
                            fill="#fe7710"
                            name="Expenses"
                            radius={[12, 12, 0, 0]}
                            animationBegin={200}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          >
                            <LabelList
                              dataKey="expenses"
                              position="top"
                              formatter={(value: number) =>
                                `€${value.toLocaleString()}`
                              }
                              style={{
                                fontSize: "11px",
                                fill: "#374151",
                                fontWeight: "500",
                              }}
                            />
                          </Bar>
                          <Bar
                            dataKey="net_profit"
                            fill="#105352"
                            name="Net Profit"
                            radius={[12, 12, 0, 0]}
                            animationBegin={400}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          >
                            <LabelList
                              dataKey="net_profit"
                              position="top"
                              formatter={(value: number) =>
                                `€${value.toLocaleString()}`
                              }
                              style={{
                                fontSize: "11px",
                                fill: "#374151",
                                fontWeight: "500",
                              }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quarterly Summary Cards */}
              {chartData.quarterlyPL && chartData.quarterlyPL.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {chartData.quarterlyPL.map(
                    (
                      quarter: {
                        quarter: string;
                        revenue: number;
                        expenses: number;
                        net_profit: number;
                        profit_margin: number;
                      },
                      index: number
                    ) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100"
                    >
                      <h4 className="font-semibold text-indigo-900 mb-3">
                        {quarter.quarter}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium text-gray-900">
                            €{quarter.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Expenses:</span>
                          <span className="font-medium text-gray-900">
                            €{quarter.expenses.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-indigo-200 pt-2">
                          <span className="text-gray-600">Net Profit:</span>
                          <span
                            className={`font-bold ${quarter.net_profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                              }`}
                          >
                            €{quarter.net_profit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Margin:</span>
                          <span
                            className={`font-bold ${quarter.profit_margin >= 0
                              ? "text-green-600"
                              : "text-red-600"
                              }`}
                          >
                            {quarter.profit_margin.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Year-over-Year Comparison
        {report.analysis_data?.quarterly_yoy_comparison && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Year-over-Year Comparison
              </CardTitle>
              <p className="text-sm text-gray-600">
                {report.analysis_data.quarterly_yoy_comparison.current_quarter_label} vs{' '}
                {report.analysis_data.quarterly_yoy_comparison.previous_year_quarter_label}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Revenue Growth</div>
                  <div className={`text-2xl font-bold ${
                    report.analysis_data.quarterly_yoy_comparison.yoy_growth_revenue >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {report.analysis_data.quarterly_yoy_comparison.yoy_growth_revenue >= 0 ? '+' : ''}
                    {report.analysis_data.quarterly_yoy_comparison.yoy_growth_revenue.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    €{report.analysis_data.quarterly_yoy_comparison.previous_year_metrics.total_revenue.toLocaleString()} →{' '}
                    €{report.analysis_data.quarterly_yoy_comparison.current_metrics.total_revenue.toLocaleString()}
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Expense Growth</div>
                  <div className={`text-2xl font-bold ${
                    report.analysis_data.quarterly_yoy_comparison.yoy_growth_expenses <= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {report.analysis_data.quarterly_yoy_comparison.yoy_growth_expenses >= 0 ? '+' : ''}
                    {report.analysis_data.quarterly_yoy_comparison.yoy_growth_expenses.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    €{report.analysis_data.quarterly_yoy_comparison.previous_year_metrics.total_expenses.toLocaleString()} →{' '}
                    €{report.analysis_data.quarterly_yoy_comparison.current_metrics.total_expenses.toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Profit Growth</div>
                  <div className={`text-2xl font-bold ${
                    report.analysis_data.quarterly_yoy_comparison.yoy_growth_profit >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {report.analysis_data.quarterly_yoy_comparison.yoy_growth_profit >= 0 ? '+' : ''}
                    {report.analysis_data.quarterly_yoy_comparison.yoy_growth_profit.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    €{report.analysis_data.quarterly_yoy_comparison.previous_year_metrics.net_profit.toLocaleString()} →{' '}
                    €{report.analysis_data.quarterly_yoy_comparison.current_metrics.net_profit.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Year-to-Date Comparison
        {report.analysis_data?.ytd_comparison && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Year-to-Date Comparison
              </CardTitle>
              <p className="text-sm text-gray-600">
                {report.analysis_data.ytd_comparison.current_ytd_label} vs{' '}
                {report.analysis_data.ytd_comparison.previous_ytd_label}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">YTD Revenue Growth</div>
                  <div className={`text-2xl font-bold ${
                    report.analysis_data.ytd_comparison.ytd_growth_revenue >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {report.analysis_data.ytd_comparison.ytd_growth_revenue >= 0 ? '+' : ''}
                    {report.analysis_data.ytd_comparison.ytd_growth_revenue.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    €{report.analysis_data.ytd_comparison.previous_ytd_metrics.total_revenue.toLocaleString()} →{' '}
                    €{report.analysis_data.ytd_comparison.current_ytd_metrics.total_revenue.toLocaleString()}
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">YTD Expense Growth</div>
                  <div className={`text-2xl font-bold ${
                    report.analysis_data.ytd_comparison.ytd_growth_expenses <= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {report.analysis_data.ytd_comparison.ytd_growth_expenses >= 0 ? '+' : ''}
                    {report.analysis_data.ytd_comparison.ytd_growth_expenses.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    €{report.analysis_data.ytd_comparison.previous_ytd_metrics.total_expenses.toLocaleString()} →{' '}
                    €{report.analysis_data.ytd_comparison.current_ytd_metrics.total_expenses.toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">YTD Profit Growth</div>
                  <div className={`text-2xl font-bold ${
                    report.analysis_data.ytd_comparison.ytd_growth_profit >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {report.analysis_data.ytd_comparison.ytd_growth_profit >= 0 ? '+' : ''}
                    {report.analysis_data.ytd_comparison.ytd_growth_profit.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    €{report.analysis_data.ytd_comparison.previous_ytd_metrics.net_profit.toLocaleString()} →{' '}
                    €{report.analysis_data.ytd_comparison.current_ytd_metrics.net_profit.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Quarterly P&L Table - COMMENTED OUT - Will be fixed and re-enabled later */}
        {/* TODO: Fix Quarterly P&L calculation to ensure accurate data */}
        {/* {report.analysis_data?.current_year_quarterly_pl &&
         report.analysis_data.current_year_quarterly_pl.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="w-5 h-5 text-indigo-600" />
                Quarterly Profit & Loss - {report.period_year}
              </CardTitle>
              <p className="text-sm text-gray-600">Individual quarterly performance breakdown</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Quarter</th>
                      <th className="text-right py-2 px-4">Revenue</th>
                      <th className="text-right py-2 px-4">Expenses</th>
                      <th className="text-right py-2 px-4">Gross Profit</th>
                      <th className="text-right py-2 px-4">Net Profit</th>
                      <th className="text-right py-2 px-4">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.analysis_data.current_year_quarterly_pl.map((quarter, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium">{quarter.quarter}</td>
                        <td className="text-right py-2 px-4">€{quarter.revenue.toLocaleString()}</td>
                        <td className="text-right py-2 px-4">€{quarter.expenses.toLocaleString()}</td>
                        <td className="text-right py-2 px-4">€{quarter.gross_profit.toLocaleString()}</td>
                        <td className={`text-right py-2 px-4 font-bold ${
                          quarter.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          €{quarter.net_profit.toLocaleString()}
                        </td>
                        <td className={`text-right py-2 px-4 ${
                          quarter.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {quarter.profit_margin.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Significant Account Changes Section */}
        {report.analysis_data?.spike_decline_analysis &&
          (() => {
            const filtered = filterSignificantAccountChanges(
              report.analysis_data.spike_decline_analysis
            );
            return (
              <ScrollReveal
                direction="up"
                distance={30}
                duration={0.6}
                delay={0.4}
              >
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Significant Account Changes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">
                        Significant Increases
                      </h4>
                      {filtered.spikes.length > 0 ? (
                        <ul className="list-disc pl-5 text-gray-800">
                          {filtered.spikes.slice(0, 5).map(
                            (
                              spike: {
                                code: string;
                                description: string;
                                change_percent: number;
                              },
                              idx: number
                            ) => (
                            <li key={idx}>
                              <span className="font-semibold">
                                {spike.code}
                              </span>
                              : {spike.description} (
                              <span className="text-green-600">
                                +{spike.change_percent.toFixed(1)}%
                              </span>
                              )
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 italic">
                          No significant increases detected.
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">
                        Significant Decreases
                      </h4>
                      {filtered.declines.length > 0 ? (
                        <ul className="list-disc pl-5 text-gray-800">
                          {filtered.declines.slice(0, 5).map(
                            (
                              decline: {
                                code: string;
                                description: string;
                                change_percent: number;
                              },
                              idx: number
                            ) => (
                            <li key={idx}>
                              <span className="font-semibold">
                                {decline.code}
                              </span>
                              : {decline.description} (
                              <span className="text-red-600">
                                {decline.change_percent.toFixed(1)}%
                              </span>
                              )
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 italic">
                          No significant decreases detected.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })()}

        {/* Strategic Recommendations */}
        <ScrollReveal direction="up" distance={40} duration={0.7} delay={0.45}>
          <div className="bg-[#f0f4f8] rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Strategic Recommendations
                </h2>
                <p className="text-gray-600">
                  Insights and actionable recommendations
                </p>
                {/* Translation typing indicator for recommendations */}
                {isTypingRecommendations && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                    <Languages className="w-3 h-3" />
                    <span>
                      Typing recommendations in {translatingLanguage}...
                    </span>
                  </div>
                )}
              </div>
              {!isReadOnly && (
                <div className="flex items-center gap-2">
                  {!editingRecommendations && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingRecommendations(true);
                        // Auto-fill client's custom prompt if it exists
                        if (report.client?.report_recommendations_prompt) {
                          setRecommendationsPrompt(
                            report.client.report_recommendations_prompt
                          );
                        }
                      }}
                      className="border-gray-200 border-2 rounded-full text-xs md:text-sm flex-1 sm:flex-none"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.95997 9.13697L10.846 6.03797C11.178 4.87797 12.822 4.87797 13.154 6.03797L14.039 9.13697C14.095 9.33301 14.2001 9.51153 14.3442 9.6557C14.4884 9.79988 14.6669 9.90493 14.863 9.96097L17.962 10.846C19.122 11.178 19.122 12.822 17.962 13.154L14.863 14.039C14.6669 14.095 14.4884 14.2001 14.3442 14.3442C14.2001 14.4884 14.095 14.6669 14.039 14.863L13.154 17.962C12.822 19.122 11.178 19.122 10.846 17.962L9.96097 14.863C9.90493 14.6669 9.79988 14.4884 9.6557 14.3442C9.51153 14.2001 9.33301 14.095 9.13697 14.039L6.03797 13.154C4.87797 12.822 4.87797 11.178 6.03797 10.846L9.13697 9.96097C9.33301 9.90493 9.51153 9.79988 9.6557 9.6557C9.79988 9.51153 9.90493 9.33301 9.96097 9.13697"
                          fill="black"
                          fillOpacity="0.16"
                        />
                        <path
                          d="M9.96001 14.863L10.846 17.962C11.178 19.122 12.822 19.122 13.154 17.962L14.039 14.863C14.095 14.667 14.2001 14.4884 14.3443 14.3443C14.4884 14.2001 14.667 14.095 14.863 14.039L17.962 13.154C19.122 12.822 19.122 11.178 17.962 10.846L14.863 9.96101C14.667 9.90498 14.4884 9.79992 14.3443 9.65575C14.2001 9.51158 14.095 9.33305 14.039 9.13701L13.154 6.03801C12.822 4.87801 11.178 4.87801 10.846 6.03801L9.96101 9.13701C9.90498 9.33305 9.79992 9.51158 9.65575 9.65575C9.51158 9.79992 9.33305 9.90498 9.13701 9.96101L6.03801 10.846C4.87801 11.178 4.87801 12.822 6.03801 13.154L9.13701 14.039C9.33305 14.095 9.51158 14.2001 9.65575 14.3443C9.79992 14.4884 9.90498 14.667 9.96101 14.863M4.43001 19.716L4.80601 21.224C4.85601 21.426 5.14401 21.426 5.19401 21.224L5.57101 19.716C5.57984 19.681 5.59799 19.649 5.62351 19.6235C5.64904 19.598 5.68101 19.5798 5.71601 19.571L7.22401 19.194C7.42601 19.144 7.42601 18.857 7.22401 18.806L5.71601 18.429C5.68101 18.4202 5.64904 18.402 5.62351 18.3765C5.59799 18.351 5.57984 18.319 5.57101 18.284L5.19401 16.776C5.14401 16.574 4.85601 16.574 4.80601 16.776L4.42901 18.284C4.42018 18.319 4.40204 18.351 4.37651 18.3765C4.35098 18.402 4.31902 18.4202 4.28401 18.429L2.77601 18.806C2.57401 18.856 2.57401 19.143 2.77601 19.194L4.28401 19.571C4.31902 19.5798 4.35098 19.598 4.37651 19.6235C4.40204 19.649 4.42118 19.681 4.43001 19.716ZM18.43 5.71601L18.806 7.22401C18.856 7.42601 19.143 7.42601 19.194 7.22401L19.571 5.71601C19.5798 5.68101 19.598 5.64904 19.6235 5.62351C19.649 5.59799 19.681 5.57984 19.716 5.57101L21.224 5.19401C21.426 5.14401 21.426 4.85601 21.224 4.80601L19.716 4.42901C19.681 4.42018 19.649 4.40204 19.6235 4.37651C19.598 4.35098 19.5798 4.31902 19.571 4.28401L19.194 2.77601C19.144 2.57401 18.857 2.57401 18.806 2.77601L18.429 4.28401C18.4202 4.31902 18.402 4.35098 18.3765 4.37651C18.351 4.40204 18.319 4.42018 18.284 4.42901L16.776 4.80601C16.574 4.85601 16.574 5.14401 16.776 5.19401L18.284 5.57101C18.319 5.57984 18.351 5.59799 18.3765 5.62351C18.402 5.64904 18.4212 5.68101 18.43 5.71601Z"
                          stroke="#135290"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span className="hidden sm:inline">AI Regenerate</span>
                      <span className="sm:hidden">AI</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleEditToggleWithSave(
                        editingRecommendations,
                        setEditingRecommendations
                      )
                    }
                    className="border-gray-200 border-2 rounded-full text-xs md:text-sm flex-1 sm:flex-none"
                    disabled={isSaving}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 19H6.425L16.2 9.225L14.775 7.8L5 17.575V19ZM3 21V16.75L16.2 3.575C16.4 3.39167 16.621 3.25 16.863 3.15C17.105 3.05 17.359 3 17.625 3C17.891 3 18.1493 3.05 18.4 3.15C18.6507 3.25 18.8673 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.771 5.4 20.863 5.65C20.955 5.9 21.0007 6.15 21 6.4C21 6.66667 20.9543 6.921 20.863 7.163C20.7717 7.405 20.6257 7.62567 20.425 7.825L7.25 21H3ZM15.475 8.525L14.775 7.8L16.2 9.225L15.475 8.525Z"
                        fill="#135290"
                      />
                    </svg>

                    {editingRecommendations
                      ? isSaving
                        ? "Saving..."
                        : "Save"
                      : "Edit"}
                  </Button>
                  {editingRecommendations && (
                    <Button
                      size="sm"
                      onClick={addRecommendation}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* AI Regenerate Section - Always visible when editing */}
              {!isReadOnly && editingRecommendations && (
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-purple-200 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <Label className="text-sm font-medium text-gray-700">
                      AI Regenerate All Recommendations
                    </Label>
                  </div>
                  <Textarea
                    value={recommendationsPrompt}
                    onChange={(e) => setRecommendationsPrompt(e.target.value)}
                    placeholder="Additional instructions (combined with default prompt): E.g., Focus on cost reduction and revenue diversification..."
                    rows={3}
                    className="resize-none border-purple-200 focus:border-purple-400"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleRegenerateRecommendations}
                      disabled={
                        regeneratingRecommendations ||
                        !recommendationsPrompt.trim()
                      }
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {regeneratingRecommendations ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                    {recommendationsPrompt && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveRecommendationsPromptToClient}
                          disabled={regeneratingRecommendations}
                          className="border-green-200 text-green-600 hover:bg-green-50"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save Prompt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRecommendationsPrompt("")}
                          disabled={regeneratingRecommendations}
                        >
                          Clear
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {(recommendations.length > 0
                ? recommendations
                : [
                  "Consider reinvesting profits into growth opportunities to capitalize on positive momentum",
                  "Develop new revenue streams and market expansion plans to diversify income sources",
                  "Monitor cash flow closely and consider debt reduction strategies for improved financial stability",
                  "Implement cost optimization measures while maintaining service quality",
                  "Establish strategic partnerships to enhance market position and operational efficiency",
                ]
              ).map((rec, index) => (
                <div key={index} className="relative pl-6">
                  {/* Vertical blue line on the left */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#135290]"></div>

                  {!isReadOnly && editingRecommendations ? (
                    <div className="flex gap-3">
                      <Textarea
                        value={rec}
                        onChange={(e) =>
                          updateRecommendation(index, e.target.value)
                        }
                        placeholder={`Strategic recommendation ${index + 1}...`}
                        rows={3}
                        className="flex-1 resize-none border-0 bg-transparent focus:bg-white focus:border focus:border-gray-300 rounded p-2"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeRecommendation(index)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-900 leading-relaxed">{rec}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Email Configuration - Collapsible - Hidden in read-only mode */}
        {!isReadOnly && (
          <ScrollReveal direction="up" distance={30} duration={0.6} delay={0.5}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Email Configuration
                    </h3>
                    <p className="text-sm text-gray-600">
                      Setup email delivery preferences
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleEditToggleWithSave(
                          editingEmailConfig,
                          setEditingEmailConfig
                        )
                      }
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      disabled={isSaving}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {editingEmailConfig
                        ? isSaving
                          ? "Saving..."
                          : "Save"
                        : "Edit"}
                    </Button>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Recipients
                      </Label>
                      <div className="space-y-3 mt-2">
                        {recipientEmails.map((email, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) =>
                                updateRecipientEmail(index, e.target.value)
                              }
                              placeholder="recipient@company.com"
                              className="flex-1"
                              readOnly={!editingEmailConfig}
                            />
                            {editingEmailConfig && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeRecipientEmail(index)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {editingEmailConfig && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={addRecipientEmail}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Recipient
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        BCC Recipients
                      </Label>
                      <div className="space-y-3 mt-2">
                        {bccEmails.map((email, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) =>
                                updateBccEmail(index, e.target.value)
                              }
                              placeholder="bcc@company.com"
                              className="flex-1"
                              readOnly={!editingEmailConfig}
                            />
                            {editingEmailConfig && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeBccEmail(index)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {editingEmailConfig && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={addBccEmail}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add BCC
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="subject"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Subject
                    </Label>
                    <Input
                      id="subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="mt-2"
                      readOnly={!editingEmailConfig}
                      placeholder="Financial Report - Q1 2024"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="message"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email Message
                      </Label>
                      {editingEmailConfig && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateAIMessage}
                          disabled={generatingMessage}
                          className="text-xs"
                        >
                          {generatingMessage ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Brain className="h-3 w-3 mr-2" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id="message"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={4}
                      className="mt-2 resize-none"
                      readOnly={!editingEmailConfig}
                      placeholder="Enter your message or use AI to generate a professional message..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* AI Regeneration Dialog */}
        <AIRegenerateDialog
          open={showRegenerateDialog}
          onOpenChange={setShowRegenerateDialog}
          type="report"
          documentId={report.id}
          onRegenerate={handleRegenerateResults}
          availableOptions={{
            title: true,
            summary: true,
            recommendations: true,
            email_subject: true,
            email_message: true,
          }}
          currentData={{
            title: reportTitle,
            summary: reportSummary,
            recommendations: recommendations,
            email_subject: emailSubject,
            email_message: emailMessage,
            financial_data: report.analysis_data,
            client_name: report.client?.name || report.client_name,
            period: report.period_display,
          }}
        />
      </div>

      {/* Yuki Raw Data Modal */}
      <YukiRawDataModal
        open={showYukiRawDataModal}
        onOpenChange={setShowYukiRawDataModal}
        reportId={report.id}
      />

      {/* Translation Dialog with Loading States & Typing Effect */}
      <TranslationDialog
        open={showTranslationDialog}
        onOpenChange={setShowTranslationDialog}
        reportId={report.id}
        onTranslationComplete={handleTranslationComplete}
      />

      {/* Share Report Dialog */}
      <ShareReportDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        reportId={report.id}
      />
    </div>
  );
};

// Send Report Dialog Component
interface SendReportDialogProps {
  recipientEmails: string[];
  bccEmails: string[];
  emailSubject: string;
  emailMessage: string;
  onRecipientsChange: (emails: string[]) => void;
  onBccChange: (emails: string[]) => void;
  onSubjectChange: (subject: string) => void;
  onMessageChange: (message: string) => void;
  onSend: () => void;
  onAddRecipient: () => void;
  onRemoveRecipient: (index: number) => void;
  onUpdateRecipient: (index: number, value: string) => void;
  onAddBcc: () => void;
  onRemoveBcc: (index: number) => void;
  onUpdateBcc: (index: number, value: string) => void;
  clientName: string;
  clientUsers: ClientUser[];
  onClose: () => void;
  isSending: boolean;
}

const SendReportDialog: React.FC<SendReportDialogProps> = ({
  recipientEmails,
  bccEmails,
  emailSubject,
  emailMessage,
  onRecipientsChange,
  onBccChange,
  onSubjectChange,
  onMessageChange,
  onSend,
  onAddRecipient,
  onRemoveRecipient,
  onUpdateRecipient,
  onAddBcc,
  onRemoveBcc,
  onUpdateBcc,
  clientName,
  clientUsers,
  onClose,
  isSending,
}) => {
  const addClientUser = (user: ClientUser) => {
    if (!recipientEmails.includes(user.email)) {
      onRecipientsChange([...recipientEmails, user.email]);
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <Alert>
        <Mail className="w-4 h-4" />
        <AlertDescription>
          Report will be sent as PDF attachment to the specified recipients.
        </AlertDescription>
      </Alert>

      {/* Client Users Quick Add */}
      {clientUsers && clientUsers.length > 0 && (
        <div className="border rounded-lg p-3 bg-muted/50">
          <Label className="text-sm font-medium mb-2 block">
            Quick Add Client Users
          </Label>
          <div className="space-y-1">
            {clientUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-sm ${recipientEmails.includes(user.email)
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-background"
                  }`}
                onClick={() => addClientUser(user)}
              >
                <div className="flex-1">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground mx-1">•</span>
                  <span className="text-muted-foreground">{user.role}</span>
                </div>
                {recipientEmails.includes(user.email) && (
                  <Badge variant="default" className="text-xs ml-2">
                    Added
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipients */}
      <div>
        <Label className="text-sm font-medium">To Recipients</Label>
        <div className="space-y-2 mt-1">
          {recipientEmails.map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => onUpdateRecipient(index, e.target.value)}
                placeholder="recipient@email.com"
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveRecipient(index)}
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={onAddRecipient}>
            <Plus className="w-4 h-4 mr-1" />
            Add Recipient
          </Button>
        </div>
      </div>

      {/* BCC */}
      <div>
        <Label className="text-sm font-medium">BCC Recipients</Label>
        <div className="space-y-2 mt-1">
          {bccEmails.map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => onUpdateBcc(index, e.target.value)}
                placeholder="bcc@email.com"
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveBcc(index)}
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={onAddBcc}>
            <Plus className="w-4 h-4 mr-1" />
            Add BCC
          </Button>
        </div>
      </div>

      {/* Subject */}
      <div>
        <Label htmlFor="subject" className="text-sm font-medium">
          Subject
        </Label>
        <Input
          id="subject"
          value={emailSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message" className="text-sm font-medium">
          Message
        </Label>
        <Textarea
          id="message"
          value={emailMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSending}
        >
          Cancel
        </Button>
        <Button type="button" onClick={onSend} disabled={isSending}>
          {isSending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Mail className="w-4 h-4 mr-2" />
          )}
          {isSending ? "Sending..." : "Send Report"}
        </Button>
      </div>
    </div>
  );
};

export default FullReportEditor;
