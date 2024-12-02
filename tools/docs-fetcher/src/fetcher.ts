import { Browser, chromium } from 'playwright';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PackageDocsConfig } from './config';

export interface FetchResult {
  success: boolean;
  error?: string;
  files?: string[];
}

export class DocsFetcher {
  private browser: Browser | null = null;
  private cacheDir: string;

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
  }

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private getCacheDir(pkg: PackageDocsConfig): string {
    return path.join(this.cacheDir, pkg.name);
  }

  async fetchDocs(pkg: PackageDocsConfig): Promise<FetchResult> {
    if (!pkg.docsUrl) {
      return { success: false, error: 'No documentation URL provided' };
    }

    try {
      await this.init();
      const context = await this.browser!.newContext();
      const page = await context.newPage();

      // Create cache directory for this package
      const pkgCacheDir = this.getCacheDir(pkg);
      await fs.ensureDir(pkgCacheDir);

      // Navigate to docs URL
      await page.goto(pkg.docsUrl, { waitUntil: 'networkidle' });

      // Save the main HTML content
      const content = await page.content();
      const mainFile = path.join(pkgCacheDir, 'index.html');
      await fs.writeFile(mainFile, content);

      // Save CSS and modify references
      const styles = await page.$$eval('link[rel="stylesheet"]', (links: HTMLLinkElement[]) => 
        links.map(link => ({ href: link.href, path: link.getAttribute('href') }))
      );

      for (const style of styles) {
        if (style.href && style.path) {
          const cssResponse = await context.request.get(style.href);
          const cssContent = await cssResponse.text();
          const cssPath = path.join(pkgCacheDir, 'css', path.basename(style.path));
          await fs.ensureDir(path.dirname(cssPath));
          await fs.writeFile(cssPath, cssContent);
        }
      }

      // Save images
      const images = await page.$$eval('img', (imgs: HTMLImageElement[]) => 
        imgs.map(img => ({ src: img.src, path: img.getAttribute('src') }))
      );

      for (const image of images) {
        if (image.src && image.path) {
          try {
            const imgResponse = await context.request.get(image.src);
            const imgBuffer = await imgResponse.body();
            const imgPath = path.join(pkgCacheDir, 'images', path.basename(image.path));
            await fs.ensureDir(path.dirname(imgPath));
            await fs.writeFile(imgPath, imgBuffer);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn(`Failed to download image ${image.src}: ${errorMessage}`);
          }
        }
      }

      // Create a metadata file
      const metadata = {
        name: pkg.name,
        version: pkg.version,
        docsUrl: pkg.docsUrl,
        fetchedAt: new Date().toISOString(),
        files: ['index.html']
      };
      await fs.writeJson(path.join(pkgCacheDir, 'metadata.json'), metadata, { spaces: 2 });

      await context.close();

      return {
        success: true,
        files: ['index.html']
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while fetching documentation'
      };
    }
  }

  async clearCache(pkg: PackageDocsConfig): Promise<void> {
    const pkgCacheDir = this.getCacheDir(pkg);
    await fs.remove(pkgCacheDir);
  }

  async getCachedDocs(pkg: PackageDocsConfig): Promise<string | null> {
    const pkgCacheDir = this.getCacheDir(pkg);
    const mainFile = path.join(pkgCacheDir, 'index.html');
    
    try {
      const exists = await fs.pathExists(mainFile);
      if (!exists) return null;
      
      return mainFile;
    } catch {
      return null;
    }
  }
}
