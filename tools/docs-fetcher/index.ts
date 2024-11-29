import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DocsConfig, configs, DEFAULT_DELAY, DEFAULT_CACHE_DIR, CACHE_MAX_AGE_DAYS } from './config';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface CacheMeta {
  lastFetched: string;
  baseUrl: string;
  projectName: string;
}

export class DocsFetcher {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly projectCacheDir: string;
  private readonly metaFile: string;

  constructor(private readonly config: DocsConfig) {
    this.config.cacheDir = this.config.cacheDir || path.join(__dirname, DEFAULT_CACHE_DIR);
    this.config.delay = this.config.delay || DEFAULT_DELAY;
    
    this.projectCacheDir = path.join(this.config.cacheDir, this.config.projectName);
    this.metaFile = path.join(this.projectCacheDir, 'meta.json');
  }

  private async init(): Promise<void> {
    this.browser = await chromium.launch();
    this.page = await this.browser.newPage();
  }

  private async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  private async fetchPage(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.text();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error instanceof Error ? error.message : error);
      return null;
    }
  }

  private async visitPage(url: string): Promise<string[]> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 45000 
      });
      
      await this.page.waitForSelector('main', { timeout: 45000 });
      
      // Try to expand sections on this page
      await this.page.evaluate(() => {
        const expandButtons = document.querySelectorAll('button[aria-expanded="false"]');
        expandButtons.forEach(button => (button as HTMLButtonElement).click());
      });
      
      await this.page.waitForTimeout(500);
      
      return await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href*="/docs"]'))
          .map(a => a.getAttribute('href'))
          .filter(href => href && href.startsWith('/docs') && !href.includes('#')) as string[];
      });
    } catch (error) {
      console.warn(`Warning: Failed to process ${url}:`, error instanceof Error ? error.message : error);
      return [];
    }
  }

  private formatName(name: string, index: number): string {
    return `${index}-${name}`;
  }

  private rootFolderOrder: { [key: string]: number } = {
    'getting-started': 1,
    'configuration': 2,
    'database': 3,
    'fields': 4,
    'access-control': 5,
    'hooks': 6,
    'admin': 7,
    'authentication': 8,
    'rest-api': 9,
    'graphql': 10,
    'local-api': 11,
    'queries': 12,
    'rich-text': 13,
    'lexical': 14,
    'live-preview': 15,
    'versions': 16,
    'upload': 17,
    'email': 18,
    'jobs-queue': 19,
    'typescript': 20,
    'plugins': 21,
    'examples': 22,
    'integrations': 23,
    'cloud': 24,
    'production': 25
  };

  private fileOrder: { [key: string]: number } = {
    'overview': 1,
    'what-is-payload': 2,
    'concepts': 3,
    'installation': 4
  };

  private async savePage(url: string, pageIndex: number, content: string): Promise<void> {
    const cacheDir = this.getCacheDir();
    
    // Split the URL path into segments and create corresponding folders
    const urlPath = url.startsWith('/') ? url.slice(1) : url;
    const segments = urlPath.split('/');
    const fileName = segments.pop() || 'index';  // Use 'index' for root path
    
    // Skip the first 'docs' segment as we don't need that nesting
    if (segments[0] === 'docs') {
      segments.shift();
    }
    
    // If this is the root docs page, save it as index.html
    if (segments.length === 0 && fileName === 'docs') {
      await fs.writeFile(path.join(cacheDir, 'index.html'), content);
      return;
    }
    
    // Create nested folder structure with sequential numbering
    let currentPath = cacheDir;
    
    // Create folder structure
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      let numberedSegment;
      
      if (i === 0) {
        // For root level, use predefined order
        const folderNumber = this.rootFolderOrder[segment] || Object.keys(this.rootFolderOrder).length + 1;
        numberedSegment = this.formatName(segment, folderNumber);
      } else {
        // For nested folders, get existing folders and determine next number
        const siblings = await fs.readdir(currentPath);
        const existingNumbers = new Set<number>();
        
        for (const sibling of siblings) {
          const match = sibling.match(/^(\d+)-/);
          if (match) {
            existingNumbers.add(parseInt(match[1]));
          }
        }
        
        let folderNumber = 1;
        while (existingNumbers.has(folderNumber)) {
          folderNumber++;
        }
        
        numberedSegment = this.formatName(segment, folderNumber);
      }
      
      currentPath = path.join(currentPath, numberedSegment);
      await fs.ensureDir(currentPath);
    }
    
    // Get all files in the current directory and their numbers
    const files = await fs.readdir(currentPath);
    const existingFiles = new Map<string, number>();
    const usedNumbers = new Set<number>();
    
    for (const file of files) {
      const match = file.match(/^(\d+)-(.+)\.html$/);
      if (match) {
        const [, num, name] = match;
        const index = parseInt(num);
        existingFiles.set(name, index);
        usedNumbers.add(index);
      }
    }
    
    // Determine file index based on content type and existing files
    let fileIndex: number;
    
    // If this is an overview file, it should always be first
    if (fileName === 'overview') {
      fileIndex = 1;
    } else {
      // For non-overview files, find the next available number
      fileIndex = 2; // Start from 2 since 1 is reserved for overview
      while (usedNumbers.has(fileIndex)) {
        fileIndex++;
      }
      
      // Special handling for common files to maintain order
      if (fileName === 'what-is-payload' && !existingFiles.has('overview')) {
        fileIndex = 1;
      }
    }
    
    usedNumbers.add(fileIndex);
    const numberedFileName = this.formatName(fileName, fileIndex);
    const filePath = path.join(currentPath, `${numberedFileName}.html`);
    await fs.writeFile(filePath, content);
  }

  private getCacheDir(): string {
    return this.projectCacheDir;
  }

  private sortLinks(links: string[]): string[] {
    // Sort links by their path segments to ensure consistent ordering
    return links.sort((a, b) => {
      const aSegments = a.split('/').filter(s => s);
      const bSegments = b.split('/').filter(s => s);
      
      // Compare each segment
      for (let i = 0; i < Math.min(aSegments.length, bSegments.length); i++) {
        if (aSegments[i] !== bSegments[i]) {
          return aSegments[i].localeCompare(bSegments[i]);
        }
      }
      
      // If all segments match up to the shorter path, shorter path comes first
      return aSegments.length - bSegments.length;
    });
  }

  public async fetch(force = false): Promise<void> {
    try {
      const { baseUrl } = this.config;
      const cacheDir = this.getCacheDir();
      
      // Check if cache exists and is fresh
      const { needsUpdate } = await this.checkNeedsUpdate();
      if (!needsUpdate && !force) {
        console.log('Cache is up to date');
        return;
      }

      // Only clear cache if we're going to update
      if (await fs.pathExists(cacheDir)) {
        await this.clearCache();
      }

      await this.init();
      await fs.ensureDir(this.getCacheDir());

      console.log(`Fetching docs from ${this.config.baseUrl}${this.config.startPath}`);
      const links = await this.extractLinks();
      
      // Sort links for consistent ordering
      const sortedLinks = this.sortLinks(links);

      console.log(`Saving ${sortedLinks.length} documentation pages...`);
      let savedCount = 0;
      
      for (const [index, link] of sortedLinks.entries()) {
        try {
          if (!this.page) throw new Error('Page not initialized');
          
          const url = `${baseUrl}${link}`;
          savedCount++;
          console.log(`Saving page ${savedCount}/${sortedLinks.length}: ${link}`);
          
          await this.page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 45000 
          });
          
          // Wait for main content
          await this.page.waitForSelector('main', { timeout: 45000 });
          
          // Get the HTML content
          const content = await this.page.content();
          
          // Save with proper folder structure and numbering
          await this.savePage(link, index, content);
          
          // Small delay between saves
          await this.page.waitForTimeout(500);
          
        } catch (error) {
          console.warn(`Warning: Failed to save ${link}:`, error instanceof Error ? error.message : error);
          continue;
        }
      }
      
      await this.saveMeta();
      console.log('Documentation fetching complete!');
      
    } catch (error) {
      console.error('Error fetching docs:', error instanceof Error ? error.message : error);
      throw error;
    } finally {
      await this.close();
    }
  }

  private async saveMeta(): Promise<void> {
    const metaPath = path.join(this.getCacheDir(), 'meta.json');
    const meta = {
      lastUpdated: new Date().toISOString(),
    };
    await fs.writeJson(metaPath, meta);
  }

  private async clearCache(): Promise<void> {
    const cacheDir = this.getCacheDir();
    if (await fs.pathExists(cacheDir)) {
      console.log('Clearing old cache...');
      await fs.remove(cacheDir);
    }
  }

  private async checkNeedsUpdate(): Promise<{ needsUpdate: boolean; reason?: string }> {
    try {
      if (!await fs.pathExists(this.metaFile)) {
        return { needsUpdate: true, reason: 'No cache exists' };
      }

      const meta = await fs.readJson(this.metaFile) as CacheMeta;
      const lastFetched = new Date(meta.lastFetched);
      const now = new Date();
      const daysSinceLastFetch = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastFetch > CACHE_MAX_AGE_DAYS) {
        return { needsUpdate: true, reason: `Cache is older than ${CACHE_MAX_AGE_DAYS} days` };
      }

      return { needsUpdate: false };
    } catch (error) {
      console.error('Error checking for updates:', error instanceof Error ? error.message : error);
      return { needsUpdate: true, reason: 'Error checking cache status' };
    }
  }

  private async extractLinks(): Promise<string[]> {
    const { baseUrl, startPath } = this.config;
    const fullUrl = `${baseUrl}${startPath}`;

    try {
      if (!this.page) throw new Error('Page not initialized');
      
      console.log('Navigating to docs page...');
      await this.page.goto(fullUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 45000 
      });
      
      console.log('Waiting for content to load...');
      await this.page.waitForSelector('main', { timeout: 45000 });
      
      console.log('Expanding navigation...');
      await this.page.evaluate(() => {
        const expandButtons = document.querySelectorAll('button[aria-expanded="false"]');
        expandButtons.forEach(button => (button as HTMLButtonElement).click());
      });
      
      await this.page.waitForTimeout(1000);

      console.log('Collecting initial links...');
      const initialLinks = await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href*="/docs"]'))
          .map(a => a.getAttribute('href'))
          .filter(href => href && href.startsWith('/docs') && !href.includes('#')) as string[];
      });

      console.log(`Found ${initialLinks.length} initial links`);
      const allLinks = new Set<string>(initialLinks);

      // Visit each documentation page and collect more links
      console.log('Visiting individual pages to find more links...');
      let processedCount = 0;
      const totalPages = initialLinks.length;

      for (const link of initialLinks) {
        const pageUrl = `${baseUrl}${link}`;
        processedCount++;
        console.log(`Visiting ${link}... (${processedCount}/${totalPages})`);
        
        const pageLinks = await this.visitPage(pageUrl);
        pageLinks.forEach(link => allLinks.add(link));

        // Add a small delay between pages to be nice to their server
        await this.page.waitForTimeout(500);
      }

      const uniqueLinks = Array.from(allLinks);
      console.log(`Found ${uniqueLinks.length} total unique documentation pages`);
      return uniqueLinks;

    } catch (error) {
      console.error('Error extracting links:', error instanceof Error ? error.message : error);
      return [];
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const source = args[0] || 'payload';
const force = args.includes('--force');

const config = configs[source];

if (!config) {
  console.error(`Unknown documentation source: ${source}`);
  console.log('Available sources:', Object.keys(configs).join(', '));
  console.log('Usage: bun start [source] [--force]');
  process.exit(1);
}

const fetcher = new DocsFetcher(config);
fetcher.fetch(force);
