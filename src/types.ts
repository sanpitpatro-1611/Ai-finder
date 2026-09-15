export type AICategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'coding'
  | 'website-builder'
  | 'app-builder'
  | 'design'
  | 'research'
  | 'local-ai'
  | 'productivity';

export type FreeStatus =
  | 'free'
  | 'free-tier'
  | 'open-source'
  | 'free-credits'
  | 'self-hosted'
  | 'paid'
  | 'pricing-unverified';

export type VerificationStatus =
  | 'verified'
  | 'community-reported'
  | 'pending-check';

export type ItemType = 'model' | 'tool' | 'framework' | 'runtime';

export type AccessType = 'web' | 'api' | 'local' | 'cli' | 'desktop' | 'extension';

export type SourceType = 'live-api' | 'github' | 'rss' | 'curated-baseline';

export interface AITrackerItem {
  id: string;
  name: string;
  provider: string;
  type: ItemType;
  category: AICategory;
  description: string;
  capabilities: string[];
  releaseDate: string; // ISO date string (YYYY-MM-DD) or "Release date not verified"
  freeStatus: FreeStatus;
  openSource: boolean;
  selfHosted: boolean;
  accessType: AccessType;
  officialUrl: string;
  sourceUrl: string;
  sourceName: string;
  lastVerifiedAt: string;
  verificationStatus: VerificationStatus;
  limitations: string[];
  tags: string[];
  sourceType: SourceType;
  license?: string;
  whatChanged?: string;
  whyItMatters?: string;
  stars?: number;
  downloads?: number;
}

export interface SourceHealth {
  id: string;
  name: string;
  url: string;
  type: 'huggingface' | 'github' | 'rss' | 'curated';
  status: 'healthy' | 'degraded' | 'offline' | 'cached';
  latencyMs: number;
  lastChecked: string;
  itemsRetrieved: number;
  error?: string;
  notes?: string;
}

export interface TrackerDataResponse {
  items: AITrackerItem[];
  sources: SourceHealth[];
  lastRefreshed: string;
  isCached: boolean;
  cacheAgeSeconds: number;
  totalCount: number;
  liveCount: number;
  baselineCount: number;
}

export interface CategoryMeta {
  id: AICategory;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
  accentColor: string;
  keywords: string[];
}

export interface ScoutMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  referencedToolIds?: string[];
  suggestedPrompts?: string[];
}

export interface FilterOptions {
  searchQuery: string;
  category: AICategory | 'all';
  freeStatus: FreeStatus | 'all';
  openSourceOnly: boolean;
  selfHostedOnly: boolean;
  recentlyReleasedOnly: boolean;
  requiresApiKeyOnly: boolean;
  noCodeOnly: boolean;
  itemType: ItemType | 'all';
  sortBy: 'newest' | 'recently-updated' | 'free-first' | 'open-source-first' | 'most-relevant';
}
