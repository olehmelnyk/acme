#!/usr/bin/env bun
import { DocsFetcher } from './index';
import { FETCH_CONFIG } from './fetch-config';
import { searchDocsUrl } from './utils';
import * as fs from 'fs-extra';

async function main() {
  // Get package name from command line args
  const args = process.argv.slice(2);
  const packageName = args[0];
  
  if (!packageName) {
    console.error('Please provide a package name');
    process.exit(1);
  }

  // Parse options
  const options = {
    force: args.includes('--force'),
    limit: parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '15')
  };

  // Update config with command line options
  const config = {
    ...FETCH_CONFIG,
    limit: options.limit
  };

  // Ensure cache directory exists
  await fs.ensureDir(config.cacheDir);
  console.log(`Cache directory: ${config.cacheDir}`);
  console.log(`Page limit: ${config.limit}`);

  // Create fetcher instance
  const fetcher = new DocsFetcher(config);

  try {
    // Initialize browser
    await fetcher.init();

    if (packageName === '--all') {
      // Process all packages
      await fetcher.processPackages();
    } else {
      // Search for docs URL
      const docsUrl = await searchDocsUrl(packageName);
      if (!docsUrl) {
        console.error(`No documentation URL found for ${packageName}`);
        process.exit(1);
      }

      console.log(`Documentation URL: ${docsUrl}`);
      // Fetch docs for single package
      await fetcher.fetchDocs(packageName, docsUrl);
    }

    console.log('Documentation fetching completed successfully');
  } catch (error) {
    console.error('Error fetching documentation:', error);
    process.exit(1);
  } finally {
    await fetcher.close();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
