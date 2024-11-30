import { DocsConfig } from './config';
import path from 'path';

export interface FetchConfig extends DocsConfig {
  limit: number;
  maxDepth: number;
  delay: number;
}

export const FETCH_CONFIG: FetchConfig = {
  rootDir: process.cwd().replace(/\/tools\/docs-fetcher$/, ''),
  scanPaths: ["package.json", "**/package.json"],
  excludePaths: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.git/**"
  ],
  excludePackages: [],
  excludePatterns: [],
  includePackages: [],
  packageDocsFile: "package-docs.json",
  cacheDir: path.join(process.cwd(), "cache"),
  limit: 15,  // Limit to 15 pages
  maxDepth: 3,
  delay: 1000  // 1 second delay between requests
};
