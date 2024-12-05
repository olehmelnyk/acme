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
  console.log('Searching in root:', root);
  try {
    const pattern = '**/*.md';
    const options = {
      cwd: root,
      ignore: ['**/node_modules/**', '**/dist/**', '**/artifacts/**'],
      absolute: true,
      nodir: true,
      withFileTypes: false
    };
    
    const matches = await glob(pattern, options);
    return Array.isArray(matches) ? matches.map(match => match.toString()) : [];
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
        const normalizedTarget = resolve(dirname(file), target)
          .split('/')
          .map((part, i, arr) => {
            // Keep case for the filename (last part)
            if (i === arr.length - 1) return part;
            // Lowercase for directories
            return part.toLowerCase();
          })
          .join('/');

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
  // Create a map of lowercase paths to actual paths for case-insensitive comparison
  const fileMap = new Map(files.map(f => [f.toLowerCase(), f]));
  const brokenRefs: XRef[] = [];
  const suggestedFixes = new Map<string, string>();
  
  refs.forEach(ref => {
    const targetLower = ref.target.toLowerCase();
    if (!fileMap.has(targetLower)) {
      brokenRefs.push(ref);
      
      // Try to find similar files for suggestions
      const similarFiles = Array.from(fileMap.values())
        .filter(f => {
          const baseName = f.split('/').pop();
          const targetName = ref.target.split('/').pop();
          if (!baseName || !targetName) return false;
          return baseName.toLowerCase() === targetName.toLowerCase();
        });
      
      if (similarFiles.length > 0) {
        // Use relative path for suggestion
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
  try {
    const root = process.cwd();
    console.log('🔍 Scanning for markdown files...');
    
    const files = await findMarkdownFiles(root);
    if (files.length === 0) {
      console.error('❌ No markdown files found');
      process.exit(1);
    }
    console.log(`📑 Found ${files.length} markdown files`);
    
    console.log('🔎 Checking cross-references...');
    const allRefs: XRef[] = [];
    for (const file of files) {
      try {
        const refs = extractCrossReferences(file);
        allRefs.push(...refs);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
        process.exit(1);
      }
    }
    console.log(`📝 Found ${allRefs.length} cross-references`);
    
    const result = validateReferences(files, allRefs);
    
    if (!result.valid) {
      console.error('\n❌ Found broken references:');
      result.brokenRefs.forEach(ref => {
        console.error(`  - ${relative(root, ref.source)}:${ref.line} -> ${ref.target}`);
        const suggestion = result.suggestedFixes.get(ref.target);
        if (suggestion) {
          console.error(`    Suggestion: ${suggestion}`);
        }
      });
      process.exit(1);
    }
    
    console.log('\n✅ All references are valid!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
