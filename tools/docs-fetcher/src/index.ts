import { chromium, Browser, BrowserContext } from 'playwright';
import { DocsFetcherError, ErrorCode } from './errors';
import { DirectoryManager } from './directory-manager';
import { UrlManager } from './url-manager';
import { HtmlParser } from './html-parser';
import { logger } from './logger';
import { join } from 'path';
import { writeFile } from 'fs/promises';

export interface FetcherConfig {
  /** Directory to store cached documentation */
  cacheDir: string;
  /** Base URL for documentation */
  baseUrl: string;
  /** Glob patterns to match package files */
  patterns?: string[];
  /** Maximum number of concurrent requests */
  limit?: number;
  /** Force refresh cached documentation */
  forceRefresh?: boolean;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Retry configuration for failed requests */
  retryOptions?: RetryConfig;
}

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Delay between retry attempts in milliseconds */
  retryDelay: number;
  /** Request timeout in milliseconds */
  timeout: number;
}

export interface DocumentationScoreDetails {
  contentLength: number;
  codeExamples: number;
  organization: number;
  references: number;
}

/**
 * DocsFetcher class for fetching and processing documentation from various sources.
 */
export class DocsFetcher {
  private readonly config: Required<FetcherConfig>;
  private browser: Browser | null;
  private dirManager: DirectoryManager;
  private urlManager: UrlManager | null;
  private parser: HtmlParser | null;

  /**
   * Creates a new instance of DocsFetcher.
   * @param config - Configuration options for the fetcher
   */
  constructor(config: FetcherConfig) {
    if (!config.cacheDir || !config.baseUrl) {
      throw new DocsFetcherError(
        ErrorCode.CONFIG_LOAD_ERROR,
        'Invalid configuration provided'
      );
    }

    this.config = {
      cacheDir: config.cacheDir,
      baseUrl: config.baseUrl,
      patterns: config.patterns ?? ['package.json'],
      limit: config.limit ?? 10,
      forceRefresh: config.forceRefresh ?? false,
      verbose: config.verbose ?? false,
      retryOptions: {
        maxRetries: config.retryOptions?.maxRetries ?? 3,
        retryDelay: config.retryOptions?.retryDelay ?? 1000,
        timeout: config.retryOptions?.timeout ?? 30000
      }
    };
    this.browser = null;
    this.dirManager = new DirectoryManager(config.cacheDir);
    this.urlManager = null;
    this.parser = null;
  }

  /**
   * Initializes the DocsFetcher instance.
   * @throws DocsFetcherError if initialization fails
   */
  public async init(): Promise<void> {
    try {
      await this.dirManager.init();
      this.browser = await chromium.launch();
      this.urlManager = new UrlManager(this.config.baseUrl);
    } catch (error) {
      if (error instanceof Error) {
        throw new DocsFetcherError(
          ErrorCode.VALIDATION_ERROR,
          `Failed to initialize docs fetcher: ${error.message}`
        );
      }
      throw new DocsFetcherError(
        ErrorCode.VALIDATION_ERROR,
        'Failed to initialize docs fetcher'
      );
    }
  }

  /**
   * Closes the DocsFetcher instance and releases resources.
   */
  public async close(): Promise<void> {
    try {
      await this.browser?.close();
      this.browser = null;
      this.urlManager = null;
      this.parser = null;
    } catch (error) {
      logger.error('Error while closing browser:', error);
    }
  }

