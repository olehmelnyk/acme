import { DocsFetcherError, ErrorCode } from './errors';
import { logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  documentation?: {
    urls: string[];
    readmeContent?: string;
    quality?: Array<{
      url: string;
      score: number;
      details: {
        freshness: number;
        size: number;
        language: string;
        readability: number;
        completeness: number;
      };
    }>;
  };
  installInstructions?: string;
}

export interface PackageLinks {
  npm?: string;
  homepage?: string;
  repository?: string;
  documentation?: string[];
}

export class PackageInfoFetcher {
  private readonly cacheDir: string;
  private cache: Map<string, PackageInfo>;
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  constructor(cacheDir?: string) {
    this.cacheDir = cacheDir ?? path.join(process.cwd(), 'artifacts', 'docs-fetcher', 'cache');
    this.cache = new Map();
    // Ensure cache directory exists
    fs.mkdirSync(this.cacheDir, { recursive: true });
    fs.writeFileSync(path.join(this.cacheDir, '.stats'), '[]', 'utf-8');
  }

  async init(): Promise<void> {
    try {
      await this.loadCache();
    } catch (err) {
      logger.error('Failed to initialize package info fetcher:', err);
      throw new DocsFetcherError(
        ErrorCode.CACHE_INIT_ERROR,
        `Failed to initialize package info fetcher: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  private async loadCache(): Promise<void> {
    try {
      // Try to read the cache file
      try {
        const statsPath = path.join(this.cacheDir, '.stats');
        const cacheContent = await fs.promises.readFile(statsPath, 'utf-8');
        this.cache = new Map(JSON.parse(cacheContent));
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
          // If file doesn't exist, start with empty cache
          this.cache = new Map();
          // Create empty stats file
          await fs.promises.writeFile(path.join(this.cacheDir, '.stats'), '[]', 'utf-8');
        } else {
          throw err; // Re-throw other errors
        }
      }
    } catch (err) {
      throw new DocsFetcherError(
        ErrorCode.CACHE_INIT_ERROR,
        `Failed to initialize cache: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  async getPackageInfo(packageName: string): Promise<PackageInfo> {
    // Check cache first
    const cached = this.cache.get(packageName);
    if (cached) {
      return cached;
    }

    // Fetch from npm registry with retries
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const response = await fetch(`https://registry.npmjs.org/${packageName}`, {
            signal: controller.signal
          });

          if (!response.ok) {
            if (response.status === 404) {
              throw new DocsFetcherError(
                ErrorCode.NOT_FOUND,
                `Package '${packageName}' not found`
              );
            }
            throw new DocsFetcherError(
              ErrorCode.NETWORK_ERROR,
              `Failed to fetch package info: ${response.statusText}`
            );
          }

          const data = await response.json() as Record<string, unknown>;
          if (!data || typeof data !== 'object' || !data['name']) {
            throw new DocsFetcherError(
              ErrorCode.INVALID_DATA,
              `Invalid package data received for ${packageName}`
            );
          }

          const info = this.parsePackageInfo(data);
          
          // Cache the result
          this.cache.set(packageName, info);
          await this.saveCache();
          
          return info;
        } catch (err) {
          if (err instanceof DocsFetcherError) throw err;
          if (err instanceof Error && err.name === 'AbortError') {
            throw new DocsFetcherError(
              ErrorCode.TIMEOUT,
              `timeout fetching package info for ${packageName}`
            );
          }
          throw new DocsFetcherError(
            ErrorCode.NETWORK_ERROR,
            `Network error: ${err instanceof Error ? err.message : 'Unknown error'}`
          );
        } finally {
          clearTimeout(timeout);
        }
      } catch (err) {
        if (err instanceof DocsFetcherError) {
          if (err.code === ErrorCode.NETWORK_ERROR && attempt < this.maxRetries - 1) {
            // Wait with exponential backoff before retrying
            await new Promise(resolve => setTimeout(resolve, this.baseDelay * Math.pow(2, attempt)));
            continue;
          }
        }
        throw err;
      }
    }

    throw new DocsFetcherError(
      ErrorCode.NETWORK_ERROR,
      `Failed to fetch package info after ${this.maxRetries} attempts`
    );
  }

