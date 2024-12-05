#!/usr/bin/env bun
import { Command } from 'commander';
import chalk from 'chalk';
import { DocFormatter } from '../formatting/doc-formatter';
import { ConfigurationManager } from '../utils/config-manager';

interface FormatOptions {
  [key: string]: any;
  dir: string;
  verbose: boolean;
  dryRun: boolean;
}

const program = new Command();

export function setupFormatCommand(program: Command): void {
  program
    .command('format')
    .description('Format documentation files')
    .option('-d, --dir <directory>', 'Directory containing documentation files')
    .option('-v, --verbose', 'Show detailed output')
    .option('--dry-run', 'Show what would be done without making changes')
    .action(async (options: FormatOptions) => {
      const config = ConfigurationManager.getInstance();
      const formatter = new DocFormatter();

      const directory = options['dir'] || process.cwd();
      const verbose = options['verbose'] || false;
      const dryRun = options['dry-run'] || false;

      let files: string[] = [];
      let formatted = 0;
      let skipped = 0;
      let errors = 0;

      try {
        files = await formatter.findMarkdownFiles(directory);

        for (const file of files) {
          if (options['verbose']) {
            console.log(chalk.gray(`Processing ${file}`));
          }

          try {
            const content = await formatter.formatFile(file);
            if (content.hasChanges) {
              if (options['dry-run']) {
                console.log(chalk.yellow(`Would format ${file}`));
              } else {
                await formatter.writeFile(file, content.formatted);
                console.log(chalk.green(`Formatted ${file}`));
              }
              formatted++;
            } else {
              if (options['verbose']) {
                console.log(chalk.gray(`Skipped ${file} (already formatted)`));
              }
              skipped++;
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(chalk.red(`Error processing ${file}: ${errorMessage}`));
            errors++;
          }
        }

        console.log('\nSummary:');
        console.log(chalk.blue(`Total files: ${files.length}`));
        console.log(chalk.green(`${options['dry-run'] ? 'Would format' : 'Formatted'}: ${formatted}`));
        console.log(chalk.gray(`Skipped: ${skipped}`));
        if (errors > 0) {
          console.log(chalk.red(`Errors: ${errors}`));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`Error: ${errorMessage}`));
        process.exit(1);
      }
    });
}

setupFormatCommand(program);
program.parse();
