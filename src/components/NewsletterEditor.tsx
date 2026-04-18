import { useState, useEffect } from "react";
import { buildApiUrl } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Eye, Send, Calendar, Sparkles, Mail, FileText, Save, ArrowLeft, Settings, Users, RefreshCw, Bell } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AIRegenerateDialog from '@/components/AIRegenerateDialog';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import { UserProfile } from "@/components/UserProfile";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";

interface NewsletterSection {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
}

interface Newsletter {
  id?: number;
  title: string;
  subject: string;
  content: {
    sections: NewsletterSection[];
    images: any[];
    graphs: any[];
    style: {
      template: string;
      colors: { primary: string; secondary: string };
      fonts: { heading: string; body: string };
    };
    sources?: Array<{
      title: string;
      url: string;
      description?: string;
    }>;
  };
  html_content?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduled_at?: string;
  ai_generated?: boolean;
}

interface EmailList {
  id: number;
  name: string;
  total_subscribers: number;
  active_subscribers: number;
  is_active: boolean;
}

interface NewsletterEditorProps {
  newsletter?: Newsletter;
  onBack: () => void;
  onSave: (newsletter: Newsletter) => void;
}

const NewsletterEditor = ({ newsletter, onBack, onSave }: NewsletterEditorProps) => {
  const orgColors = useOrganizationColors();
  const [currentNewsletter, setCurrentNewsletter] = useState<Newsletter>(
    newsletter || {
      title: '',
      subject: '',
      content: {
        sections: [],
        images: [],
        graphs: [],
        style: {
          template: 'professional',
          colors: { primary: '#1f2937', secondary: '#6b7280' },
          fonts: { heading: 'Arial', body: 'Arial' }
        }
      },
      status: 'draft'
    }
  );

  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [selectedEmailLists, setSelectedEmailLists] = useState<number[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Regeneration state
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

  // Update newsletter when prop changes
  useEffect(() => {
    if (newsletter) {
      // Parse content if it's a string
      let parsedNewsletter = { ...newsletter };

      if (typeof newsletter.content === 'string') {
        try {
          parsedNewsletter.content = JSON.parse(newsletter.content);
        } catch (e) {
          console.error('Error parsing newsletter content:', e);
          parsedNewsletter.content = {
            sections: [],
            images: [],
            graphs: [],
            style: {
              template: 'professional',
              colors: { primary: '#1f2937', secondary: '#6b7280' },
              fonts: { heading: 'Arial', body: 'Arial' }
            }
          };
        }
      }

      // Ensure content has the expected structure
      if (!parsedNewsletter.content.sections) {
        parsedNewsletter.content.sections = [];
      }
      if (!parsedNewsletter.content.images) {
        parsedNewsletter.content.images = [];
      }
      if (!parsedNewsletter.content.graphs) {
        parsedNewsletter.content.graphs = [];
      }
      if (!parsedNewsletter.content.style) {
        parsedNewsletter.content.style = {
          template: 'professional',
          colors: { primary: '#1f2937', secondary: '#6b7280' },
          fonts: { heading: 'Arial', body: 'Arial' }
        };
      }

      setCurrentNewsletter(parsedNewsletter);
    }
  }, [newsletter]);

  useEffect(() => {
    fetchEmailLists();
  }, []);

  const fetchEmailLists = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl('/api/email-lists'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmailLists(data.filter((list: EmailList) => list.is_active));
      }
    } catch (error) {
      console.error('Error fetching email lists:', error);
    }
  };

  const handleSectionUpdate = (index: number, field: keyof NewsletterSection, value: string) => {
    const updatedSections = [...currentNewsletter.content.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    
    setCurrentNewsletter({
      ...currentNewsletter,
      content: {
        ...currentNewsletter.content,
        sections: updatedSections
      }
    });
  };

  const addSection = () => {
    const newSection: NewsletterSection = {
      id: `section_${Date.now()}`,
      type: 'text',
      title: 'New Section',
      content: '',
      order: currentNewsletter.content.sections.length
    };

    setCurrentNewsletter({
      ...currentNewsletter,
      content: {
        ...currentNewsletter.content,
        sections: [...currentNewsletter.content.sections, newSection]
      }
    });
  };

  const removeSection = (index: number) => {
    const updatedSections = currentNewsletter.content.sections.filter((_, i) => i !== index);
    setCurrentNewsletter({
      ...currentNewsletter,
      content: {
        ...currentNewsletter.content,
        sections: updatedSections.map((section, i) => ({ ...section, order: i }))
      }
    });
  };

  const saveNewsletter = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const method = currentNewsletter.id ? 'PUT' : 'POST';
      const url = currentNewsletter.id 
        ? `/api/newsletters/${currentNewsletter.id}`
        : '/api/newsletters';

      const response = await fetch(buildApiUrl(url), {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...currentNewsletter,
          email_list_ids: selectedEmailLists
        })
      });

      if (response.ok) {
        const savedNewsletter = await response.json();
        toast({
          title: "Success",
          description: "Newsletter saved successfully"
        });
        onSave(savedNewsletter);
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.detail || "Failed to save newsletter"
        });
      }
    } catch (error) {
      console.error('Error saving newsletter:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save newsletter"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendNewsletter = async (scheduleAt?: string) => {
    if (selectedEmailLists.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one email list"
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/newsletters/${currentNewsletter.id}/send`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_list_ids: selectedEmailLists,
          schedule_at: scheduleAt || undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message
        });
        setIsSendDialogOpen(false);
        setIsScheduleDialogOpen(false);
        onBack(); // Go back to list
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.detail || "Failed to send newsletter"
        });
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send newsletter"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = () => {
    let htmlContent = `
      <div style="font-family: ${currentNewsletter.content.style.fonts.body}; max-width: 600px; margin: 0 auto; background: white; padding: 20px;">
        <h1 style="color: ${currentNewsletter.content.style.colors.primary}; font-family: ${currentNewsletter.content.style.fonts.heading}; text-align: center; border-bottom: 2px solid ${currentNewsletter.content.style.colors.secondary}; padding-bottom: 10px;">
          ${currentNewsletter.subject}
        </h1>
    `;

    currentNewsletter.content.sections.forEach(section => {
      htmlContent += `
        <div style="margin: 20px 0;">
          <h2 style="color: ${currentNewsletter.content.style.colors.primary}; font-family: ${currentNewsletter.content.style.fonts.heading};">
            ${section.title}
          </h2>
          <div style="color: #333; line-height: 1.6;">
            ${section.content.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    });

    htmlContent += '</div>';
    return htmlContent;
  };

  const handleRegenerateResults = (results: any) => {
    // Apply regenerated content based on what was generated
    if (results.title) {
      setCurrentNewsletter(prev => ({ ...prev, title: results.title }));
    }
    if (results.email_subject) {
      setCurrentNewsletter(prev => ({ ...prev, subject: results.email_subject }));
    }
    if (results.sections && Array.isArray(results.sections)) {
      setCurrentNewsletter(prev => ({
        ...prev,
        content: {
          ...prev.content,
          sections: results.sections.map((section: any, index: number) => ({
            id: section.id || `section_${Date.now()}_${index}`,
            type: section.type || 'text',
            title: section.title,
            content: section.content,
            order: index
          }))
        }
      }));
    }
    
    toast({
      title: "Success",
      description: "AI regeneration applied successfully!",
    });
  };

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
          <div className="container py-4 md:py-6 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div>
                  <h1 className="text-base md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {currentNewsletter.id ? 'Edit Newsletter' : 'Create Newsletter'}
                  </h1>
                  {currentNewsletter.ai_generated && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      <Sparkles className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <Button
              variant="outline"
              onClick={saveNewsletter}
              disabled={loading}
              className="flex-1 sm:flex-none h-8 md:h-9 text-xs md:text-sm"
              size="sm"
            >
              <Save className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Save Draft</span>
              <span className="sm:hidden">Save</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRegenerateDialog(true)}
              disabled={loading}
              className="border-purple-200 text-purple-600 hover:bg-purple-50 flex-1 sm:flex-none h-8 md:h-9 text-xs md:text-sm"
              size="sm"
            >
              <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">AI Regenerate</span>
              <span className="sm:hidden">AI</span>
            </Button>
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none h-8 md:h-9 text-xs md:text-sm" size="sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-base md:text-lg">Schedule Newsletter</DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">Choose when to send this newsletter</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium">Send Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="mt-1 text-xs md:text-sm h-8 md:h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium">Email Lists</label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {emailLists.map(list => (
                        <div key={list.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`list-${list.id}`}
                            checked={selectedEmailLists.includes(list.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEmailLists([...selectedEmailLists, list.id]);
                              } else {
                                setSelectedEmailLists(selectedEmailLists.filter(id => id !== list.id));
                              }
                            }}
                          />
                          <label htmlFor={`list-${list.id}`} className="text-xs md:text-sm">
                            {list.name} ({list.active_subscribers} subscribers)
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => sendNewsletter(scheduledDate)}
                    disabled={loading || !scheduledDate}
                    className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-9"
                  >
                    Schedule Newsletter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-blue-600">
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Newsletter</DialogTitle>
                  <DialogDescription>Select email lists to send this newsletter to</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email Lists</label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {emailLists.map(list => (
                        <div key={list.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`send-list-${list.id}`}
                            checked={selectedEmailLists.includes(list.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEmailLists([...selectedEmailLists, list.id]);
                              } else {
                                setSelectedEmailLists(selectedEmailLists.filter(id => id !== list.id));
                              }
                            }}
                          />
                          <label htmlFor={`send-list-${list.id}`} className="text-sm">
                            {list.name} ({list.active_subscribers} subscribers)
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedEmailLists.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Total recipients: {selectedEmailLists.reduce((sum, id) => {
                          const list = emailLists.find(l => l.id === id);
                          return sum + (list?.active_subscribers || 0);
                        }, 0)}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => sendNewsletter()}
                    disabled={loading || selectedEmailLists.length === 0}
                  >
                    Send Newsletter Now
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Newsletter Details */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Newsletter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
                <div>
                  <label className="text-xs md:text-sm font-medium">Title</label>
                  <Input
                    value={currentNewsletter.title}
                    onChange={(e) => setCurrentNewsletter({...currentNewsletter, title: e.target.value})}
                    placeholder="Newsletter title..."
                    className="text-xs md:text-sm h-8 md:h-9 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium">Email Subject</label>
                  <Input
                    value={currentNewsletter.subject}
                    onChange={(e) => setCurrentNewsletter({...currentNewsletter, subject: e.target.value})}
                    placeholder="Email subject line..."
                    className="text-xs md:text-sm h-8 md:h-9 mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Sections */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <CardTitle className="text-base md:text-lg">Content Sections</CardTitle>
                  <Button onClick={addSection} size="sm" className="text-xs md:text-sm h-8 w-full sm:w-auto">
                    <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Add Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
                {currentNewsletter.content.sections.length === 0 ? (
                  <div className="text-center py-6 md:py-8 text-xs md:text-sm text-gray-500">
                    No content sections yet. Add a section to get started.
                  </div>
                ) : (
                  currentNewsletter.content.sections.map((section, index) => (
                    <Card key={section.id} className="border">
                      <CardHeader className="pb-3 p-3 md:p-6">
                        <div className="flex justify-between items-center gap-2">
                          <Input
                            value={section.title}
                            onChange={(e) => handleSectionUpdate(index, 'title', e.target.value)}
                            className="font-medium border-none p-0 h-auto focus-visible:ring-0 text-xs md:text-sm"
                            placeholder="Section title..."
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(index)}
                            className="h-8 w-8 flex-shrink-0"
                          >
                            ×
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 md:p-6">
                        <Textarea
                          value={section.content}
                          onChange={(e) => handleSectionUpdate(index, 'content', e.target.value)}
                          placeholder="Section content..."
                          className="min-h-[100px] md:min-h-[120px] text-xs md:text-sm"
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Sources Section */}
            {currentNewsletter.content.sources && currentNewsletter.content.sources.length > 0 && (
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <FileText className="h-3 w-3 md:h-4 md:w-4" />
                    Sources & References
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Data sources and references used in this newsletter
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-2 md:space-y-3">
                    {currentNewsletter.content.sources.map((source, index) => (
                      <div key={index} className="p-2 md:p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] md:text-xs font-semibold text-gray-500 mt-1">#{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs md:text-sm truncate">{source.title}</h4>
                            {source.description && (
                              <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {source.description}
                              </p>
                            )}
                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mt-1 inline-block"
                              >
                                {source.url}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview & Settings */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="email">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                  </TabsList>
                  <TabsContent value="email" className="mt-4">
                    <div className="border rounded-lg p-4 bg-white min-h-[300px] max-h-[400px] overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: generatePreview() }} />
                    </div>
                  </TabsContent>
                  <TabsContent value="html" className="mt-4">
                    <pre className="text-xs bg-gray-100 p-4 rounded-lg max-h-[400px] overflow-auto">
                      {generatePreview()}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Style Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Style Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Template</label>
                  <Select
                    value={currentNewsletter.content.style.template}
                    onValueChange={(value) => setCurrentNewsletter({
                      ...currentNewsletter,
                      content: {
                        ...currentNewsletter.content,
                        style: {
                          ...currentNewsletter.content.style,
                          template: value
                        }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <Input
                    type="color"
                    value={currentNewsletter.content.style.colors.primary}
                    onChange={(e) => setCurrentNewsletter({
                      ...currentNewsletter,
                      content: {
                        ...currentNewsletter.content,
                        style: {
                          ...currentNewsletter.content.style,
                          colors: {
                            ...currentNewsletter.content.style.colors,
                            primary: e.target.value
                          }
                        }
                      }
                    })}
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={currentNewsletter.status}
                    onValueChange={(value: 'draft' | 'published' | 'scheduled' | 'archived') => 
                      setCurrentNewsletter({...currentNewsletter, status: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Email Lists */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Email Lists ({emailLists.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {emailLists.map(list => (
                    <div key={list.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{list.name}</p>
                        <p className="text-xs text-gray-500">{list.active_subscribers} subscribers</p>
                      </div>
                      <Checkbox
                        checked={selectedEmailLists.includes(list.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEmailLists([...selectedEmailLists, list.id]);
                          } else {
                            setSelectedEmailLists(selectedEmailLists.filter(id => id !== list.id));
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
                {selectedEmailLists.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      Selected: {selectedEmailLists.length} lists with{' '}
                      {selectedEmailLists.reduce((sum, id) => {
                        const list = emailLists.find(l => l.id === id);
                        return sum + (list?.active_subscribers || 0);
                      }, 0)} total subscribers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

            {/* AI Regeneration Dialog */}
            <AIRegenerateDialog
              open={showRegenerateDialog}
              onOpenChange={setShowRegenerateDialog}
              type="newsletter"
              documentId={currentNewsletter.id}
              onRegenerate={handleRegenerateResults}
              availableOptions={{
                title: true,
                sections: true,
                email_subject: true
              }}
              currentData={{
                title: currentNewsletter.title,
                subject: currentNewsletter.subject,
                sections: currentNewsletter.content.sections,
                style: currentNewsletter.content.style
              }}
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default NewsletterEditor;