import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Save,
  Loader2,
  RotateCcw,
  FileText,
  Mail,
  AlertCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { axiosAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface PromptManagementProps {
  organizationId: number;
}

const DEFAULT_PROMPTS = {
  report_summary_prompt: `You are an expert financial communicator writing CONCISE executive summaries for busy C-level executives.

Create a brief, focused executive summary as a SINGLE FLOWING PARAGRAPH (max 120 words):

The paragraph should cover:
- Key financial metrics (revenue, profit, margin) with specific numbers
- Quarter-over-quarter comparison showing growth/decline percentages
- Overall financial health assessment
- 1-2 most critical insights from account-level spikes/declines if provided

IMPORTANT CONSTRAINTS:
- Write as ONE CONTINUOUS PARAGRAPH - no line breaks, no bullet points, no bold headers
- Maximum 120 words total
- Natural, flowing sentences that connect smoothly
- Professional business tone
- Focus on actionable insights
- Avoid formatting like "**text**" or numbered lists
- Mention specific account changes if significant spikes/declines are present

Write in clear, direct, professional language as a single cohesive paragraph.`,

  report_recommendations_prompt: `You are an expert business consultant and financial advisor specializing in Belgian businesses.

Provide exactly 5 specific, actionable, and prioritized strategic recommendations covering the most critical areas:
1. **Revenue Optimization**: Strategies to increase sales, improve pricing, or expand markets
2. **Cost Management**: Specific areas for cost reduction without compromising operations
3. **Cash Flow Management**: Working capital optimization and liquidity improvements
4. **Profitability Enhancement**: Margin improvement strategies and efficiency gains
5. **Strategic Growth & Risk Management**: Strategic initiatives for sustainable business growth, financial risk management, and contingency planning

Each recommendation should be:
- Specific and measurable
- Directly tied to the financial data provided
- Actionable with clear next steps
- Prioritized by potential impact

Return recommendations as a JSON array of strings with exactly 5 items, with each recommendation being a clear, detailed statement.

IMPORTANT: Focus recommendations on the account-level spikes and declines provided in the context.`,

  newsletter_generation_prompt: `Create a Belgian financial newsletter in the specified language. Word count: as requested.

OUTPUT REQUIREMENTS:
- Response must be PURE JSON starting with { and ending with }
- No markdown, no code blocks, no text before/after JSON
- All content in the specified language

CREATE JSON WITH:
1. "sections" array: 7-10 sections about Belgian business/finance topics
   - Each section: {"id": "section_X", "type": "text", "title": "...", "content": "detailed multi-paragraph analysis", "order": X}
   - Topics: Economic trends, tax updates, market insights, business tips, regulations, sector analysis
   - Use specific Belgian data and examples

2. "images": [] (empty array)

3. "graphs": [] (empty array)

4. "style": {"template": "professional", "colors": {"primary": "#1f2937", "secondary": "#6b7280"}, "fonts": {"heading": "Arial", "body": "Arial"}}

5. "sources": Array of 5+ credible sources
   - Format: {"title": "...", "url": "https://...", "description": "..."}
   - Include: NBB, FOD Financiën, ECB, Belgian news sites

CONTENT RULES:
- Write in the specified language
- Include 5-10 sections with detailed Belgian financial content
- Each section: professional analysis with specific data
- Sources: Include credible Belgian/EU financial sources
- Escape all special characters properly for JSON

*** START YOUR RESPONSE WITH { - NO OTHER TEXT ***`,
};

const PromptManagement = ({ organizationId }: PromptManagementProps) => {
  console.log(
    "PromptManagement component mounted with organizationId:",
    organizationId
  );
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prompts, setPrompts] = useState({
    report_summary_prompt: "",
    report_recommendations_prompt: "",
    newsletter_generation_prompt: "",
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    console.log("useEffect triggered, fetching prompts...");
    fetchPrompts();
  }, [organizationId]);

  const fetchPrompts = async () => {
    setLoading(true);
    console.log("Fetching prompts for organization:", organizationId);
    try {
      const response = await axiosAuth.get(
        `/api/organizations/${organizationId}`
      );
      const org = response.data;
      console.log("Organization data received:", org);
      console.log(
        "Report summary prompt length:",
        org.report_summary_prompt?.length || 0
      );
      console.log(
        "Report recommendations prompt length:",
        org.report_recommendations_prompt?.length || 0
      );
      console.log(
        "Newsletter prompt length:",
        org.newsletter_generation_prompt?.length || 0
      );

      const loadedPrompts = {
        report_summary_prompt:
          org.report_summary_prompt || DEFAULT_PROMPTS.report_summary_prompt,
        report_recommendations_prompt:
          org.report_recommendations_prompt ||
          DEFAULT_PROMPTS.report_recommendations_prompt,
        newsletter_generation_prompt:
          org.newsletter_generation_prompt ||
          DEFAULT_PROMPTS.newsletter_generation_prompt,
      };

      console.log("Setting prompts:", {
        summary_length: loadedPrompts.report_summary_prompt?.length || 0,
        recommendations_length:
          loadedPrompts.report_recommendations_prompt?.length || 0,
        newsletter_length:
          loadedPrompts.newsletter_generation_prompt?.length || 0,
      });

      setPrompts(loadedPrompts);
      console.log("Prompts loaded successfully");
    } catch (error: any) {
      console.error("Failed to fetch prompts:", error);
      console.error("Error details:", error.response?.data);

      // Load defaults on error
      console.log("Loading default prompts due to error");
      setPrompts({
        report_summary_prompt: DEFAULT_PROMPTS.report_summary_prompt,
        report_recommendations_prompt:
          DEFAULT_PROMPTS.report_recommendations_prompt,
        newsletter_generation_prompt:
          DEFAULT_PROMPTS.newsletter_generation_prompt,
      });

      toast({
        title: "Warning",
        description: "Could not load saved prompts. Using defaults.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (field: string, value: string) => {
    console.log(`Prompt changed: ${field}, new length: ${value.length}`);
    setPrompts((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    console.log("Saving prompts for organization:", organizationId);
    console.log("Prompts to save:", {
      summary_length: prompts.report_summary_prompt?.length || 0,
      recommendations_length:
        prompts.report_recommendations_prompt?.length || 0,
      newsletter_length: prompts.newsletter_generation_prompt?.length || 0,
    });

    try {
      const response = await axiosAuth.put(
        `/api/organizations/${organizationId}`,
        prompts
      );
      console.log("Save response:", response.data);

      toast({
        title: "Success",
        description: "AI prompt settings saved successfully",
        duration: 3000,
      });
      setHasChanges(false);
    } catch (error: any) {
      console.error("Failed to save prompts:", error);
      console.error("Error response:", error.response?.data);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to save prompt settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = (field: keyof typeof DEFAULT_PROMPTS) => {
    setPrompts((prev) => ({
      ...prev,
      [field]: DEFAULT_PROMPTS[field],
    }));
    setHasChanges(true);

    toast({
      title: "Reset to Default",
      description: "Prompt has been reset to the default template",
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> These prompts control how AI generates
          reports and newsletters. Customize them carefully to maintain
          consistent output quality. Changes apply to all future generations.
        </AlertDescription>
      </Alert>

      {/* Report Summary Prompt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle>Report Executive Summary Prompt</CardTitle>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Report Summary Prompt Preview</DialogTitle>
                    <DialogDescription>
                      This is the current prompt that will be sent to AWS
                      Bedrock (Claude) for generating report summaries.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {prompts.report_summary_prompt}
                    </pre>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResetToDefault("report_summary_prompt")}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </div>
          <CardDescription>
            This system prompt controls how AI generates the executive summary
            section of financial reports. The summary should be concise,
            professional, and highlight key metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="report-summary-prompt" className="font-semibold">
              System Prompt
            </Label>
            <Textarea
              id="report-summary-prompt"
              value={prompts.report_summary_prompt}
              onChange={(e) =>
                handlePromptChange("report_summary_prompt", e.target.value)
              }
              rows={15}
              className="font-mono text-sm resize-y min-h-[200px]"
              placeholder="Enter the system prompt for report summary generation..."
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                This prompt is sent to AWS Bedrock (Claude) along with financial
                data to generate the executive summary.
              </span>
              <span className="text-gray-400">
                {prompts.report_summary_prompt?.length || 0} characters
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Recommendations Prompt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <CardTitle>Report Recommendations Prompt</CardTitle>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Report Recommendations Prompt Preview
                    </DialogTitle>
                    <DialogDescription>
                      This is the current prompt that will be sent to AWS
                      Bedrock (Claude) for generating business recommendations.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {prompts.report_recommendations_prompt}
                    </pre>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleResetToDefault("report_recommendations_prompt")
                }
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </div>
          <CardDescription>
            This system prompt controls how AI generates strategic business
            recommendations based on financial data. Recommendations should be
            specific, actionable, and tailored to Belgian businesses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label
              htmlFor="report-recommendations-prompt"
              className="font-semibold"
            >
              System Prompt
            </Label>
            <Textarea
              id="report-recommendations-prompt"
              value={prompts.report_recommendations_prompt}
              onChange={(e) =>
                handlePromptChange(
                  "report_recommendations_prompt",
                  e.target.value
                )
              }
              rows={22}
              className="font-mono text-sm resize-y min-h-[300px]"
              placeholder="Enter the system prompt for report recommendations generation..."
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                This prompt guides the AI to generate exactly 5 actionable
                business recommendations.
              </span>
              <span className="text-gray-400">
                {prompts.report_recommendations_prompt?.length || 0} characters
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Generation Prompt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <CardTitle>Newsletter Generation Prompt</CardTitle>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Newsletter Generation Prompt Preview
                    </DialogTitle>
                    <DialogDescription>
                      This is the current base prompt that will be sent to AWS
                      Bedrock (Claude) for generating newsletters. Language and
                      word count placeholders will be replaced dynamically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {prompts.newsletter_generation_prompt}
                    </pre>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleResetToDefault("newsletter_generation_prompt")
                }
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </div>
          <CardDescription>
            This base prompt controls how AI generates newsletter content. The
            newsletter should contain Belgian financial news, insights, and
            analysis in a structured JSON format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label
              htmlFor="newsletter-generation-prompt"
              className="font-semibold"
            >
              Base Prompt
            </Label>
            <Textarea
              id="newsletter-generation-prompt"
              value={prompts.newsletter_generation_prompt}
              onChange={(e) =>
                handlePromptChange(
                  "newsletter_generation_prompt",
                  e.target.value
                )
              }
              rows={25}
              className="font-mono text-sm resize-y min-h-[350px]"
              placeholder="Enter the base prompt for newsletter generation..."
            />
            <div className="flex flex-col gap-1 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>
                  Note: The placeholder "in the specified language" and "Word
                  count: as requested" will be dynamically replaced.
                </span>
                <span className="text-gray-400">
                  {prompts.newsletter_generation_prompt?.length || 0} characters
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        {hasChanges && (
          <Alert className="flex-1">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              You have unsaved changes. Click "Save Prompt Settings" to apply
              them.
            </AlertDescription>
          </Alert>
        )}
        <Button onClick={handleSave} disabled={saving || !hasChanges} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Prompt Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PromptManagement;
