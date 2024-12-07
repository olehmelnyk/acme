#!/usr/bin/env bun
import { DocsFetcher } from './index';
import { loadConfig } from './fetch-config';
import { DocumentationSearch, SearchResult } from './search';
import { PackageInfoFetcher } from './package-info';
import { DocsFetcherError } from './errors';
import fs from 'fs';
import { logger } from './logger';

interface CliOptions {
  force: boolean;
  all: boolean;
  verbose: boolean;
  limit: number;
  search?: string;
  packages?: string[];
  preInstall?: boolean;
}

const HELP_TEXT = `
📚 Docs Fetcher - Documentation Download Tool

Usage:
  bun run cli.ts [package-name] [options]
  bun run cli.ts score [package-name] [options]

Options:
  --force         Force re-download of documentation
  --limit=<num>   Set page limit (default: 15)
  --all          Fetch docs for all packages
  --verbose      Show detailed progress
  --search       Search within fetched documentation
  --pre-install  Fetch installation instructions before installing
  --clear-cache  Clear the search cache
  --cache-stats  Show cache statistics
  --help         Show this help text

Score Options:
  --details      Show detailed scoring breakdown
  --threshold=<num> Only show documentation above this score (0-100)

Examples:
  bun run cli.ts react
  bun run cli.ts express --force
  bun run cli.ts --all --limit=20
  bun run cli.ts express --search="middleware"
  bun run cli.ts --all --search="routing"
  bun run cli.ts next --pre-install
  bun run cli.ts --clear-cache
  bun run cli.ts --cache-stats
  bun run cli.ts score react --details
  bun run cli.ts score express --threshold=80
`;

