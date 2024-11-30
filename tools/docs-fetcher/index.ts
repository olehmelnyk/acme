import { chromium, Page, Browser } from 'playwright';
import { DirectoryManager } from './directory-manager';
import { UrlManager } from './url-manager';
import { findPackages, deduplicatePackages, searchDocsUrl } from './utils';
import { FetchConfig } from './fetch-config';

interface CurrentPackage {
  name: string;
  docsUrl: string;
}

export class DocsFetcher {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private dirManager: DirectoryManager;
  private urlManager: UrlManager | null = null;
  private currentPackage: CurrentPackage | null = null;
  private readonly config: FetchConfig;
  
  constructor(config: FetchConfig) {
    this.config = config;
    this.dirManager = new DirectoryManager(config.cacheDir);
  }
  
  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true
      });
    }
    
    if (!this.page) {
      this.page = await this.browser.newPage();
      await this.page.setViewportSize({ width: 1280, height: 800 });
      
      // Set longer timeout for navigation
      this.page.setDefaultNavigationTimeout(30000);
      this.page.setDefaultTimeout(30000);
    }
  }
  
  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  
  private async fetchPage(url: string): Promise<{ html: string; title: string }> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    
    console.log(`Fetching ${url}...`);
    
    try {
      // Navigate to the page
      await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // Wait for content to load
      await this.page.waitForSelector('body', { timeout: 5000 });
      
      // Get page title
      const title = await this.page.title();
      
      // Get page content
      const html = await this.page.content();
      
      return { html, title };
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }
  
  private async extractLinks(url: string): Promise<string[]> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    
    try {
      const links = await this.page.evaluate(() => {
        const anchors = document.querySelectorAll('a[href]');
        return Array.from(anchors, a => {
          const href = a.getAttribute('href');
          return href ? href : null;
        }).filter((href): href is string => href !== null);
      });
      
      return links;
    } catch (error) {
      console.error(`Error extracting links from ${url}:`, error);
      return [];
    }
  }
  
  async fetchDocs(packageName: string, docsUrl: string): Promise<void> {
    try {
      // Initialize browser if needed
      await this.init();
      
      // Clear existing documentation
      await this.dirManager.clearPackageDir(packageName);
      
      // Set current package
      this.currentPackage = {
        name: packageName,
        docsUrl
      };
      
      // Initialize URL manager for this package
      this.urlManager = new UrlManager(docsUrl, {
        allowedDomains: [new URL(docsUrl).hostname],
        startPaths: ['/']
      });
      
      // Process URLs until queue is empty or limit reached
      let processedCount = 0;
      while (processedCount < this.config.limit && this.urlManager.hasNext()) {
        const url = this.urlManager.next();
        if (!url) break;
        
        try {
          // Fetch page content
          const { html, title } = await this.fetchPage(url);
          
          // Extract path segments for categorization
          const urlPath = new URL(url).pathname;
          const pathSegments = urlPath.split('/').filter(Boolean);
          
          // Use first path segment as category, or 'general' if none exists
          const category = pathSegments[0] || 'general';
          
          // Create metadata
          const metadata = {
            url,
            title,
            fetchedAt: new Date().toISOString(),
            pathSegments,
            category
          };
          
          if (!this.urlManager) {
            throw new Error('URL manager not initialized');
          }
          
          // Save the document with proper structure
          await this.dirManager.saveDocument(
            this.currentPackage.name,
            category,
            title,
            html,
            metadata,
            this.urlManager.getSectionNumber(category),
            this.urlManager.getPageNumber(category, url)
          );
          
          // Extract and process links
          const links = await this.extractLinks(url);
          for (const link of links) {
            this.urlManager.addToQueue(link);
          }
          
          processedCount++;
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, this.config.delay));
        } catch (error) {
          console.error(`Error processing ${url}:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error(`Error fetching docs for ${packageName}:`, error);
      throw error;
    }
  }
  
  async processPackages(): Promise<void> {
    try {
      // Find all package.json files
      const packages = await findPackages(
        this.config.rootDir,
        this.config.scanPaths,
        this.config.excludePaths
      );
      
      // Deduplicate packages
      const uniquePackages = deduplicatePackages(packages);
      
      console.log(`Found ${uniquePackages.length} unique packages`);
      
      // Process each package
      for (const pkg of uniquePackages) {
        try {
          console.log(`Processing ${pkg.name}...`);
          
          // Search for docs URL if not provided
          const docsUrl = await searchDocsUrl(pkg.name);
          if (!docsUrl) {
            console.log(`No docs URL found for ${pkg.name}`);
            continue;
          }
          
          // Fetch documentation
          await this.fetchDocs(pkg.name, docsUrl);
        } catch (error) {
          console.error(`Error processing package ${pkg.name}:`, error);
          continue;
        }
      }
    } finally {
      await this.close();
    }
  }
}
