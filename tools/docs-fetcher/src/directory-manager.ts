import * as path from 'path';
import * as fs from 'fs-extra';

export class DirectoryManager {
  private counters: Map<string, number> = new Map();
  private readonly cacheDir: string;
  private visitedPaths: Set<string> = new Set();

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
  }

  reset(): void {
    this.counters.clear();
    this.visitedPaths.clear();
  }

  private getNextNumber(parentPath: string): number {
    const current = this.counters.get(parentPath) || 0;
    const next = current + 1;
    this.counters.set(parentPath, next);
    return next;
  }

  normalizePathSegment(segment: string): string {
    return segment
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatNumber(num: number): string {
    return num.toString().padStart(3, '0');
  }

  getPackageDir(packageName: string): string {
    const packageDir = path.join(this.cacheDir, this.normalizePathSegment(packageName));
    fs.ensureDirSync(packageDir);
    return packageDir;
  }

  async createPackageStructure(packageName: string, category: string, sectionNumber: number): Promise<string> {
    const packageDir = this.getPackageDir(packageName);
    const normalizedCategory = this.normalizePathSegment(category);
    const categoryDirName = `${this.formatNumber(sectionNumber)}-${normalizedCategory}`;
    const categoryDir = path.join(packageDir, categoryDirName);
    await fs.ensureDir(categoryDir);
    return categoryDir;
  }

  async clearPackageDir(packageName: string): Promise<void> {
    const packageDir = this.getPackageDir(packageName);
    if (await fs.pathExists(packageDir)) {
      console.log(`Clearing existing documentation for ${packageName}...`);
      await fs.remove(packageDir);
    }
    await fs.ensureDir(packageDir);
  }

  async saveDocument(
    packageName: string,
    category: string,
    title: string,
    content: string,
    metadata: Record<string, unknown>,
    sectionNumber: number,
    pageNumber: number
  ): Promise<string> {
    const categoryDir = await this.createPackageStructure(packageName, category, sectionNumber);
    const normalizedTitle = this.normalizePathSegment(title);
    const fileName = `${this.formatNumber(pageNumber)}-${normalizedTitle}`;
    
    // Save the HTML content
    const htmlPath = path.join(categoryDir, `${fileName}.html`);
    await fs.writeFile(htmlPath, content, 'utf8');
    
    // Save metadata
    const metaPath = path.join(categoryDir, `${fileName}.meta.json`);
    await fs.writeJson(metaPath, {
      ...metadata,
      title,
      savedAt: new Date().toISOString()
    }, { spaces: 2 });
    
    return htmlPath;
  }
}