  private parsePackageInfo(data: Record<string, unknown>): PackageInfo {
    // Get the latest version info
    const distTags = data['dist-tags'] as Record<string, string> | undefined;
    const latestVersion = distTags?.['latest'];
    const versions = data['versions'] as Record<string, unknown> | undefined;
    const latest = versions?.[latestVersion ?? ''] as Record<string, unknown> | undefined;

    // Get repository info
    const repository = this.parseRepository(latest?.['repository'] ?? data['repository']);
    
    return {
      name: data['name'] as string,
      version: latestVersion ?? (data['version'] as string),
      description: latest?.['description'] as string ?? data['description'] as string,
      author: typeof latest?.['author'] === 'string' 
        ? latest['author'] as string 
        : (latest?.['author'] as Record<string, string>)?.['name'] ?? data['author'] as string,
      homepage: latest?.['homepage'] as string ?? data['homepage'] as string,
      repository,
      documentation: {
        urls: this.extractDocumentationUrls(data, latest ?? {}),
        readmeContent: data['readme'] as string
      },
      installInstructions: this.generateInstallInstructions(data['name'] as string)
    };
  }

  private parseRepository(repo: unknown): { type: string; url: string } | undefined {
    if (!repo || typeof repo !== 'object') return undefined;
    
    const repoObj = repo as Record<string, unknown>;
    const type = repoObj['type'];
    const url = repoObj['url'];
    
    if (typeof type !== 'string' || typeof url !== 'string') return undefined;
    
    return { type, url };
  }

  private extractDocumentationUrls(data: Record<string, unknown>, latest: Record<string, unknown>): string[] {
    const urls: string[] = [];
    
    // Add homepage if exists
    const homepage = data['homepage'];
    if (typeof homepage === 'string') {
      urls.push(homepage);
    }

    // Add repository docs if exists
    const repository = data['repository'];
    if (repository && typeof repository === 'object') {
      const repoObj = repository as Record<string, unknown>;
      const repoUrl = repoObj['url'];
      if (typeof repoUrl === 'string') {
        urls.push(repoUrl.replace(/^git\+/, '').replace(/\.git$/, '') + '/blob/main/README.md');
      }
    }

    // Add documentation from latest version if exists
    const docs = latest['documentation'];
    if (docs && typeof docs === 'string') {
      urls.push(docs);
    }

    return [...new Set(urls)];
  }

  private generateInstallInstructions(packageName: string): string {
    return [
      '# Installation',
      '',
      '## Using npm',
      `\`\`\`bash`,
      `npm add ${packageName}`,
      `\`\`\``,
      '',
      '## Using yarn',
      `\`\`\`bash`,
      `yarn add ${packageName}`,
      `\`\`\``,
      '',
      '## Using pnpm',
      `\`\`\`bash`,
      `pnpm add ${packageName}`,
      `\`\`\``,
      '',
      '## Using bun',
      `\`\`\`bash`,
      `bun add ${packageName}`,
      `\`\`\``,
      '',
      `# Note: Also available via CDN at unpkg.com/${packageName}`
    ].join('\n');
  }

  async getDocumentationUrls(packageName: string): Promise<PackageLinks> {
    const info = await this.getPackageInfo(packageName);
    return {
      npm: `https://www.npmjs.com/package/${packageName}`,
      homepage: info.homepage,
      repository: info.repository?.url,
      documentation: info.documentation?.urls
    };
  }

  async findInstallationInstructions(packageName: string): Promise<string> {
    await this.getPackageInfo(packageName); // Ensure package exists
    return this.generateInstallInstructions(packageName);
  }

  async getAllPackageInfo(packageName: string): Promise<{ info: PackageInfo; links: PackageLinks }> {
    const info = await this.getPackageInfo(packageName);
    const links = await this.getDocumentationUrls(packageName);
    return { info, links };
  }

  private async saveCache(): Promise<void> {
    try {
      await fs.promises.writeFile(
        path.join(this.cacheDir, '.stats'),
        JSON.stringify(Array.from(this.cache.entries())),
        'utf-8'
      );
    } catch (err) {
      throw new DocsFetcherError(
        ErrorCode.CACHE_SET_ERROR,
        `Failed to save cache: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }
}
