import * as fs from 'fs';
import * as path from 'path';

export class PackageAnalyzer {
  private cacheDir: string;

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
    this.ensureCacheDir();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  async findPackageJson(startDir: string): Promise<string[]> {
    const packageJsons: string[] = [];
    
    try {
      const files = await fs.promises.readdir(startDir);
      
      for (const file of files) {
        const fullPath = path.join(startDir, file);
        const stats = await fs.promises.stat(fullPath);
        
        if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          packageJsons.push(...await this.findPackageJson(fullPath));
        } else if (file === 'package.json') {
          packageJsons.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Error scanning directory ${startDir}:`, error);
    }
    
    return packageJsons;
  }

  async getDependencies(packageJsonPath: string): Promise<string[]> {
    try {
      const content = await fs.promises.readFile(packageJsonPath, 'utf8');
      const pkg = JSON.parse(content);
      
      const deps = new Set<string>();
      
      // Collect all types of dependencies
      for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
        if (pkg[depType]) {
          Object.keys(pkg[depType]).forEach(dep => deps.add(dep));
        }
      }
      
      return Array.from(deps);
    } catch (error) {
      console.warn(`Error parsing ${packageJsonPath}:`, error);
      return [];
    }
  }

  async getPriorityPackages(rootDir: string): Promise<string[]> {
    const packageJsons = await this.findPackageJson(rootDir);
    const allDeps = new Set<string>();
    
    for (const pkgPath of packageJsons) {
      const deps = await this.getDependencies(pkgPath);
      deps.forEach(dep => allDeps.add(dep));
    }
    
    return Array.from(allDeps);
  }
}
