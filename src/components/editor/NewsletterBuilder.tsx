import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, GripVertical, Trash2, Eye, Save, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { buildApiUrl } from '@/lib/api';
import { NewsletterBuilderData, NewsletterBlock, BlockType, ThemeOptions } from '@/types/newsletter-builder';
import { HeroBlock } from './blocks/HeroBlock';
import { MetricsBlock } from './blocks/MetricsBlock';
import { ArticleBlock } from './blocks/ArticleBlock';
import { TwoColumnBlock } from './blocks/TwoColumnBlock';
import { ChecklistBlock } from './blocks/ChecklistBlock';
import { FooterBlock } from './blocks/FooterBlock';
import { templates, getTemplateById } from '@/templates/newsletters';
import { ThemeCustomizer } from './ThemeCustomizer';
import { NewsletterRenderer } from '../newsletter/NewsletterRenderer';
import { AIGenerateDialog } from './AIGenerateDialog';
import { Sparkles, RefreshCw } from 'lucide-react';
import AIRegenerateDialog from '@/components/AIRegenerateDialog';

interface NewsletterBuilderProps {
  newsletter?: NewsletterBuilderData;
  onBack: () => void;
  onSave: (newsletter: NewsletterBuilderData) => void;
}

const blockComponents = {
  hero: HeroBlock,
  metrics: MetricsBlock,
  article: ArticleBlock,
  twoColumn: TwoColumnBlock,
  checklist: ChecklistBlock,
  footer: FooterBlock,
};

const blockLabels: Record<BlockType, string> = {
  hero: 'Hero Section',
  metrics: 'Metrics (KPIs)',
  article: 'Article',
  twoColumn: 'Two Column',
  checklist: 'Checklist',
  footer: 'Footer',
};

interface SortableBlockItemProps {
  block: NewsletterBlock;
  theme: ThemeOptions;
  onUpdate: (block: NewsletterBlock) => void;
  onDelete: (id: string) => void;
}

