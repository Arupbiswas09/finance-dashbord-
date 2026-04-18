import { useState, useEffect } from "react";
import { buildApiUrl } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { Users, Plus, Edit, Trash2, Upload, Download, MoreVertical, Mail, FileText, RefreshCw, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface EmailSubscriber {
  email: string;
  name?: string;
  is_active: boolean;
  subscribed_at?: string;
  metadata?: any;
}

interface EmailList {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  emails: EmailSubscriber[];
  total_subscribers: number;
  active_subscribers: number;
  list_type: string;
  source_metadata?: any;
  created_at: string;
  updated_at?: string;
}

const EmailLists = () => {
  const { user } = useAuth();
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<EmailList | null>(null);
  const [viewingList, setViewingList] = useState<EmailList | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    is_active: true,
    import_organizational_clients: false,
    import_client_users: false,
    import_organization_users: false,
    auto_sync: false,
    emails: [] as EmailSubscriber[]
  });
  const [csvData, setCsvData] = useState('');
  const [newEmails, setNewEmails] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');

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
        setEmailLists(data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch email lists"
        });
      }
    } catch (error) {
      console.error('Error fetching email lists:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch email lists"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailListDetails = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/email-lists/${id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setViewingList(data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch email list details"
        });
      }
    } catch (error) {
      console.error('Error fetching email list details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch email list details"
      });
    }
  };

  const createEmailList = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl('/api/email-lists'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email list created successfully"
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchEmailLists();
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.detail || "Failed to create email list"
        });
      }
    } catch (error) {
      console.error('Error creating email list:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create email list"
      });
    }
  };

  const updateEmailList = async () => {
    if (!selectedList) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/email-lists/${selectedList.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email list updated successfully"
        });
        setIsEditDialogOpen(false);
        setSelectedList(null);
        resetForm();
        fetchEmailLists();
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.detail || "Failed to update email list"
        });
      }
    } catch (error) {
      console.error('Error updating email list:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update email list"
      });
    }
  };

  const deleteEmailList = async (id: number) => {
    if (!confirm('Are you sure you want to delete this email list?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/email-lists/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email list deleted successfully"
        });
        fetchEmailLists();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete email list"
        });
      }
    } catch (error) {
      console.error('Error deleting email list:', error);
    }
  };

  const syncWithClients = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/email-lists/${id}/sync-clients`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email list synced with clients successfully"
        });
        fetchEmailLists();
        // If we're currently viewing this list, refresh its details
        if (viewingList && viewingList.id === id) {
          fetchEmailListDetails(id);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to sync email list"
        });
      }
    } catch (error) {
      console.error('Error syncing email list:', error);
    }
  };

  const importEmails = async () => {
    if (!selectedList) return;

    let emails: { email: string; name: string; is_active: boolean }[] = [];
    
    // Handle manual entry
    if (newEmails.trim()) {
      emails = newEmails
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.includes('@'))
        .map(email => ({
          email: email.trim(),
          name: '',
          is_active: true
        }));
    }
    
    // Handle CSV import
    if (csvData.trim()) {
      const csvEmails = csvData
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.includes('@'))
        .map(line => {
          const parts = line.split(',');
          return {
            email: parts[0].trim(),
            name: parts[1] ? parts[1].trim() : '',
            is_active: true
          };
        });
      emails = [...emails, ...csvEmails];
    }

    if (emails.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No valid email addresses found"
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/email-lists/${selectedList.id}/emails`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emails })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Added ${emails.length} email addresses`
        });
        setIsImportDialogOpen(false);
        setNewEmails('');
        setCsvData('');
        fetchEmailLists();
        // If we're currently viewing a list, refresh its details
        if (viewingList && viewingList.id === selectedList.id) {
          fetchEmailListDetails(viewingList.id);
        }
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.detail || "Failed to add emails"
        });
      }
    } catch (error) {
      console.error('Error adding emails:', error);
    }
  };

  const removeEmailsFromList = async (emailListId: number, emailAddresses: string[]) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/email-lists/${emailListId}/emails`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email_addresses: emailAddresses })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Removed ${emailAddresses.length} email addresses`
        });
        fetchEmailLists();
        // If we're currently viewing this list, refresh its details
        if (viewingList && viewingList.id === emailListId) {
          fetchEmailListDetails(emailListId);
        }
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.detail || "Failed to remove emails"
        });
      }
    } catch (error) {
      console.error('Error removing emails:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove emails"
      });
    }
  };

  const addManualSubscriber = () => {
    if (!manualEmail.trim() || !manualEmail.includes('@')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address"
      });
      return;
    }

    // Check for duplicates
    if (formData.emails?.some((e: { email: string }) => e.email === manualEmail)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email already added"
      });
      return;
    }

    setFormData({
      ...formData,
      emails: [
        ...(formData.emails || []),
        {
          email: manualEmail,
          name: manualName || undefined,
          is_active: true
        }
      ]
    });
    setManualEmail('');
    setManualName('');
  };

  const removeManualSubscriber = (email: string) => {
    setFormData({
      ...formData,
      emails: (formData.emails || []).filter((e: { email: string }) => e.email !== email)
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
      import_organizational_clients: false,
      import_client_users: false,
      import_organization_users: false,
      auto_sync: false,
      emails: []
    });
    setManualEmail('');
    setManualName('');
  };

  const openEditDialog = (list: EmailList) => {
    setSelectedList(list);
    setFormData({
      name: list.name,
      description: list.description || '',
      is_active: list.is_active,
      import_organizational_clients: false,
      import_client_users: false,
      import_organization_users: false,
      auto_sync: false,
      emails: []
    });
    setIsEditDialogOpen(true);
  };

  const exportEmails = (list: EmailList) => {
    const csv = 'email,name,status\n' + 
      list.emails.map(email => 
        `${email.email},"${email.name || ''}",${email.is_active ? 'active' : 'inactive'}`
      ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_emails.csv`;
    a.click();
  };

  if (viewingList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="container py-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setViewingList(null)}
              >
                ← Back to Lists
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{viewingList.name}</h1>
                <p className="text-gray-500">{viewingList.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedList(viewingList);
                  setIsImportDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Emails
              </Button>
              <Button
                variant="outline"
                onClick={() => exportEmails(viewingList)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Email Subscribers ({viewingList.total_subscribers})</CardTitle>
                  <CardDescription>{viewingList.active_subscribers} active subscribers</CardDescription>
                </div>
                <Badge variant={viewingList.list_type === 'organizational_clients' ? 'default' : 'secondary'}>
                  {viewingList.list_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(viewingList.emails || []).map((subscriber, index) => (
                    <TableRow key={index}>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>{subscriber.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                          {subscriber.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subscriber.subscribed_at 
                          ? new Date(subscriber.subscribed_at).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmailsFromList(viewingList.id, [subscriber.email])}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Import Emails Dialog */}
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Email Addresses</DialogTitle>
                <DialogDescription>
                  Add new email addresses to "{selectedList?.name}"
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="csv">CSV Import</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4">
                  <div>
                    <Label>Email Addresses (one per line)</Label>
                    <Textarea
                      value={newEmails}
                      onChange={(e) => setNewEmails(e.target.value)}
                      placeholder="john@example.com&#10;jane@example.com&#10;..."
                      rows={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter one email address per line. Names and other data will be extracted automatically if possible.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="csv" className="space-y-4">
                  <div>
                    <Label>CSV Data</Label>
                    <Textarea
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      placeholder="email,name&#10;john@example.com,John Doe&#10;jane@example.com,Jane Smith"
                      rows={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      CSV format with headers. Supported columns: email (required), name, status
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={importEmails}>
                  Add Emails
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <main className="container py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Email Lists</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your email subscribers and mailing lists</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Email List
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailLists.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailLists.filter(l => l.is_active).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailLists.reduce((sum, l) => sum + l.total_subscribers, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailLists.reduce((sum, l) => sum + l.active_subscribers, 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Email Lists Table */}
        <Card>
          <CardHeader>
            <CardTitle>Email Lists</CardTitle>
            <CardDescription>Manage your subscriber lists and mailing groups</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : emailLists.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No email lists yet. Create your first list to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLists.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell>
                        <div>
                          <p 
                            className="font-medium cursor-pointer hover:text-blue-600"
                            onClick={() => setViewingList(list)}
                          >
                            {list.name}
                          </p>
                          {list.description && (
                            <p className="text-sm text-gray-500">{list.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={list.list_type === 'organizational_clients' ? 'default' : 'secondary'}>
                          {list.list_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{list.total_subscribers}</p>
                          <p className="text-sm text-gray-500">{list.active_subscribers} active</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={list.is_active ? "default" : "secondary"}>
                          {list.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(list.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => fetchEmailListDetails(list.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Subscribers
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(list)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedList(list);
                                setIsImportDialogOpen(true);
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Import Emails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportEmails(list)}>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            {list.list_type === 'organizational_clients' && (
                              <DropdownMenuItem onClick={() => syncWithClients(list.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Sync with Clients
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteEmailList(list.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Email List Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Email List</DialogTitle>
              <DialogDescription>Create a new email list for your newsletters</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Monthly Newsletter Subscribers"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of this email list..."
                  rows={3}
                />
              </div>
              <div className="space-y-3 border rounded-lg p-3 bg-muted/50">
                <div className="text-sm font-medium">Import Options</div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.import_organizational_clients}
                    onCheckedChange={(checked) => setFormData({...formData, import_organizational_clients: checked})}
                  />
                  <Label className="text-sm">Import all organizational client emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.import_client_users}
                    onCheckedChange={(checked) => setFormData({...formData, import_client_users: checked})}
                  />
                  <Label className="text-sm">Import all client users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.import_organization_users}
                    onCheckedChange={(checked) => setFormData({...formData, import_organization_users: checked})}
                  />
                  <Label className="text-sm">Import all organization users (PYZ team)</Label>
                </div>
              </div>

              <div className="space-y-3 border rounded-lg p-3 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.auto_sync}
                    onCheckedChange={(checked) => setFormData({...formData, auto_sync: checked})}
                  />
                  <div>
                    <Label className="text-sm font-medium">Enable Auto-Sync</Label>
                    <p className="text-xs text-muted-foreground">Automatically update this list when users/clients are added or removed</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border rounded-lg p-3">
                <div className="text-sm font-medium">Manual Subscribers ({formData.emails?.length || 0})</div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Email address"
                      type="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addManualSubscriber();
                        }
                      }}
                    />
                    <Input
                      placeholder="Name (optional)"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-40"
                    />
                    <Button type="button" size="sm" onClick={addManualSubscriber}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.emails && formData.emails.length > 0 && (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {formData.emails.map(
                        (subscriber: { email: string; name?: string }, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-background p-2 rounded">
                          <span>{subscriber.email} {subscriber.name && `(${subscriber.name})`}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeManualSubscriber(subscriber.email)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createEmailList} disabled={!formData.name.trim()}>
                Create List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Email List Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Email List</DialogTitle>
              <DialogDescription>Update email list details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateEmailList}>
                Update List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Emails Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Email Addresses</DialogTitle>
              <DialogDescription>
                Add new email addresses to "{selectedList?.name}"
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="csv">CSV Import</TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="space-y-4">
                <div>
                  <Label>Email Addresses (one per line)</Label>
                  <Textarea
                    value={newEmails}
                    onChange={(e) => setNewEmails(e.target.value)}
                    placeholder="john@example.com&#10;jane@example.com&#10;..."
                    rows={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter one email address per line. Names and other data will be extracted automatically if possible.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="csv" className="space-y-4">
                <div>
                  <Label>CSV Data</Label>
                  <Textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="email,name&#10;john@example.com,John Doe&#10;jane@example.com,Jane Smith"
                    rows={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    CSV format with headers. Supported columns: email (required), name, status
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={importEmails}>
                Add Emails
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default EmailLists;