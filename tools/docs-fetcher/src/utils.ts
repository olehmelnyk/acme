import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob'; 
import { logger } from './logger';

export interface PackageInfo {
  name: string;
  version: string;
  path: string;
}

export async function findPackages(
  rootDir: string, 
  scanPaths: string[], 
  excludePaths: string[]
): Promise<PackageInfo[]> {
  const patterns = scanPaths.map(pattern => {
    // If pattern starts with /, make it relative to root
    if (pattern.startsWith('/')) {
      return path.join(rootDir, pattern.slice(1));
    }
    // If pattern is relative, make it absolute
    return path.join(rootDir, pattern);
  });
  
  logger.info(`Scanning for packages in ${rootDir} with patterns:`, patterns);
  
  const allFiles: string[] = [];
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      ignore: excludePaths.map(p => path.join(rootDir, p)),
      absolute: true,
      nodir: true,
      follow: true,
      cwd: rootDir
    });
    
    logger.info(`Found ${files.length} package.json files for pattern ${pattern}`);
    allFiles.push(...files);
  }
  
  const packages: PackageInfo[] = [];
  for (const file of allFiles) {
    try {
      logger.debug(`Processing ${file}...`);
      const content = await fs.readJson(file);
      
      // Include the package itself if it has a name
      if (content.name) {
        packages.push({
          name: content.name,
          version: content.version || 'latest',
          path: file
        });
      }
    } catch (error) {
      logger.error(`Error processing ${file}:`, error);
    }
  }
  
  return packages;
}

export function deduplicatePackages(packages: PackageInfo[]): PackageInfo[] {
  const uniquePackages = new Map<string, PackageInfo>();
  
  for (const pkg of packages) {
    const existing = uniquePackages.get(pkg.name);
    if (!existing || compareVersions(pkg.version, existing.version) > 0) {
      uniquePackages.set(pkg.name, pkg);
    }
  }
  
  return Array.from(uniquePackages.values());
}

export function compareVersions(v1: string, v2: string): number {
  const normalize = (v: string) => v.replace(/^[^0-9]*/, '');
  const n1 = normalize(v1);
  const n2 = normalize(v2);
  
  if (n1 === '' && n2 === '') return 0;
  if (n1 === '') return -1;
  if (n2 === '') return 1;
  
  const parts1 = n1.split('.');
  const parts2 = n2.split('.');
  
  const len = Math.max(parts1.length, parts2.length);
  
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(parts1[i] || '0', 10);
    const num2 = parseInt(parts2[i] || '0', 10);
    
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  
  return 0;
}

export async function searchDocsUrl(packageName: string): Promise<string | undefined> {
  // Handle known packages first
  const knownDocs: Record<string, string> = {
    'next': 'https://nextjs.org/docs',
    'react': 'https://react.dev/reference/react',
    'typescript': 'https://www.typescriptlang.org/docs/',
    'express': 'https://expressjs.com/en/4x/api.html',
    'chalk': 'https://github.com/chalk/chalk#readme',
    'lodash': 'https://lodash.com/docs',
    'axios': 'https://axios-http.com/docs/intro',
    'vitest': 'https://vitest.dev/guide/',
    'webpack': 'https://webpack.js.org/concepts/',
    'vite': 'https://vitejs.dev/guide/',
    'prisma': 'https://www.prisma.io/docs',
    'drizzle': 'https://orm.drizzle.team/docs',
    'tailwindcss': 'https://tailwindcss.com/docs',
    'shadcn': 'https://ui.shadcn.com/docs',
    'nx': 'https://nx.dev/docs',
    'react-native': 'https://reactnative.dev/docs/getting-started',
    'react-query': 'https://tanstack.com/query/v4/docs',
    'zustand': 'https://zustand.docs.pmnd.rs/getting-started/introduction',
    'expo': 'https://docs.expo.dev/',
  };

  logger.info(`🔍 Searching documentation for ${packageName}...`);

  // Check if it's a known package
  if (knownDocs[packageName]) {
    logger.info(`📚 Found known documentation URL for ${packageName}`);
    return knownDocs[packageName];
  }

  try {
    // Try npm registry first
    logger.info(`📦 Checking npm registry for ${packageName}...`);
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch package info: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check various common documentation URL locations in priority order
    const possibleUrls = [
      // Direct documentation URLs
      data.homepage,
      data.documentation,
      // Repository URLs
      typeof data.repository === 'string' ? data.repository : data.repository?.url,
      // README URLs
      `https://github.com/${packageName}/${packageName}#readme`,
      `https://github.com/${packageName.replace('@', '')}#readme`,
      // Package website
      `https://${packageName}.js.org`,
      // Other possible locations
      ...(data.maintainers?.map((m: { url: string }) => m.url) || []),
      data.bugs?.url
    ].filter(Boolean);

    logger.info(`🔗 Found ${possibleUrls.length} potential documentation URLs`);
    
    // Clean up GitHub URLs
    const cleanUrls = possibleUrls.map(url => {
      if (typeof url !== 'string') return url;
      return url
        .replace('git+https://', 'https://')
        .replace('git://', 'https://')
        .replace('.git', '');
    });

    // Try to find a documentation URL
    for (const url of cleanUrls) {
      if (url && isValidDocsUrl(url)) {
        logger.info(`✅ Found valid documentation URL: ${url}`);
        return url;
      }
    }
    
    // If no valid docs URL found, default to npm package page
    logger.info(`⚠️ No specific documentation found, using npm page`);
    return `https://www.npmjs.com/package/${packageName}`;
  } catch (error) {
    logger.error(`❌ Error searching docs URL for ${packageName}:`, error);
    return undefined;
  }
}

export function isValidDocsUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    
    // List of known documentation domains
    const validDomains = [
      'github.com',
      'npmjs.com',
      'npmjs.org',
      'docs.github.com',
      'githubusercontent.com',
      'readthedocs.io',
      'readthedocs.org',
      'gitbook.io',
      'js.org'
    ];

    // Check if the domain or its parent domain is in the valid list
    const domain = parsedUrl.hostname;
    const isValidDomain = validDomains.some(valid => 
      domain === valid || domain.endsWith(`.${valid}`)
    );

    // Allow custom documentation domains if they contain common doc paths
    const docPaths = ['/docs', '/doc', '/documentation', '/guide', '/api', '/manual', '/reference', '/learn', '/tutorial'];
    const hasDocPath = docPaths.some(path => parsedUrl.pathname.includes(path));

    return isValidDomain || hasDocPath;
  } catch {
    return false;
  }
}

export function extractLinksFromHtml(html: string): Array<[string, string]> {
  const links: Array<[string, string]> = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  Array.from(doc.querySelectorAll('a[href]')).forEach(anchor => {
    const href = anchor.getAttribute('href');
    const text = anchor.textContent?.trim() || '';
    if (href) {
      links.push([href, text]);
    }
  });
  
  return links;
}
