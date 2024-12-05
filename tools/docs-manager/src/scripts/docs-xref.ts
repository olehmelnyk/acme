#!/usr/bin/env bun
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { resolve, relative, dirname } from 'path';

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
  return glob('**/*.md', { 
    cwd: root,
    ignore: ['**/node_modules/**', '**/dist/**'],
    absolute: true 
  });
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
        refs.push({
          source: file,
          target: resolve(dirname(file), target),
          line: index + 1
        });
      }
    }
  });
  
  return refs;
}

function validateReferences(files: string[], refs: XRef[]): ValidationResult {
  const fileSet = new Set(files);
  const brokenRefs: XRef[] = [];
  const suggestedFixes = new Map<string, string>();
  
  refs.forEach(ref => {
    if (!fileSet.has(ref.target)) {
      brokenRefs.push(ref);
      
      // Try to find similar files for suggestions
      const similarFiles = Array.from(fileSet)
        .filter(f => {
          const baseName = f.split('/').pop();
          const targetName = ref.target.split('/').pop();
          if (!baseName || !targetName) return false;
          return baseName.toLowerCase().includes(targetName.toLowerCase());
        });
      
      if (similarFiles.length > 0) {
        suggestedFixes.set(
          ref.target,
          relative(dirname(ref.source), similarFiles[0])
        );
      }
    }
  });
  
  return {
    valid: brokenRefs.length === 0,
    brokenRefs,
    suggestedFixes
  };
}

async function main() {
  const root = process.cwd();
  console.log('🔍 Scanning for markdown files...');
  
  const files = await findMarkdownFiles(root);
  console.log(`📑 Found ${files.length} markdown files`);
  
  const allRefs: XRef[] = [];
  files.forEach(file => {
    const refs = extractCrossReferences(file);
    allRefs.push(...refs);
  });
  console.log(`🔗 Found ${allRefs.length} cross-references`);
  
  const validation = validateReferences(files, allRefs);
  
  if (validation.valid) {
    console.log('✅ All cross-references are valid!');
    process.exit(0);
  } else {
    console.log('\n❌ Found broken cross-references:');
    validation.brokenRefs.forEach(ref => {
      console.log(`\n${ref.source}:${ref.line}`);
      console.log(`  Broken reference to: ${ref.target}`);
      
      const suggestion = validation.suggestedFixes.get(ref.target);
      if (suggestion) {
        console.log(`  Suggestion: ${suggestion}`);
      }
    });
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
