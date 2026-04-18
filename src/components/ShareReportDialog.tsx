import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Copy, Check, Loader2, Trash2, Eye, Key } from "lucide-react";
import { buildApiUrl } from "@/lib/api";

interface ShareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number;
}

interface ShareLink {
  id: number;
  token: string;
  share_url: string;
  created_at: string | null;
  updated_at: string | null;
  expires_at: string | null;
  is_single_use: boolean;
  is_used: boolean;
  failed_attempts: number;
  cooldown_until: string | null;
  views: number;
  last_access_at: string | null;
  is_expired: boolean;
  is_valid: boolean;
  password?: string | null;
  enable_ai_chat?: boolean;
}

export const ShareReportDialog: React.FC<ShareReportDialogProps> = ({
  open,
  onOpenChange,
  reportId,
}) => {
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(60);
  const [isSingleUse, setIsSingleUse] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [enableAiChat, setEnableAiChat] = useState(false);

  const [links, setLinks] = useState<ShareLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksError, setLinksError] = useState<string | null>(null);

  const expirationOptions = [
    { value: 5, label: "5 minutes" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 1440, label: "24 hours" },
    { value: 10080, label: "7 days" },
    { value: 43200, label: "30 days" },
    { value: 131400, label: "3 months" },
    { value: 262800, label: "6 months" },
  ];

  const fetchShareLinks = async () => {
    if (!reportId) return;
    setLinksLoading(true);
    setLinksError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/reports/${reportId}/share-links`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to load share links");
      }

      const data = await response.json();
      setLinks(Array.isArray(data.links) ? data.links : []);

      // If backend returns a password, keep it so user can copy it easily
      if (data.links && data.links.length > 0) {
        const firstWithPassword = data.links.find((l: ShareLink) => l.password);
        if (firstWithPassword?.password) {
          setGeneratedPassword(firstWithPassword.password);
        }
      }
    } catch (error) {
      console.error("Failed to fetch share links:", error);
      setLinksError(
        error instanceof Error
          ? error.message
          : "Failed to load share links for this report"
      );
    } finally {
      setLinksLoading(false);
    }
  };

  // When dialog opens, load history of links
  useEffect(() => {
    if (open) {
      fetchShareLinks();
    } else {
      // Reset transient UI state when dialog closes
      setShareUrl("");
      setGeneratedPassword(null);
      setCopied(false);
      setCopiedPassword(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reportId]);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(
          `/api/reports/${reportId}/share?expires_in_minutes=${expiresInMinutes}&is_single_use=${isSingleUse}&enable_ai_chat=${enableAiChat}`
        ),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate shareable link");
      }

      // Build full URL
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${data.share_url}`;
      setShareUrl(fullUrl);
      if (data.password) {
        setGeneratedPassword(data.password);
      }

      // Refresh history after creating a new link
      fetchShareLinks();

      toast({
        title: "Success",
        description: "Shareable link generated successfully!",
      });
    } catch (error) {
      console.error("Error generating shareable link:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate shareable link",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopiedPassword(true);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    });
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleDeleteLink = async (token: string) => {
    if (!window.confirm("Are you sure you want to delete this share link?")) {
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(
        buildApiUrl(`/api/reports/${reportId}/share-links/${token}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to delete share link");
      }

      toast({
        title: "Deleted",
        description: "Share link deleted successfully",
      });

      // Refresh list
      fetchShareLinks();
    } catch (error) {
      console.error("Error deleting share link:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete share link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Generate a password-protected link to share this report. The
            password is first 4 digits of CoC (chamber of commerce) + last 3
            digits of VAT.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Existing links / history */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Existing share links</Label>
              {linksLoading && (
                <span className="flex items-center text-xs text-gray-500">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Loading…
                </span>
              )}
            </div>
            {linksError && <p className="text-xs text-red-500">{linksError}</p>}
            {links.length === 0 && !linksLoading && !linksError && (
              <p className="text-xs text-gray-500">
                No share links have been created for this report yet.
              </p>
            )}

            {links.length > 0 && (
              <div className="max-h-64 overflow-x-auto overflow-y-auto border rounded-md">
                <table className="w-full text-xs min-w-[500px]">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Created
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Expires
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Views
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Status
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => {
                      const fullUrl = `${window.location.origin}${link.share_url}`;
                      const statusLabel = link.is_expired
                        ? "Expired"
                        : link.is_single_use && link.is_used
                          ? "Used"
                          : "Active";
                      const statusColor = link.is_expired
                        ? "text-red-600"
                        : link.is_single_use && link.is_used
                          ? "text-yellow-600"
                          : "text-green-600";
                      return (
                        <tr
                          key={link.id}
                          className="border-t border-gray-100 align-top"
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            {formatDateTime(link.created_at)}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            <div className="max-w-[100px] truncate" title={formatDateTime(link.expires_at)}>
                              {formatDateTime(link.expires_at)}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-gray-500" />
                              <span>{link.views}</span>
                            </div>
                            {link.last_access_at && (
                              <div className="text-[10px] text-gray-500">
                                Last: {formatDateTime(link.last_access_at)}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`font-medium ${statusColor}`}>
                              {statusLabel}
                            </span>
                            {link.is_single_use && (
                              <div className="text-[10px] text-gray-500">
                                Single-use
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                title="Copy link"
                                onClick={() => {
                                  navigator.clipboard.writeText(fullUrl);
                                  toast({
                                    title: "Copied",
                                    description: "Share link copied",
                                  });
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              {link.password && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-7 w-7"
                                  title="Copy password"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      link.password || ""
                                    );
                                    toast({
                                      title: "Copied",
                                      description: "Password copied",
                                    });
                                  }}
                                >
                                  <Key className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete link"
                                onClick={() => handleDeleteLink(link.token)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-4 mt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiration">Link Expiration</Label>
              <Select
                value={expiresInMinutes.toString()}
                onValueChange={(value) => setExpiresInMinutes(parseInt(value))}
              >
                <SelectTrigger id="expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expirationOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="single-use"
                checked={isSingleUse}
                onCheckedChange={(checked) =>
                  setIsSingleUse(checked as boolean)
                }
              />
              <Label
                htmlFor="single-use"
                className="text-xs sm:text-sm font-normal cursor-pointer leading-tight"
              >
                Single-use only (link becomes invalid after first view)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-ai-chat"
                checked={enableAiChat}
                onCheckedChange={(checked) =>
                  setEnableAiChat(checked as boolean)
                }
              />
              <Label
                htmlFor="enable-ai-chat"
                className="text-xs sm:text-sm font-normal cursor-pointer leading-tight"
              >
                Enable AI chat assistant for this shared report
              </Label>
            </div>

            {shareUrl && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg border">
                <Label>Shareable Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 font-mono text-xs sm:text-sm overflow-hidden text-ellipsis"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Share this link with anyone. They will need to enter the
                  7-digit password to view the report.
                </p>
                {generatedPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-700">
                      Password:{" "}
                      <span className="font-mono font-semibold">
                        {generatedPassword}
                      </span>
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={handleCopyPassword}
                      title="Copy password"
                    >
                      {copiedPassword ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                Close
              </Button>
              <Button onClick={handleGenerateLink} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : shareUrl ? (
                  "Regenerate Link"
                ) : (
                  "Generate Link"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
