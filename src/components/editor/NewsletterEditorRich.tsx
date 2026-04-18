import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { buildApiUrl } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save,
  Eye,
  ArrowLeft,
  X,
  Video,
  FileText,
  Sparkles,
  RefreshCw,
  Bell,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Newsletter, MediaReference, NewsletterStyle } from "@/types/newsletter";
import NewsletterPreview from "@/components/NewsletterPreview";
import { AIGenerateDialogRich } from "./AIGenerateDialogRich";
import AIRegenerateDialog from "@/components/AIRegenerateDialog";
import { ThemeSelector } from "./ThemeSelector";
import { NewsletterTheme, getThemeById, getDefaultTheme, newsletterThemes } from "@/themes/newsletter-themes";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import { UserProfile } from "@/components/UserProfile";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";
import "@/components/NewsletterEditor.css";

interface NewsletterEditorRichProps {
  newsletter?: Newsletter;
  onBack: () => void;
  onSave: (newsletter: Newsletter) => void;
}

/**
 * Rich Text Editor Toolbar Component
 */
const EditorToolbar = ({ editor, onImageClick, onVideoClick, onAttachmentClick }: {
  editor: ReturnType<typeof useEditor>;
  onImageClick: () => void;
  onVideoClick: () => void;
  onAttachmentClick: () => void;
}) => {
  if (!editor) return null;

  return (
    <div className="border rounded-lg mb-4 p-2 flex flex-wrap gap-1 bg-gray-50">
      {/* Text Formatting */}
      <Button
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('underline') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      {/* Headings */}
      <Button
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      {/* Lists */}
      <Button
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      {/* Links & Media */}
      <Button
        variant={editor.isActive('link') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        title="Insert Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onImageClick}
        title="Insert Image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onVideoClick}
        title="Insert Video"
      >
        <Video className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAttachmentClick}
        title="Insert Attachment"
      >
        <FileText className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      {/* Alignment */}
      <Button
        variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

/**
 * Main Newsletter Editor Component - Single Editor
 */
const NewsletterEditorRich = ({ newsletter, onBack, onSave }: NewsletterEditorRichProps) => {
  const { user } = useAuth();
  const orgColors = useOrganizationColors();
  const [title, setTitle] = useState(newsletter?.title || '');
  const [subject, setSubject] = useState(newsletter?.subject || '');
  const [media, setMedia] = useState<MediaReference[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<NewsletterTheme>(getDefaultTheme());
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false);
  const [isAIRegenerateOpen, setIsAIRegenerateOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Initialize editor content from newsletter
  const getInitialContent = () => {
    if (newsletter) {
      // If newsletter has html_content, use it
      if (newsletter.html_content) {
        return newsletter.html_content;
      }
      
      // Otherwise try to get content from content structure
      let content = newsletter.content;
      if (typeof content === 'string') {
        try {
          content = JSON.parse(content);
        } catch (e) {
          console.error('Error parsing newsletter content:', e);
        }
      }
      
      if (content && typeof content === 'object') {
        // If it has sections, combine them into single HTML
        if ('sections' in content && Array.isArray(content.sections)) {
          return content.sections.map((s: any) => s.content || '').join('\n\n');
        }
      }
      if (typeof content === 'string' && content.includes('<')) {
        return content;
      }
    }
    return '';
  };

  // Create single TipTap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: { class: 'newsletter-image' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'newsletter-link' },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your newsletter content... You can add headings, paragraphs, lists, images, and more!',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Color,
      TextStyle,
    ],
    content: getInitialContent(),
    onUpdate: () => {
      // Content is automatically managed by TipTap
    },
  });

  // Initialize media and theme from newsletter
  useEffect(() => {
    if (newsletter) {
      let content = newsletter.content;
      if (typeof content === 'string') {
        try {
          content = JSON.parse(content);
        } catch (e) {
          console.error('Error parsing newsletter content:', e);
        }
      }
      
      if (content && typeof content === 'object') {
        // Load media
        if ('media' in content) {
          setMedia(content.media || []);
        }
        
        // Load theme
        if ('style' in content && content.style) {
          const style = content.style;
          if (style.themeId) {
            const theme = getThemeById(style.themeId);
            if (theme) {
              setSelectedTheme(theme);
            }
          } else if (style.colors) {
            // Convert old style format to theme
            const theme = getDefaultTheme();
            // Update theme colors from style
            theme.colors.primary = style.colors.primary || theme.colors.primary;
            theme.colors.secondary = style.colors.secondary || theme.colors.secondary;
            theme.colors.background = style.colors.background || theme.colors.background;
            setSelectedTheme(theme);
          }
        }
      }
    }
  }, [newsletter]);

  // Handle media upload
  const handleMediaUpload = async (file: File, type: 'image' | 'video' | 'attachment') => {
    if (!user?.organization?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User organization not found",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'newsletter');

      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl('/api/upload/media'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const mediaRef: MediaReference = {
        id: data.id || `media_${Date.now()}`,
        type,
        url: data.url,
        alt: file.name,
        filename: file.name,
        size: file.size,
        uploaded_at: new Date().toISOString(),
      };

      setMedia(prev => [...prev, mediaRef]);
      
      // Insert into editor
      if (editor) {
        if (type === 'image') {
          editor.chain().focus().setImage({ src: mediaRef.url, alt: mediaRef.alt || '' }).run();
        } else if (type === 'video') {
          // For video, insert as iframe
          editor.chain().focus().insertContent(`<iframe src="${mediaRef.url}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`).run();
        } else {
          // For attachments, insert as link
          editor.chain().focus().insertContent(`<a href="${mediaRef.url}" download="${file.name}">${file.name}</a>`).run();
        }
      }

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
      });
      
      if (type === 'image') {
        setIsImageDialogOpen(false);
        setImageUrl('');
      } else if (type === 'video') {
        setIsVideoDialogOpen(false);
        setVideoUrl('');
      } else {
        setIsAttachmentDialogOpen(false);
        setAttachmentUrl('');
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to upload ${type}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image URL insertion
  const handleImageUrl = () => {
    if (!imageUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an image URL",
      });
      return;
    }

    const mediaRef: MediaReference = {
      id: `media_${Date.now()}`,
      type: 'image',
      url: imageUrl,
      uploaded_at: new Date().toISOString(),
    };

    setMedia(prev => [...prev, mediaRef]);
    
    if (editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }

    setIsImageDialogOpen(false);
    setImageUrl('');
  };

  // Handle video URL insertion
  const handleVideoUrl = () => {
    if (!videoUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a video URL",
      });
      return;
    }

    const mediaRef: MediaReference = {
      id: `media_${Date.now()}`,
      type: 'video',
      url: videoUrl,
      uploaded_at: new Date().toISOString(),
    };

    setMedia(prev => [...prev, mediaRef]);
    
    if (editor) {
      // Try to detect YouTube/Vimeo URLs and convert to embed
      let embedUrl = videoUrl;
      if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (videoUrl.includes('vimeo.com/')) {
        const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
        if (videoId) {
          embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
      }
      
      editor.chain().focus().insertContent(`<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`).run();
    }

    setIsVideoDialogOpen(false);
    setVideoUrl('');
  };

  // Save newsletter
  const saveNewsletter = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a newsletter title",
      });
      return;
    }

    if (!editor) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Editor not ready",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Get HTML and JSON content from editor
      const htmlContent = editor.getHTML();
      const jsonContent = editor.getJSON();

      // Create content structure - single section with all content
      const style: NewsletterStyle = {
        template: 'professional',
        themeId: selectedTheme.id,
        colors: {
          primary: selectedTheme.colors.primary,
          secondary: selectedTheme.colors.secondary,
          background: selectedTheme.colors.background,
          headerBg: selectedTheme.colors.headerBg,
          footerBg: selectedTheme.colors.footerBg,
          textHeading: selectedTheme.colors.textHeading,
          textBody: selectedTheme.colors.textBody,
          textMuted: selectedTheme.colors.textMuted,
          cardBg: selectedTheme.colors.cardBg,
          border: selectedTheme.colors.border,
        },
        fonts: {
          heading: selectedTheme.fonts.heading,
          body: selectedTheme.fonts.body,
        },
        layout: selectedTheme.layout,
      };

      const content = {
        sections: [{
          id: 'main',
          type: 'text',
          order: 0,
          content: htmlContent,
          metadata: {
            jsonContent,
          },
        }],
        media,
        style,
      };

      const newsletterData: Newsletter = {
        ...(newsletter || {}),
        title,
        subject: subject || title,
        content: content as any,
        html_content: htmlContent,
        status: newsletter?.status || 'draft',
      };

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
        body: JSON.stringify(newsletterData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save newsletter');
      }

      const savedNewsletter = await response.json();
      toast({
        title: "Success",
        description: "Newsletter saved successfully",
      });
      onSave(savedNewsletter);
    } catch (error: any) {
      console.error('Error saving newsletter:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save newsletter",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle AI generation result - combine all sections into single editor
  const handleAIGenerate = (generatedNewsletter: Newsletter) => {
    // Update title and subject
    setTitle(generatedNewsletter.title);
    setSubject(generatedNewsletter.subject || generatedNewsletter.title);
    
    // Convert newsletter sections to single HTML content
    const content = generatedNewsletter.content;
    let htmlContent = '';
    
    if (generatedNewsletter.html_content) {
      htmlContent = generatedNewsletter.html_content;
    } else if (typeof content === 'object' && 'sections' in content) {
      // Combine all sections into single HTML
      htmlContent = content.sections.map((s: any) => s.content || '').join('\n\n');
    }
    
    // Set editor content
    if (editor && htmlContent) {
      editor.commands.setContent(htmlContent);
    }
    
    // Load media if available
    if (typeof content === 'object' && 'media' in content && Array.isArray(content.media)) {
      setMedia(content.media);
    }
    
    // Load theme if available
    if (typeof content === 'object' && 'style' in content && content.style) {
      const style = content.style;
      if (style.themeId) {
        const theme = getThemeById(style.themeId);
        if (theme) {
          setSelectedTheme(theme);
        }
      } else if (style.colors) {
        // Try to match theme by colors or use default
        const matchingTheme = newsletterThemes.find(t => 
          t.colors.primary === style.colors.primary && 
          t.colors.secondary === style.colors.secondary
        );
        if (matchingTheme) {
          setSelectedTheme(matchingTheme);
        }
      }
    }
    
    toast({
      title: "Success",
      description: "AI-generated newsletter loaded. You can now edit and customize it.",
    });
  };

  // Handle AI regenerate result - combine all sections into single editor
  const handleAIRegenerate = (results: any) => {
    // Update title if regenerated
    if (results.title) {
      setTitle(results.title);
    }
    
    // Update subject if regenerated
    if (results.email_subject) {
      setSubject(results.email_subject);
    }
    
    // Update content if sections were regenerated
    if (results.sections && Array.isArray(results.sections)) {
      // Combine all sections into single HTML
      const htmlContent = results.sections.map((s: any) => s.content || '').join('\n\n');
      
      // Set editor content
      if (editor && htmlContent) {
        editor.commands.setContent(htmlContent);
      }
    }
    
    toast({
      title: "Success",
      description: "AI regeneration applied successfully! Header and footer sections have been included.",
    });
  };

  // Get preview sections (single section with all content)
  const getPreviewSections = () => {
    if (!editor) return [];
    
    return [{
      id: 'main',
      type: 'text' as const,
      order: 0,
      content: editor.getHTML(),
      metadata: {},
    }];
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className="flex h-16 shrink-0 items-center gap-2 border-b px-4"
          style={{ backgroundColor: orgColors.primary }}
        >
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Button
            variant="secondary"
            onClick={onBack}
            className="flex items-center gap-2 text-sm hover:bg-gray-50 h-8 px-3 rounded-full bg-white border border-gray-200"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              color: '#111827'
            }}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#3D52A0' }} />
            <span className="font-semibold" style={{ color: '#111827' }}>Back</span>
          </Button>
          <div className="ml-auto flex items-center space-x-4">
            <LanguageChangeDropdown />
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB'
              }}
            >
              <Bell className="h-4 w-4" style={{ color: '#3D52A0' }} />
            </Button>
            <UserProfile />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-6 px-4">
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 mb-6">
            {!newsletter?.id && (
              <Button
                variant="outline"
                onClick={() => setIsAIGenerateOpen(true)}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
            )}
            {newsletter?.id && (
              <Button
                variant="outline"
                onClick={() => setIsAIRegenerateOpen(true)}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                AI Regenerate
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
              <Button onClick={saveNewsletter} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
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
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Newsletter title..."
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject line..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Content</CardTitle>
                <CardDescription>
                  Write and format your newsletter content. Add headings, paragraphs, lists, images, and more.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editor && (
                  <>
                    <EditorToolbar
                      editor={editor}
                      onImageClick={() => setIsImageDialogOpen(true)}
                      onVideoClick={() => setIsVideoDialogOpen(true)}
                      onAttachmentClick={() => setIsAttachmentDialogOpen(true)}
                    />
                    <div className="border rounded-lg p-4 min-h-[500px] bg-white prose prose-sm max-w-none">
                      <EditorContent editor={editor} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ThemeSelector
              selectedThemeId={selectedTheme.id}
              onThemeChange={setSelectedTheme}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Media Library</CardTitle>
              </CardHeader>
              <CardContent>
                {media.length === 0 ? (
                  <p className="text-sm text-gray-500">No media uploaded yet</p>
                ) : (
                  <div className="space-y-2">
                    {media.map((item) => (
                      <div key={item.id} className="border rounded p-2">
                        {item.type === 'image' && (
                          <img src={item.url} alt={item.alt} className="w-full h-24 object-cover rounded" />
                        )}
                        {item.type === 'video' && (
                          <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        {item.type === 'attachment' && (
                          <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1 truncate">{item.filename || item.url}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </div>

          {/* Image Dialog */}
          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
              <DialogDescription>
                Upload an image or provide a URL
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Upload Image</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleMediaUpload(file, 'image');
                    }
                  }}
                  className="mt-2"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <div>
                <Label>Image URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button onClick={handleImageUrl}>Insert</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

          {/* Video Dialog */}
          <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Video</DialogTitle>
              <DialogDescription>
                Upload a video or provide a URL (YouTube, Vimeo, or direct link)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Upload Video</Label>
                <Input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleMediaUpload(file, 'video');
                    }
                  }}
                  className="mt-2"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <div>
                <Label>Video URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <Button onClick={handleVideoUrl}>Insert</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

          {/* Attachment Dialog */}
          <Dialog open={isAttachmentDialogOpen} onOpenChange={setIsAttachmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Attachment</DialogTitle>
              <DialogDescription>
                Upload a file attachment (PDF, DOC, DOCX)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Upload File</Label>
                <Input
                  ref={attachmentInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleMediaUpload(file, 'attachment');
                    }
                  }}
                  className="mt-2"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <div>
                <Label>File URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf"
                  />
                  <Button onClick={() => {
                    if (attachmentUrl && editor) {
                      editor.chain().focus().insertContent(`<a href="${attachmentUrl}" download>${attachmentUrl}</a>`).run();
                      setIsAttachmentDialogOpen(false);
                      setAttachmentUrl('');
                    }
                  }}>Insert</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

          {/* AI Generate Dialog */}
          <AIGenerateDialogRich
            open={isAIGenerateOpen}
            onOpenChange={setIsAIGenerateOpen}
            onGenerate={handleAIGenerate}
          />

          {/* AI Regenerate Dialog */}
          {newsletter?.id && (
            <AIRegenerateDialog
            open={isAIRegenerateOpen}
            onOpenChange={setIsAIRegenerateOpen}
            type="newsletter"
            documentId={newsletter.id}
            onRegenerate={handleAIRegenerate}
            availableOptions={{
              title: true,
              sections: true,
              email_subject: true
            }}
            currentData={{
              title,
              subject,
              sections: editor ? [{
                id: 'main',
                type: 'text',
                order: 0,
                content: editor.getHTML(),
              }] : [],
            }}
            />
          )}

          {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Newsletter Preview</DialogTitle>
                </DialogHeader>
                <NewsletterPreview
                  title={title}
                  subject={subject}
                  sections={getPreviewSections()}
                  style={{
                    template: 'professional',
                    themeId: selectedTheme.id,
                    colors: {
                      primary: selectedTheme.colors.primary,
                      secondary: selectedTheme.colors.secondary,
                      background: selectedTheme.colors.background,
                      headerBg: selectedTheme.colors.headerBg,
                      footerBg: selectedTheme.colors.footerBg,
                      textHeading: selectedTheme.colors.textHeading,
                      textBody: selectedTheme.colors.textBody,
                      textMuted: selectedTheme.colors.textMuted,
                      cardBg: selectedTheme.colors.cardBg,
                      border: selectedTheme.colors.border,
                    },
                    fonts: {
                      heading: selectedTheme.fonts.heading,
                      body: selectedTheme.fonts.body,
                    },
                    layout: selectedTheme.layout,
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default NewsletterEditorRich;
