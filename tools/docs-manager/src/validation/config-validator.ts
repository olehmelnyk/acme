import { ConfigurationManager } from '../utils/config-manager';
import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { join, relative } from 'path';
import { z } from 'zod';

const backupConfigSchema = z.object({
  diagramsRoot: z.string(),
  backupDir: z.string(),
  maxBackupAge: z.string().regex(/^\d+[dhm]$/),
  excludePatterns: z.array(z.string()).optional(),
  formatOptions: z.object({
    indentSize: z.number().min(1).max(8),
    lineWidth: z.number().min(40).max(120),
    trailingComma: z.enum(['none', 'es5', 'all']),
    quoteStyle: z.enum(['single', 'double'])
  }).optional()
});

const docsConfigSchema = z.object({
  validation: z.object({
    requireFrontMatter: z.boolean(),
    requireHeadingIds: z.boolean(),
    maxLineLength: z.number()
  }),
  formatting: z.object({
    headingStyle: z.enum(['atx', 'setext']),
    listStyle: z.enum(['dash', 'asterisk', 'plus']),
    lineWidth: z.number(),
    codeBlockStyle: z.enum(['fenced', 'indented'])
  }).optional()
});

export class ConfigValidator {
  private config: ConfigurationManager;
  private inCodeBlock = false;
  private docsConfig: z.infer<typeof docsConfigSchema> | null = null;
  private isValidated = false;

  constructor(private workingDir: string = process.cwd()) {
    this.config = ConfigurationManager.getInstance(workingDir);
  }

  async validateAll(): Promise<ValidationResult> {
    const result: ValidationResult = {
      errors: [],
      warnings: [],
      success: true
    };

    try {
      // Validate configuration files
      await this.validateConfigFiles(result);

      // Load docs config for markdown validation
      await this.loadDocsConfig(result);

      // Only proceed with markdown validation if we have valid config
      if (this.docsConfig) {
        await this.validateMarkdownFiles(result);
      }

      result.success = result.errors.length === 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push({
        type: 'critical',
        message: `Validation failed: ${errorMessage}`,
        file: null
      });
      result.success = false;
    }

    return result;
  }

  private async loadDocsConfig(result: ValidationResult): Promise<void> {
    try {
      const configPath = join(this.workingDir, 'tools', 'docs-manager', 'config', 'docs.json');
      const content = await readFile(configPath, 'utf-8');
      const data = JSON.parse(content);

      try {
        this.docsConfig = docsConfigSchema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
          result.errors.push({
            type: 'schema-validation',
            message: `Invalid docs configuration:\n${issues.join('\n')}`,
            file: configPath
          });
        } else {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push({
            type: 'unknown',
            message: `Failed to validate docs configuration: ${errorMessage}`,
            file: configPath
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push({
        type: 'critical',
        message: `Failed to load docs configuration: ${errorMessage}`,
        file: null
      });
    }
  }

  private async validateConfigFiles(result: ValidationResult): Promise<void> {
    const configFiles = await glob('**/config/*.json', {
      cwd: this.workingDir,
      absolute: true
    });

    for (const file of configFiles) {
      try {
        const content = await readFile(file, 'utf-8');
        const data = JSON.parse(content);
        const relativePath = relative(this.workingDir, file);

        if (file.endsWith('backup.json')) {
          try {
            backupConfigSchema.parse(data);
          } catch (error) {
            if (error instanceof z.ZodError) {
              const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
              result.errors.push({
                type: 'schema-validation',
                message: `Invalid backup configuration in ${relativePath}:\n${issues.join('\n')}`,
                file
              });
            } else {
              const errorMessage = error instanceof Error ? error.message : String(error);
              result.errors.push({
                type: 'unknown',
                message: `Failed to validate backup configuration in ${relativePath}: ${errorMessage}`,
                file
              });
            }
          }
        } else if (!file.endsWith('docs.json')) {
          // docs.json is handled separately in loadDocsConfig
          result.warnings.push({
            type: 'unknown-config',
            message: `Unknown configuration file: ${relativePath}`,
            file
          });
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          result.errors.push({
            type: 'json-syntax',
            message: `Invalid JSON in ${relative(this.workingDir, file)}: ${error.message}`,
            file
          });
        } else {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push({
            type: 'unknown',
            message: `Error processing ${relative(this.workingDir, file)}: ${errorMessage}`,
            file
          });
        }
      }
    }
  }

  private async validateMarkdownFiles(result: ValidationResult): Promise<void> {
    if (!this.docsConfig?.validation) return;

    const files = await glob('**/*.md', {
      cwd: this.workingDir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        const relativePath = relative(this.workingDir, file);

        // Reset code block state
        this.inCodeBlock = false;

        // Validate front matter if required
        if (this.docsConfig.validation.requireFrontMatter && !this.hasFrontMatter(content)) {
          result.errors.push({
            type: 'front-matter',
            message: `Missing front matter in ${relativePath}`,
            file
          });
        }

        // Validate heading IDs if required
        if (this.docsConfig.validation.requireHeadingIds && !this.hasHeadingIds(content)) {
          result.errors.push({
            type: 'heading-ids',
            message: `Missing heading IDs in ${relativePath}`,
            file
          });
        }

        // Validate line length if specified
        if (this.docsConfig.validation.maxLineLength) {
          const longLines = this.findLongLines(content, this.docsConfig.validation.maxLineLength);
          if (longLines.length > 0) {
            result.warnings.push({
              type: 'line-length',
              message: `Lines exceeding maximum length in ${relativePath}: ${longLines.join(', ')}`,
              file
            });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push({
          type: 'file-read',
          message: `Error reading ${relative(this.workingDir, file)}: ${errorMessage}`,
          file
        });
      }
    }
  }

  private hasFrontMatter(content: string): boolean {
    return content.trimStart().startsWith('---\n');
  }

  private hasHeadingIds(content: string): boolean {
    const headingPattern = /^#+\s+.*(?:{#[\w-]+})?$/gm;
    const headings = content.match(headingPattern) || [];
    return headings.every(heading => heading.includes('{#'));
  }

  private findLongLines(content: string, maxLength: number): number[] {
    return content.split('\n')
      .map((line, index) => ({ line, index: index + 1 }))
      .filter(({ line }) => {
        if (line.trim().startsWith('```')) {
          this.inCodeBlock = !this.inCodeBlock;
          return false;
        }
        if (this.inCodeBlock) return false;
        return line.length > maxLength;
      })
      .map(({ index }) => index);
  }
}

interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  success: boolean;
}

interface ValidationError {
  type: 'schema-validation' | 'json-syntax' | 'front-matter' | 'heading-ids' | 'file-read' | 'critical' | 'unknown';
  message: string;
  file: string | null;
}

interface ValidationWarning {
  type: 'line-length' | 'unknown-config';
  message: string;
  file: string;
}
