import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import { DocsFetcherError, ErrorCode } from './errors';

export interface ParsedHtml {
  title: string;
  headings: Record<string, string[]>;
  mainContent: string;
  description: string;
  keywords: string[];
  codeBlocks: string[];
  apiReferences: string[];
}

/**
 * HtmlParser class for parsing HTML content and extracting structured information.
 */
export class HtmlParser {
  private readonly $: CheerioAPI;

  /**
   * Creates a new instance of HtmlParser.
   * @param html - The HTML content to parse
   */
  constructor(html: string) {
    if (!html) {
      throw new DocsFetcherError(
        ErrorCode.VALIDATION_ERROR,
        'HTML content cannot be empty'
      );
    }
    this.$ = cheerio.load(html);
  }

  /**
   * Parses the HTML content and extracts structured information.
   * @returns A Promise resolving to ParsedHtml containing extracted information
   * @throws DocsFetcherError if parsing fails
   */
  public async parse(): Promise<ParsedHtml> {
    try {
      // Remove script and style elements
      this.$('script, style').remove();
      
      return {
        title: this.extractTitle(),
        headings: this.extractHeadings(),
        mainContent: this.extractMainContent(),
        description: this.extractMetaDescription(),
        keywords: this.extractMetaKeywords(),
        codeBlocks: this.extractCodeBlocks(),
        apiReferences: this.extractApiReferences()
      };
    } catch {
      throw new DocsFetcherError(
        ErrorCode.PARSE_ERROR,
        'Failed to parse HTML: Unknown error'
      );
    }
  }

  /**
   * Extracts the page title from the HTML.
   * @returns The page title or an empty string if not found
   */
  public extractTitle(): string {
    try {
      return this.$('title').first().text().trim() || '';
    } catch {
      return '';
    }
  }

  /**
   * Extracts all headings from the HTML content.
   * @returns A record of heading levels and their text content
   */
  private extractHeadings(): Record<string, string[]> {
    const headings: Record<string, string[]> = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };

    try {
      Object.keys(headings).forEach((k: string) => {
        this.$(k).each((_, el) => {
          const text = this.$(el).text().trim();
          if (text) {
            headings[k].push(text);
          }
        });
      });
    } catch {
      // If there's an error, return the empty structure
      // rather than throwing, as headings are non-critical
    }

    return headings;
  }

  /**
   * Extracts the main content from the HTML body.
   * @returns The cleaned main content text
   */
  private extractMainContent(): string {
    try {
      return this.$('body').text().trim();
    } catch {
      return '';
    }
  }

  /**
   * Extracts the meta description from the HTML.
   * @returns The meta description or an empty string if not found
   */
  private extractMetaDescription(): string {
    try {
      return this.$('meta[name="description"]').attr('content') || '';
    } catch {
      return '';
    }
  }

  /**
   * Extracts meta keywords from the HTML.
   * @returns An array of keywords or an empty array if none found
   */
  private extractMetaKeywords(): string[] {
    try {
      const keywords = this.$('meta[name="keywords"]').attr('content');
      return keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  /**
   * Extracts code blocks from the HTML content.
   * @returns An array of code block contents
   */
  private extractCodeBlocks(): string[] {
    const codeBlocks: string[] = [];
    try {
      this.$('pre code').each((_, el) => {
        const code = this.$(el).text().trim();
        if (code) {
          codeBlocks.push(code);
        }
      });
    } catch {
      // Return whatever we managed to extract
    }
    return codeBlocks;
  }

  /**
   * Extracts API references from links in the HTML.
   * @returns An array of API reference URLs
   */
  private extractApiReferences(): string[] {
    const apiRefs: string[] = [];
    try {
      this.$('a[href*="api"]').each((_, el) => {
        const href = this.$(el).attr('href');
        if (href) {
          apiRefs.push(href);
        }
      });
    } catch {
      // Return whatever we managed to extract
    }
    return apiRefs;
  }

  /**
   * Cleans and returns the main content of the HTML.
   * @returns The cleaned content text
   */
  public cleanContent(): string {
    try {
      // Remove unwanted elements
      this.$('script, style, iframe, noscript').remove();
      
      // Get the cleaned content
      const content = this.$('body').text().trim();
      
      // Normalize whitespace
      return content.replace(/\s+/g, ' ');
    } catch {
      return '';
    }
  }

  /**
   * Extracts all valid links from the HTML content.
   * @returns An array of valid URLs
   */
  public extractLinks(): string[] {
    const links: string[] = [];
    try {
      this.$('a[href]').each((_, el) => {
        const href = this.$(el).attr('href');
        // Check for internal fragments and unsafe URL schemes
        if (href && 
            !href.startsWith('#') && 
            !/^(javascript|data|vbscript|file):/i.test(href)) {
          links.push(href);
        }
      });
    } catch {
      // Return whatever we managed to extract
    }
    return links;
  }
}
