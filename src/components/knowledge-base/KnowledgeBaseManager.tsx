import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Database, Loader2 } from "lucide-react";
import { apiCall, API_ENDPOINTS } from "@/lib/api";
import { KnowledgeBase } from "@/hooks/useChatLogic";
import { DocumentUploader } from "./DocumentUploader";
import { KnowledgeBaseDocumentList } from "./KnowledgeBaseDocumentList";

interface KnowledgeBaseManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (kb: KnowledgeBase) => void;
}

export const KnowledgeBaseManager = ({ open, onOpenChange }: KnowledgeBaseManagerProps) => {
    // Single knowledge base per organization - automatically created
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadKnowledgeBase();
        }
    }, [open]);

    const loadKnowledgeBase = async () => {
        setIsLoading(true);
        try {
            const response = await apiCall(API_ENDPOINTS.knowledgeBases);
            if (response.ok) {
                const data = await response.json();
                // Get the single knowledge base (auto-created if doesn't exist)
                if (data.knowledge_bases && data.knowledge_bases.length > 0) {
                    setKnowledgeBase(data.knowledge_bases[0]);
                }
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to load knowledge base" });
            }
        } catch (error) {
            console.error("Failed to load knowledge base:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load knowledge base" });
        } finally {
            setIsLoading(false);
        }
    };

    const refreshKnowledgeBase = async () => {
        if (!knowledgeBase) return;
        try {
            const response = await apiCall(API_ENDPOINTS.knowledgeBase(knowledgeBase.id));
            if (response.ok) {
                const data = await response.json();
                setKnowledgeBase(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Document Library
                    </DialogTitle>
                    <DialogDescription>
                        Upload and manage your organization's documents. All documents are automatically searchable in every chat conversation.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : knowledgeBase ? (
                    <div className="flex-1 overflow-y-auto py-2 space-y-6">
                        {/* Upload Section */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Upload Documents</h4>
                            <DocumentUploader
                                kbId={knowledgeBase.id}
                                onUploadComplete={refreshKnowledgeBase}
                            />
                        </div>

                        {/* Documents List */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">
                                    Stored Documents ({knowledgeBase.documents?.length || 0})
                                </h4>
                                {knowledgeBase.documents && knowledgeBase.documents.length > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                        All documents are automatically available in AI chats
                                    </span>
                                )}
                            </div>
                            <KnowledgeBaseDocumentList
                                kbId={knowledgeBase.id}
                                documents={knowledgeBase.documents || []}
                                onUpdate={refreshKnowledgeBase}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center py-12 text-muted-foreground">
                        <p>No knowledge base found. Please try again.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
