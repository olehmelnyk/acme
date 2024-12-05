import { logger } from './logger';

/**
 * Manages URL normalization and validation
 */
export class UrlManager {
  private baseUrl: string;
  private allowedDomains: string[];
  private visitedUrls: Set<string> = new Set();
  private urlQueue: string[] = [];
  private maxDepth: number;

  constructor(baseUrl: string, config?: { allowedDomains?: string[]; maxDepth?: number }) {
    this.baseUrl = this.normalizeUrl(baseUrl);
    const domain = new URL(this.baseUrl).hostname;
    this.allowedDomains = config?.allowedDomains || [domain];
    this.maxDepth = config?.maxDepth || 15;

    // Add base URL to queue
    this.addToQueue(this.baseUrl);
  }

  normalizeUrl(url: string): string {
    try {
      // Handle relative paths
      if (!url.startsWith('http')) {
        url = new URL(url, this.baseUrl).toString();
      }
      
      // Remove trailing slashes, hashes, and query params
      const parsedUrl = new URL(url);
      parsedUrl.hash = '';
      parsedUrl.search = '';
      let normalized = parsedUrl.toString();
      if (normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
      }
      return normalized;
    } catch {
      logger.warn(`Invalid URL: ${url}`);
      return '';
    }
  }

  urlToFilename(url: string): string {
    try {
      const parsedUrl = new URL(url);
      let pathname = parsedUrl.pathname;
      
      // Handle root path
      if (pathname === '/' || pathname === '') {
        return 'index.html';
      }

      // Remove leading and trailing slashes
      pathname = pathname.replace(/^\/|\/$/g, '');

      // Replace special characters with hyphens
      let filename = pathname
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');

      // Handle file extension
      if (!filename.endsWith('.html')) {
        filename = `${filename}.html`;
      }

      // Ensure valid filename
      return filename;
    } catch (error) {
      logger.warn(`Error converting URL to filename: ${url}`, error);
      return 'unknown.html';
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return this.allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  addToQueue(url: string): void {
    const normalizedUrl = this.normalizeUrl(url);
    if (
      normalizedUrl &&
      !this.visitedUrls.has(normalizedUrl) &&
      !this.urlQueue.includes(normalizedUrl) &&
      this.isValidUrl(normalizedUrl) &&
      this.visitedUrls.size < this.maxDepth
    ) {
      logger.log(`Adding to queue: ${normalizedUrl}`);
      this.urlQueue.push(normalizedUrl);
    }
  }

  hasNext(): boolean {
    return this.urlQueue.length > 0;
  }

  getNext(): string | undefined {
    const url = this.urlQueue.shift();
    if (url) {
      this.visitedUrls.add(url);
    }
    return url;
  }

  getVisitedUrls(): string[] {
    return Array.from(this.visitedUrls);
  }

  clearQueue(): void {
    this.urlQueue = [];
  }

  isDocumentationUrl(url: string): boolean {
    const docPatterns = [
      /docs?/i,
      /documentation/i,
      /guide/i,
      /tutorial/i,
      /manual/i,
      /reference/i,
      /api/i,
      /readme/i,
      /getting-started/i
    ];

    try {
      const parsedUrl = new URL(url);
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      
      return docPatterns.some(pattern => 
        pathSegments.some(segment => pattern.test(segment))
      );
    } catch {
      return false;
    }
  }
}
