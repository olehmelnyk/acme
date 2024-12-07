import { DocsConfig } from './config';
import { Browser, BrowserContext, Page } from 'playwright';

export interface PackageDocsConfig {
  name: string;
  docsUrl: string;
  path?: string;
  fetch?: boolean;
  searchAttempted?: boolean;
  lastFetched?: string;
  config?: {
    fetchDocs?: boolean;
    searchDocs?: boolean;
    docsUrl?: string;
    allowedDomains?: string[];
    startPaths?: string[];
  };
}

export interface DocsFetcher {
  config: DocsConfig;
  packageDocs: Map<string, PackageDocsConfig>;
  browser: Browser | null;
  context: BrowserContext | null;
  initBrowser(): Promise<void>;
  loadPackageDocs(): Promise<void>;
  savePackageDocs(): Promise<void>;
  initPackage(pkg: PackageDocsConfig): Promise<void>;
  fetchPage(url: string, page: Page): Promise<{ links: string[]; title: string }>;
  fetchPackage(pkg: PackageDocsConfig): Promise<void>;
  fetchAllDocs(pattern?: string): Promise<void>;
  close(): Promise<void>;
}

export interface CacheOptions {
  maxSize: number;
  ttl: number;
  cleanupInterval?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  size: number;
}

export interface CacheStats {
  size: number;
  entries: number;
  hits: number;
  misses: number;
  lastCleanup: number;
}

export interface DocumentationScore {
  url: string;
  score: number;
  details: {
    readability: number;
    completeness: number;
    freshness: number;
    accessibility: number;
    codeExamples: number;
    apiDocs: number;
  };
  metadata: {
    lastUpdated?: string;
    wordCount: number;
    codeBlockCount: number;
    headingCount: number;
    hasSearch: boolean;
    hasNavigation: boolean;
    hasExamples: boolean;
    hasApi: boolean;
  };
}

export interface ScoringOptions {
  minWordCount: number;
  minCodeExamples: number;
  minHeadings: number;
  readabilityThreshold: number;
  maxAge: number;
  weights: {
    readability: number;
    completeness: number;
    freshness: number;
    accessibility: number;
    codeExamples: number;
    apiDocs: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  statusCode?: number;
  contentType?: string;
  error?: string;
  redirectUrl?: string;
  responseTime: number;
}

export interface FetchResult {
  url: string;
  content: string;
  validation: ValidationResult;
  score?: DocumentationScore;
}

export interface PackageMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  bugs?: {
    url: string;
  };
  keywords?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface DocumentationInfo {
  urls: string[];
  quality?: DocumentationScore[];
  mainUrl?: string;
  alternativeUrls?: string[];
}

export interface PackageInfo extends PackageMetadata {
  documentation?: DocumentationInfo;
  installInstructions?: string;
  lastFetched?: number;
}

export interface FetchConfig {
  cacheDir: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  userAgent: string;
  maxConcurrency: number;
  maxDepth: number;
  ignorePatterns: string[];
  allowedDomains: string[];
  excludedDomains: string[];
  maxFileSize: number;
  followRedirects: boolean;
  validateSSL: boolean;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  proxy?: string;
}

export interface DirectoryInfo {
  path: string;
  exists: boolean;
  isWritable: boolean;
  size: number;
  files: number;
  lastModified: number;
}

export interface ErrorDetails {
  code: string;
  message: string;
  cause?: unknown;
  context?: Record<string, unknown>;
}

export type FetcherOptions = Partial<FetchConfig> & {
  scoringOptions?: Partial<ScoringOptions>;
  cacheOptions?: Partial<CacheOptions>;
};
