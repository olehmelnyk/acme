import { readFile } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

const BackupConfigSchema = z.object({
  paths: z.object({
    diagramsRoot: z.string(),
    backupDir: z.string()
  }),
  maintenance: z.object({
    maxBackupAge: z.string().regex(/^\d+[dhm]$/),
    compressionEnabled: z.boolean(),
    retainCount: z.number().min(1)
  }),
  scheduling: z.object({
    enabled: z.boolean(),
    interval: z.string().regex(/^\d+[dhm]$/),
    timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
  })
});

const DocsConfigSchema = z.object({
  validation: z.object({
    maxLineLength: z.number().optional(),
    requireFrontMatter: z.boolean().optional(),
    requireHeadingIds: z.boolean().optional(),
    requireTableOfContents: z.boolean().optional(),
    allowedDirections: z.array(z.string()).optional(),
    maxDiagramSize: z.number().optional(),
    requiredSections: z.array(z.string()).optional(),
    styleRules: z.record(z.string(), z.any()).optional(),
  }).optional(),
  crossReferencing: z.object({
    enabled: z.boolean(),
    baseUrl: z.string().optional(),
    checkLinks: z.boolean().optional(),
  }).optional(),
  formatting: z.object({
    lineLength: z.number().optional(),
    codeBlockStyle: z.enum(['fenced', 'indented']).optional(),
    headingStyle: z.enum(['atx', 'setext']).optional(),
    listStyle: z.enum(['hyphen', 'asterisk', 'plus']).optional(),
  }).optional(),
});

const FormattingConfigSchema = z.object({
  validation: z.object({
    maxLineLength: z.number().optional(),
    requireFrontMatter: z.boolean().optional(),
    requireHeadingIds: z.boolean().optional(),
    requireTableOfContents: z.boolean().optional(),
  }),
  crossReferencing: z.object({
    enabled: z.boolean(),
    baseUrl: z.string().optional(),
    checkLinks: z.boolean().optional(),
  }),
  formatting: z.object({
    lineLength: z.number().optional(),
    codeBlockStyle: z.enum(['fenced', 'indented']).optional(),
    headingStyle: z.enum(['atx', 'setext']).optional(),
    listStyle: z.enum(['hyphen', 'asterisk', 'plus']).optional(),
  }),
});

export type BackupConfig = z.infer<typeof BackupConfigSchema>;
export type DocsConfig = z.infer<typeof DocsConfigSchema>;
export type FormattingConfig = z.infer<typeof FormattingConfigSchema>;

export class ConfigurationManager {
  private static instance: ConfigurationManager | null = null;
  private backupConfig: BackupConfig | null = null;
  private docsConfig: DocsConfig | null = null;
  private formattingConfig: FormattingConfig | null = null;
  private readonly backupConfigPath: string;
  private readonly docsConfigPath: string;
  private readonly formattingConfigPath: string;

  private constructor(private workingDir: string = process.cwd()) {
    this.backupConfigPath = join(workingDir, 'tools/docs-manager/config/backup.json');
    this.docsConfigPath = join(workingDir, 'tools/docs-manager/config/docs.json');
    this.formattingConfigPath = join(workingDir, 'tools/docs-manager/config/formatting.json');
  }

  public static getInstance(workingDir?: string): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager(workingDir);
    }
    return ConfigurationManager.instance;
  }

  public static resetInstance(): void {
    ConfigurationManager.instance = null;
  }

  private async loadConfig<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
    try {
      const content = await readFile(path, 'utf-8');
      const data = JSON.parse(content);
      return schema.parse(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load configuration from ${path}: ${errorMessage}`);
    }
  }

  async loadBackupConfig(): Promise<BackupConfig> {
    if (!this.backupConfig) {
      try {
        this.backupConfig = await this.loadConfig(this.backupConfigPath, BackupConfigSchema);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
          throw new Error(`Invalid backup configuration:\n${issues.join('\n')}`);
        }
        throw error;
      }
    }
    return this.backupConfig;
  }

  async loadDocsConfig(): Promise<DocsConfig> {
    if (!this.docsConfig) {
      try {
        this.docsConfig = await this.loadConfig(this.docsConfigPath, DocsConfigSchema);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
          throw new Error(`Invalid docs configuration:\n${issues.join('\n')}`);
        }
        throw error;
      }
    }
    return this.docsConfig;
  }

  async loadFormattingConfig(): Promise<FormattingConfig> {
    if (!this.formattingConfig) {
      try {
        this.formattingConfig = await this.loadConfig(this.formattingConfigPath, FormattingConfigSchema);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
          throw new Error(`Invalid formatting configuration:\n${issues.join('\n')}`);
        }
        throw error;
      }
    }
    return this.formattingConfig;
  }

  // Backup Configuration Methods
  async getDiagramsRoot(): Promise<string> {
    const config = await this.loadBackupConfig();
    return config.paths.diagramsRoot;
  }

  async getBackupDir(): Promise<string> {
    const config = await this.loadBackupConfig();
    return config.paths.backupDir;
  }

  async getMaxBackupAge(): Promise<string> {
    const config = await this.loadBackupConfig();
    return config.maintenance.maxBackupAge;
  }

  async getCompressionEnabled(): Promise<boolean> {
    const config = await this.loadBackupConfig();
    return config.maintenance.compressionEnabled;
  }

  // Docs Configuration Methods
  async getValidationRules() {
    const config = await this.loadDocsConfig();
    return config.validation;
  }

  async getFormattingRules() {
    const config = await this.loadDocsConfig();
    return config.formatting;
  }

  async getCrossReferenceRules() {
    const config = await this.loadDocsConfig();
    return config.crossReferencing;
  }

  // Formatting Configuration Methods
  async getValidation() {
    const config = await this.loadFormattingConfig();
    return config.validation;
  }

  async getCrossReferencing() {
    const config = await this.loadFormattingConfig();
    return config.crossReferencing;
  }

  async getFormatting() {
    const config = await this.loadFormattingConfig();
    return config.formatting;
  }
}
