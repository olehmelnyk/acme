#!/usr/bin/env bun

import { execSync } from 'child_process';

const BRANCH_PATTERN = /^(feat|fix|hotfix|release|support)\/ACME-\d+-[a-zA-Z0-9/_-]+$/;
const PROTECTED_BRANCHES = ['main', 'dev', 'stage'];

function getCurrentBranch(): string {
  try {
    return execSync('git branch --show-current').toString().trim();
  } catch (error) {
    console.error('Failed to get current branch:', error);
    process.exit(1);
  }
}

function validateBranchName(branchName: string): boolean {
  // Check if it's a protected branch
  if (PROTECTED_BRANCHES.includes(branchName)) {
    return true;
  }

  // Check if branch name matches the pattern
  return BRANCH_PATTERN.test(branchName);
}

function main() {
  const currentBranch = getCurrentBranch();
  
  if (!validateBranchName(currentBranch)) {
    console.error('❌ Branch name validation failed!');
    console.error(`Branch name "${currentBranch}" does not match the required pattern:`);
    console.error('Pattern: <type>/ACME-<number>-<description>');
    console.error('Where <type> is one of: feat, fix, hotfix, release, support');
    console.error('Example: feat/ACME-123-add-user-auth');
    process.exit(1);
  }

  console.log('✅ Branch name is valid');
  process.exit(0);
}

main();
