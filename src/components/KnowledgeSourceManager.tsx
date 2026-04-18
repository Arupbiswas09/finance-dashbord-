import { useState, useEffect } from "react";
import { buildApiUrl } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, ExternalLink, Trash2, Sparkles } from "lucide-react";
import { KnowledgeSource, KnowledgeSourceCreate } from "@/types/knowledge-source";
import { Checkbox } from "@/components/ui/checkbox";

interface KnowledgeSourceManagerProps {
  selectedSourceIds: number[];
  onSelectionChange: (sourceIds: number[]) => void;
}

const KnowledgeSourceManager = ({ selectedSourceIds, onSelectionChange }: KnowledgeSourceManagerProps) => {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSource, setNewSource] = useState<KnowledgeSourceCreate>({
    title: '',
    url: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl('/api/knowledge-sources?active_only=false'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSources(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching knowledge sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultSources = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl('/api/knowledge-sources/initialize-defaults'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message
        });
        fetchSources();
      }
    } catch (error) {
      console.error('Error initializing defaults:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize default sources"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSource = async () => {
    if (!newSource.title || !newSource.url) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide title and URL"
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl('/api/knowledge-sources'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSource)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Knowledge source added successfully"
        });
        setIsAddDialogOpen(false);
        setNewSource({ title: '', url: '', description: '', is_active: true });
        fetchSources();
      }
    } catch (error) {
      console.error('Error adding source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add knowledge source"
      });
    }
  };

  const deleteSource = async (sourceId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(buildApiUrl(`/api/knowledge-sources/${sourceId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Knowledge source deleted"
        });
        fetchSources();
        // Remove from selection if selected
        onSelectionChange(selectedSourceIds.filter(id => id !== sourceId));
      }
    } catch (error) {
      console.error('Error deleting source:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete knowledge source"
      });
    }
  };

  const toggleSourceSelection = (sourceId: number) => {
    if (selectedSourceIds.includes(sourceId)) {
      onSelectionChange(selectedSourceIds.filter(id => id !== sourceId));
    } else {
      onSelectionChange([...selectedSourceIds, sourceId]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Knowledge Base
                </CardTitle>
                <CardDescription>
                  Select sources to use for newsletter content generation. Content will be automatically scraped when generating.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.length === 0 && (
                <Button onClick={initializeDefaultSources} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Default Sources
                </Button>
              )}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Source
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Knowledge Source</DialogTitle>
                    <DialogDescription>
                      Add a custom URL to scrape for newsletter content
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., NBB Financial News"
                        value={newSource.title}
                        onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com/news"
                        value={newSource.url}
                        onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of this source"
                        value={newSource.description}
                        onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={newSource.is_active}
                        onCheckedChange={(checked) => setNewSource({ ...newSource, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addSource}>Add Source</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No knowledge sources configured.</p>
              <p className="text-sm mt-2">Click "Add Default Sources" to get started with Belgian financial news sources.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Checkbox
                      checked={selectedSourceIds.includes(source.id)}
                      onCheckedChange={() => toggleSourceSelection(source.id)}
                      disabled={!source.is_active}
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{source.title}</h4>
                          {source.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary flex items-center gap-1"
                          >
                            {source.url.length > 50 ? source.url.substring(0, 50) + '...' : source.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        {source.description && (
                          <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {!source.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSource(source.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSourceIds.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedSourceIds.length} source(s) selected for newsletter generation
        </div>
      )}
    </div>
  );
};

export default KnowledgeSourceManager;
