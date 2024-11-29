export interface DocsConfig {
  baseUrl: string;
  startPath: string;
  projectName: string;
  delay?: number;
  cacheDir?: string;
}

export const configs: Record<string, DocsConfig> = {
  payload: {
    baseUrl: 'https://payloadcms.com',
    startPath: '/docs',
    projectName: 'payload'
  },
  nextjs: {
    baseUrl: 'https://nextjs.org',
    startPath: '/docs',
    projectName: 'nextjs'
  }
};

export const DEFAULT_DELAY = 500;
export const DEFAULT_CACHE_DIR = 'cache';
export const CACHE_MAX_AGE_DAYS = 7;
