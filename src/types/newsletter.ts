/**
 * TypeScript types for Newsletter Rich Text Editor
 */

export type NewsletterStatus = 'draft' | 'published' | 'scheduled' | 'archived';

/**
 * Media reference for embedded content
 */
export interface MediaReference {
  id: string;
  type: 'image' | 'video' | 'attachment';
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  filename?: string;
  size?: number;
  uploaded_at?: string;
}

/**
 * Newsletter section/block structure
 */
export interface NewsletterSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'heading' | 'quote' | 'list';
  order: number;
  content: string; // HTML content from TipTap
  metadata?: {
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    listType?: 'ordered' | 'unordered';
    alignment?: 'left' | 'center' | 'right' | 'justify';
    [key: string]: any;
  };
}

/**
 * Newsletter style configuration
 */
export interface NewsletterStyle {
  template: 'professional' | 'modern' | 'minimal' | 'custom';
  themeId?: string; // Theme ID from newsletter-themes
  colors: {
    primary: string;
    secondary: string;
    background?: string;
    text?: string;
    headerBg?: string;
    footerBg?: string;
    textHeading?: string;
    textBody?: string;
    textMuted?: string;
    cardBg?: string;
    border?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing?: {
    section: number;
    paragraph: number;
  };
  layout?: {
    headerStyle?: 'dark' | 'light' | 'gradient';
    footerStyle?: 'dark' | 'light';
    cardStyle?: 'rounded' | 'sharp' | 'elevated';
    spacing?: 'compact' | 'normal' | 'spacious';
  };
}

/**
 * Complete newsletter content structure
 */
export interface NewsletterContent {
  sections: NewsletterSection[];
  media: MediaReference[]; // All media references used in the newsletter
  style: NewsletterStyle;
  sources?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

/**
 * Main Newsletter interface
 */
export interface Newsletter {
  id?: number;
  title: string;
  subject: string;
  content: NewsletterContent | string; // Can be object or JSON string
  html_content?: string; // Final rendered HTML
  status: NewsletterStatus;
  scheduled_at?: string;
  ai_generated?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * TipTap JSON content structure (as stored by TipTap)
 */
export interface TipTapContent {
  type: string;
  content?: TipTapContent[];
  attrs?: Record<string, any>;
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
}

/**
 * Newsletter editor state
 */
export interface NewsletterEditorState {
  title: string;
  subject: string;
  content: TipTapContent;
  sections: NewsletterSection[];
  media: MediaReference[];
  style: NewsletterStyle;
  isDirty: boolean;
  isSaving: boolean;
}

