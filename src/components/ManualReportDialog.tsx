import React, { useState } from 'react';
import { buildApiUrl } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Upload, FileText, CheckCircle, AlertTriangle, Brain,
  Loader2, Eye, File, X, RefreshCw, Check, ChevronsUpDown, Search
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface Client {
  id: number;
  name: string;
  yuki_administration_id: string;
}

interface ParsedData {
  financial_metrics?: {
    revenue?: number;
    expenses?: number;
    profit?: number;
    assets?: number;
    liabilities?: number;
  };
  text_content?: string;
  tables?: Array<{
    title: string;
    data: Record<string, any>[];
  }>;
  metadata?: {
    pages: number;
    file_size: number;
    creation_date?: string;
  };
}

interface ManualReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onReportGenerated?: () => void;
  onSuccess?: () => void;
}

const ManualReportDialog: React.FC<ManualReportDialogProps> = ({
  open,
  onOpenChange,
  clients,
  onReportGenerated,
  onSuccess,
}) => {
  const [step, setStep] = useState<'upload' | 'parsing' | 'preview' | 'generating' | 'completed'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);
  const [openClientCombobox, setOpenClientCombobox] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a PDF file"
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select a file smaller than 10MB"
        });
        return;
      }
      
      setSelectedFile(file);
      setParseError(null);
    }
  };

  const handleParsePDF = async () => {
    if (!selectedFile) return;

    setStep('parsing');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl('/api/reports/parse-pdf'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse PDF');
      }

      if (data.success && data.parsed_data) {
        setParsedData(data.parsed_data);
        setStep('preview');
        toast({
          title: "Success",
          description: "PDF parsed successfully! Review the extracted data below."
        });
      } else {
        // Parsing failed, we'll show error and allow proceeding with raw PDF
        setParseError(data.error || 'Could not extract structured data from PDF');
        setStep('preview');
      }
    } catch (error) {
      console.error('Error parsing PDF:', error);
      setParseError(error instanceof Error ? error.message : 'Failed to parse PDF');
      setStep('preview');
    }
  };

  const handleGenerateReport = async (useRawPdf: boolean = false) => {
    if (!selectedFile || !selectedClient) return;

    setStep('generating');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('client_id', selectedClient);
      formData.append('use_raw_pdf', useRawPdf.toString());
      
      if (!useRawPdf && parsedData) {
        formData.append('parsed_data', JSON.stringify(parsedData));
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl('/api/reports/generate-from-pdf'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      if (data.success) {
        setReportId(data.report_id);
        setStep('completed');
        toast({
          title: "Success",
          description: "Report generated successfully from PDF!"
        });
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate report'
      });
      setStep('preview');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setSelectedFile(null);
    setSelectedClient('');
    setParsedData(null);
    setParseError(null);
    setReportId(null);
  };

  const handleClose = () => {
    if (step === 'completed' && reportId) {
      onSuccess?.();
      onReportGenerated?.();
    }
    handleReset();
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderUploadStep = () => (
    <>
      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Select Client</Label>
            <Popover open={openClientCombobox} onOpenChange={setOpenClientCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openClientCombobox}
                  className="justify-between"
                >
                  {selectedClient
                    ? clients.find((client) => client.id.toString() === selectedClient)?.name
                    : "Select a client for this report"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <div className="flex flex-col">
                  {/* Search Input */}
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Search clients..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="h-11 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  {/* Scrollable Client List */}
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    {clients
                      .filter(client => client && client.name && client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()))
                      .length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No client found.
                      </div>
                    ) : (
                      clients
                        .filter(client => client && client.name && client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()))
                        .map((client) => (
                          <div
                            key={client.id}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                              selectedClient === client.id.toString() && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => {
                              setSelectedClient(client.id.toString());
                              setOpenClientCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClient === client.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {client.name}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pdf-upload">Upload Financial PDF</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  {selectedFile ? (
                    <>
                      <FileText className="w-12 h-12 text-blue-600" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium">Upload PDF File</p>
                        <p className="text-sm text-gray-500">
                          Click to select a financial statement or report (max 10MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            Our AI will extract financial data from your PDF and generate a comprehensive report. 
            If extraction fails, we'll analyze the full document content.
          </AlertDescription>
        </Alert>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button 
          onClick={handleParsePDF}
          disabled={!selectedFile || !selectedClient}
        >
          Parse PDF & Continue
        </Button>
      </DialogFooter>
    </>
  );

  const renderParsingStep = () => (
    <>
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Parsing PDF Document</h3>
          <p className="text-sm text-gray-500 mt-1">
            Extracting financial data and analyzing content...
          </p>
        </div>
      </div>
    </>
  );

  const renderPreviewStep = () => (
    <>
      <div className="space-y-6">
        {parseError ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Parsing failed:</strong> {parseError}</p>
                <p className="text-sm">
                  Don't worry! We can still generate a report by sending the full PDF to our AI for analysis.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully extracted financial data from your PDF. Review the data below:
            </AlertDescription>
          </Alert>
        )}

        {parsedData && (
          <div className="space-y-4">
            {parsedData.financial_metrics && Object.keys(parsedData.financial_metrics).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Extracted Financial Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(parsedData.financial_metrics).filter(([key, value]) => value !== null).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium capitalize">{key}:</span>
                        <span>
                          {typeof value === 'number' 
                            ? new Intl.NumberFormat('en-US', { 
                                style: 'currency', 
                                currency: 'EUR' 
                              }).format(value)
                            : value || 'N/A'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Limited Financial Data Extracted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    No structured financial metrics were found in the PDF. This could be because:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                    <li>The PDF contains mostly images or scanned content</li>
                    <li>Financial data is in a format our parser doesn't recognize</li>
                    <li>The document uses non-standard terminology</li>
                  </ul>
                  <p className="text-sm text-blue-600 mt-3 font-medium">
                    Don't worry! Our AI can still analyze the full document content to generate a comprehensive report.
                  </p>
                </CardContent>
              </Card>
            )}

            {parsedData.text_content && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Text Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {parsedData.text_content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This is a preview of the extracted text content that will be analyzed by AI.
                  </p>
                </CardContent>
              </Card>
            )}

            {parsedData.tables && parsedData.tables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Extracted Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {parsedData.tables.map((table, index) => (
                      <div key={index}>
                        <Badge variant="secondary" className="mb-2">
                          {table.title || `Table ${index + 1}`}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          {table.data.length} rows extracted
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {parsedData.metadata && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pages:</span>
                      <span>{parsedData.metadata.pages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span>{formatFileSize(parsedData.metadata.file_size)}</span>
                    </div>
                    {parsedData.metadata.creation_date && (
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(parsedData.metadata.creation_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
        {parseError ? (
          <Button onClick={() => handleGenerateReport(true)}>
            <Brain className="w-4 h-4 mr-2" />
            Generate with AI (Full PDF)
          </Button>
        ) : (
          <Button onClick={() => handleGenerateReport(false)}>
            <Brain className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        )}
      </DialogFooter>
    </>
  );

  const renderGeneratingStep = () => (
    <>
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Generating Financial Report</h3>
          <p className="text-sm text-gray-500 mt-1">
            Our AI is analyzing your data and creating a comprehensive report...
          </p>
        </div>
      </div>
    </>
  );

  const renderCompletedStep = () => (
    <>
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        <CheckCircle className="w-16 h-16 text-green-600" />
        <div className="text-center">
          <h3 className="text-xl font-medium">Report Generated Successfully!</h3>
          <p className="text-sm text-gray-500 mt-2">
            Your financial report has been created from the uploaded PDF.
          </p>
        </div>
        
        {reportId && (
          <Card className="w-full">
            <CardContent className="pt-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Report ID: {reportId}</p>
                <p className="text-sm text-gray-600">
                  The report is now available in your reports list and can be edited, downloaded, or sent to clients.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <DialogFooter>
        <Button onClick={handleClose} className="w-full">
          View Reports
        </Button>
      </DialogFooter>
    </>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'upload': return 'Upload Financial PDF';
      case 'parsing': return 'Parsing Document';
      case 'preview': return 'Review Extracted Data';
      case 'generating': return 'Generating Report';
      case 'completed': return 'Report Created';
      default: return 'Manual Report Generation';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'upload': return 'Select a client and upload a financial PDF document';
      case 'parsing': return 'Extracting financial data from your PDF document';
      case 'preview': return 'Review the extracted data before generating the report';
      case 'generating': return 'Creating a comprehensive financial report using AI';
      case 'completed': return 'Your report has been successfully generated';
      default: return 'Generate reports from PDF documents using AI analysis';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <File className="w-5 h-5 text-blue-600" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2">
            {['upload', 'parsing', 'preview', 'generating', 'completed'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepName
                      ? 'bg-blue-600 text-white'
                      : ['upload', 'parsing', 'preview', 'generating', 'completed'].indexOf(step) > index
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 h-0.5 ${
                      ['upload', 'parsing', 'preview', 'generating', 'completed'].indexOf(step) > index
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          {step === 'upload' && renderUploadStep()}
          {step === 'parsing' && renderParsingStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'generating' && renderGeneratingStep()}
          {step === 'completed' && renderCompletedStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualReportDialog;