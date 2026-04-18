import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { Upload, Loader2, FileType } from "lucide-react";

interface DocumentUploaderProps {
    kbId: number;
    onUploadComplete: () => void;
}

export const DocumentUploader = ({ kbId, onUploadComplete }: DocumentUploaderProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        ];
        // Allow strict equality or extension check as fallback
        const ext = file.name.split('.').pop()?.toLowerCase();
        const validExt = ['pdf', 'docx', 'txt'].includes(ext || '');

        if (!allowedTypes.includes(file.type) && !validExt) {
            toast({
                variant: "destructive",
                title: "Invalid file type",
                description: "Please upload PDF, DOCX, or TXT files only."
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            toast({
                variant: "destructive",
                title: "File too large",
                description: "Maximum file size is 10MB."
            });
            return;
        }

        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            // Use fetch directly for file upload to avoid Content-Type header conflict
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/knowledge-bases/${kbId}/documents`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `File ${file.name} uploaded successfully.`
                });
                if (fileInputRef.current) fileInputRef.current.value = "";
                onUploadComplete();
            } else {
                const error = await response.json();
                throw new Error(error.detail || "Upload failed");
            }

        } catch (error) {
            console.error("Upload error:", error);
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Unknown error occurred"
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <Input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
            />
            <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="outline"
                className="w-full border-dashed border-2 h-24 flex flex-col gap-2 hover:bg-accent/50"
            >
                {isUploading ? (
                    <>
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Uploading...</span>
                    </>
                ) : (
                    <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-muted-foreground">Click to upload document</span>
                        <span className="text-xs text-muted-foreground/70">(PDF, DOCX, TXT up to 10MB)</span>
                    </>
                )}
            </Button>
        </div>
    );
};
