/**
 * Manages URL normalization and validation
 */
export class UrlManager {
  private baseUrl: string;
  private allowedDomains: string[];
  private startPaths: string[];
  private visitedUrls: Set<string> = new Set();
  private urlQueue: string[] = [];
  private readonly urlPattern = /^(https?:\/\/[^\/]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/;
  private sectionOrder: Map<string, number> = new Map();
  private pageOrder: Map<string, Map<string, number>> = new Map();
  private currentSectionNumber = 1;

  constructor(baseUrl: string, config?: { allowedDomains?: string[]; startPaths?: string[] }) {
    this.baseUrl = this.normalizeUrl(baseUrl);
    const domain = new URL(this.baseUrl).hostname;
    this.allowedDomains = config?.allowedDomains || [domain];
    this.startPaths = config?.startPaths || ['/'];

    // Initialize queue with start paths
    this.startPaths.forEach(path => {
      const url = new URL(path, this.baseUrl).toString();
      this.addToQueue(url);
    });

    // Initialize page order maps
    this.pageOrder = new Map();
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
    } catch (error) {
      console.warn(`Invalid URL: ${url}`);
      return '';
    }
  }

  isAllowedDomain(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return this.allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  isDocumentationPath(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      
      // Skip obvious non-documentation paths
      if (/\.(png|jpg|jpeg|gif|svg|ico|css|js|json|woff|woff2|ttf|eot)$/.test(path)) {
        return false;
      }
      
      // Skip common non-documentation paths
      const skipPaths = ['/blog', '/news', '/community', '/download', '/changelog'];
      if (skipPaths.some(skip => path.startsWith(skip))) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  addToQueue(url: string): void {
    const normalized = this.normalizeUrl(url);
    if (
      normalized &&
      !this.visitedUrls.has(normalized) &&
      !this.urlQueue.includes(normalized) &&
      this.isAllowedDomain(normalized) &&
      this.isDocumentationPath(normalized)
    ) {
      // Add to queue in order based on URL structure
      const urlPath = this.getUrlPath(normalized);
      const currentUrls = [...this.urlQueue];
      
      // Sort URLs to maintain documentation structure order
      const sortedUrls = [...currentUrls, normalized].sort((a, b) => {
        const pathA = this.getUrlPath(a);
        const pathB = this.getUrlPath(b);
        return pathA.localeCompare(pathB);
      });

      this.urlQueue.length = 0;
      this.urlQueue.push(...sortedUrls);
    }
  }

  markVisited(url: string): void {
    const normalized = this.normalizeUrl(url);
    if (normalized) {
      this.visitedUrls.add(normalized);
    }
  }

  getNextUrl(): string | undefined {
    return this.urlQueue.shift();
  }

  isAllowedUrl(url: string): boolean {
    const normalized = this.normalizeUrl(url);
    return normalized !== '' && this.isAllowedDomain(normalized) && this.isDocumentationPath(normalized);
  }

  getUrlPath(url: string): string {
    try {
      const urlObj = new URL(url);
      // Get path without query parameters or hash
      let path = urlObj.pathname;
      
      // Remove trailing slashes
      path = path.replace(/\/+$/, '');
      
      return path;
    } catch (error) {
      console.error(`Failed to parse URL: ${url}`, error);
      return '';
    }
  }

  hasMoreUrls(): boolean {
    return this.urlQueue.length > 0;
  }

  getVisitedCount(): number {
    return this.visitedUrls.size;
  }

  getQueueCount(): number {
    return this.urlQueue.length;
  }

  getSectionNumber(section: string): number {
    if (!this.sectionOrder.has(section)) {
      this.sectionOrder.set(section, this.currentSectionNumber++);
      this.pageOrder.set(section, new Map());
    }
    return this.sectionOrder.get(section) || 1;
  }

  getPageNumber(section: string, url: string): number {
    const sectionPages = this.pageOrder.get(section);
    if (!sectionPages) {
      return 1;
    }

    if (!sectionPages.has(url)) {
      const nextNumber = sectionPages.size + 1;
      sectionPages.set(url, nextNumber);
    }

    return sectionPages.get(url) || 1;
  }

  hasNext(): boolean {
    return this.urlQueue.length > 0;
  }

  next(): string | undefined {
    const url = this.urlQueue.shift();
    if (url) {
      this.visitedUrls.add(url);
    }
    return url;
  }
}
