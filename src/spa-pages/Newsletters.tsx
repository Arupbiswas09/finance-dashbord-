import { useState, useEffect } from "react";
import { buildApiUrl } from '@/lib/api';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfile } from "@/components/UserProfile";
import { Separator } from "@/components/ui/separator";
import KnowledgeSourceManager from "@/components/KnowledgeSourceManager";
import { Brain, Eye, Send, Calendar, Sparkles, Mail, FileText, MoreVertical, Plus, Edit, Trash2, Copy, Settings, AlertTriangle, Globe, Search, ChevronLeft, ChevronRight, Printer, Download, Share2, Maximize2, Bell, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";

// Types
interface Newsletter {
  id: number;
  title: string;
  subject: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  sent_count: number;
  open_count: number;
  click_count: number;
  ai_generated: boolean;
  created_at: string;
  sent_at?: string;
  scheduled_at?: string;
}

interface EmailList {
  id: number;
  name: string;
  total_subscribers: number;
  active_subscribers: number;
  is_active: boolean;
}

interface NewslettersProps {
  currentView: 'list' | 'create' | 'edit';
  onViewChange: (view: 'list' | 'create' | 'edit') => void;
  onEditNewsletter: (newsletter: Newsletter) => void;
}

const Newsletters = ({ currentView, onViewChange, onEditNewsletter }: NewslettersProps) => {
  const { user } = useAuth();
  const orgColors = useOrganizationColors();
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [wordCount, setWordCount] = useState(2000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<number[]>([]);

  // Available languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' }
  ];

  // Fetch newsletters and email lists
  useEffect(() => {
    fetchNewsletters();
    fetchEmailLists();
    checkEmailConfiguration();
  }, []);

  const checkEmailConfiguration = async () => {
    try {
      if (!user?.organization?.id) {
        setEmailConfigured(false);
        return;
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/organizations/${user.organization.id}/email-config`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmailConfigured(data.email_configured || false);
      }
    } catch (error) {
      console.error('Error checking email configuration:', error);
      setEmailConfigured(false);
    }
  };

  const fetchNewsletters = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl('/api/newsletters'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNewsletters(Array.isArray(data) ? data : []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch newsletters"
        });
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch newsletters"
      });
    } finally {
      setLoading(false);
    }
  };

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
        setEmailLists(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching email lists:', error);
    }
  };

  const generateNewsletter = async () => {
    if (!newsletterTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a newsletter title"
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newsletterTitle,
          custom_prompt: generationPrompt || undefined,
          include_financial_data: true,
          include_graphs: true,
          include_images: true,
          language: selectedLanguage,
          word_count: wordCount,
          knowledge_source_ids: selectedKnowledgeSources
        })
      });

      if (response.ok) {
        const newsletter = await response.json();
        toast({
          title: "Success",
          description: "Newsletter generated successfully!"
        });
        onEditNewsletter(newsletter);
        fetchNewsletters();
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.detail || "Failed to generate newsletter"
        });
      }
    } catch (error) {
      console.error('Error generating newsletter:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate newsletter"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteNewsletter = async (id: number) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/newsletters/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Newsletter deleted successfully"
        });
        fetchNewsletters();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete newsletter"
        });
      }
    } catch (error) {
      console.error('Error deleting newsletter:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: "secondary" as const, label: "Draft" },
      published: { variant: "default" as const, label: "Published" },
      scheduled: { variant: "outline" as const, label: "Scheduled" },
      archived: { variant: "secondary" as const, label: "Archived" }
    };

    const config = variants[status as keyof typeof variants] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (currentView === 'list') {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-[112px] shrink-0 items-center justify-between px-12 bg-white">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div>
                <h1 className="text-[32px] font-normal text-gray-900 leading-tight mb-1.5">Newsletter Management</h1>
                <p className="text-base text-black font-normal">Manage and send AI-powered newsletters to your clients</p>
              </div>
            </div>

            {/* User actions */}
            <div className="flex items-center">
              <LanguageChangeDropdown />
              <Button
                variant="secondary"
                size="icon"
                className="relative hover:bg-gray-50 rounded-full w-8 h-8 ml-2"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB'
                }}
              >
                <Bell className="h-4 w-4" style={{ color: '#4B5563' }} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }}></span>
              </Button>
              <div className="ml-4">
                <UserProfile />
              </div>
            </div>
          </header>

          {/* Border line with padding */}
          <div className="px-12 bg-white">
            <div className="border-b border-gray-300"></div>
          </div>

          {/* Main content */}
          <div className="flex flex-1 flex-col bg-white">
            <div className="min-h-[calc(100vh-8rem)] flex-1 p-10 bg-white">
              {!emailConfigured && (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 mb-6">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-800 dark:text-amber-200">Email Not Configured</AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    To send newsletters via email, you need to configure your email settings first.
                    <Button
                      variant="link"
                      className="p-0 h-auto text-amber-800 dark:text-amber-200 underline ml-1"
                      onClick={() => navigate('/organization-settings?tab=integration')}
                    >
                      Configure email settings
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                <Card>
                  <CardHeader className="pb-0 px-3 py-1 md:px-4 md:py-2">
                    <CardTitle className="text-[10px] md:text-sm font-medium text-gray-500 dark:text-gray-400">Total Newsletter</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 py-1 md:px-4 md:py-2 pt-0">
                    <div className="flex items-baseline gap-2">
                      <div className="text-lg md:text-2xl font-bold">{newsletters.length}</div>
                      <span className="text-xs text-green-600 font-medium">+2.45%</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-0 px-3 py-1 md:px-4 md:py-2">
                    <CardTitle className="text-[10px] md:text-sm font-medium text-gray-500 dark:text-gray-400">Published</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 py-1 md:px-4 md:py-2 pt-0">
                    <div className="text-lg md:text-2xl font-bold">{newsletters.filter(n => n.status === 'published').length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-0 px-3 py-1 md:px-4 md:py-2">
                    <CardTitle className="text-[10px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
                      <span className="hidden sm:inline">Total Recipients</span>
                      <span className="sm:hidden">Recipients</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 py-1 md:px-4 md:py-2 pt-0">
                    <div className="flex items-baseline gap-2">
                      <div className="text-lg md:text-2xl font-bold">{newsletters.reduce((sum, n) => sum + n.sent_count, 0)}</div>
                      <span className="text-xs text-green-600 font-medium">+2.45%</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-0 px-3 py-1 md:px-4 md:py-2">
                    <CardTitle className="text-[10px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
                      <span className="hidden sm:inline">Avg. Open Rate</span>
                      <span className="sm:hidden">Open Rate</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 py-1 md:px-4 md:py-2 pt-0">
                    <div className="text-lg md:text-2xl font-bold">
                      {newsletters.length > 0
                        ? Math.round((newsletters.reduce((sum, n) => sum + (n.sent_count > 0 ? (n.open_count / n.sent_count) * 100 : 0), 0) / newsletters.length))
                        : 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>


              {/* Toolbar */}
              <div className="bg-[#f9f9fb] p-4 rounded-lg">
                <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onViewChange('create')}
                      className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Newsletter
                    </Button>

                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search"
                        className="pl-8 h-9 border border-gray-400 rounded-full bg-[#f6f6f7] text-sm w-48"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{loading ? "Loading..." : `1 - ${Math.min(10, newsletters.length)} of ${newsletters.length}`}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-black hover:text-gray-600">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-black hover:text-gray-600">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-black hover:text-gray-600">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-6 bg-gray-200"></div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-black hover:text-gray-600">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Newsletters Table */}
                <Card className="rounded-lg border border-gray-200 shadow-sm bg-white">
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : newsletters.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">No newsletters yet. Create your first newsletter to get started.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-gray-200 bg-white hover:bg-gray-50">
                              <TableHead className="h-12 px-6 py-3 text-left text-xs font-semibold text-gray-700 w-12">
                                <input type="checkbox" className="rounded border border-gray-300" />
                              </TableHead>
                              <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                Name
                              </TableHead>
                              <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                Status
                              </TableHead>
                              <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                Recipients
                              </TableHead>
                              <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                Open Rate
                              </TableHead>
                              <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                Last Synced
                              </TableHead>
                              <TableHead className="h-12 px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {newsletters.map((newsletter) => (
                              <TableRow key={newsletter.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="px-6 py-4 w-12">
                                  <input type="checkbox" className="rounded border border-gray-300" />
                                </TableCell>
                                <TableCell className="px-4 py-4">
                                  <div>
                                    <p 
                                      className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                      onClick={() => onEditNewsletter(newsletter)}
                                    >
                                      {newsletter.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{newsletter.subject}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-4">
                                  <Badge
                                    className={`${newsletter.status === 'published'
                                      ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                      } border-0 text-xs font-medium`}
                                  >
                                    {newsletter.status === 'published' ? 'Published' : 'Draft'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-4 text-sm text-gray-900">{newsletter.sent_count}</TableCell>
                                <TableCell className="px-4 py-4 text-sm text-gray-900">
                                  {newsletter.sent_count > 0
                                    ? `${Math.round((newsletter.open_count / newsletter.sent_count) * 100)}%`
                                    : '-'}
                                </TableCell>
                                <TableCell className="px-4 py-4 text-sm text-gray-600">
                                  {new Date(newsletter.created_at).toLocaleDateString()} | {new Date(newsletter.created_at).toLocaleTimeString()}
                                </TableCell>
                                <TableCell className="px-4 py-4">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                                        ⋮
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => onEditNewsletter(newsletter)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Clone
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => deleteNewsletter(newsletter.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider >
    );
  }

  if (currentView === 'create') {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold">Generate Newsletter</h1>
            </div>
            <div className="flex flex-1 items-center justify-end px-4">
              <UserProfile />
            </div>
          </header>

          {/* Main content */}
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-4 md:pt-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm md:text-base text-muted-foreground">Create engaging newsletters with AI assistance</p>
              <Button
                variant="outline"
                onClick={() => onViewChange('list')}
                className="text-xs md:text-sm"
              >
                Back to List
              </Button>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  AI Newsletter Generator
                </CardTitle>
                <CardDescription>
                  Generate professional newsletters with Belgian financial insights and market trends
                </CardDescription>
                {isGenerating && (
                  <div 
                    className="mt-4 p-4 border-l-4 rounded"
                    style={{ 
                      backgroundColor: `${orgColors.primary}15`,
                      borderLeftColor: orgColors.primary 
                    }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="animate-spin rounded-full h-5 w-5 border-b-2 mr-3"
                        style={{ borderColor: orgColors.primary }}
                      ></div>
                      <div>
                        <p 
                          className="font-medium"
                          style={{ color: orgColors.primary }}
                        >
                          Generating your newsletter...
                        </p>
                        <p 
                          className="text-sm"
                          style={{ color: orgColors.primary }}
                        >
                          This may take 10-30 seconds. Please wait while we create professional content with Belgian financial insights.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Newsletter Title *</label>
                  <Input
                    placeholder="e.g., Monthly Financial Update - January 2024"
                    value={newsletterTitle}
                    onChange={(e) => setNewsletterTitle(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-indigo-600" />
                    Newsletter Language *
                  </label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700">
                      <SelectValue placeholder="Select language" />
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
                  <p className="text-xs text-gray-500">
                    The entire newsletter will be generated in the selected language
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Word Count</label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="500"
                      max="5000"
                      step="100"
                      value={wordCount}
                      onChange={(e) => setWordCount(parseInt(e.target.value) || 2000)}
                      className="bg-gray-50 dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-500">words</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Newsletter will be approximately {wordCount} words (range: 500-5000)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Prompt (Optional)</label>
                  <textarea
                    placeholder="Add any specific instructions for the AI to customize the newsletter content..."
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to generate content based on latest Belgian financial trends and regulations
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Source Manager */}
            <div className="max-w-2xl mx-auto mt-6">
              <KnowledgeSourceManager
                selectedSourceIds={selectedKnowledgeSources}
                onSelectionChange={setSelectedKnowledgeSources}
              />
            </div>

            {/* Generate Button */}
            <Card className="max-w-2xl mx-auto mt-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-2 border-indigo-100 bg-indigo-50/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium">Financial Data</span>
                      </div>
                      <p className="text-xs text-gray-600">Include latest Belgian financial regulations and market insights</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-100 bg-green-50/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Visual Content</span>
                      </div>
                      <p className="text-xs text-gray-600">Generate charts and visual elements for better engagement</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-100 bg-purple-50/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">AI Insights</span>
                      </div>
                      <p className="text-xs text-gray-600">Personalized recommendations and business tips</p>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={generateNewsletter}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700"
                  disabled={!newsletterTitle.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Newsletter with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // If currentView is 'edit', we'll show the editor (to be implemented)
  return <div>Newsletter Editor - Coming Soon</div>;
};

export default Newsletters;
