import { DocsConfig } from './config';
import { Browser, BrowserContext, Page } from 'playwright';

export interface PackageDocsConfig {
  name: string;
  docsUrl: string;
  path?: string;
  fetch?: boolean;
  searchAttempted?: boolean;
  lastFetched?: string;
  config?: {
    fetchDocs?: boolean;
    searchDocs?: boolean;
    docsUrl?: string;
    allowedDomains?: string[];
    startPaths?: string[];
  };
}

export interface DocsFetcher {
  config: DocsConfig;
  packageDocs: Map<string, PackageDocsConfig>;
  browser: Browser | null;
  context: BrowserContext | null;
  initBrowser(): Promise<void>;
  loadPackageDocs(): Promise<void>;
  savePackageDocs(): Promise<void>;
  initPackage(pkg: PackageDocsConfig): Promise<void>;
  fetchPage(url: string, page: Page): Promise<{ links: string[]; title: string }>;
  fetchPackage(pkg: PackageDocsConfig): Promise<void>;
  fetchAllDocs(pattern?: string): Promise<void>;
  close(): Promise<void>;
}
