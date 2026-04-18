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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface AIRegenerateOptions {
  content?: boolean;
  summary?: boolean;
  recommendations?: boolean;
  title?: boolean;
  sections?: boolean;
  email_subject?: boolean;
  email_message?: boolean;
}

interface AIRegenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'report' | 'newsletter';
  documentId?: number;
  onRegenerate: (results: any) => void;
  availableOptions: AIRegenerateOptions;
  currentData?: any;
}

const AIRegenerateDialog: React.FC<AIRegenerateDialogProps> = ({
  open,
  onOpenChange,
  type,
  documentId,
  onRegenerate,
  availableOptions,
  currentData
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<AIRegenerateOptions>({});
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleOptionChange = (option: keyof AIRegenerateOptions, checked: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  const getOptionLabel = (option: keyof AIRegenerateOptions): string => {
    const labels = {
      content: 'Main Content',
      summary: 'Executive Summary',
      recommendations: 'Recommendations',
      title: 'Title',
      sections: 'Content Sections',
      email_subject: 'Email Subject',
      email_message: 'Email Message'
    };
    return labels[option] || option;
  };

  const handleRegenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt for regeneration"
      });
      return;
    }

    if (Object.values(selectedOptions).every(v => !v)) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Please select at least one item to regenerate"
      });
      return;
    }

    setIsRegenerating(true);
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = documentId 
        ? `/${type}s/${documentId}/regenerate`
        : `/${type}s/regenerate`;
        
      const response = await fetch(buildApiUrl(`/api${endpoint}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          options: selectedOptions,
          current_data: currentData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to regenerate ${type}`);
      }

      setResults(data);
      toast({
        title: "Success",
        description: `AI regeneration completed successfully!`,
      });
    } catch (error) {
      console.error('Error regenerating:', error);
      toast({
        title: "Error",
        description: `Failed to regenerate ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApplyResults = () => {
    if (results) {
      onRegenerate(results);
      setResults(null);
      setPrompt('');
      setSelectedOptions({});
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setPrompt('');
    setSelectedOptions({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Regeneration - {type === 'report' ? 'Financial Report' : 'Newsletter'}
          </DialogTitle>
          <DialogDescription>
            Use AI to regenerate selected parts of your {type} based on your custom prompt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!results ? (
            <>
              {/* Custom Prompt Input */}
              <div>
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Custom Prompt
                </Label>
                <div className="mt-2">
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Describe what you want to achieve. For example: "Make the ${type} more professional and detailed, focus on growth metrics and future opportunities..."`}
                    rows={4}
                    className="resize-none"
                    disabled={isRegenerating}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific about the tone, focus areas, and any particular requirements.
                  </p>
                </div>
              </div>

              {/* Options Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Select items to regenerate
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(availableOptions).map(([option, available]) => 
                    available && (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={selectedOptions[option as keyof AIRegenerateOptions] || false}
                          onCheckedChange={(checked) => 
                            handleOptionChange(option as keyof AIRegenerateOptions, !!checked)
                          }
                          disabled={isRegenerating}
                        />
                        <Label 
                          htmlFor={option} 
                          className="text-sm cursor-pointer"
                        >
                          {getOptionLabel(option as keyof AIRegenerateOptions)}
                        </Label>
                      </div>
                    )
                  )}
                </div>
                {Object.values(selectedOptions).some(v => v) && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Selected: {Object.entries(selectedOptions)
                        .filter(([, selected]) => selected)
                        .map(([option]) => getOptionLabel(option as keyof AIRegenerateOptions))
                        .join(', ')
                      }
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Results Preview */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generated Successfully
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Generate Again
                </Button>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <h4 className="font-medium text-gray-900 mb-3">Preview of Generated Content:</h4>
                <div className="space-y-3">
                  {results.title && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Title:</Label>
                      <p className="text-sm bg-white p-2 rounded border">{results.title}</p>
                    </div>
                  )}
                  {results.summary && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Summary:</Label>
                      <p className="text-sm bg-white p-2 rounded border whitespace-pre-wrap">
                        {results.summary}
                      </p>
                    </div>
                  )}
                  {results.content && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Content:</Label>
                      <p className="text-sm bg-white p-2 rounded border whitespace-pre-wrap">
                        {results.content}
                      </p>
                    </div>
                  )}
                  {results.recommendations && Array.isArray(results.recommendations) && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Recommendations:</Label>
                      <div className="space-y-1">
                        {results.recommendations.map((rec: string, index: number) => (
                          <p key={index} className="text-sm bg-white p-2 rounded border">
                            {index + 1}. {rec}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.sections && Array.isArray(results.sections) && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Content Sections:</Label>
                      <div className="space-y-2">
                        {results.sections.map((section: any, index: number) => (
                          <div key={index} className="bg-white p-2 rounded border">
                            <p className="text-sm font-medium">{section.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{section.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.email_subject && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Email Subject:</Label>
                      <p className="text-sm bg-white p-2 rounded border">{results.email_subject}</p>
                    </div>
                  )}
                  {results.email_message && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Email Message:</Label>
                      <p className="text-sm bg-white p-2 rounded border whitespace-pre-wrap">
                        {results.email_message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Applying these changes will replace the current content. 
                  Make sure you're satisfied with the generated content before applying.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isRegenerating}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              {results ? (
                <Button onClick={handleApplyResults}>
                  Apply Changes
                </Button>
              ) : (
                <Button 
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !prompt.trim()}
                  className="min-w-32"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Regenerate with AI
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIRegenerateDialog;