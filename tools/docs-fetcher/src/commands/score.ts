import { Command } from "commander";
import { PackageInfoFetcher } from "../package-info";
import chalk from "chalk";
import { logger } from '../logger';

export function createScoreCommand(program: Command): void {
  program
    .command("score")
    .description("Score documentation quality for a package")
    .argument("<package>", "Package name to score documentation for")
    .option("-d, --details", "Show detailed scoring breakdown")
    .option("-t, --threshold <score>", "Only show documentation above this score", parseFloat)
    .action(async (packageName: string, options: { details?: boolean; threshold?: number }) => {
      try {
        const fetcher = new PackageInfoFetcher();
        const packageInfo = await fetcher.getPackageInfo(packageName);

        if (!packageInfo.documentation?.quality?.length) {
          logger.info(chalk.yellow(`No documentation found for package '${packageName}'`));
          return;
        }

        logger.info(chalk.bold(`\nDocumentation Quality Scores for ${chalk.cyan(packageName)} v${packageInfo.version}:`));
        logger.info("─".repeat(80));

        for (const doc of packageInfo.documentation.quality) {
          if (options.threshold && doc.score < options.threshold) continue;

          logger.info(`\n${chalk.bold("URL:")} ${doc.url}`);
          logger.info(`${chalk.bold("Score:")} ${formatScore(doc.score)}`);

          if (options.details) {
            logger.info("\nDetailed Breakdown:");
            logger.info(`├─ Freshness:    ${formatScore(doc.details.freshness)}`);
            logger.info(`├─ Size:         ${formatScore(doc.details.size)}`);
            logger.info(`├─ Language:     ${doc.details.language}`);
            logger.info(`├─ Readability:  ${formatScore(doc.details.readability)}`);
            logger.info(`└─ Completeness: ${formatScore(doc.details.completeness)}`);
          }

          logger.info("─".repeat(80));
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(chalk.red(`Error: ${error.message}`));
        } else {
          logger.error(chalk.red(`An unknown error occurred: ${String(error)}`));
        }
        process.exit(1);
      }
    });
}

function formatScore(score: number): string {
  const percentage = Math.round(score * 100);
  let color: (text: string) => string;

  if (percentage >= 80) color = chalk.green;
  else if (percentage >= 60) color = chalk.yellow;
  else color = chalk.red;

  return color(`${percentage}%`);
}
