import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buildApiUrl } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { SharedReportPasswordModal } from "@/components/SharedReportPasswordModal";
import { SharedReportViewer } from "@/components/SharedReportViewer";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    users?: any[];
  } | null;
  client_name?: string;
  period_display: string;
  summary: string;
  vat_closure_status?: string;
  analysis_data: any;
  processed_data: any;
  recipient_emails: string[];
  bcc_emails: string[];
  email_subject: string;
  email_message: string;
  enable_ai_chat?: boolean;
  calendly_link?: string | null;
}

export default function SharedReportView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Check if password is stored in sessionStorage (for page refresh)
    const storedPassword = sessionStorage.getItem(
      `shared_report_password_${token}`
    );
    if (storedPassword && token) {
      setPassword(storedPassword);
      loadReport(token, storedPassword);
    }
  }, [token]);

  const loadReport = async (reportToken: string, reportPassword: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        buildApiUrl(
          `/api/shared-reports/${reportToken}?password=${reportPassword}`
        )
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to load report");
      }

      const reportData = await response.json();

      console.log('=== SHARED REPORT DEBUG ===');
      console.log('Full report data:', reportData);
      console.log('enable_ai_chat value:', reportData.enable_ai_chat);
      console.log('enable_ai_chat type:', typeof reportData.enable_ai_chat);
      console.log('Token:', token);
      console.log('========================');

      setReport(reportData);
      setShowPasswordModal(false);

      // Store password in sessionStorage for page refresh
      sessionStorage.setItem(`shared_report_password_${token}`, reportPassword);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load report";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setShowPasswordModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordVerified = (verifiedPassword: string) => {
    if (token && verifiedPassword) {
      setPassword(verifiedPassword);
      loadReport(token, verifiedPassword);
    }
  };

  const handlePasswordError = (errorMessage: string) => {
    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>Invalid share link</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <SharedReportPasswordModal
        open={showPasswordModal && !report}
        token={token}
        onPasswordVerified={handlePasswordVerified}
        onError={handlePasswordError}
      />

      {report && (
        <SharedReportViewer
          report={report}
          enableAiChat={report.enable_ai_chat}
          shareToken={token}
          calendlyLink={report.calendly_link ?? undefined}
        />
      )}
    </>
  );
}
