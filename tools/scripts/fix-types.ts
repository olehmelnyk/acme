#!/usr/bin/env bun

import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';

interface TypeError {
  file: string;
  line: number;
  character: number;
  code: string;
  message: string;
}

function parseTypeErrors(output: string): TypeError[] {
  const errors: TypeError[] = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Match TypeScript error format: file(line,char): error TS2xxx: message
    const match = line.match(/([^(]+)\((\d+),(\d+)\): error (TS\d+): (.+)/);
    if (match) {
      errors.push({
        file: match[1].trim(),
        line: parseInt(match[2]),
        character: parseInt(match[3]),
        code: match[4],
        message: match[5]
      });
    }
  }
  
  return errors;
}

function ensureFileExists(filePath: string): boolean {
  if (!existsSync(filePath)) {
    try {
      // Create directory if it doesn't exist
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      // Create empty file
      writeFileSync(filePath, '', 'utf8');
      return true;
    } catch (error) {
      console.error(`Failed to create file ${filePath}:`, error);
      return false;
    }
  }
  return true;
}

function fixMissingImports(error: TypeError): boolean {
  try {
    // Handle common type errors
    switch (error.code) {
      case 'TS2304': // Cannot find name 'X'
      case 'TS2552': // Cannot find name 'X'. Did you mean 'Y'?
        const match = error.message.match(/Cannot find name '([^']+)'/);
        if (match) {
          const symbol = match[1];
          // Try to find the symbol in node_modules types
          const possibleImports = findPossibleImports(symbol);
          if (possibleImports.length > 0) {
            if (ensureFileExists(error.file)) {
              addImport(error.file, possibleImports[0], symbol);
              return true;
            }
          }
        }
        break;
        
      case 'TS7016': // Could not find declaration file
        const moduleMatch = error.message.match(/Could not find a declaration file for module '([^']+)'/);
        if (moduleMatch) {
          const module = moduleMatch[1];
          // Install @types package if available
          installTypes(module);
          return true;
        }
        break;
    }
  } catch (error) {
    console.error(`Failed to fix import in ${error.file}:`, error);
  }
  
  return false;
}

function findPossibleImports(symbol: string): string[] {
  try {
    // Search in node_modules/@types for possible type definitions
    const result = spawnSync('find', [
      'node_modules/@types',
      '-type', 'f',
      '-name', '*.d.ts',
      '-exec', 'grep', '-l', symbol, '{}', ';'
    ]);
    
    if (result.status === 0 && result.stdout) {
      return result.stdout.toString()
        .split('\n')
        .filter(Boolean)
        .map(path => path.replace(/.*node_modules\/@types\/(.+?)\/.*/, '$1'));
    }
  } catch (error) {
    console.error('Failed to find possible imports:', error);
  }
  
  return [];
}

function addImport(file: string, module: string, symbol: string) {
  try {
    if (!existsSync(file)) {
      console.error(`File not found: ${file}`);
      return;
    }
    
    const content = readFileSync(file, 'utf8');
    const importStatement = `import { ${symbol} } from '${module}';\n`;
    writeFileSync(file, importStatement + content);
    console.log(`✅ Added import for ${symbol} from ${module} in ${file}`);
  } catch (error) {
    console.error(`Failed to add import to ${file}:`, error);
    throw error;
  }
}

function installTypes(module: string) {
  try {
    const typesPackage = `@types/${module}`;
    console.log(`📦 Installing ${typesPackage}...`);
    const result = spawnSync('bun', ['add', '-d', typesPackage], {
      stdio: 'inherit'
    });
    
    if (result.status === 0) {
      console.log(`✅ Installed ${typesPackage}`);
      return true;
    } else {
      console.error(`❌ Failed to install ${typesPackage}`);
      return false;
    }
  } catch (error) {
    console.error('Failed to install types:', error);
    return false;
  }
}

async function main() {
  try {
    // Run type check and capture output
    console.log('🔍 Running type check...');
    const typecheck = spawnSync('bun', ['nx', 'affected', '--target=typecheck'], {
      encoding: 'utf8'
    });
    
    if (typecheck.status === 0) {
      console.log('✅ No type errors found');
      process.exit(0);
    }
    
    const errors = parseTypeErrors(typecheck.stdout || typecheck.stderr || '');
    if (errors.length === 0) {
      console.log('❌ Failed to parse type errors');
      process.exit(1);
    }
    
    console.log(`Found ${errors.length} type errors. Attempting to fix...`);
    let fixedCount = 0;
    
    for (const error of errors) {
      try {
        if (fixMissingImports(error)) {
          fixedCount++;
        }
      } catch (error) {
        console.error('Failed to fix error:', error);
      }
    }
    
    if (fixedCount > 0) {
      console.log(`🔧 Fixed ${fixedCount} type errors automatically`);
      // Run type check again to verify fixes
      console.log('🔍 Verifying fixes...');
      const recheck = spawnSync('bun', ['nx', 'affected', '--target=typecheck'], {
        stdio: 'inherit'
      });
      process.exit(recheck.status || 0);
    } else {
      console.log('❌ Could not automatically fix any type errors');
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
