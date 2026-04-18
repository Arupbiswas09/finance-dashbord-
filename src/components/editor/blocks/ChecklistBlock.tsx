import { ChecklistBlockData } from '@/types/newsletter-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';

interface ChecklistBlockProps {
  data: ChecklistBlockData;
  onChange: (data: ChecklistBlockData) => void;
  theme: {
    primary: string;
    accent: string;
  };
}

export const ChecklistBlock = ({ data, onChange, theme }: ChecklistBlockProps) => {
  const updateItem = (index: number, field: 'text' | 'checked', value: string | boolean) => {
    const updated = [...data.items];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, items: updated });
  };

  const addItem = () => {
    onChange({
      ...data,
      items: [...data.items, { text: '', checked: false }],
    });
  };

  const removeItem = (index: number) => {
    onChange({
      ...data,
      items: data.items.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Title (optional)</Label>
        <Input
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Checklist title"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Items</Label>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
        {data.items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2 border rounded p-2">
            <Checkbox
              checked={item.checked}
              onCheckedChange={(checked) => updateItem(index, 'checked', checked === true)}
            />
            <Input
              value={item.text}
              onChange={(e) => updateItem(index, 'text', e.target.value)}
              placeholder="Item text"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

