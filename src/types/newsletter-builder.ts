/**
 * Block-based Newsletter Editor Types
 */

export type BlockType = 
  | 'hero'
  | 'metrics'
  | 'article'
  | 'twoColumn'
  | 'checklist'
  | 'footer';

export interface ThemeOptions {
  primary: string;
  accent: string;
  bgCard: string;
  textHeading: string;
  textBody: string;
  cardStyle: 'rounded' | 'sharp';
  background: 'light' | 'dark';
}

export interface HeroBlockData {
  imageUrl?: string;
  title: string;
  subtitle?: string;
  dateBadge?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface MetricBlockData {
  metrics: Array<{
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
  }>;
}

export interface ArticleBlockData {
  imageUrl?: string;
  title: string;
  content: string; // Rich text HTML
  author?: string;
  date?: string;
  imagePosition?: 'left' | 'right' | 'top';
}

export interface TwoColumnBlockData {
  left: {
    title?: string;
    content: string; // Rich text HTML
    imageUrl?: string;
  };
  right: {
    title?: string;
    content: string; // Rich text HTML
    imageUrl?: string;
  };
}

export interface ChecklistBlockData {
  title?: string;
  items: Array<{
    text: string;
    checked: boolean;
  }>;
}

export interface FooterBlockData {
  companyName?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  unsubscribeText?: string;
}

export type BlockData = 
  | HeroBlockData
  | MetricBlockData
  | ArticleBlockData
  | TwoColumnBlockData
  | ChecklistBlockData
  | FooterBlockData;

export interface NewsletterBlock {
  id: string;
  type: BlockType;
  data: BlockData;
  order: number;
}

export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  previewImage?: string;
  theme: ThemeOptions;
  blocks: Omit<NewsletterBlock, 'id' | 'order'>[];
}

export interface NewsletterBuilderData {
  id?: string;
  title: string;
  subject: string;
  template: string;
  theme: ThemeOptions;
  content: any; // TipTap JSON document
  blocks: NewsletterBlock[];
  html?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