  /**
   * Creates a new browser context with configured options.
   * @returns A Promise resolving to a BrowserContext
   * @throws DocsFetcherError if browser is not initialized
   */
  private async createContext(): Promise<BrowserContext> {
    if (!this.browser) {
      throw new DocsFetcherError(
        ErrorCode.VALIDATION_ERROR,
        'DocsFetcher not initialized'
      );
    }

    return this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'DocsFetcher/1.0'
    });
  }

  /**
   * Processes HTML content and extracts relevant information.
   * @param url - The URL of the content
   * @param content - The HTML content to process
   * @returns Processed content with title and extracted links
   * @throws DocsFetcherError if processing fails
   */
  private async processHtmlContent(url: string, content: string): Promise<{
    title: string;
    content: string;
    links: string[];
  }> {
    try {
      this.parser = new HtmlParser(content);
      const parsed = await this.parser.parse();
      
      return {
        title: parsed.title,
        content: parsed.mainContent,
        links: parsed.apiReferences
      };
    } catch (error) {
      throw new DocsFetcherError(
        ErrorCode.PROCESSING_ERROR,
        `Failed to process HTML content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Saves processed content to the cache directory.
   * @param packageName - Name of the package
   * @param url - URL of the content
   * @param title - Title of the content
   * @param content - Processed content
   * @param links - Extracted links
   */
  private async saveContent(
    packageName: string,
    url: string,
    title: string,
    content: string,
    links: string[]
  ): Promise<void> {
    try {
      if (!this.urlManager) {
        throw new DocsFetcherError(
          ErrorCode.VALIDATION_ERROR,
          'DocsFetcher not initialized'
        );
      }

      const fileName = this.urlManager.urlToFilename(url) || 'index.html';
      const outputDir = await this.dirManager.getPackageDir(packageName);

      await writeFile(
        join(outputDir, fileName),
        JSON.stringify({
          url,
          title,
          content,
          links,
          fetchedAt: new Date().toISOString()
        }, null, 2)
      );
    } catch (error) {
      throw new DocsFetcherError(
        ErrorCode.DOCUMENTATION_FETCH_ERROR,
        `Failed to save content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fetches documentation for a specific package.
   * @param packageName - Name of the package to fetch documentation for
   * @throws DocsFetcherError if fetching fails
   */
  public async fetchDocs(packageName: string): Promise<void> {
    if (!packageName) {
      throw new DocsFetcherError(
        ErrorCode.DOCUMENTATION_FETCH_ERROR,
        'Error fetching documentation'
      );
    }

    const context = await this.createContext();
    try {
      const { content, title } = await this.fetchPage(packageName);
      const url = this.config.baseUrl + '/' + packageName;
      const processed = await this.processHtmlContent(url, content);
      await this.saveContent(
        packageName,
        url,
        processed.title || title,
        processed.content,
        processed.links
      );
    } catch (error) {
      throw new DocsFetcherError(
        ErrorCode.DOCUMENTATION_FETCH_ERROR,
        `Failed to fetch docs for ${packageName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      await context.close();
    }
  }

  /**
   * Fetches documentation for multiple packages concurrently.
   * @param packages - Array of package names to fetch documentation for
   * @throws DocsFetcherError if fetching fails
   */
  public async fetchDocsForPackages(packages: string[]): Promise<void> {
    if (!packages.length) {
      throw new DocsFetcherError(
        ErrorCode.DOCUMENTATION_FETCH_ERROR,
        'Error fetching documentation'
      );
    }

    const limit = this.config.limit;
    const chunks: string[][] = [];
    
    for (let i = 0; i < packages.length; i += limit) {
      chunks.push(packages.slice(i, i + limit));
    }

    try {
      for (const chunk of chunks) {
        await Promise.all(chunk.map(pkg => this.fetchDocs(pkg)));
      }
    } catch (error) {
      throw new DocsFetcherError(
        ErrorCode.DOCUMENTATION_FETCH_ERROR,
        `Failed to fetch docs for packages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fetches a single page and returns its content.
   * @param url - URL of the page to fetch
   * @returns Page content and title
   * @throws DocsFetcherError if fetching fails
   */
  private async fetchPage(url: string): Promise<{ content: string; title: string }> {
    if (!this.browser) {
      throw new DocsFetcherError(
        ErrorCode.VALIDATION_ERROR,
        'DocsFetcher not initialized'
      );
    }

    const context = await this.createContext();
    try {
      const page = await context.newPage();
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.retryOptions.timeout
      });

      if (!response) {
        throw new DocsFetcherError(
          ErrorCode.DOCUMENTATION_FETCH_ERROR,
          `Failed to load ${url}: No response`
        );
      }

      if (!response.ok()) {
        throw new DocsFetcherError(
          ErrorCode.DOCUMENTATION_FETCH_ERROR,
          `Failed to load ${url}: ${response.status()} ${response.statusText()}`
        );
      }

      const content = await page.content();
      const title = await page.title();

      return { content, title };
    } catch (error) {
      throw new DocsFetcherError(
        ErrorCode.DOCUMENTATION_FETCH_ERROR,
        `Failed to fetch ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      await context.close();
    }
  }

  /**
   * Score documentation for a package
   * @param packageName - Name of the package to score documentation for
   * @returns Documentation score and details
   */
  public async scoreDocumentation(packageName: string): Promise<{ score: number; details: DocumentationScoreDetails }> {
    if (!packageName) {
      throw new DocsFetcherError(
        ErrorCode.VALIDATION_ERROR,
        'Package name is required'
      );
    }

    try {
      const context = await this.createContext();
      const { content } = await this.fetchPage(packageName);
      const url = this.config.baseUrl + '/' + packageName;
      const processed = await this.processHtmlContent(url, content);
      
      // Basic scoring algorithm
      let score = 0;
      const details: DocumentationScoreDetails = {
        contentLength: 0,
        codeExamples: 0,
        organization: 0,
        references: 0
      };
      
      // Score based on content length
      const contentLength = processed.content.length;
      details.contentLength = Math.min(contentLength / 10000, 1); // Max score for 10k chars
      score += details.contentLength * 0.3;
      
      // Score based on code examples
      const codeBlocks = (processed.content.match(/```[\s\S]*?```/g) || []).length;
      details.codeExamples = Math.min(codeBlocks / 5, 1); // Max score for 5 code blocks
      score += details.codeExamples * 0.3;
      
      // Score based on section organization
      const headers = (processed.content.match(/^#{1,6}\s+.+$/gm) || []).length;
      details.organization = Math.min(headers / 10, 1); // Max score for 10 headers
      score += details.organization * 0.4;
      
      // Score based on links
      const links = processed.links.length;
      details.references = Math.min(links / 10, 1); // Max score for 10 links
      score += details.references * 0.3;

      await context.close();
      return { score, details };
    } catch (error) {
      throw new DocsFetcherError(
        ErrorCode.DOCUMENTATION_SCORING_ERROR,
        `Failed to score documentation for ${packageName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Process all packages in the configured patterns
   */
  public async processAllPackages(): Promise<void> {
    const packages = await this.dirManager.findPackages(this.config.patterns);
    await this.fetchDocsForPackages(packages);
  }
}
