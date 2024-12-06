#!/usr/bin/env bun
import { parseArgs } from 'util';
import { generateComponent } from './component';

const usage = `
Usage: bun generate component [options] <name>

Options:
  --directory, -d    Target directory (default: "src/components")
  --no-test         Skip test file generation
  --no-stories      Skip stories file generation
  --help, -h        Show this help message

Example:
  bun generate component Button
  bun generate component -d src/features/auth LoginForm
`;

async function main() {
  try {
    const {
      values,
      positionals,
    } = parseArgs({
      args: process.argv.slice(2),
      options: {
        directory: {
          type: 'string',
          short: 'd',
        },
        test: {
          type: 'boolean',
          default: true,
        },
        stories: {
          type: 'boolean',
          default: true,
        },
        help: {
          type: 'boolean',
          short: 'h',
        },
      },
      allowPositionals: true,
    });

    if (values.help || positionals.length === 0) {
      console.log(usage);
      process.exit(0);
    }

    const [command, name] = positionals;

    if (command !== 'component') {
      console.error('Error: Only "component" generator is currently supported');
      console.log(usage);
      process.exit(1);
    }

    if (!name) {
      console.error('Error: Component name is required');
      console.log(usage);
      process.exit(1);
    }

    await generateComponent({
      name,
      directory: values.directory,
      withTest: values.test,
      withStories: values.stories,
    });
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
