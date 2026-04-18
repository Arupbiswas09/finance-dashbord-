export interface KnowledgeSource {
  id: number;
  organization_id: number;
  title: string;
  url: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  last_scraped_at?: string;
  scrape_status: 'pending' | 'scraping' | 'success' | 'failed';
  scrape_error?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface KnowledgeSourceCreate {
  title: string;
  url: string;
  description?: string;
  is_active?: boolean;
}

export interface KnowledgeSourceUpdate {
  title?: string;
  url?: string;
  description?: string;
  is_active?: boolean;
}

export interface ScrapeRequest {
  source_ids: number[];
}
