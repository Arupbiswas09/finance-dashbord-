import { FooterBlockData } from '@/types/newsletter-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface FooterBlockProps {
  data: FooterBlockData;
  onChange: (data: FooterBlockData) => void;
  theme: {
    primary: string;
    accent: string;
  };
}

export const FooterBlock = ({ data, onChange, theme }: FooterBlockProps) => {
  const addSocialLink = () => {
    onChange({
      ...data,
      socialLinks: [
        ...(data.socialLinks || []),
        { platform: '', url: '' },
      ],
    });
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...(data.socialLinks || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, socialLinks: updated });
  };

  const removeSocialLink = (index: number) => {
    onChange({
      ...data,
      socialLinks: data.socialLinks?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Company Name</Label>
        <Input
          value={data.companyName || ''}
          onChange={(e) => onChange({ ...data, companyName: e.target.value })}
          placeholder="Company name"
        />
      </div>
      <div>
        <Label>Contact Email</Label>
        <Input
          type="email"
          value={data.contactInfo?.email || ''}
          onChange={(e) => onChange({
            ...data,
            contactInfo: { ...data.contactInfo, email: e.target.value },
          })}
          placeholder="contact@company.com"
        />
      </div>
      <div>
        <Label>Phone</Label>
        <Input
          value={data.contactInfo?.phone || ''}
          onChange={(e) => onChange({
            ...data,
            contactInfo: { ...data.contactInfo, phone: e.target.value },
          })}
          placeholder="+1 (555) 123-4567"
        />
      </div>
      <div>
        <Label>Address</Label>
        <Input
          value={data.contactInfo?.address || ''}
          onChange={(e) => onChange({
            ...data,
            contactInfo: { ...data.contactInfo, address: e.target.value },
          })}
          placeholder="Company address"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Social Links</Label>
          <Button size="sm" onClick={addSocialLink}>
            <Plus className="h-4 w-4 mr-1" />
            Add Link
          </Button>
        </div>
        {(data.socialLinks || []).map((link, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={link.platform}
              onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
              placeholder="Platform (e.g., Twitter)"
              className="flex-1"
            />
            <Input
              value={link.url}
              onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
              placeholder="URL"
              className="flex-1"
            />
            <Button variant="ghost" size="sm" onClick={() => removeSocialLink(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div>
        <Label>Unsubscribe Text</Label>
        <Input
          value={data.unsubscribeText || ''}
          onChange={(e) => onChange({ ...data, unsubscribeText: e.target.value })}
          placeholder="Unsubscribe from this list"
        />
      </div>
    </div>
  );
};

