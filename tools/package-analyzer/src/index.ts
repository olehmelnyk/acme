import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';
import { promisify } from 'util';

const globPromise = promisify(glob);

export interface PackageInfo {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  location: string;
  type: 'app' | 'lib' | 'package' | 'tool';
}

export interface ProjectAnalysis {
  packages: PackageInfo[];
  allDependencies: Map<string, Set<string>>; // package name -> versions
  devDependencies: Map<string, Set<string>>;
  peerDependencies: Map<string, Set<string>>;
  frameworksUsed: Set<string>;
  toolingUsed: Set<string>;
}

export interface AnalyzerOptions {
  patterns?: string[];
  excludePatterns?: string[];
  cacheDir?: string;
  cacheDuration?: number; // in hours
  forceRefresh?: boolean;
}

export class PackageAnalyzer {
  private readonly rootDir: string;
  private readonly patterns: string[];
  private readonly excludePatterns: string[];
  private readonly cacheDir: string;
  private readonly cacheDuration: number;
  private readonly forceRefresh: boolean;

  constructor(rootDir: string, options: AnalyzerOptions = {}) {
    this.rootDir = rootDir;
    this.patterns = options.patterns || [
      '**/package.json',
      'apps/**/package.json',
      'libs/**/package.json',
      'packages/**/package.json',
      'tools/**/package.json'
    ];
    this.excludePatterns = options.excludePatterns || [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.git/**'
    ];
    this.cacheDir = options.cacheDir || path.join(this.rootDir, 'cache', 'package-analyzer');
    this.cacheDuration = options.cacheDuration || 720; // 30 days default
    this.forceRefresh = options.forceRefresh || false;
  }

  private getCacheFilePath(): string {
    return path.join(this.cacheDir, 'analysis.json');
  }

  private async saveToCache(analysis: ProjectAnalysis): Promise<void> {
    try {
      await fs.promises.mkdir(this.cacheDir, { recursive: true });
      const cacheFile = this.getCacheFilePath();
      
      const serializedAnalysis = {
        ...analysis,
        allDependencies: Array.from(analysis.allDependencies.entries()),
        devDependencies: Array.from(analysis.devDependencies.entries()),
        peerDependencies: Array.from(analysis.peerDependencies.entries()),
        frameworksUsed: Array.from(analysis.frameworksUsed),
        toolingUsed: Array.from(analysis.toolingUsed),
        timestamp: new Date().toISOString()
      };

      await fs.promises.writeFile(
        cacheFile,
        JSON.stringify(serializedAnalysis, null, 2)
      );
    } catch (error) {
      console.warn('Failed to cache analysis:', error);
    }
  }

  private async loadFromCache(): Promise<ProjectAnalysis | null> {
    try {
      const cacheFile = this.getCacheFilePath();
      
      // Check file existence using promises
      try {
        await fs.promises.access(cacheFile, fs.constants.R_OK);
      } catch {
        return null;
      }

      // Get initial file stats
      let initialStats;
      try {
        initialStats = await fs.promises.stat(cacheFile);
      } catch {
        return null;
      }
      
      const ageHours = (Date.now() - initialStats.mtimeMs) / (1000 * 60 * 60);
      if (ageHours > this.cacheDuration) {
        return null;
      }

      // Read and parse file
      let cached;
      try {
        const content = await fs.promises.readFile(cacheFile, 'utf8');
        
        // Check if file was modified during read
        const currentStats = await fs.promises.stat(cacheFile);
        if (currentStats.mtimeMs !== initialStats.mtimeMs || 
            currentStats.size !== initialStats.size) {
          return null; // File was modified during read
        }
        
        cached = JSON.parse(content);
      } catch {
        return null;
      }
      
      return {
        packages: cached.packages,
        allDependencies: new Map(cached.allDependencies),
        devDependencies: new Map(cached.devDependencies),
        peerDependencies: new Map(cached.peerDependencies),
        frameworksUsed: new Set(cached.frameworksUsed),
        toolingUsed: new Set(cached.toolingUsed)
      };
    } catch (error) {
      console.warn('Failed to load cached analysis:', error);
      return null;
    }
  }

  private async findPackageFiles(): Promise<string[]> {
    const files: string[] = [];
    for (const pattern of this.patterns) {
      const matches = await globPromise(pattern, {
        cwd: this.rootDir,
        ignore: this.excludePatterns,
        absolute: true
      });
      files.push(...matches);
    }
    return files;
  }

  private determinePackageType(location: string): 'app' | 'lib' | 'package' | 'tool' {
    if (location.includes('/apps/')) return 'app';
    if (location.includes('/libs/')) return 'lib';
    if (location.includes('/packages/')) return 'package';
    if (location.includes('/tools/')) return 'tool';
    return 'lib'; // default to lib
  }

  private isFramework(packageName: string): boolean {
    const frameworks = new Set([
      'next',
      'expo',
      '@nestjs/core',
      'react',
      'react-native',
      'express'
    ]);
    return frameworks.has(packageName);
  }

  private isTooling(packageName: string): boolean {
    const tooling = new Set([
      'typescript',
      'webpack',
      'babel',
      'eslint',
      'jest',
      'prettier',
      'nx',
      'turbo'
    ]);
    return tooling.has(packageName);
  }

  private async performAnalysis(): Promise<ProjectAnalysis> {
    const packageFiles = await this.findPackageFiles();
    const packages: PackageInfo[] = [];
    const allDependencies = new Map<string, Set<string>>();
    const devDependencies = new Map<string, Set<string>>();
    const peerDependencies = new Map<string, Set<string>>();
    const frameworksUsed = new Set<string>();
    const toolingUsed = new Set<string>();

    for (const file of packageFiles) {
      const content = await fs.promises.readFile(file, 'utf8');
      const pkg = JSON.parse(content);
      const location = path.relative(this.rootDir, file);
      const type = this.determinePackageType(location);

      const packageInfo: PackageInfo = {
        name: pkg.name,
        version: pkg.version,
        dependencies: pkg.dependencies || {},
        devDependencies: pkg.devDependencies || {},
        peerDependencies: pkg.peerDependencies || {},
        location,
        type
      };

      packages.push(packageInfo);

      // Process dependencies
      const processDeps = (deps: Record<string, string>, map: Map<string, Set<string>>): void => {
        Object.entries(deps).forEach(([name, version]) => {
          if (!map.has(name)) {
            map.set(name, new Set());
          }
          const versions = map.get(name);
          if (versions) {
            versions.add(version);
          }

          if (this.isFramework(name)) {
            frameworksUsed.add(name);
          }
          if (this.isTooling(name)) {
            toolingUsed.add(name);
          }
        });
      };

      processDeps(packageInfo.dependencies, allDependencies);
      processDeps(packageInfo.devDependencies, devDependencies);
      processDeps(packageInfo.peerDependencies, peerDependencies);
    }

    return {
      packages,
      allDependencies,
      devDependencies,
      peerDependencies,
      frameworksUsed,
      toolingUsed
    };
  }

  async analyze(): Promise<ProjectAnalysis> {
    // Skip cache if force refresh is enabled
    if (!this.forceRefresh) {
      // Try to load from cache first
      const cached = await this.loadFromCache();
      if (cached) {
        return cached;
      }
    }

    // Perform fresh analysis
    const analysis = await this.performAnalysis();
    
    // Cache the results
    await this.saveToCache(analysis);
    
    return analysis;
  }

  formatAnalysis(analysis: ProjectAnalysis): string {
    let output = '📦 Project Dependencies Analysis\n\n';

    output += '🛠️ Frameworks Used:\n';
    analysis.frameworksUsed.forEach(framework => {
      const versions = analysis.allDependencies.get(framework);
      output += `  - ${framework} (${Array.from(versions || []).join(', ')})\n`;
    });

    output += '\n🔧 Development Tools:\n';
    analysis.toolingUsed.forEach(tool => {
      const versions = analysis.devDependencies.get(tool);
      output += `  - ${tool} (${Array.from(versions || []).join(', ')})\n`;
    });

    output += '\n📊 Package Statistics:\n';
    const typeCount = new Map<string, number>();
    analysis.packages.forEach(pkg => {
      typeCount.set(pkg.type, (typeCount.get(pkg.type) || 0) + 1);
    });
    typeCount.forEach((count, type) => {
      output += `  - ${type}: ${count}\n`;
    });

    output += '\n📚 Most Used Dependencies:\n';
    const sortedDeps = Array.from(analysis.allDependencies.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 10);
    sortedDeps.forEach(([dep, versions]) => {
      output += `  - ${dep} (${versions.size} versions: ${Array.from(versions).join(', ')})\n`;
    });

    return output;
  }
}
