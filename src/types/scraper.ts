export type SummaryMode = 'comprehensive' | 'bullet-points' | 'executive' | 'deep-dive';

export interface ScrapedData {
  url: string;
  title: string;
  description: string;
  siteName: string;
  favicon: string;
  text: string;
  wordCount: number;
  charCount: number;
  readTimeMinutes: number;
}

export interface SummaryResult {
  url: string;
  title: string;
  description: string;
  siteName: string;
  favicon: string;
  tldr: string;
  keyTakeaways: string[];
  summary: string;
  topics: string[];
  stats: {
    originalWordCount: number;
    originalCharCount: number;
    originalReadTime: number;
    summaryWordCount: number;
    summaryReadTime: number;
    reductionPercentage: number;
  };
  scrapedTextPreview: string;
  scrapedAt: string;
  modelUsed: string;
  mode: SummaryMode;
}

export interface ScrapeRequestBody {
  url: string;
  mode?: SummaryMode;
  customApiKey?: string;
}

export interface ApiResponse<T = SummaryResult> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
