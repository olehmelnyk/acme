import { logger } from './logger';

export interface LinkValidationResult {
  url: string;
  isValid: boolean;
  statusCode?: number;
  contentType?: string;
  responseTimeMs: number;
  lastModified?: Date;
  error?: string;
}

export interface LinkValidationOptions {
  timeout?: number;
  allowedContentTypes?: string[];
  maxRedirects?: number;
}

export class LinkValidator {
  private readonly defaultOptions: LinkValidationOptions = {
    timeout: 10000,
    allowedContentTypes: ['text/html', 'text/plain', 'application/json'],
    maxRedirects: 5
  };

  async validateLink(url: string, options?: LinkValidationOptions): Promise<LinkValidationResult> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(opts.timeout ?? this.defaultOptions.timeout ?? 10000)
      });

      const endTime = Date.now();
      const contentType = response.headers.get('content-type');
      const lastModified = response.headers.get('last-modified');

      const result: LinkValidationResult = {
        url,
        isValid: true, // Set to true by default, then check conditions
        statusCode: response.status,
        contentType: contentType ?? undefined,
        responseTimeMs: endTime - startTime,
        lastModified: lastModified ? new Date(lastModified) : undefined,
        error: undefined
      };

      // Only check content type if allowedContentTypes is specified and not empty
      if (opts.allowedContentTypes && opts.allowedContentTypes.length > 0) {
        if (!contentType || !opts.allowedContentTypes.some(t => contentType.toLowerCase().includes(t.toLowerCase()))) {
          result.isValid = false;
          result.error = 'Invalid content type';
        }
      }

      if (response.status >= 400) {
        result.isValid = false;
        result.error = `HTTP error: ${response.status}`;
      }

      return result;
    } catch (error) {
      logger.warn(`Failed to validate link ${url}:`, error);
      const result: LinkValidationResult = {
        url,
        isValid: false,
        responseTimeMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      if (error instanceof TypeError && error.message.includes('timeout')) {
        result.error = 'Request timed out';
      }

      return result;
    }
  }

  async validateLinks(urls: string[], options?: LinkValidationOptions): Promise<LinkValidationResult[]> {
    return Promise.all(urls.map(url => this.validateLink(url, options)));
  }

  private isValidResponse(status: number, contentType: string | null, allowedTypes: string[]): boolean {
    if (status < 200 || status >= 400) {
      return false;
    }

    // If no content type restrictions are specified, consider it valid
    if (!allowedTypes || allowedTypes.length === 0) {
      return true;
    }

    if (!contentType) {
      return false;
    }

    return allowedTypes.some(allowed => contentType.toLowerCase().includes(allowed.toLowerCase()));
  }
}
