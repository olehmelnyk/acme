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

async function findMarkdownFiles(root: string): Promise<string[]> {
  console.log('Searching in root:', root);
  try {
    const pattern = '**/*.md';
    const options = {
      cwd: join(root, 'docs'),  // Look in the docs directory
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/artifacts/**',
        '**/architecture/diagrams/readme.md'  // Ignore generated index
      ],
      absolute: true,
      nodir: true,
      withFileTypes: false
    };
    
    const matches = await glob(pattern, options);
    const files = Array.isArray(matches) ? matches.map(match => match.toString()) : [];
    
    if (files.length === 0) {
      console.warn('No markdown files found in docs directory. Expected markdown files in:', join(root, 'docs'));
      process.exit(0);  // Exit successfully since this might be a new project
    }
    
    return files;
  } catch (error) {
    console.error('Error finding markdown files:', error);
    return [];
  }
}

function extractCrossReferences(file: string): XRef[] {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const refs: XRef[] = [];
  
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = linkPattern.exec(line)) !== null) {
      const [, , target] = match;
      if (target.endsWith('.md')) {
        // Normalize the target path
        const normalizedTarget = resolve(dirname(file), target);
        refs.push({
          source: file,
          target: normalizedTarget,
          line: index + 1
        });
      }
    }
  });
  
  return refs;
}

function validateReferences(files: string[], refs: XRef[]): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    brokenRefs: [],
    suggestedFixes: new Map()
  };
  
  refs.forEach(ref => {
    if (!files.includes(ref.target)) {
      result.valid = false;
      result.brokenRefs.push(ref);
      
      // Try to find similar files for suggestions
      const targetBase = basename(ref.target).toLowerCase();
      const suggestions = files
        .filter(f => basename(f).toLowerCase().includes(targetBase.replace('.md', '')))
        .map(f => relative(dirname(ref.source), f));
      
      if (suggestions.length > 0) {
        result.suggestedFixes.set(ref.target, suggestions[0]);
      }
    }
  });
  
  return result;
}

async function main() {
  const workspaceRoot = process.cwd();
  const repoRoot = workspaceRoot.includes('tools/docs-manager') 
    ? resolve(workspaceRoot, '../..')  // If running from tools/docs-manager
    : workspaceRoot;                   // If running from repo root
  
  const files = await findMarkdownFiles(repoRoot);
  console.log(`Found ${files.length} markdown files`);
  
  const allRefs: XRef[] = [];
  files.forEach(file => {
    const refs = extractCrossReferences(file);
    allRefs.push(...refs);
  });
  
  console.log(`Found ${allRefs.length} cross-references`);
  
  const validation = validateReferences(files, allRefs);
  
  if (!validation.valid) {
    console.error('\nBroken cross-references found:');
    validation.brokenRefs.forEach(ref => {
      console.error(`\nIn ${relative(repoRoot, ref.source)} (line ${ref.line}):`);
      console.error(`  Target not found: ${relative(repoRoot, ref.target)}`);
      
      const suggestion = validation.suggestedFixes.get(ref.target);
      if (suggestion) {
        console.error(`  Suggestion: ${suggestion}`);
      }
    });
    process.exit(1);
  }
  
  console.log('\n✅ All cross-references are valid');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
