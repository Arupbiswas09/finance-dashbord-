import { useState, useEffect, useCallback, useRef } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Upload,
  X
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Newsletter, NewsletterSection, MediaReference, TipTapContent } from "@/types/newsletter";
import NewsletterPreview from "./NewsletterPreview";
import "./NewsletterEditor.css";

interface NewsletterEditorRichProps {
  newsletter?: Newsletter;
  onBack: () => void;
  onSave: (newsletter: Newsletter) => void;
}

const NewsletterEditorRich = ({ newsletter, onBack, onSave }: NewsletterEditorRichProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(newsletter?.title || '');
  const [subject, setSubject] = useState(newsletter?.subject || '');
  const [media, setMedia] = useState<MediaReference[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // If it has sections, combine them
        if ('sections' in content && Array.isArray(content.sections)) {
          return content.sections.map((s: NewsletterSection) => s.content).join('\n');
        }
      }
      if (typeof content === 'string' && content.includes('<')) {
        return content;
      }
    }
    return '';
  };

  // Create TipTap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'newsletter-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'newsletter-link',
        },
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

  // Initialize media from newsletter
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
      
      if (content && typeof content === 'object' && 'media' in content) {
        setMedia(content.media || []);
      }
    }
  }, [newsletter]);


  const handleImageUpload = async (file: File) => {
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
        type: 'image',
        url: data.url,
        alt: file.name,
        filename: file.name,
        size: file.size,
        uploaded_at: new Date().toISOString(),
      };

      setMedia(prev => [...prev, mediaRef]);
      
      // Insert image into editor
      if (editor) {
        editor.chain().focus().setImage({ src: mediaRef.url, alt: mediaRef.alt }).run();
      }

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      
      setIsImageDialogOpen(false);
      setImageUrl('');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

      // Create content structure
      const content = {
        sections: [{
          id: 'main',
          type: 'text',
          order: 0,
          content: htmlContent,
          metadata: {
            jsonContent: jsonContent,
          },
        }],
        media,
        style: {
          template: 'professional',
          colors: {
            primary: '#1f2937',
            secondary: '#6b7280',
          },
          fonts: {
            heading: 'Arial',
            body: 'Arial',
          },
        },
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

  if (!editor) {
    return <div>Loading editor...</div>;
  }

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
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={saveNewsletter} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
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
                {/* Toolbar */}
                <div className="border rounded-lg mb-4 p-2 flex flex-wrap gap-1">
                          <Button
                            variant={editor.isActive('bold') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                          >
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={editor.isActive('italic') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                          >
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={editor.isActive('underline') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                          >
                            <UnderlineIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={editor.isActive('strike') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                          >
                            <Strikethrough className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-6 bg-gray-300 mx-1" />
                          <Button
                            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                          >
                            <Heading1 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                          >
                            <Heading2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                          >
                            <Heading3 className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-6 bg-gray-300 mx-1" />
                          <Button
                            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                          >
                            <ListOrdered className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                          >
                            <Quote className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-6 bg-gray-300 mx-1" />
                          <Button
                            variant={editor.isActive('link') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => {
                              const url = window.prompt('Enter URL:');
                              if (url) {
                                editor.chain().focus().setLink({ href: url }).run();
                              }
                            }}
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
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
                                        handleImageUpload(file);
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
                          <div className="w-px h-6 bg-gray-300 mx-1" />
                          <Button
                            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                          >
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                          >
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                          >
                            <AlignRight className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-6 bg-gray-300 mx-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                          >
                            <Undo className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                          >
                            <Redo className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Editor */}
                        <div className="border rounded-lg p-4 min-h-[500px] bg-white prose prose-sm max-w-none">
                          <EditorContent editor={editor} />
                        </div>
                      </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                        <p className="text-xs text-gray-500 mt-1 truncate">{item.filename || item.url}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Newsletter Preview</DialogTitle>
            </DialogHeader>
            <NewsletterPreview
              title={title}
              subject={subject}
              sections={editor ? [{
                id: 'main',
                type: 'text',
                order: 0,
                content: editor.getHTML(),
                metadata: {},
              }] : []}
              style={{
                template: 'professional',
                colors: { primary: '#1f2937', secondary: '#6b7280' },
                fonts: { heading: 'Arial', body: 'Arial' },
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NewsletterEditorRich;