function formatScore(score: number) {
  return `${(score * 100).toFixed(2)}%`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    logger.info(HELP_TEXT);
    process.exit(0);
  }

  const firstArg = args[0]?.startsWith('--') ? undefined : args[0];
  const options: CliOptions = {
    force: args.includes('--force'),
    all: args.includes('--all'),
    verbose: args.includes('--verbose'),
    limit: parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '15'),
    search: args.find(arg => arg.startsWith('--search='))?.split('=')[1],
    packages: args.find(arg => arg.startsWith('--packages='))?.split('=')[1]?.split(','),
    preInstall: args.includes('--pre-install')
  };

  const config = await loadConfig();
  
  // Handle score command
  if (args[0] === 'score') {
    const targetPackage = args[1];
    if (!targetPackage) {
      logger.error('Please specify a package name to score');
      process.exit(1);
    }

    const fetcher = new DocsFetcher({
      ...config,
      limit: options.limit,
      verbose: options.verbose,
      forceRefresh: options.force
    });
    try {
      await fetcher.init();
      const result = await fetcher.scoreDocumentation(targetPackage);
      logger.info(`Documentation Score for ${targetPackage}: ${formatScore(result.score)}`);
      if (args.includes('--details') && result.details) {
        logger.info('Score breakdown:', result.details);
      }
      process.exit(0);
    } catch (error) {
      if (error instanceof DocsFetcherError) {
        logger.error(`Error scoring package: ${error.message}`);
      } else {
        logger.error('An unexpected error occurred:', error instanceof Error ? error.message : 'Unknown error');
      }
      process.exit(1);
    }
  }

  // Handle cache management
  if (args.includes('--clear-cache')) {
    logger.info('Clearing search cache...');
    const search = new DocumentationSearch(config.cacheDir);
    try {
      await search.clearCache();
      logger.info('Cache cleared successfully');
      process.exit(0);
    } catch (error) {
      if (error instanceof DocsFetcherError) {
        logger.error(`Error clearing cache: ${error.message}`);
      } else {
        logger.error('An unexpected error occurred:', error instanceof Error ? error.message : 'Unknown error');
      }
      process.exit(1);
    }
  }

  if (args.includes('--cache-stats')) {
    logger.info('Fetching cache statistics...');
    const search = new DocumentationSearch(config.cacheDir);
    try {
      const stats = await search.getCacheStats();
      logger.info('Cache Statistics:');
      logger.info(`- Total packages: ${stats.totalPackages}`);
      logger.info(`- Cache size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      process.exit(0);
    } catch (error) {
      if (error instanceof DocsFetcherError) {
        logger.error(`Error fetching cache stats: ${error.message}`);
      } else {
        logger.error('An unexpected error occurred:', error instanceof Error ? error.message : 'Unknown error');
      }
      process.exit(1);
    }
  }

  // Print configuration
  if (options.verbose) {
    logger.info('Configuration:');
    logger.info(`Cache directory: ${config.cacheDir}`);
    logger.info(`Page limit: ${options.limit}`);
  }

  const fetcher = new DocsFetcher({
    ...config,
    limit: options.limit,
    verbose: options.verbose,
    forceRefresh: options.force
  });

  // Get package name (if not --all)
  const targetPackage = options.packages && options.packages.length > 0 ? options.packages[0] : firstArg;

  if (!options.all && !targetPackage) {
    logger.error('Please specify a package name or use --all');
    process.exit(1);
  }

  // Ensure cache directory exists
  if (!fs.existsSync(config.cacheDir)) {
    fs.mkdirSync(config.cacheDir, { recursive: true });
  }

  logger.info('Initializing docs fetcher...');
  logger.info(`Cache directory: ${config.cacheDir}`);
  logger.info(`Page limit: ${options.limit}`);

  try {
    logger.info('Starting browser...');
    await fetcher.init();

    if (options.search) {
      const search = new DocumentationSearch(config.cacheDir);
      let results: SearchResult[];
      
      if (options.all) {
        logger.info(`Searching all packages for "${options.search}"...`);
        results = await search.searchAll(options.search);
      } else if (targetPackage) {
        logger.info(`Searching ${targetPackage} docs for "${options.search}"...`);
        results = await search.search({ 
          query: options.search,
          maxResults: options.limit || 10 
        });
      } else {
        logger.error('Please specify a package name or use --all to search all packages');
        process.exit(1);
      }

      logger.info(search.formatResults(results));
      process.exit(0);
    }

    if (targetPackage) {
      if (options.preInstall) {
        logger.info(`Fetching installation instructions for ${targetPackage}...`);
        const packageInfo = new PackageInfoFetcher(config.cacheDir);
        try {
          const info = await packageInfo.getPackageInfo(targetPackage);
          logger.info('\nInstallation Instructions:');
          logger.info('==============================');
          logger.info(info.installInstructions || 'No installation instructions found.');
          logger.info('==============================\n');

          if (info.documentation?.urls) {
            logger.info('Documentation Links:');
            info.documentation.urls.forEach(url => {
              logger.info(url);
            });
          }
        } catch (error) {
          if (error instanceof DocsFetcherError) {
            logger.error(`Error: ${error.message}`);
          } else {
            logger.error('An unexpected error occurred:', error instanceof Error ? error.message : 'Unknown error');
          }
          process.exit(1);
        }
        process.exit(0);
      }

      logger.info(`Fetching docs for ${targetPackage}...`);
      await fetcher.fetchDocs(targetPackage);
      logger.info(`Successfully fetched docs for ${targetPackage}`);
    } else if (options.all) {
      logger.info('Processing all packages...');
      try {
        await fetcher.processAllPackages();
        logger.info('Successfully processed all packages');
      } catch (error) {
        if (error instanceof DocsFetcherError) {
          logger.error(`Error processing packages: ${error.message}`);
        } else {
          logger.error('An unexpected error occurred:', error instanceof Error ? error.message : 'Unknown error');
        }
        process.exit(1);
      }
    } else if (options.packages && options.packages.length > 0) {
      logger.info(`Fetching docs for specific packages: ${options.packages.join(', ')}`);
      const results = await Promise.all(options.packages.map(pkg => fetcher.fetchDocs(pkg)));

      const failed = results.filter(r => r !== undefined);
      if (failed.length > 0) {
        logger.error(`Failed to fetch docs for ${failed.length} packages:`);
        failed.forEach(f => logger.error(`  - ${f}`));
        process.exit(1);
      }

      logger.info('All specified packages processed successfully!');
    }
  } catch (error) {
    if (error instanceof DocsFetcherError) {
      logger.error(`Error: ${error.message}`);
    } else {
      logger.error('An unexpected error occurred:', error instanceof Error ? error.message : 'Unknown error');
    }
    process.exit(1);
  } finally {
    try {
      await fetcher.close();
    } catch (error) {
      if (error instanceof DocsFetcherError) {
        logger.error(`Error closing browser: ${error.message}`);
      } else {
        logger.error('An unexpected error occurred while closing browser:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }
}

main().catch(error => {
  logger.error('Fatal error:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
