import { useState } from 'react';
import { HeroBlockData } from '@/types/newsletter-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { buildApiUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface HeroBlockProps {
  data: HeroBlockData;
  onChange: (data: HeroBlockData) => void;
  theme: {
    primary: string;
    accent: string;
  };
}

export const HeroBlock = ({ data, onChange, theme }: HeroBlockProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

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
        <Label>Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Hero title"
        />
      </div>
      <div>
        <Label>Subtitle (optional)</Label>
        <Input
          value={data.subtitle || ''}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          placeholder="Hero subtitle"
        />
      </div>
      <div>
        <Label>Date Badge (optional)</Label>
        <Input
          value={data.dateBadge || ''}
          onChange={(e) => onChange({ ...data, dateBadge: e.target.value })}
          placeholder="e.g., Q4 2024"
        />
      </div>
      <div>
        <Label>Image</Label>
        {data.imageUrl ? (
          <div className="relative mt-2">
            <img src={data.imageUrl} alt="Hero" className="w-full h-48 object-cover rounded-lg" />
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
      <div>
        <Label>Alignment</Label>
        <select
          value={data.alignment || 'center'}
          onChange={(e) => onChange({ ...data, alignment: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full mt-2 p-2 border rounded"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
};

