import React, { useState } from "react";
import FullReportEditor from "./FullReportEditor";
import { SharedReportChatButton } from "./SharedReportChatButton";
import { SharedReportChatModal } from "./SharedReportChatModal";

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
}

interface SharedReportViewerProps {
  report: ReportData;
  enableAiChat?: boolean;
  shareToken?: string;
  calendlyLink?: string;
}

export const SharedReportViewer: React.FC<SharedReportViewerProps> = ({
  report,
  enableAiChat = false,
  shareToken,
  calendlyLink,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Mock handlers for read-only view
  const handleSave = async () => {
    // No-op for read-only view
  };

  const handleSend = async () => {
    // No-op for read-only view
  };

  const handleDownloadPDF = async () => {
    // No-op for read-only view
  };

  const handleBack = () => {
    // No-op for read-only view
  };

  console.log('=== VIEWER PROPS ===');
  console.log('enableAiChat:', enableAiChat);
  console.log('shareToken:', shareToken);
  console.log('Should render chat:', enableAiChat && shareToken);
  console.log('==================');

  return (
    <>
      <FullReportEditor
        report={report}
        onSave={handleSave}
        onSend={handleSend}
        onDownloadPDF={handleDownloadPDF}
        onBack={handleBack}
        isReadOnly={true}
      />

      {enableAiChat && shareToken && (
        <>
          <SharedReportChatButton onClick={() => setIsChatOpen(true)} />
          <SharedReportChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            reportData={report}
            token={shareToken}
            calendlyLink={calendlyLink}
          />
        </>
      )}
    </>
  );
};

