import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { DocsFetcherError, ErrorCode } from './errors';

export interface FetchConfig {
  cacheDir: string;
  baseUrl: string;
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
  forceRefresh?: boolean;
}

export const FETCH_CONFIG: FetchConfig = {
  cacheDir: path.join(os.homedir(), '.docs-fetcher', 'artifacts', 'cache'),
  baseUrl: 'https://docs.npmjs.com',  // Default NPM documentation URL
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  userAgent: 'DocsFetcher/1.0',
  maxConcurrency: 5,
  maxDepth: 3,
  ignorePatterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/test/**',
    '**/tests/**',
    '**/docs/api/**'
  ],
  allowedDomains: [],
  excludedDomains: [],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  followRedirects: true,
  validateSSL: true,
  headers: {},
  cookies: {},
  proxy: undefined
};

// Export a function to create the config
export async function createFetchConfig(options: { forceRefresh?: boolean } = {}): Promise<FetchConfig> {
  try {
    const configPath = path.join(process.cwd(), 'docs-fetcher.config.json');
    
    if (!fs.existsSync(configPath)) {
      return { ...FETCH_CONFIG, forceRefresh: options.forceRefresh };
    }

    const configFile = await fs.promises.readFile(configPath, 'utf8');
    const userConfig = JSON.parse(configFile);

    return {
      ...FETCH_CONFIG,
      ...userConfig,
      forceRefresh: options.forceRefresh
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create fetch config: ${error.message}`);
    }
    throw new Error(`Failed to create fetch config`);
  }
}

export async function loadConfig(): Promise<FetchConfig> {
  try {
    return FETCH_CONFIG;
  } catch (error) {
    throw new DocsFetcherError(
      ErrorCode.CONFIG_LOAD_ERROR,
      `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
