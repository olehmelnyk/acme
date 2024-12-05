#!/usr/bin/env bun
import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname, basename } from 'path';
import chalk from 'chalk';

const DIAGRAMS_DIR = 'docs/architecture/diagrams';
const INDEX_FILE = 'docs/architecture/diagrams/readme.md';

interface DiagramInfo {
  title: string;
  path: string;
  category: string;
  description: string;
}

function extractDiagramInfo(filePath: string, content: string): DiagramInfo | null {
  const titleMatch = content.match(/^# (.*)/m);
  const descriptionMatch = content.match(/^# .*\n\n([^\n#].*)/m);
  
  if (!titleMatch) return null;

  const category = dirname(relative(DIAGRAMS_DIR, filePath)).split('/')[0];
  
  return {
    title: titleMatch[1],
    path: relative(dirname(INDEX_FILE), filePath),
    category: category === '.' ? 'General' : category.charAt(0).toUpperCase() + category.slice(1),
    description: descriptionMatch ? descriptionMatch[1].trim() : 'No description provided'
  };
}

function generateIndex(diagrams: DiagramInfo[]): string {
  const categories = [...new Set(diagrams.map(d => d.category))].sort();
  
  let content = '# Architecture Diagrams Index\n\n';
  content += 'This document provides an index of all architecture diagrams in the project.\n\n';
  
  categories.forEach(category => {
    content += `## ${category}\n\n`;
    const categoryDiagrams = diagrams.filter(d => d.category === category).sort((a, b) => a.title.localeCompare(b.title));
    
    categoryDiagrams.forEach(diagram => {
      content += `### [${diagram.title}](${diagram.path})\n\n`;
      content += `${diagram.description}\n\n`;
    });
  });
  
  return content;
}

async function main() {
  const workspaceRoot = process.cwd();
  const diagramsPath = join(workspaceRoot, DIAGRAMS_DIR);
  const indexPath = join(workspaceRoot, INDEX_FILE);
  
  console.log(chalk.blue('🔍 Scanning for architecture diagrams...'));
  
  const files = await glob('**/*.md', { 
    cwd: diagramsPath,
    absolute: true,
    ignore: ['**/readme.md', '**/index.md']
  });

  console.log(chalk.blue(`📑 Found ${files.length} diagram files`));

  const diagrams: DiagramInfo[] = [];
  
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const info = extractDiagramInfo(file, content);
    if (info) {
      diagrams.push(info);
    } else {
      console.warn(chalk.yellow(`⚠️  Warning: Could not extract info from ${relative(workspaceRoot, file)}`));
    }
  }

  console.log(chalk.blue('📝 Generating index...'));
  const indexContent = generateIndex(diagrams);
  writeFileSync(indexPath, indexContent);

  console.log(chalk.green(`✅ Index generated successfully at ${relative(workspaceRoot, indexPath)}`));
}

main().catch(error => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
