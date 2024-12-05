#!/usr/bin/env bun
import { PackageAnalyzer } from './index';
import * as path from 'path';

interface CliOptions {
  rootDir: string;
  save: boolean;
  force: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  return {
    rootDir: args[0] || process.cwd().replace(/\/tools\/package-analyzer$/, ''),
    save: args.includes('--save'),
    force: args.includes('--force') || args.includes('-f')
  };
}

/* eslint-disable no-console */
async function main(): Promise<void> {
  const options = parseArgs();
  
  console.log(`🔍 Analyzing packages in ${options.rootDir}...`);
  if (options.force) {
    console.log('⚡ Force refresh enabled - ignoring cache');
  }

  const analyzer = new PackageAnalyzer(options.rootDir, {
    forceRefresh: options.force
  });
  
  const analysis = await analyzer.analyze();
  console.log(analyzer.formatAnalysis(analysis));

  if (options.save) {
    const outputFile = path.join(options.rootDir, 'package-analysis.json');
    await Bun.write(outputFile, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 Analysis saved to ${outputFile}`);
  }
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
/* eslint-enable no-console */
