import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { ArticleBlockData } from '@/types/newsletter-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { buildApiUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface ArticleBlockProps {
  data: ArticleBlockData;
  onChange: (data: ArticleBlockData) => void;
  theme: {
    primary: string;
    accent: string;
  };
}

export const ArticleBlock = ({ data, onChange, theme }: ArticleBlockProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: data.content,
    onUpdate: ({ editor }) => {
      onChange({ ...data, content: editor.getHTML() });
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!user?.organization?.id) return;

    setUploading(true);
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

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      onChange({ ...data, imageUrl: result.url });
      toast({ title: 'Success', description: 'Image uploaded' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Article Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Article title"
        />
      </div>
      <div>
        <Label>Image Position</Label>
        <select
          value={data.imagePosition || 'top'}
          onChange={(e) => onChange({ ...data, imagePosition: e.target.value as 'left' | 'right' | 'top' })}
          className="w-full mt-2 p-2 border rounded"
        >
          <option value="top">Top</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
      {data.imagePosition && data.imagePosition !== 'top' && (
        <div>
          <Label>Image</Label>
          {data.imageUrl ? (
            <div className="relative mt-2">
              <img src={data.imageUrl} alt="Article" className="w-full h-32 object-cover rounded-lg" />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => onChange({ ...data, imageUrl: undefined })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                disabled={uploading}
              />
            </div>
          )}
        </div>
      )}
      <div>
        <Label>Content</Label>
        {editor && (
          <div className="mt-2 border rounded-lg p-4 min-h-[200px]">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
      <div>
        <Label>Author (optional)</Label>
        <Input
          value={data.author || ''}
          onChange={(e) => onChange({ ...data, author: e.target.value })}
          placeholder="Author name"
        />
      </div>
      <div>
        <Label>Date (optional)</Label>
        <Input
          value={data.date || ''}
          onChange={(e) => onChange({ ...data, date: e.target.value })}
          placeholder="Publication date"
        />
      </div>
    </div>
  );
};

