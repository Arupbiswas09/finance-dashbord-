import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Save, Copy, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { axiosAuth } from "@/contexts/AuthContext";

const Organization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.organization?.name || "",
    description: user?.organization?.description || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!user?.organization?.id) return;

    setIsSaving(true);
    try {
      const response = await axiosAuth.put(`/api/organizations/${user.organization.id}`, {
        name: formData.name,
        description: formData.description,
      });

      toast({
        title: "Success",
        description: "Organization updated successfully!",
      });

      setIsEditing(false);
      // Update user context with new organization data
      // This would ideally refresh the user data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update organization",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.organization?.name || "",
      description: user?.organization?.description || "",
    });
    setIsEditing(false);
  };

  const copyOrgId = async () => {
    if (!user?.organization?.org_id) return;
    
    try {
      await navigator.clipboard.writeText(user.organization.org_id);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Organization ID copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy organization ID",
        variant: "destructive",
      });
    }
  };

  if (user?.role?.name !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>
            You don't have permission to view organization settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user?.organization) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>
            No organization found for your account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization details and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter organization name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter organization description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Organization ID</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={user.organization.org_id}
                  disabled
                  className="font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyOrgId}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This unique ID identifies your organization. Share it with team members for invitations.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Details
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Organization Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Overview</CardTitle>
            <CardDescription>
              Key information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {user.organization.is_active ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {user.organization.created_at 
                    ? new Date(user.organization.created_at).toLocaleDateString()
                    : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Created</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Organization Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multi-user collaboration</li>
                <li>• Role-based access control</li>
                <li>• Secure data isolation</li>
                <li>• Centralized billing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Organization;