import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, FileText, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { KnowledgeBaseDocument } from "@/hooks/useChatLogic"; // Ensure type is exported or redefine
import { toast } from "@/components/ui/use-toast";
import { apiCall, API_ENDPOINTS } from "@/lib/api";
import { useState } from "react";

interface KnowledgeBaseDocumentListProps {
    kbId: number;
    documents: KnowledgeBaseDocument[];
    onUpdate: () => void;
}

export const KnowledgeBaseDocumentList = ({ kbId, documents, onUpdate }: KnowledgeBaseDocumentListProps) => {
    const [processingIds, setProcessingIds] = useState<number[]>([]);

    const handleDelete = async (docId: number) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        setProcessingIds(prev => [...prev, docId]);
        try {
            const response = await apiCall(API_ENDPOINTS.knowledgeBaseDocument(kbId, docId), {
                method: "DELETE"
            });

            if (response.ok) {
                toast({ title: "Document deleted" });
                onUpdate();
            } else {
                toast({ variant: "destructive", title: "Failed to delete document" });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error deleting document" });
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== docId));
        }
    };

    const handleReindex = async (docId: number) => {
        setProcessingIds(prev => [...prev, docId]);
        try {
            const response = await apiCall(API_ENDPOINTS.knowledgeBaseDocumentIndex(kbId, docId), {
                method: "POST",
                body: JSON.stringify({}) // Schema expects generic body maybe?
            });

            if (response.ok) {
                toast({ title: "Indexing started" });
                onUpdate();
            } else {
                toast({ variant: "destructive", title: "Failed to trigger indexing" });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error triggering indexing" });
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== docId));
        }
    };

    const getStatusBadge = (status: string, error?: string) => {
        switch (status) {
            case "indexed":
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Indexed</Badge>;
            case "indexing":
                return <Badge variant="secondary" className="animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Indexing</Badge>;
            case "failed":
                return <Badge variant="destructive" title={error}><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
            default:
                return <Badge variant="outline">Not Indexed</Badge>;
        }
    };

    if (documents.length === 0) {
        return <div className="text-center p-4 text-muted-foreground text-sm">No documents uploaded yet.</div>;
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((doc) => (
                        <TableRow key={doc.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate max-w-[200px]" title={doc.filename}>{doc.filename}</span>
                            </TableCell>
                            <TableCell>{doc.file_type.toUpperCase()}</TableCell>
                            <TableCell>{(doc.file_size / 1024).toFixed(1)} KB</TableCell>
                            <TableCell>{getStatusBadge(doc.indexing_status, doc.indexing_error)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {(doc.indexing_status === "failed" || doc.indexing_status === "not_indexed") && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleReindex(doc.id)}
                                            disabled={processingIds.includes(doc.id)}
                                        >
                                            <RefreshCw className={`h-4 w-4 text-blue-500 ${processingIds.includes(doc.id) ? 'animate-spin' : ''}`} />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(doc.id)}
                                        disabled={processingIds.includes(doc.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
