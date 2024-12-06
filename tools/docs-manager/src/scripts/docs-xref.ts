#!/usr/bin/env bun
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { resolve, relative, dirname, join, basename } from 'path';

interface XRef {
  source: string;
  target: string;
  line: number;
}

interface ValidationResult {
  valid: boolean;
  brokenRefs: XRef[];
  suggestedFixes: Map<string, string>;
}

const isVerbose = process.argv.includes('--verbose');

function log(...args: any[]) {
  if (isVerbose) {
    console.log(...args);
  }
}

function normalizeMarkdownPath(basePath: string, targetPath: string): string {
  log('\nNormalizing path:', { basePath, targetPath });
  
  // If the path starts with 'docs/', remove it
  const cleanPath = targetPath.replace(/^docs\//, '');
  log('Cleaned path:', cleanPath);
  
  // Resolve the path relative to the base file
  const resolvedPath = resolve(dirname(basePath), cleanPath);
  log('Resolved path:', resolvedPath);
  
  // Convert to relative path from docs directory
  const docsDir = resolve(process.cwd(), 'docs');
  const relativePath = relative(docsDir, resolvedPath);
  log('Final relative path:', relativePath);
  
  return relativePath;
}

async function findMarkdownFiles(root: string): Promise<string[]> {
  log('\nSearching for markdown files...');
  log('Root directory:', root);
  
  try {
    const docsDir = join(root, 'docs');
    log('Docs directory:', docsDir);
    
    const pattern = '**/*.md';
    const options = {
      cwd: docsDir,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/artifacts/**',
        '**/architecture/diagrams/readme.md'
      ],
      absolute: true,
      nodir: true,
      withFileTypes: false
    };
    
    log('Search options:', options);
    
    const matches = await glob(pattern, options);
    const files = Array.isArray(matches) ? matches.map(match => match.toString()) : [];
    
    log(`Found ${files.length} markdown files:`, files);
    
    if (files.length === 0) {
      console.warn('⚠️ No markdown files found in docs directory:', docsDir);
      process.exit(0);
    }
    
    return files;
  } catch (error) {
    console.error('❌ Error finding markdown files:', error);
    return [];
  }
}

function extractCrossReferences(file: string): XRef[] {
  log('\nExtracting cross-references from:', file);
  
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const refs: XRef[] = [];
  
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = linkPattern.exec(line)) !== null) {
      const [, text, target] = match;
      if (target.endsWith('.md')) {
        log(`Found link on line ${index + 1}:`, { text, target });
        
        // Normalize the target path
        const normalizedTarget = normalizeMarkdownPath(file, target);
        refs.push({
          source: file,
          target: normalizedTarget,
          line: index + 1
        });
      }
    }
  });
  
  log(`Found ${refs.length} cross-references`);
  return refs;
}

function validateReferences(files: string[], refs: XRef[]): ValidationResult {
  log('\nValidating cross-references...');
  log(`Total files: ${files.length}`);
  log(`Total references: ${refs.length}`);
  
  const result: ValidationResult = {
    valid: true,
    brokenRefs: [],
    suggestedFixes: new Map()
  };
  
  // Create a map of normalized paths for easier lookup
  const normalizedFiles = new Map(
    files.map(f => {
      const docsDir = resolve(process.cwd(), 'docs');
      const normalizedPath = relative(docsDir, f).toLowerCase();
      log('Normalizing file path:', { original: f, normalized: normalizedPath });
      return [normalizedPath, f];
    })
  );
  
  refs.forEach(ref => {
    const normalizedTarget = ref.target.toLowerCase();
    log('\nChecking reference:', {
      source: ref.source,
      target: ref.target,
      normalizedTarget
    });
    
    if (!normalizedFiles.has(normalizedTarget)) {
      log('❌ Reference not found');
      result.valid = false;
      result.brokenRefs.push(ref);
      
      // Try to find similar files
      const targetBase = basename(ref.target).toLowerCase();
      const suggestions = Array.from(normalizedFiles.keys())
        .filter(f => basename(f).toLowerCase().includes(targetBase.replace('.md', '')))
        .map(f => relative(dirname(ref.source), normalizedFiles.get(f) || ''));
      
      if (suggestions.length > 0) {
        log('Found suggestions:', suggestions);
        result.suggestedFixes.set(ref.target, suggestions[0]);
      }
    } else {
      log('✅ Reference found');
    }
  });
  
  return result;
}

async function main() {
  try {
    const workspaceRoot = process.cwd();
    log('\nWorkspace root:', workspaceRoot);
    
    const repoRoot = workspaceRoot.includes('tools/docs-manager') 
      ? resolve(workspaceRoot, '../..')
      : workspaceRoot;
    log('Repository root:', repoRoot);
    
    const files = await findMarkdownFiles(repoRoot);
    console.log(`📝 Found ${files.length} markdown files`);
    
    const allRefs: XRef[] = [];
    files.forEach(file => {
      const refs = extractCrossReferences(file);
      allRefs.push(...refs);
    });
    
    console.log(`🔍 Found ${allRefs.length} cross-references`);
    
    const validation = validateReferences(files, allRefs);
    
    if (!validation.valid) {
      console.error('\n❌ Broken cross-references found:');
      validation.brokenRefs.forEach(ref => {
        const relativeSource = relative(repoRoot, ref.source);
        console.error(`\nIn ${relativeSource} (line ${ref.line}):`);
        console.error(`  Target not found: ${ref.target}`);
        
        const suggestion = validation.suggestedFixes.get(ref.target);
        if (suggestion) {
          console.error(`  Suggestion: ${suggestion}`);
        }
      });
      process.exit(1);
    }
    
    console.log('\n✅ All cross-references are valid');
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
