import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { templates } from '@/templates/newsletters';
import { NewsletterTemplate } from '@/types/newsletter-builder';
import KnowledgeSourceManager from '@/components/KnowledgeSourceManager';
import { buildApiUrl } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (newsletter: any) => void;
}

export const AIGenerateDialog = ({ open, onOpenChange, onGenerate }: AIGenerateDialogProps) => {
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [wordCount, setWordCount] = useState(2000);
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<number[]>([]);
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
      const template = templates.find(t => t.id === selectedTemplate);
      
      const response = await fetch(buildApiUrl('/api/newsletters/generate'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newsletterTitle,
          custom_prompt: generationPrompt || undefined,
          template: selectedTemplate, // Pass template ID
          template_theme: template?.theme, // Pass template theme
          include_financial_data: true,
          include_graphs: true,
          include_images: true,
          language: selectedLanguage,
          word_count: wordCount,
          knowledge_source_ids: selectedKnowledgeSources,
        }),
      });

      if (response.ok) {
        const newsletter = await response.json();
        toast({
          title: 'Success',
          description: 'Newsletter generated successfully!',
        });
        
        // Convert old format to new block format
        const convertedNewsletter = convertToBlockFormat(newsletter, template);
        onGenerate(convertedNewsletter);
        onOpenChange(false);
        
        // Reset form
        setNewsletterTitle('');
        setGenerationPrompt('');
        setSelectedKnowledgeSources([]);
      } else {
        const error = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.detail || 'Failed to generate newsletter',
        });
      }
    } catch (error) {
      console.error('Error generating newsletter:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate newsletter',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const convertToBlockFormat = (newsletter: any, template?: NewsletterTemplate): any => {
    // Convert old section-based format to new block format
    const blocks: any[] = [];
    
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
    
    if (content?.sections && Array.isArray(content.sections)) {
      content.sections.forEach((section: any, index: number) => {
        // Map old section types to new block types based on title/content
        let blockType: 'hero' | 'metrics' | 'article' | 'twoColumn' | 'checklist' | 'footer' = 'article';
        const titleLower = (section.title || '').toLowerCase();
        const contentLower = (section.content || '').toLowerCase();
        
        if (index === 0 && (titleLower.includes('welcome') || titleLower.includes('introduction') || titleLower.includes('overview'))) {
          blockType = 'hero';
        } else if (titleLower.includes('metric') || titleLower.includes('kpi') || titleLower.includes('key performance') || contentLower.includes('revenue') && contentLower.includes('%')) {
          blockType = 'metrics';
        } else if (titleLower.includes('footer') || titleLower.includes('contact') || index === content.sections.length - 1) {
          blockType = 'footer';
        } else {
          blockType = 'article';
        }

        blocks.push({
          id: section.id || `block_${Date.now()}_${index}`,
          type: blockType,
          data: getBlockDataFromSection(section, blockType),
          order: index,
        });
      });
    }

    // If no sections, create default blocks from template
    if (blocks.length === 0 && template) {
      blocks.push(...template.blocks.map((block, index) => ({
        id: `block_${Date.now()}_${index}`,
        ...block,
        order: index,
      })));
    }

    return {
      id: newsletter.id?.toString(),
      title: newsletter.title,
      subject: newsletter.subject,
      template: selectedTemplate,
      theme: template?.theme || templates[0].theme,
      content: content,
      blocks,
      html: newsletter.html_content,
      status: newsletter.status || 'draft',
      ai_generated: true,
    };
  };

  const getBlockDataFromSection = (section: any, blockType: string): any => {
    switch (blockType) {
      case 'hero':
        // Extract first paragraph as subtitle
        const contentText = section.content || '';
        const firstParagraph = contentText.replace(/<[^>]*>/g, '').substring(0, 150);
        return {
          title: section.title || '',
          subtitle: firstParagraph || '',
          alignment: 'center',
          dateBadge: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };
      case 'metrics':
        // Try to extract metrics from content - look for numbers and percentages
        const metrics: any[] = [];
        const content = section.content || '';
        const numberMatches = content.match(/(\$?[\d,]+(?:\.\d+)?[%MBK]?)/g);
        if (numberMatches && numberMatches.length >= 3) {
          metrics.push(
            { label: 'Revenue', value: numberMatches[0], trend: 'up' },
            { label: 'Growth', value: numberMatches[1] || 'N/A', trend: 'up' },
            { label: 'Clients', value: numberMatches[2] || 'N/A', trend: 'up' },
          );
        } else {
          metrics.push(
            { label: 'Metric 1', value: 'N/A', trend: 'neutral' },
            { label: 'Metric 2', value: 'N/A', trend: 'neutral' },
            { label: 'Metric 3', value: 'N/A', trend: 'neutral' },
          );
        }
        return { metrics };
      case 'footer':
        return {
          companyName: 'Your Company',
          contactInfo: {
            email: 'contact@company.com',
          },
          unsubscribeText: 'Unsubscribe from this list',
        };
      default:
        return {
          title: section.title || '',
          content: section.content || '<p></p>',
        };
    }
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
            Generate professional newsletters with AI assistance using your selected template style
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div>
            <Label>Template Style</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              The AI will generate content matching this template's style and structure
            </p>
          </div>

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
          </div>

          {/* Custom Prompt */}
          <div>
            <Label>Custom Prompt (Optional)</Label>
            <Textarea
              placeholder="Add any specific instructions for the AI to customize the newsletter content..."
              value={generationPrompt}
              onChange={(e) => setGenerationPrompt(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to generate content based on latest financial trends and regulations
            </p>
          </div>

          {/* Knowledge Sources */}
          <div>
            <Label>Knowledge Sources (Optional)</Label>
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
                    This may take 10-30 seconds. The AI is creating professional content matching your selected template style.
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

