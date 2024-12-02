import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';

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
  const packages: PackageInfo[] = [];
  
  // Ensure scan paths are relative to root
  const patterns = scanPaths.map(pattern => {
    // If pattern starts with /, make it relative to root
    if (pattern.startsWith('/')) {
      return path.join(rootDir, pattern.slice(1));
    }
    // If pattern is relative, make it absolute
    return path.join(rootDir, pattern);
  });
  
  console.log(`Scanning for packages in ${rootDir} with patterns:`, patterns);
  
  for (const pattern of patterns) {
    const files = await new Promise<string[]>((resolve, reject) => {
      glob.glob(pattern, {
        ignore: excludePaths.map(p => path.join(rootDir, p)),
        absolute: true,
        nodir: true,
        follow: true,
        cwd: rootDir
      }, (err: Error | null, matches: string[]) => {
        if (err) reject(err);
        else resolve(matches);
      });
    });
    
    console.log(`Found ${files.length} package.json files for pattern ${pattern}`);
    
    for (const file of files) {
      try {
        console.log(`Processing ${file}...`);
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
        console.error(`Error processing ${file}:`, error);
      }
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
    'vue': 'https://vuejs.org/guide/introduction.html',
    'angular': 'https://angular.io/docs',
    'svelte': 'https://svelte.dev/docs',
    'typescript': 'https://www.typescriptlang.org/docs/'
  };

  // Check if it's a known package
  if (knownDocs[packageName]) {
    return knownDocs[packageName];
  }

  try {
    // Try npm registry first
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch package info: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check various common documentation URL locations
    const possibleUrls = [
      data.homepage,
      data.repository?.url,
      ...(data.maintainers?.map((m: { url: string }) => m.url) || []),
      data.bugs?.url
    ].filter(Boolean);
    
    // Try to find a documentation URL
    for (const url of possibleUrls) {
      if (url && isValidDocsUrl(url)) {
        return url;
      }
    }
    
    return undefined;
  } catch (error) {
    console.error(`Error searching docs URL for ${packageName}:`, error);
    return undefined;
  }
}

export function isValidDocsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Common documentation hostnames
    const docHosts = [
      'docs.',
      'documentation.',
      'developer.',
      'developers.',
      'wiki.',
      'github.io',
      'githubusercontent.com',
      'readthedocs.io',
      'gitbook.io'
    ];
    
    // Check if URL contains documentation-related terms
    const docTerms = ['/docs/', '/documentation/', '/wiki/', '/guide/', '/manual/'];
    
    return docHosts.some(host => hostname.includes(host)) ||
           docTerms.some(term => urlObj.pathname.includes(term));
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
