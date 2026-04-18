import { useState } from "react";
import Newsletters from "./Newsletters";
import NewsletterEditorRich from "@/components/editor/NewsletterEditorRich";
import { Newsletter as NewsletterType } from "@/types/newsletter";

// Legacy Newsletter interface for backward compatibility
interface LegacyNewsletter {
  id?: number;
  title: string;
  subject: string;
  content: {
    sections: any[];
    images: any[];
    graphs: any[];
    style: {
      template: string;
      colors: { primary: string; secondary: string };
      fonts: { heading: string; body: string };
    };
    sources?: Array<{
      title: string;
      url: string;
      description?: string;
    }>;
  };
  html_content?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduled_at?: string;
  ai_generated?: boolean;
}

// Helper function to convert legacy newsletter format to new format
function convertLegacyNewsletter(legacy: LegacyNewsletter): NewsletterType {
  const sections = legacy.content?.sections || [];
  const newsletterSections = sections.map((section: any, index: number) => ({
    id: section.id || `section_${Date.now()}_${index}`,
    type: 'text' as const,
    order: index,
    content: section.content || '',
    metadata: {},
  }));

  return {
    id: legacy.id,
    title: legacy.title,
    subject: legacy.subject,
    content: {
      sections: newsletterSections,
      media: legacy.content?.images?.map((img: any, idx: number) => ({
        id: `media_${idx}`,
        type: 'image' as const,
        url: typeof img === 'string' ? img : img.url || img.src || '',
        alt: typeof img === 'string' ? '' : img.alt || '',
      })) || [],
      style: {
        template: (legacy.content?.style?.template || "professional") as
          | "professional"
          | "modern"
          | "minimal"
          | "custom",
        colors: {
          primary: legacy.content?.style?.colors?.primary || '#1f2937',
          secondary: legacy.content?.style?.colors?.secondary || '#6b7280',
        },
        fonts: {
          heading: legacy.content?.style?.fonts?.heading || 'Arial',
          body: legacy.content?.style?.fonts?.body || 'Arial',
        },
      },
      sources: legacy.content?.sources || [],
    },
    html_content: legacy.html_content,
    status: legacy.status,
    scheduled_at: legacy.scheduled_at,
    ai_generated: legacy.ai_generated,
  };
}

const Newsletter = () => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedNewsletter, setSelectedNewsletter] = useState<NewsletterType | null>(null);

  const handleEditNewsletter = (newsletter: LegacyNewsletter | NewsletterType) => {
    // Convert legacy format if needed
    const convertedNewsletter: NewsletterType = 'content' in newsletter && typeof newsletter.content === 'object' && 'sections' in newsletter.content
      ? newsletter as NewsletterType
      : convertLegacyNewsletter(newsletter as LegacyNewsletter);
    
    setSelectedNewsletter(convertedNewsletter);
    setCurrentView('edit');
  };

  const handleSaveNewsletter = (newsletterData: NewsletterType) => {
    // NewsletterEditorRich handles the API call, just navigate back
    setCurrentView('list');
    setSelectedNewsletter(null);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedNewsletter(null);
  };

  if (currentView === 'edit' || currentView === 'create') {
    return (
      <NewsletterEditorRich
        newsletter={currentView === 'edit' ? selectedNewsletter || undefined : undefined}
        onBack={handleBackToList}
        onSave={handleSaveNewsletter}
      />
    );
  }

  return (
    <Newsletters
      currentView={currentView}
      onViewChange={setCurrentView}
      onEditNewsletter={(n) =>
        handleEditNewsletter(n as unknown as NewsletterType | LegacyNewsletter)
      }
    />
  );
};

export default Newsletter;