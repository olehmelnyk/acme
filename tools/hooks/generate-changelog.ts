import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface GitChange {
  status: string;
  file: string;
}

// Commit type definitions with their patterns
const commitTypes = {
  security: {
    patterns: [/security/i, /vulnerability/i, /cve/i],
    dirs: ['security']
  },
  docs: {
    patterns: [/docs?/i, /documentation/i, /readme/i],
    dirs: ['docs', 'documentation']
  },
  test: {
    patterns: [/test/i, /spec/i, /__tests__/, /__mocs__/],
    dirs: ['test', 'tests', '__tests__', '__mocs__']
  },
  translation: {
    patterns: [/i18n/i, /translations?/i, /locale/i],
    dirs: ['locales', 'translations', 'i18n']
  },
  build: {
    patterns: [/webpack/i, /vite/i, /build/i, /deps/i],
    dirs: ['build', 'config']
  },
  ci: {
    patterns: [/\.github\/workflows/i, /\.gitlab-ci/i],
    dirs: ['.github', 'ci', '.gitlab']
  },
  style: {
    patterns: [/style/i, /format/i, /lint/i],
    dirs: ['styles', 'css']
  },
  perf: {
    patterns: [/perf/i, /performance/i, /optimize/i],
    dirs: ['perf']
  },
  refactor: {
    patterns: [/refactor/i, /restructure/i],
    dirs: []
  },
  temp: {
    patterns: [/te?mp(orary)?/i, /wip/i, /draft/i],
    dirs: ['temp']
  }
};

function getGitChanges(): GitChange[] {
  const output = execSync('git diff --cached --name-status').toString();
  return output
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [status, ...fileParts] = line.split('\t');
      return { status, file: fileParts.join('\t') };
    });
}

function detectCommitType(changes: GitChange[]): string {
  // Check for special cases first
  if (changes.some(c => c.file.includes('.changeset'))) return 'changeset';
  if (changes.some(c => c.status === 'D')) return 'revert';

  // Check each file against type patterns
  for (const [type, config] of Object.entries(commitTypes)) {
    const hasMatchingFile = changes.some(change => 
      config.patterns.some(pattern => pattern.test(change.file)) ||
      config.dirs.some(dir => change.file.startsWith(dir + '/'))
    );
    if (hasMatchingFile) return type;
  }

  // Check if it's a fix by looking for keywords in staged changes
  const stagedContent = execSync('git diff --cached').toString().toLowerCase();
  if (stagedContent.includes('fix') || stagedContent.includes('bug')) return 'fix';

  // Default to feat if no other type matches
  return 'feat';
}

function detectScope(changes: GitChange[]): string {
  // Get all unique top-level directories
  const dirs = new Set(changes.map(c => c.file.split('/')[0]));
  
  // If there's only one directory, use it as scope
  if (dirs.size === 1) return Array.from(dirs)[0];

  // If there are multiple directories, find the most common one
  const dirCounts = Array.from(dirs).reduce((acc, dir) => {
    acc[dir] = changes.filter(c => c.file.startsWith(dir + '/')).length;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonDir = Object.entries(dirCounts)
    .sort(([, a], [, b]) => b - a)[0][0];

  return mostCommonDir;
}

async function generateChangeDescription(changes: GitChange[]): Promise<string> {
  const filesByType = changes.reduce((acc, change) => {
    const ext = path.extname(change.file);
    if (!acc[ext]) acc[ext] = [];
    acc[ext].push(change);
    return acc;
  }, {} as Record<string, GitChange[]>);

  const descriptions: string[] = [];

  for (const [ext, files] of Object.entries(filesByType)) {
    const fileCount = files.length;
    const fileType = ext ? `${ext.slice(1)} files` : 'files';
    const action = files.every(f => f.status === 'A') ? 'Added' :
                   files.every(f => f.status === 'D') ? 'Removed' :
                   'Updated';
    
    descriptions.push(`${action} ${fileCount} ${fileType}`);
  }

  return descriptions.join('\n');
}

async function generateCommitMessage(changes: GitChange[]): Promise<string> {
  const type = detectCommitType(changes);
  const scope = detectScope(changes);
  const description = await generateChangeDescription(changes);
  
  return `${type}${scope ? `(${scope})` : ''}: ${description}`;
}

async function main() {
  try {
    const changes = getGitChanges();
    if (changes.length === 0) {
      console.log('No staged changes found');
      process.exit(0);
    }

    const commitMessage = await generateCommitMessage(changes);
    fs.writeFileSync('.git/COMMIT_EDITMSG', commitMessage);
    console.log('Generated commit message:', commitMessage);
  } catch (error) {
    console.error('Error generating commit message:', error);
    process.exit(1);
  }
}

main();
