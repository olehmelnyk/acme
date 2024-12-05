#!/usr/bin/env bun
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';

const DIAGRAMS_DIR = 'docs/architecture/diagrams';
const REQUIRED_SECTIONS = ['Overview', 'Components', 'Interactions', 'Implementation Details'];

interface ValidationError {
  file: string;
  errors: string[];
}

async function validateDiagramFile(filePath: string): Promise<string[]> {
  const content = readFileSync(filePath, 'utf-8');
  const errors: string[] = [];

  // Check for required sections
  REQUIRED_SECTIONS.forEach(section => {
    if (!content.includes(`## ${section}`)) {
      errors.push(`Missing required section: ${section}`);
    }
  });

  // Check for mermaid diagrams
  if (!content.includes('```mermaid')) {
    errors.push('No mermaid diagram found');
  }

  // Check for proper markdown structure
  if (!content.startsWith('# ')) {
    errors.push('Missing top-level heading');
  }

  // Check for implementation details
  if (!content.includes('### Implementation') && !content.includes('## Implementation')) {
    errors.push('Missing implementation details section');
  }

  return errors;
}

async function main() {
  const workspaceRoot = process.cwd();
  const diagramsPath = join(workspaceRoot, DIAGRAMS_DIR);
  
  console.log(chalk.blue('🔍 Validating architecture diagrams...'));
  
  const files = await glob('**/*.md', { 
    cwd: diagramsPath,
    absolute: true 
  });

  const validationErrors: ValidationError[] = [];

  for (const file of files) {
    const errors = await validateDiagramFile(file);
    if (errors.length > 0) {
      validationErrors.push({
        file: relative(workspaceRoot, file),
        errors
      });
    }
  }

  if (validationErrors.length > 0) {
    console.log(chalk.red('\n❌ Found validation errors:'));
    validationErrors.forEach(({ file, errors }) => {
      console.log(chalk.yellow(`\n${file}:`));
      errors.forEach(error => console.log(chalk.red(`  - ${error}`)));
    });
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All diagrams are valid!'));
  }
}

main().catch(error => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
