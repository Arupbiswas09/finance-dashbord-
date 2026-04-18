import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import KnowledgeSourceManager from '@/components/KnowledgeSourceManager';
import { buildApiUrl } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { Newsletter, NewsletterSection } from '@/types/newsletter';
import { NewsletterTheme, newsletterThemes, getDefaultTheme } from '@/themes/newsletter-themes';

interface AIGenerateDialogRichProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (newsletter: Newsletter) => void;
}

export const AIGenerateDialogRich = ({ open, onOpenChange, onGenerate }: AIGenerateDialogRichProps) => {
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [wordCount, setWordCount] = useState(2000);
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<number[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<NewsletterTheme>(getDefaultTheme());
  const [isGenerating, setIsGenerating] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
  ];

  const handleGenerate = async () => {
    if (!newsletterTitle.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a newsletter title',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(buildApiUrl('/api/newsletters/generate'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newsletterTitle,
          custom_prompt: generationPrompt || undefined,
          include_financial_data: true,
          include_graphs: true,
          include_images: true,
          language: selectedLanguage,
          word_count: wordCount,
          knowledge_source_ids: selectedKnowledgeSources.length > 0 ? selectedKnowledgeSources : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate newsletter');
      }

      const generatedNewsletter = await response.json();
      
      // Convert the generated newsletter to the new format
      const convertedNewsletter = convertToNewFormat(generatedNewsletter, selectedTheme);
      
      toast({
        title: 'Success',
        description: 'Newsletter generated successfully!',
      });
      
      onGenerate(convertedNewsletter);
      onOpenChange(false);
      
      // Reset form
      setNewsletterTitle('');
      setEmailSubject('');
      setGenerationPrompt('');
      setSelectedKnowledgeSources([]);
    } catch (error: any) {
      console.error('Error generating newsletter:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to generate newsletter',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Convert generated newsletter from backend format - combine all sections into single HTML
   */
  const convertToNewFormat = (newsletter: any, theme: NewsletterTheme): Newsletter => {
    // Parse content if it's a string
    let content = newsletter.content;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        console.error('Error parsing newsletter content:', e);
        content = { sections: [] };
      }
    }
    
    // Combine all sections into single HTML content
    let combinedHtml = '';
    if (newsletter.html_content) {
      combinedHtml = newsletter.html_content;
    } else if (content?.sections && Array.isArray(content.sections)) {
      // Combine all section content into one
      combinedHtml = content.sections.map((section: any) => section.content || '').join('\n\n');
    }
    
    // If still no content, create default
    if (!combinedHtml) {
      combinedHtml = '<p>Start writing your newsletter...</p>';
    }

    // Create single section with all combined content
    const sections: NewsletterSection[] = [{
      id: 'main',
      type: 'text',
      order: 0,
      content: combinedHtml,
      metadata: {},
    }];

    return {
      id: newsletter.id,
      title: newsletter.title,
      subject: emailSubject.trim() || newsletter.subject || newsletter.title,
      content: {
        sections,
        media: content?.images?.map((img: any, idx: number) => ({
          id: `media_${idx}`,
          type: 'image' as const,
          url: typeof img === 'string' ? img : img.url || img.src || '',
          alt: typeof img === 'string' ? '' : img.alt || '',
        })) || [],
        style: {
          template: 'professional',
          themeId: theme.id,
          colors: {
            primary: theme.colors.primary,
            secondary: theme.colors.secondary,
            background: theme.colors.background,
            headerBg: theme.colors.headerBg,
            footerBg: theme.colors.footerBg,
            textHeading: theme.colors.textHeading,
            textBody: theme.colors.textBody,
            textMuted: theme.colors.textMuted,
            cardBg: theme.colors.cardBg,
            border: theme.colors.border,
          },
          fonts: {
            heading: theme.fonts.heading,
            body: theme.fonts.body,
          },
          layout: theme.layout,
        },
        sources: content?.sources || [],
      },
      html_content: combinedHtml,
      status: newsletter.status || 'draft',
      ai_generated: newsletter.ai_generated || true,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Newsletter Generator
          </DialogTitle>
          <DialogDescription>
            Generate professional newsletters with AI assistance. Select knowledge sources to include context from your news sources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Newsletter Title */}
          <div>
            <Label>Newsletter Title *</Label>
            <Input
              placeholder="e.g., Monthly Financial Update - January 2024"
              value={newsletterTitle}
              onChange={(e) => setNewsletterTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Email Subject */}
          <div>
            <Label>Email Subject (Optional)</Label>
            <Input
              placeholder="Leave empty to use newsletter title"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Subject line for the email. If left empty, the newsletter title will be used.
            </p>
          </div>

          {/* Language */}
          <div>
            <Label>Newsletter Language *</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Word Count */}
          <div>
            <Label>Target Word Count</Label>
            <div className="flex items-center gap-4 mt-1">
              <Input
                type="number"
                min="500"
                max="5000"
                step="100"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value) || 2000)}
              />
              <span className="text-sm text-gray-500">words</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Newsletter will be approximately {wordCount} words (range: 500-5000)
            </p>
          </div>

          {/* Custom Prompt */}
          <div>
            <Label>Custom Prompt (Optional)</Label>
            <Textarea
              placeholder={`Example: Create a monthly financial newsletter for November 2024 covering:
- Q4 financial landscape and year-end tax planning
- Key deadlines (VAT due Jan 20, pension contribution limits)
- Business expense documentation requirements
- Charitable giving tax benefits
- Investment portfolio review recommendations
- Market outlook for 2025

Focus on actionable year-end planning advice with specific deadlines and percentages.`}
              value={generationPrompt}
              onChange={(e) => setGenerationPrompt(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to generate content based on latest financial trends and regulations. Or provide specific instructions for the newsletter content, tone, and focus areas.
            </p>
          </div>

          {/* Theme Selection */}
          <div>
            <Label>Newsletter Theme</Label>
            <Select 
              value={selectedTheme.id} 
              onValueChange={(value) => {
                const theme = newsletterThemes.find(t => t.id === value);
                if (theme) setSelectedTheme(theme);
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {newsletterThemes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{
                          background: `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.secondary} 100%)`,
                        }}
                      />
                      <span>{theme.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedTheme.description}
            </p>
          </div>

          {/* Knowledge Sources */}
          <div>
            <Label>Knowledge Sources (Optional)</Label>
            <p className="text-xs text-gray-500 mb-2">
              Select news sources to include context from. The AI will scrape and use content from these sources.
            </p>
            <div className="mt-2">
              <KnowledgeSourceManager
                selectedSourceIds={selectedKnowledgeSources}
                onSelectionChange={setSelectedKnowledgeSources}
              />
            </div>
          </div>

          {/* Generation Info */}
          {isGenerating && (
            <div className="p-4 border-l-4 rounded bg-blue-50 border-blue-500">
              <div className="flex items-center">
                <Loader2 className="animate-spin h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">Generating your newsletter...</p>
                  <p className="text-sm text-blue-700">
                    This may take 10-30 seconds. The AI is creating professional content{selectedKnowledgeSources.length > 0 ? ' using your selected knowledge sources' : ''}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!newsletterTitle.trim() || isGenerating}
            className="bg-gradient-to-r from-indigo-600 to-blue-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Newsletter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

