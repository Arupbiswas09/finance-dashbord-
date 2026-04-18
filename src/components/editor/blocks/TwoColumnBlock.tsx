import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TwoColumnBlockData } from '@/types/newsletter-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { buildApiUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface TwoColumnBlockProps {
  data: TwoColumnBlockData;
  onChange: (data: TwoColumnBlockData) => void;
  theme: {
    primary: string;
    accent: string;
  };
}

export const TwoColumnBlock = ({ data, onChange, theme }: TwoColumnBlockProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'left' | 'right'>('left');
  const [uploading, setUploading] = useState(false);

  const leftEditor = useEditor({
    extensions: [StarterKit, Image],
    content: data.left.content,
    onUpdate: ({ editor }) => {
      onChange({ ...data, left: { ...data.left, content: editor.getHTML() } });
    },
  });

  const rightEditor = useEditor({
    extensions: [StarterKit, Image],
    content: data.right.content,
    onUpdate: ({ editor }) => {
      onChange({ ...data, right: { ...data.right, content: editor.getHTML() } });
    },
  });

  const handleImageUpload = async (file: File, side: 'left' | 'right') => {
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
      if (side === 'left') {
        onChange({ ...data, left: { ...data.left, imageUrl: result.url } });
      } else {
        onChange({ ...data, right: { ...data.right, imageUrl: result.url } });
      }
      toast({ title: 'Success', description: 'Image uploaded' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'left' | 'right')}>
        <TabsList>
          <TabsTrigger value="left">Left Column</TabsTrigger>
          <TabsTrigger value="right">Right Column</TabsTrigger>
        </TabsList>
        <TabsContent value="left" className="space-y-4">
          <div>
            <Label>Left Title</Label>
            <Input
              value={data.left.title || ''}
              onChange={(e) => onChange({ ...data, left: { ...data.left, title: e.target.value } })}
              placeholder="Left column title"
            />
          </div>
          <div>
            <Label>Left Image</Label>
            {data.left.imageUrl ? (
              <div className="relative mt-2">
                <img src={data.left.imageUrl} alt="Left" className="w-full h-32 object-cover rounded-lg" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onChange({ ...data, left: { ...data.left, imageUrl: undefined } })}
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
                    if (file) handleImageUpload(file, 'left');
                  }}
                  disabled={uploading}
                />
              </div>
            )}
          </div>
          <div>
            <Label>Left Content</Label>
            {leftEditor && (
              <div className="mt-2 border rounded-lg p-4 min-h-[200px]">
                <EditorContent editor={leftEditor} />
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="right" className="space-y-4">
          <div>
            <Label>Right Title</Label>
            <Input
              value={data.right.title || ''}
              onChange={(e) => onChange({ ...data, right: { ...data.right, title: e.target.value } })}
              placeholder="Right column title"
            />
          </div>
          <div>
            <Label>Right Image</Label>
            {data.right.imageUrl ? (
              <div className="relative mt-2">
                <img src={data.right.imageUrl} alt="Right" className="w-full h-32 object-cover rounded-lg" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onChange({ ...data, right: { ...data.right, imageUrl: undefined } })}
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
                    if (file) handleImageUpload(file, 'right');
                  }}
                  disabled={uploading}
                />
              </div>
            )}
          </div>
          <div>
            <Label>Right Content</Label>
            {rightEditor && (
              <div className="mt-2 border rounded-lg p-4 min-h-[200px]">
                <EditorContent editor={rightEditor} />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

