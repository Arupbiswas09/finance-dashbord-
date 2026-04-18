import { ThemeOptions } from '@/types/newsletter-builder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ThemeCustomizerProps {
  theme: ThemeOptions;
  onChange: (theme: ThemeOptions) => void;
}

export const ThemeCustomizer = ({ theme, onChange }: ThemeCustomizerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Customization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Primary Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={theme.primary}
              onChange={(e) => onChange({ ...theme, primary: e.target.value })}
              className="w-16 h-10"
            />
            <Input
              type="text"
              value={theme.primary}
              onChange={(e) => onChange({ ...theme, primary: e.target.value })}
              placeholder="#1e40af"
            />
          </div>
        </div>
        <div>
          <Label>Accent Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={theme.accent}
              onChange={(e) => onChange({ ...theme, accent: e.target.value })}
              className="w-16 h-10"
            />
            <Input
              type="text"
              value={theme.accent}
              onChange={(e) => onChange({ ...theme, accent: e.target.value })}
              placeholder="#3b82f6"
            />
          </div>
        </div>
        <div>
          <Label>Card Background</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={theme.bgCard}
              onChange={(e) => onChange({ ...theme, bgCard: e.target.value })}
              className="w-16 h-10"
            />
            <Input
              type="text"
              value={theme.bgCard}
              onChange={(e) => onChange({ ...theme, bgCard: e.target.value })}
              placeholder="#ffffff"
            />
          </div>
        </div>
        <div>
          <Label>Heading Text Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={theme.textHeading}
              onChange={(e) => onChange({ ...theme, textHeading: e.target.value })}
              className="w-16 h-10"
            />
            <Input
              type="text"
              value={theme.textHeading}
              onChange={(e) => onChange({ ...theme, textHeading: e.target.value })}
              placeholder="#1f2937"
            />
          </div>
        </div>
        <div>
          <Label>Body Text Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={theme.textBody}
              onChange={(e) => onChange({ ...theme, textBody: e.target.value })}
              className="w-16 h-10"
            />
            <Input
              type="text"
              value={theme.textBody}
              onChange={(e) => onChange({ ...theme, textBody: e.target.value })}
              placeholder="#4b5563"
            />
          </div>
        </div>
        <div>
          <Label>Card Style</Label>
          <Select
            value={theme.cardStyle}
            onValueChange={(value: 'rounded' | 'sharp') => onChange({ ...theme, cardStyle: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="sharp">Sharp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Background</Label>
          <Select
            value={theme.background}
            onValueChange={(value: 'light' | 'dark') => onChange({ ...theme, background: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

