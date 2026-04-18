import React, { useState, useRef, useEffect } from 'react';
import { buildApiUrl } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Brain
} from 'lucide-react';
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
  AreaChart
} from 'recharts';

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
  client: {
    id: number;
    name: string;
    primary_email: string;
    alternative_emails: string[];
    users?: ClientUser[];
  };
  period_display: string;
  summary: string;
  analysis_data: {
    financial_summary: any;
    quarterly_breakdown: any;
    comparison_analysis: any;
    trends: any;
    recommendations: string[];
    html_content?: string;
    comparison_data?: any;
    chart_data?: any;
  };
  processed_data: any;
  recipient_emails: string[];
  bcc_emails: string[];
  email_subject: string;
  email_message: string;
}

interface ReportEditorProps {
  report: ReportData;
  onSave: (updatedReport: Partial<ReportData>) => Promise<void>;
  onSend: (emailData: any) => Promise<void>;
  onDownloadPDF: (reportId: number) => Promise<void>;
}

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export const ReportEditor: React.FC<ReportEditorProps> = ({ 
  report, 
  onSave, 
  onSend, 
  onDownloadPDF 
}) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isGeneratingPDF, setGeneratingPDF] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  
  // Report content state
  const [reportTitle, setReportTitle] = useState(report.title);
  const [reportSummary, setReportSummary] = useState(report.summary);
  const [reportContent, setReportContent] = useState('');
  const [recommendations, setRecommendations] = useState(
    report.analysis_data?.recommendations || []
  );
  
  // Helper function to safely get client emails
  const getClientEmails = () => {
    const emails = [];
    if (report.client?.primary_email) emails.push(report.client.primary_email);
    if (report.client?.alternative_emails && Array.isArray(report.client.alternative_emails)) {
      emails.push(...report.client.alternative_emails);
    }
    return emails.filter(Boolean);
  };
  
  // Email state - with safe client data access
  const [recipientEmails, setRecipientEmails] = useState<string[]>(
    report.recipient_emails || getClientEmails()
  );
  const [bccEmails, setBccEmails] = useState<string[]>(report.bcc_emails || []);
  const [emailSubject, setEmailSubject] = useState(
    report.email_subject || `Financial Report - ${report.client?.name || 'Client'} - ${report.period_display}`
  );
  const [emailMessage, setEmailMessage] = useState(
    report.email_message || `Dear ${report.client?.name || 'Client'} team,\n\nPlease find attached your financial report for ${report.period_display}.\n\nBest regards,\nYour Accounting Team`
  );
  const [generatingMessage, setGeneratingMessage] = useState(false);
  
  // Rich text editor ref
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize rich content from report data
    if (report.analysis_data) {
      generateInitialContent();
    }
  }, [report]);

  const generateInitialContent = () => {
    const { financial_summary, quarterly_breakdown, comparison_analysis } = report.analysis_data;
    
    const content = `
      <div class="report-content">
        <section class="executive-summary">
          <h2>Executive Summary</h2>
          <p>${report.summary}</p>
        </section>
        
        <section class="financial-overview">
          <h2>Financial Overview</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <h3>Total Revenue</h3>
              <p class="metric-value">€${financial_summary?.total_revenue?.toLocaleString() || '0'}</p>
            </div>
            <div class="metric-card">
              <h3>Total Expenses</h3>
              <p class="metric-value">€${financial_summary?.total_expenses?.toLocaleString() || '0'}</p>
            </div>
            <div class="metric-card">
              <h3>Net Profit</h3>
              <p class="metric-value">€${financial_summary?.net_profit?.toLocaleString() || '0'}</p>
            </div>
            <div class="metric-card">
              <h3>Profit Margin</h3>
              <p class="metric-value">${financial_summary?.profit_margin?.toFixed(1) || '0'}%</p>
            </div>
          </div>
        </section>
        
        <section class="chart-placeholder" data-chart-type="revenue-comparison">
          <h3>Revenue vs Operating Costs Comparison</h3>
          <div class="chart-container">[Revenue Comparison Chart]</div>
        </section>
        
        <section class="analysis">
          <h2>Detailed Analysis</h2>
          <div class="analysis-content">
            ${quarterly_breakdown?.analysis || 'Detailed financial analysis will be displayed here.'}
          </div>
        </section>
        
        <section class="recommendations">
          <h2>Recommendations</h2>
          <ul>
            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </section>
      </div>
    `;
    
    setReportContent(content);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        title: reportTitle,
        summary: reportSummary,
        recipient_emails: recipientEmails,
        bcc_emails: bccEmails,
        email_subject: emailSubject,
        email_message: emailMessage,
        // Save the HTML content as well
        analysis_data: {
          ...report.analysis_data,
          html_content: reportContent,
          recommendations
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setSaving(false);
    }
  };

  const generateAIMessage = async () => {
    setGeneratingMessage(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/reports/${report.id}/generate-message`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setEmailMessage(data.message);
        setEmailSubject(data.suggested_subject || emailSubject);
        toast({
          title: "Success",
          description: "AI message generated successfully!",
        });
      } else {
        throw new Error(data.error || 'Failed to generate AI message');
      }
    } catch (error) {
      console.error('Error generating AI message:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI message",
        variant: "destructive",
      });
    } finally {
      setGeneratingMessage(false);
    }
  };

  const handleSendReport = async () => {
    try {
      await onSend({
        recipient_emails: recipientEmails,
        bcc_emails: bccEmails,
        email_subject: emailSubject,
        email_message: emailMessage,
        include_pdf: true
      });
      setShowSendDialog(false);
    } catch (error) {
      console.error('Error sending report:', error);
    }
  };

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      await onDownloadPDF(report.id);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const addRecipientEmail = () => {
    setRecipientEmails([...recipientEmails, '']);
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
    setBccEmails([...bccEmails, '']);
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
    setRecommendations([...recommendations, '']);
  };

  const removeRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  const updateRecommendation = (index: number, value: string) => {
    const updated = [...recommendations];
    updated[index] = value;
    setRecommendations(updated);
  };

  // Rich text formatting functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  // Chart data preparation
  const prepareChartData = () => {
    const { financial_summary, comparison_data } = report.analysis_data || {};
    const previous_quarter = comparison_data?.previous_quarter;

    const revenueComparisonData = [
      {
        name: 'Revenue',
        current: financial_summary?.total_revenue || 0,
        previous: previous_quarter?.total_revenue || 0
      },
      {
        name: 'Expenses',
        current: financial_summary?.total_expenses || 0,
        previous: previous_quarter?.total_expenses || 0
      },
      {
        name: 'Net Profit',
        current: financial_summary?.net_profit || 0,
        previous: previous_quarter?.net_profit || 0
      },
      {
        name: 'Gross Profit',
        current: financial_summary?.gross_profit || 0,
        previous: previous_quarter?.gross_profit || 0
      }
    ];

    const expenseBreakdownData = [
      { name: 'Salaries', value: 35000, color: '#8884d8' },
      { name: 'Office Costs', value: 5200, color: '#82ca9d' },
      { name: 'Consultant Fees', value: 8500, color: '#ffc658' },
      { name: 'Other', value: 6000, color: '#ff7c7c' }
    ];

    // Expense comparison data - from backend
    const expenseComparisonData = report.analysis_data?.chart_data?.expenseComparison || [];

    return { revenueComparisonData, expenseComparisonData, expenseBreakdownData };
  };

  const { revenueComparisonData, expenseComparisonData, expenseBreakdownData } = prepareChartData();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
            {isEditing ? (
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="text-xl md:text-2xl lg:text-3xl font-bold border-none p-0 h-auto"
              />
            ) : reportTitle}
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            {report.client?.name || 'Unknown Client'} • {report.period_display}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
            className="flex-1 sm:flex-none text-xs md:text-sm"
            size="sm"
          >
            <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">{isEditing ? 'View Mode' : 'Edit Mode'}</span>
            <span className="md:hidden">{isEditing ? 'View' : 'Edit'}</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="default"
            className="flex-1 sm:flex-none text-xs md:text-sm"
            size="sm"
          >
            <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>

          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            variant="outline"
            className="flex-1 sm:flex-none text-xs md:text-sm"
            size="sm"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
            <span className="sm:hidden">PDF</span>
          </Button>

          <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex-1 sm:flex-none text-xs md:text-sm" size="sm">
                <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Send Report</span>
                <span className="sm:hidden">Send</span>
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
                clientName={report.client?.name || 'Unknown Client'}
                clientUsers={report.client?.users || []}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="editor" className="text-xs md:text-sm py-2">
            <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span>Editor</span>
          </TabsTrigger>
          <TabsTrigger value="charts" className="text-xs md:text-sm py-2">
            <BarChart3 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span>Charts</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs md:text-sm py-2">
            <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span>Preview</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="text-xs md:text-sm py-2">
            <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Email Setup</span>
            <span className="sm:hidden">Email</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <ReportContentEditor
            isEditing={isEditing}
            reportSummary={reportSummary}
            reportContent={reportContent}
            recommendations={recommendations}
            onSummaryChange={setReportSummary}
            onContentChange={setReportContent}
            onRecommendationsChange={setRecommendations}
            onAddRecommendation={addRecommendation}
            onRemoveRecommendation={removeRecommendation}
            onUpdateRecommendation={updateRecommendation}
            formatText={formatText}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <ReportChartsTab
            revenueComparisonData={revenueComparisonData}
            expenseComparisonData={expenseComparisonData}
            expenseBreakdownData={expenseBreakdownData}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <ReportPreview
            title={reportTitle}
            client={report.client || { id: 0, name: 'Unknown Client', yuki_administration_id: '', primary_email: '', alternative_emails: [] }}
            period={report.period_display}
            summary={reportSummary}
            content={reportContent}
            recommendations={recommendations}
            revenueComparisonData={revenueComparisonData}
            expenseBreakdownData={expenseBreakdownData}
          />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailSetupTab
            recipientEmails={recipientEmails}
            bccEmails={bccEmails}
            emailSubject={emailSubject}
            emailMessage={emailMessage}
            onRecipientsChange={setRecipientEmails}
            onBccChange={setBccEmails}
            onSubjectChange={setEmailSubject}
            onMessageChange={setEmailMessage}
            onGenerateAIMessage={generateAIMessage}
            isGeneratingAIMessage={generatingMessage}
            onAddRecipient={addRecipientEmail}
            onRemoveRecipient={removeRecipientEmail}
            onUpdateRecipient={updateRecipientEmail}
            onAddBcc={addBccEmail}
            onRemoveBcc={removeBccEmail}
            onUpdateBcc={updateBccEmail}
            clientEmails={getClientEmails()}
            clientUsers={report.client?.users || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Rich Text Content Editor Component
interface ReportContentEditorProps {
  isEditing: boolean;
  reportSummary: string;
  reportContent: string;
  recommendations: string[];
  onSummaryChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onRecommendationsChange: (value: string[]) => void;
  onAddRecommendation: () => void;
  onRemoveRecommendation: (index: number) => void;
  onUpdateRecommendation: (index: number, value: string) => void;
  formatText: (command: string, value?: string) => void;
}

const ReportContentEditor: React.FC<ReportContentEditorProps> = ({
  isEditing,
  reportSummary,
  reportContent,
  recommendations,
  onSummaryChange,
  onContentChange,
  onAddRecommendation,
  onRemoveRecommendation,
  onUpdateRecommendation,
  formatText
}) => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Rich Text Toolbar */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Palette className="w-4 h-4 md:w-5 md:h-5" />
              Formatting Toolbar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 md:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => formatText('bold')}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => formatText('italic')}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => formatText('underline')}
              >
                <Underline className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => formatText('justifyLeft')}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => formatText('justifyCenter')}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => formatText('justifyRight')}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => formatText('insertUnorderedList')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => formatText('insertOrderedList')}
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={reportSummary}
              onChange={(e) => onSummaryChange(e.target.value)}
              placeholder="Enter executive summary..."
              rows={4}
              className="w-full text-sm md:text-base"
            />
          ) : (
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">{reportSummary}</p>
          )}
        </CardContent>
      </Card>

      {/* Main Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Report Content</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div
              contentEditable
              suppressContentEditableWarning
              className="min-h-64 md:min-h-96 p-3 md:p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: reportContent }}
              onBlur={(e) => onContentChange(e.currentTarget.innerHTML)}
            />
          ) : (
            <div
              className="prose prose-sm md:prose max-w-none"
              dangerouslySetInnerHTML={{ __html: reportContent }}
            />
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-base md:text-lg">
            <span>Recommendations</span>
            {isEditing && (
              <Button size="sm" onClick={onAddRecommendation} className="text-xs md:text-sm w-full sm:w-auto">
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Add
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 md:space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex gap-2 items-start">
              {isEditing ? (
                <>
                  <Textarea
                    value={rec}
                    onChange={(e) => onUpdateRecommendation(index, e.target.value)}
                    placeholder={`Recommendation ${index + 1}...`}
                    rows={2}
                    className="flex-1 text-sm md:text-base"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRemoveRecommendation(index)}
                    className="shrink-0"
                  >
                    <Minus className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </>
              ) : (
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold mt-1 text-sm md:text-base">•</span>
                  <p className="text-sm md:text-base text-gray-700">{rec}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// Charts Tab Component
interface ReportChartsTabProps {
  revenueComparisonData: any[];
  expenseComparisonData: any[];
  expenseBreakdownData: any[];
  isEditing: boolean;
}

const ReportChartsTab: React.FC<ReportChartsTabProps> = ({
  revenueComparisonData,
  expenseComparisonData,
  expenseBreakdownData,
  isEditing
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Revenue Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250} className="md:!h-[300px]">
            <BarChart data={revenueComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
              <Legend />
              <Bar dataKey="current" fill="#8884d8" name="Current Period" />
              <Bar dataKey="previous" fill="#82ca9d" name="Previous Period" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Expense Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250} className="md:!h-[300px]">
            <BarChart data={expenseComparisonData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
              />
              <YAxis />
              <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
              <Legend />
              <Bar dataKey="current" fill="#9333ea" name="Current Quarter" />
              <Bar dataKey="previous" fill="#c084fc" name="Previous Quarter" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative flex items-center justify-center">
            {/* Subtle 3D shadow backdrop */}
            <div
              className="absolute rounded-full"
              style={{
                width: '210px',
                height: '210px',
                background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 50%)',
                boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.15), 0 10px 30px -5px rgba(0, 0, 0, 0.1), inset 0 -5px 20px rgba(0, 0, 0, 0.05)',
              }}
            />
            <ResponsiveContainer width="100%" height={300} className="relative z-10">
              <RechartsPieChart>
                <defs>
                  <filter id="pieShadow1" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ filter: 'url(#pieShadow1)' }}
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Financial Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250} className="md:!h-[300px]">
            <LineChart data={revenueComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#8884d8" 
                strokeWidth={3}
                name="Current Trend"
              />
              <Line 
                type="monotone" 
                dataKey="previous" 
                stroke="#82ca9d" 
                strokeWidth={3}
                name="Previous Trend"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Report Preview Component
interface ReportPreviewProps {
  title: string;
  client: any;
  period: string;
  summary: string;
  content: string;
  recommendations: string[];
  revenueComparisonData: any[];
  expenseBreakdownData: any[];
}

const ReportPreview: React.FC<ReportPreviewProps> = ({
  title,
  client,
  period,
  summary,
  content,
  recommendations,
  revenueComparisonData,
  expenseBreakdownData
}) => {
  return (
    <div className="bg-white p-4 md:p-6 lg:p-8 shadow-lg rounded-lg report-preview">
      {/* Header */}
      <div className="text-center border-b pb-4 md:pb-6 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-base md:text-lg lg:text-xl text-gray-600">{client.name}</p>
        <p className="text-sm md:text-base lg:text-lg text-gray-500">{period}</p>
      </div>

      {/* Executive Summary */}
      <section className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4">Executive Summary</h2>
        <p className="text-sm md:text-base text-gray-700 leading-relaxed">{summary}</p>
      </section>

      {/* Charts Section */}
      <section className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">Financial Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
            <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Revenue Comparison</h3>
            <ResponsiveContainer width="100%" height={200} className="md:!h-[250px]">
              <BarChart data={revenueComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
                <Bar dataKey="current" fill="#8884d8" name="Current Quarter" />
                <Bar dataKey="previous" fill="#82ca9d" name="Previous Quarter" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
            <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Expense Distribution</h3>
            <div className="relative flex items-center justify-center">
              {/* Subtle 3D shadow backdrop */}
              <div
                className="absolute rounded-full"
                style={{
                  width: '170px',
                  height: '170px',
                  background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 50%)',
                  boxShadow: '0 15px 50px -10px rgba(0, 0, 0, 0.15), 0 8px 25px -5px rgba(0, 0, 0, 0.1), inset 0 -4px 15px rgba(0, 0, 0, 0.05)',
                }}
              />
              <ResponsiveContainer width="100%" height={250} className="relative z-10">
                <RechartsPieChart>
                  <defs>
                    <filter id="pieShadow2" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.15"/>
                    </filter>
                  </defs>
                  <Pie
                    data={expenseBreakdownData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                    style={{ filter: 'url(#pieShadow2)' }}
                  >
                    {expenseBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mb-6 md:mb-8">
        <div
          className="prose prose-sm md:prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </section>

      {/* Recommendations */}
      <section className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4">Recommendations</h2>
        <div className="space-y-2 md:space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2 md:gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-semibold mt-1 shrink-0">
                {index + 1}
              </span>
              <p className="text-sm md:text-base text-gray-700 flex-1">{rec}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Email Setup Tab Component
interface EmailSetupTabProps {
  recipientEmails: string[];
  bccEmails: string[];
  emailSubject: string;
  emailMessage: string;
  onRecipientsChange: (emails: string[]) => void;
  onBccChange: (emails: string[]) => void;
  onSubjectChange: (subject: string) => void;
  onMessageChange: (message: string) => void;
  onGenerateAIMessage: () => void;
  isGeneratingAIMessage: boolean;
  onAddRecipient: () => void;
  onRemoveRecipient: (index: number) => void;
  onUpdateRecipient: (index: number, value: string) => void;
  onAddBcc: () => void;
  onRemoveBcc: (index: number) => void;
  onUpdateBcc: (index: number, value: string) => void;
  clientEmails: string[];
  clientUsers: ClientUser[];
}

const EmailSetupTab: React.FC<EmailSetupTabProps> = ({
  recipientEmails,
  bccEmails,
  emailSubject,
  emailMessage,
  onRecipientsChange,
  onBccChange,
  onSubjectChange,
  onMessageChange,
  onGenerateAIMessage,
  isGeneratingAIMessage,
  onAddRecipient,
  onRemoveRecipient,
  onUpdateRecipient,
  onAddBcc,
  onRemoveBcc,
  onUpdateBcc,
  clientEmails,
  clientUsers
}) => {
  const addClientEmail = (email: string) => {
    if (!recipientEmails.includes(email)) {
      onRecipientsChange([...recipientEmails, email]);
    }
  };

  const addClientUser = (user: ClientUser) => {
    if (!recipientEmails.includes(user.email)) {
      onRecipientsChange([...recipientEmails, user.email]);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Quick Add Client Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Client Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {clientEmails.map((email, index) => (
              <Badge
                key={index}
                variant={recipientEmails.includes(email) ? "default" : "outline"}
                className="cursor-pointer text-xs md:text-sm"
                onClick={() => addClientEmail(email)}
              >
                {email}
                {recipientEmails.includes(email) && " ✓"}
              </Badge>
            ))}
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            Click to add client emails to recipients
          </p>
        </CardContent>
      </Card>

      {/* Client Users */}
      {clientUsers && clientUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Client Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clientUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2 md:p-3 border rounded-lg cursor-pointer transition-colors ${
                    recipientEmails.includes(user.email)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => addClientUser(user)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium flex items-center gap-2 flex-wrap text-sm md:text-base">
                      <span className="truncate">{user.name}</span>
                      {recipientEmails.includes(user.email) && (
                        <Badge variant="default" className="text-[10px] md:text-xs">Added</Badge>
                      )}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">{user.role}</div>
                    <div className="text-xs md:text-sm text-muted-foreground truncate">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              Click to add client user emails to recipients
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-base md:text-lg">
            <span>To Recipients</span>
            <Button size="sm" onClick={onAddRecipient} className="text-xs md:text-sm w-full sm:w-auto">
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 md:space-y-3">
          {recipientEmails.map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => onUpdateRecipient(index, e.target.value)}
                placeholder="recipient@email.com"
                className="flex-1 text-sm md:text-base"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveRecipient(index)}
                className="shrink-0"
              >
                <Minus className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* BCC Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-base md:text-lg">
            <span>BCC Recipients</span>
            <Button size="sm" onClick={onAddBcc} className="text-xs md:text-sm w-full sm:w-auto">
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 md:space-y-3">
          {bccEmails.map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => onUpdateBcc(index, e.target.value)}
                placeholder="bcc@email.com"
                className="flex-1 text-sm md:text-base"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveBcc(index)}
                className="shrink-0"
              >
                <Minus className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Email Subject */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Email Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={emailSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Financial Report Subject..."
            className="w-full text-sm md:text-base"
          />
        </CardContent>
      </Card>

      {/* Email Message */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-base md:text-lg">Email Message</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGenerateAIMessage}
              disabled={isGeneratingAIMessage}
              className="text-[10px] md:text-xs w-full sm:w-auto"
            >
              {isGeneratingAIMessage ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1 md:mr-2"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Brain className="h-3 w-3 mr-1 md:mr-2" />
                  <span>Generate with AI</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={emailMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Enter your message or use AI to generate a professional message..."
            rows={6}
            className="w-full text-sm md:text-base md:rows-8"
          />
        </CardContent>
      </Card>
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
  clientUsers
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
          <Label className="text-sm font-medium mb-2 block">Quick Add Client Users</Label>
          <div className="space-y-1">
            {clientUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-sm ${
                  recipientEmails.includes(user.email)
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-background'
                }`}
                onClick={() => addClientUser(user)}
              >
                <div className="flex-1">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground mx-1">•</span>
                  <span className="text-muted-foreground">{user.role}</span>
                </div>
                {recipientEmails.includes(user.email) && (
                  <Badge variant="default" className="text-xs ml-2">Added</Badge>
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
        <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
        <Input
          id="subject"
          value={emailSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message" className="text-sm font-medium">Message</Label>
        <Textarea
          id="message"
          value={emailMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={onSend}>
          <Mail className="w-4 h-4 mr-2" />
          Send Report
        </Button>
      </div>
    </div>
  );
};

export default ReportEditor;
