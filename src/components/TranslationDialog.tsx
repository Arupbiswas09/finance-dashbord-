import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Languages, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { buildApiUrl, getAuthHeaders } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface TranslationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number;
  onTranslationComplete: (translatedData: any) => void;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

type TranslationStatus = 'idle' | 'translating' | 'typing' | 'complete';

export function TranslationDialog({
  open,
  onOpenChange,
  reportId,
  onTranslationComplete
}: TranslationDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [translatedContent, setTranslatedContent] = useState<any>(null);
  const [typingText, setTypingText] = useState('');
  const [progress, setProgress] = useState(0);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedLanguage(null);
      setStatus('idle');
      setTranslatedContent(null);
      setTypingText('');
      setProgress(0);
    }
  }, [open]);

  // Typing effect for summary
  useEffect(() => {
    if (status === 'typing' && translatedContent) {
      const summary = translatedContent.summary || '';
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex <= summary.length) {
          setTypingText(summary.substring(0, currentIndex));
          currentIndex++;
          setProgress((currentIndex / summary.length) * 100);
        } else {
          clearInterval(typingInterval);
          setStatus('complete');
          setProgress(100);
        }
      }, 15); // Typing speed (ms per character)

      return () => clearInterval(typingInterval);
    }
  }, [status, translatedContent]);

  const handleTranslate = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setStatus('translating');
    setProgress(0);

    try {
      const response = await fetch(buildApiUrl(`/api/reports/${reportId}/translate`), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          target_language: languageCode
        })
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const translatedData = await response.json();
      setTranslatedContent(translatedData);

      // Start typing effect
      setStatus('typing');

    } catch (error) {
      console.error('Error translating report:', error);
      toast({
        title: 'Translation Failed',
        description: 'Failed to translate report content',
        variant: 'destructive',
      });
      setStatus('idle');
      setSelectedLanguage(null);
    }
  };

  const handleApplyTranslation = () => {
    if (translatedContent) {
      const languageName = LANGUAGES.find(l => l.code === selectedLanguage)?.name;

      toast({
        title: 'Translation Applied',
        description: `Report has been translated to ${languageName}`,
      });

      onTranslationComplete(translatedContent);

      // Reload to show translated content
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const renderLanguageSelection = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Select a language to translate your report. The translation will be powered by AI and may take a few moments.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((language) => (
          <Button
            key={language.code}
            variant="outline"
            className="h-20 flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
            onClick={() => handleTranslate(language.code)}
            disabled={status !== 'idle'}
          >
            <span className="text-3xl">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  const renderTranslating = () => {
    const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage);

    return (
      <div className="space-y-6 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
              <Languages className="w-10 h-10 text-blue-600 animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center">
              <span className="text-lg">{selectedLang?.flag}</span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Translating to {selectedLang?.name}...
            </h3>
            <p className="text-sm text-gray-600">
              Our AI is translating your report content
            </p>
          </div>
        </div>

        {/* Translation stages */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-gray-700">Analyzing report structure...</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-gray-700">Translating executive summary...</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-gray-700">Translating recommendations...</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              AI-powered translation ensures accuracy while maintaining the professional tone and context of your financial report.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderTyping = () => {
    const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Translation Complete!</span>
        </div>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedLang?.flag}</span>
                <h4 className="font-semibold text-gray-900">Translated Preview ({selectedLang?.name})</h4>
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(progress)}% displayed
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[120px] relative">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {typingText}
                  <span className="inline-block w-0.5 h-4 bg-blue-600 ml-0.5 animate-pulse" />
                </p>
              </div>
            </div>

            {translatedContent?.recommendations && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  <Loader2 className="inline w-3 h-3 animate-spin mr-1" />
                  Loading {translatedContent.recommendations.length} recommendations...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-sm text-gray-600 text-center">
          Preparing your translated report...
        </p>
      </div>
    );
  };

  const renderComplete = () => {
    const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage);

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Translation Complete!
            </h3>
            <p className="text-sm text-gray-600">
              Your report has been successfully translated to {selectedLang?.name}
            </p>
          </div>
        </div>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{selectedLang?.flag}</span>
              <h4 className="font-semibold text-gray-900">Translated Content Preview</h4>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-[200px] overflow-y-auto">
              <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
                {translatedContent?.summary}
              </p>
            </div>

            {translatedContent?.recommendations && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  {translatedContent.recommendations.length} Recommendations Translated
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setStatus('idle');
              setSelectedLanguage(null);
              setTranslatedContent(null);
            }}
          >
            Translate to Another Language
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleApplyTranslation}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Apply Translation
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-blue-600" />
            Translate Report
          </DialogTitle>
          <DialogDescription>
            Translate your financial report to another language using AI-powered translation
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {status === 'idle' && renderLanguageSelection()}
          {status === 'translating' && renderTranslating()}
          {status === 'typing' && renderTyping()}
          {status === 'complete' && renderComplete()}
        </div>

        {status === 'idle' && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
