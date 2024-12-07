export class DocsFetcherError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'DocsFetcherError';
    Object.setPrototypeOf(this, DocsFetcherError.prototype);
  }
}

export enum ErrorCode {
  // Network related errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  PARSE_ERROR = 'PARSE_ERROR',
  INVALID_DATA = 'INVALID_DATA',

  // Cache related errors
  CACHE_INIT_ERROR = 'CACHE_INIT_ERROR',
  CACHE_SET_ERROR = 'CACHE_SET_ERROR',
  CACHE_GET_ERROR = 'CACHE_GET_ERROR',
  CACHE_DELETE_ERROR = 'CACHE_DELETE_ERROR',
  CACHE_CLEAR_ERROR = 'CACHE_CLEAR_ERROR',
  CACHE_CLEANUP_ERROR = 'CACHE_CLEANUP_ERROR',
  CACHE_STATS_ERROR = 'CACHE_STATS_ERROR',
  CACHE_INFO_ERROR = 'CACHE_INFO_ERROR',
  CACHE_SIZE_ERROR = 'CACHE_SIZE_ERROR',

  // Package info errors
  PACKAGE_INFO_ERROR = 'PACKAGE_INFO_ERROR',
  PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND',
  PACKAGE_VERSION_ERROR = 'PACKAGE_VERSION_ERROR',

  // Documentation related errors
  DOCUMENTATION_NOT_FOUND = 'DOCUMENTATION_NOT_FOUND',
  DOCUMENTATION_FETCH_ERROR = 'DOCUMENTATION_FETCH_ERROR',
  DOCUMENTATION_PARSE_ERROR = 'DOCUMENTATION_PARSE_ERROR',
  DOCUMENTATION_SCORING_ERROR = 'DOCUMENTATION_SCORING_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',

  // Configuration related errors
  CONFIG_LOAD_ERROR = 'CONFIG_LOAD_ERROR',

  // Directory related errors
  DIRECTORY_ERROR = 'DIRECTORY_ERROR',
  INIT_ERROR = 'INIT_ERROR',

  // File system related errors
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  FILE_READ_ERROR = 'FILE_READ_ERROR',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_URL = 'INVALID_URL',
  INVALID_CONTENT_TYPE = 'INVALID_CONTENT_TYPE',
  INVALID_INPUT = 'INVALID_INPUT',

  // Generic errors
  UNKNOWN = 'UNKNOWN'
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof DocsFetcherError) {
    return [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT,
      ErrorCode.RATE_LIMIT,
      ErrorCode.UNKNOWN
    ].includes(error.code);
  }
  return true; // Retry on non-DocsFetcherError errors
}

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  backoffFactor: number;
  jitter?: boolean;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  jitter: true
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {},
  context = 'operation'
): Promise<T> {
  const retryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;
  let delay = retryOptions.initialDelay;

  for (let attempt = 1; attempt <= retryOptions.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === retryOptions.maxAttempts || !isRetryableError(error)) {
        throw lastError;
      }

      // Calculate next delay with optional jitter
      delay = Math.min(
        delay * retryOptions.backoffFactor,
        retryOptions.maxDelay
      );

      if (retryOptions.jitter) {
        delay = delay * (0.5 + Math.random());
      }

      console.warn(
        `${context} failed (attempt ${attempt}/${retryOptions.maxAttempts}), ` +
        `retrying in ${Math.round(delay)}ms: ${lastError.message}`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error(`${context} failed after ${retryOptions.maxAttempts} attempts`);
}