function SortableBlockItem({ block, theme, onUpdate, onDelete }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const BlockComponent = blockComponents[block.type];

  return (
    <Card ref={setNodeRef} style={style} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <CardTitle className="text-sm">{blockLabels[block.type]}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(block.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {BlockComponent && (
          <BlockComponent
            data={block.data as any}
            onChange={(data) => onUpdate({ ...block, data })}
            theme={theme}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to convert blocks to sections format for API
function convertBlocksToSections(blocks: NewsletterBlock[]): any[] {
  return blocks.map((block, index) => ({
    id: block.id,
    type: block.type,
    title: getBlockTitle(block),
    content: getBlockContent(block),
    order: index
  }));
}

function getBlockTitle(block: NewsletterBlock): string {
  switch (block.type) {
    case 'hero':
      return (block.data as any).title || '';
    case 'metrics':
      return 'Key Metrics';
    case 'article':
      return (block.data as any).title || '';
    case 'twoColumn':
      return (block.data as any).left?.title || (block.data as any).right?.title || 'Two Column Content';
    case 'checklist':
      return (block.data as any).title || 'Checklist';
    case 'footer':
      return 'Footer';
    default:
      return '';
  }
}

function getBlockContent(block: NewsletterBlock): string {
  switch (block.type) {
    case 'hero':
      const heroData = block.data as any;
      return heroData.subtitle || '';
    case 'metrics':
      const metricsData = block.data as any;
      return JSON.stringify(metricsData.metrics || []);
    case 'article':
      const articleData = block.data as any;
      return articleData.content || '';
    case 'twoColumn':
      const twoColData = block.data as any;
      return `${twoColData.left?.content || ''}\n\n${twoColData.right?.content || ''}`;
    case 'checklist':
      const checklistData = block.data as any;
      return (checklistData.items || []).map((item: any) => `${item.checked ? '✓' : '○'} ${item.text}`).join('\n');
    case 'footer':
      const footerData = block.data as any;
      return `${footerData.companyName || ''}\n${footerData.contactInfo?.email || ''}\n${footerData.contactInfo?.phone || ''}`;
    default:
      return '';
  }
}

export const NewsletterBuilder = ({ newsletter, onBack, onSave }: NewsletterBuilderProps) => {
  const [title, setTitle] = useState(newsletter?.title || '');
  const [subject, setSubject] = useState(newsletter?.subject || '');
  const [templateId, setTemplateId] = useState(newsletter?.template || templates[0].id);
  const [blocks, setBlocks] = useState<NewsletterBlock[]>(newsletter?.blocks || []);
  const [theme, setTheme] = useState<ThemeOptions>(
    newsletter?.theme || getTemplateById(templateId)?.theme || templates[0].theme
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false);
  const [isAIRegenerateOpen, setIsAIRegenerateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const template = getTemplateById(templateId);
    if (template) {
      setTheme(template.theme);
      if (blocks.length === 0) {
        setBlocks(
          template.blocks.map((block, index) => ({
            id: `block_${Date.now()}_${index}`,
            ...block,
            order: index,
          }))
        );
      }
    }
  }, [templateId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex).map((block, index) => ({
          ...block,
          order: index,
        }));
      });
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: NewsletterBlock = {
      id: `block_${Date.now()}`,
      type,
      data: getDefaultBlockData(type),
      order: blocks.length,
    };
    setBlocks([...blocks, newBlock]);
    setIsAddBlockOpen(false);
  };

  const updateBlock = (updatedBlock: NewsletterBlock) => {
    setBlocks(blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id).map((block, index) => ({
      ...block,
      order: index,
    })));
  };

  const handleAIRegenerateResults = (results: any) => {
    // Convert regenerated sections back to blocks - ALWAYS create hero and footer
    const newBlocks: NewsletterBlock[] = [];

    if (results.title) {
      setTitle(results.title);
    }

    if (results.email_subject) {
      setSubject(results.email_subject);
    }

    // Convert regenerated sections to blocks
    if (results.sections && Array.isArray(results.sections) && results.sections.length > 0) {
      results.sections.forEach((section: any, index: number) => {
        let blockType: BlockType = 'article';
        const sectionTitle = (section.title || '').toLowerCase();
        const sectionContent = (section.content || '').toLowerCase();
        const isFirst = index === 0;
        const isLast = index === results.sections.length - 1;

        // ALWAYS make first section a hero block
        if (isFirst) {
          blockType = 'hero';
        }
        // ALWAYS make last section a footer block
        else if (isLast) {
          blockType = 'footer';
        }
        // Check for metrics based on content
        else if (sectionTitle.includes('metric') || sectionTitle.includes('kpi') || sectionTitle.includes('key performance') || 
                 sectionContent.includes('revenue') || sectionContent.includes('growth') || sectionContent.includes('$') ||
                 sectionContent.includes('%') || sectionTitle.includes('performance')) {
          blockType = 'metrics';
        }
        // Default to article
        else {
          blockType = 'article';
        }

        // Create block data based on type
        let blockData: any;
        switch (blockType) {
          case 'hero':
            // Use the section title and content for hero
            const heroContent = section.content || '';
            const cleanContent = heroContent.replace(/<[^>]*>/g, '').trim();
            blockData = {
              title: section.title || title || 'Newsletter Title',
              subtitle: cleanContent.substring(0, 300) || 'Welcome to our newsletter',
              alignment: 'center',
              dateBadge: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            };
            break;
          case 'metrics':
            // Try to extract metrics from content
            const metrics: any[] = [];
            const content = section.content || '';
            const numberMatches = content.match(/(\$?[\d,]+(?:\.\d+)?[%MBK]?)/g);
            
            // Try to extract label-value pairs from the content
            if (sectionTitle && content) {
              // Look for patterns like "Revenue: $1.2M" or "Growth: 24%"
              const lines = content
                .split("\n")
                .map((line: string) => line.trim())
                .filter((line: string) => line.length > 0);
              lines.slice(0, 3).forEach((line: string, idx: number) => {
                const match = line.match(/([^:]+):\s*([$%\d,\s]+)/);
                if (match) {
                  metrics.push({
                    label: match[1].trim(),
                    value: match[2].trim(),
                    trend: 'up'
                  });
                } else if (numberMatches && numberMatches[idx]) {
                  metrics.push({
                    label: `Metric ${idx + 1}`,
                    value: numberMatches[idx],
                    trend: 'up'
                  });
                }
              });
            }
            
            // Fallback to extracted numbers
            if (metrics.length === 0 && numberMatches && numberMatches.length >= 3) {
              metrics.push(
                { label: 'Revenue', value: numberMatches[0], trend: 'up' },
                { label: 'Growth', value: numberMatches[1] || 'N/A', trend: 'up' },
                { label: 'Clients', value: numberMatches[2] || 'N/A', trend: 'up' },
              );
            }
            
            // Final fallback
            if (metrics.length === 0) {
              metrics.push(
                { label: 'Metric 1', value: 'N/A', trend: 'neutral' },
                { label: 'Metric 2', value: 'N/A', trend: 'neutral' },
                { label: 'Metric 3', value: 'N/A', trend: 'neutral' },
              );
            }
            
            blockData = { metrics: metrics.slice(0, 3) };
            break;
          case 'footer':
            // Extract footer information from section content
            const footerContent = section.content || '';
            const footerTitle = section.title || '';
            
            // Try to extract company name, email, phone from content
            const emailMatch = footerContent.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            const phoneMatch = footerContent.match(/(\+?[\d\s\-()]+)/);
            
            blockData = {
              companyName: footerTitle || 'Your Company',
              contactInfo: {
                email: emailMatch ? emailMatch[1] : 'contact@company.com',
                phone: phoneMatch ? phoneMatch[1] : '',
              },
              unsubscribeText: 'Unsubscribe from this list',
            };
            break;
          default:
            blockData = {
              title: section.title || '',
              content: section.content || '<p></p>',
            };
        }

        newBlocks.push({
          id: section.id || `block_${Date.now()}_${index}`,
          type: blockType,
          data: blockData,
          order: index,
        });
      });
      
      // Ensure we ALWAYS have a hero block at the start
      if (newBlocks.length > 0 && newBlocks[0]?.type !== 'hero') {
        const heroBlock: NewsletterBlock = {
          id: `block_hero_${Date.now()}`,
          type: 'hero',
          data: {
            title: title || 'Newsletter Title',
            subtitle: 'Welcome to our newsletter',
            alignment: 'center',
            dateBadge: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          },
          order: 0,
        };
        newBlocks.unshift(heroBlock);
        // Reorder all blocks
        newBlocks.forEach((block, idx) => {
          block.order = idx;
        });
      }
      
      // Ensure we ALWAYS have a footer block at the end
      if (newBlocks.length > 0 && newBlocks[newBlocks.length - 1]?.type !== 'footer') {
        const footerBlock: NewsletterBlock = {
          id: `block_footer_${Date.now()}`,
          type: 'footer',
          data: {
            companyName: 'Your Company',
            contactInfo: {
              email: 'contact@company.com',
            },
            unsubscribeText: 'Unsubscribe from this list',
          },
          order: newBlocks.length,
        };
        newBlocks.push(footerBlock);
        // Reorder all blocks
        newBlocks.forEach((block, idx) => {
          block.order = idx;
        });
      }
    }

    // If no sections were regenerated but we have existing blocks, keep them
    if ((!results.sections || results.sections.length === 0) && blocks.length > 0) {
      // Don't replace blocks if no sections were regenerated
      toast({
        title: 'Info',
        description: 'No sections were regenerated. Existing blocks preserved.',
      });
      return;
    }

    // Update blocks with regenerated content
    if (newBlocks.length > 0) {
      setBlocks(newBlocks);
      
      toast({
        title: 'Success',
        description: 'AI regeneration applied successfully! Hero and footer blocks have been preserved/created.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No blocks were generated from the regeneration.',
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      // Convert blocks to TipTap JSON structure
      const content = {
        type: 'doc',
        content: blocks.map((block) => ({
          type: 'block',
          attrs: {
            blockType: block.type,
            blockId: block.id,
          },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(block.data),
                },
              ],
            },
          ],
        })),
      };

      const newsletterData: NewsletterBuilderData = {
        ...(newsletter || {}),
        title,
        subject: subject || title,
        template: templateId,
        theme,
        content,
        blocks,
        status: newsletter?.status || 'draft',
      };

      // Save to API
      const token = localStorage.getItem('access_token');
      const method = newsletter?.id ? 'PUT' : 'POST';
      const url = newsletter?.id 
        ? `/api/newsletters/${newsletter.id}`
        : '/api/newsletters';

      const response = await fetch(buildApiUrl(url), {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newsletterData.title,
          subject: newsletterData.subject,
          content: {
            template: newsletterData.template,
            theme: newsletterData.theme,
            blocks: newsletterData.blocks,
            sections: newsletterData.blocks, // For backward compatibility
            style: {
              template: newsletterData.template,
              colors: {
                primary: newsletterData.theme.primary,
                secondary: newsletterData.theme.accent,
              },
              fonts: {
                heading: 'Arial',
                body: 'Arial',
              },
            },
          },
          html_content: newsletterData.html,
          status: newsletterData.status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save newsletter');
      }

      const savedNewsletter = await response.json();
      toast({
        title: 'Success',
        description: 'Newsletter saved successfully',
      });
      onSave({
        ...newsletterData,
        id: savedNewsletter.id?.toString(),
      });
    } catch (error: any) {
      console.error('Error saving newsletter:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save newsletter',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {newsletter?.id ? 'Edit Newsletter' : 'Create Newsletter'}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            {newsletter?.id && (
              <Button
                variant="outline"
                onClick={() => setIsAIRegenerateOpen(true)}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                AI Regenerate
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsAIGenerateOpen(true)}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-6">
            {/* Newsletter Details */}
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Newsletter title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Email subject line"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Template</label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Blocks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Content Blocks</CardTitle>
                  <Dialog open={isAddBlockOpen} onOpenChange={setIsAddBlockOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Block
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Block</DialogTitle>
                        <DialogDescription>
                          Choose a block type to add to your newsletter
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {(Object.keys(blockLabels) as BlockType[]).map((type) => (
                          <Button
                            key={type}
                            variant="outline"
                            onClick={() => addBlock(type)}
                            className="h-auto p-4 flex flex-col"
                          >
                            <span className="font-medium">{blockLabels[type]}</span>
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {blocks.map((block) => (
                      <SortableBlockItem
                        key={block.id}
                        block={block}
                        theme={theme}
                        onUpdate={updateBlock}
                        onDelete={deleteBlock}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {blocks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No blocks yet. Click "Add Block" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ThemeCustomizer theme={theme} onChange={setTheme} />
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Newsletter Preview</DialogTitle>
            </DialogHeader>
            <NewsletterRenderer
              title={title}
              subject={subject}
              blocks={blocks}
              theme={theme}
            />
          </DialogContent>
        </Dialog>

        {/* AI Generate Dialog */}
        <AIGenerateDialog
          open={isAIGenerateOpen}
          onOpenChange={setIsAIGenerateOpen}
          onGenerate={(generatedNewsletter) => {
            // Update the builder with generated content
            setTitle(generatedNewsletter.title);
            setSubject(generatedNewsletter.subject);
            setTemplateId(generatedNewsletter.template);
            setTheme(generatedNewsletter.theme);
            setBlocks(generatedNewsletter.blocks || []);
          }}
        />

        {/* AI Regenerate Dialog */}
        {newsletter?.id && (
          <AIRegenerateDialog
            open={isAIRegenerateOpen}
            onOpenChange={setIsAIRegenerateOpen}
            type="newsletter"
            documentId={parseInt(newsletter.id)}
            onRegenerate={(results) => {
              // Convert regenerated sections to blocks while preserving structure
              handleAIRegenerateResults(results);
            }}
            availableOptions={{
              title: true,
              sections: true,
              email_subject: true
            }}
            currentData={{
              title,
              subject,
              sections: convertBlocksToSections(blocks),
              blocks: blocks,
              style: {
                template: templateId,
                colors: { primary: theme.primary, secondary: theme.accent },
                fonts: { heading: 'Arial', body: 'Arial' }
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

function getDefaultBlockData(type: BlockType): any {
  switch (type) {
    case 'hero':
      return { title: '', subtitle: '', alignment: 'center' };
    case 'metrics':
      return { metrics: [{ label: '', value: '', trend: 'neutral' }] };
    case 'article':
      return { title: '', content: '<p></p>' };
    case 'twoColumn':
      return { left: { content: '<p></p>' }, right: { content: '<p></p>' } };
    case 'checklist':
      return { items: [{ text: '', checked: false }] };
    case 'footer':
      return { companyName: '', contactInfo: {} };
    default:
      return {};
  }
}

