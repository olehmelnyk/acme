import path from 'path';

export interface PackageDocsConfig {
  name: string;
  version?: string;
  path?: string;
  docsUrl?: string;
  lastFetched?: string | null;  // Allow null for resetting
  isIgnored?: boolean;
  ignoreReason?: string;
  fetch?: boolean;  // Flag to indicate if we should fetch docs for this package
  searchAttempted?: boolean;  // Flag to indicate if we've tried searching before
  searchError?: string;  // Store any errors from the search attempt
}

export interface DocsConfig {
  rootDir: string;
  scanPaths: string[];
  excludePaths: string[];
  excludePackages: string[];
  excludePatterns: string[];
  cacheDir: string;
  limit?: number;
}

export interface DocsConfig {
  rootDir: string;
  scanPaths: string[];  // paths to scan for package.json files, relative to rootDir
  excludePaths: string[];  // paths to exclude from scanning (e.g., ["**/node_modules/**"])
  excludePackages: string[];  // package names to ignore
  excludePatterns: string[];  // glob patterns for package names to ignore (e.g., "@types/*")
  includePackages: string[];  // Packages to include even if not in package.json
  packageDocsFile: string;  // path to package-docs.json
  cacheDir: string;  // Make cacheDir required
  delay?: number;  // Delay between requests in ms
}

export const DEFAULT_CONFIG: DocsConfig = {
  rootDir: process.cwd().replace(/\/tools\/docs-fetcher$/, ''),  // Go up to project root
  scanPaths: ["package.json", "**/package.json"],  // Scan all package.json files
  excludePaths: [
    "**/node_modules/**",  // Skip node_modules
    "**/dist/**", 
    "**/build/**"
  ],
  excludePackages: [],
  excludePatterns: [
    "@types/*",     // Exclude TypeScript type definitions
    "bun-types"     // Also exclude bun types
  ],
  includePackages: [],  // No additional packages needed
  packageDocsFile: path.join(__dirname, "package-docs.json"),  // Keep in docs-fetcher directory
  cacheDir: path.join(__dirname, "cache"),  // Keep cache in docs-fetcher directory
  delay: 2000  // Default 2s delay between requests
};

export const CACHE_MAX_AGE_DAYS = 30;
