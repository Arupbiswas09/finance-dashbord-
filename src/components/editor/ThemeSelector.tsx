import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { NewsletterTheme, newsletterThemes, getThemeById } from '@/themes/newsletter-themes';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onThemeChange: (theme: NewsletterTheme) => void;
}

export const ThemeSelector = ({ selectedThemeId, onThemeChange }: ThemeSelectorProps) => {
  const [selectedId, setSelectedId] = useState(selectedThemeId);

  const handleThemeSelect = (theme: NewsletterTheme) => {
    setSelectedId(theme.id);
    onThemeChange(theme);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Newsletter Theme</CardTitle>
        <CardDescription>
          Choose a theme to style your newsletter. The theme affects colors, fonts, and layout.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {newsletterThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              className={`relative p-4 border-2 rounded-lg transition-all text-left ${
                selectedId === theme.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Theme Preview */}
                <div className="flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-gray-200"
                    style={{
                      background: `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.secondary} 100%)`,
                    }}
                  />
                </div>
                
                {/* Theme Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{theme.name}</h3>
                    {selectedId === theme.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                    
                  
                  {/* Color Preview */}
                  <div className="flex gap-1 mt-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.colors.headerBg }}
                      title="Header"
                    />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

