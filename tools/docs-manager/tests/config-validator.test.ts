import { beforeEach, describe, expect, it } from 'vitest';
import { ConfigValidator } from '../src/validation/config-validator';
import { mkdtemp, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Config Validator', () => {
  let validator: ConfigValidator;
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'validator-tests-'));
    validator = new ConfigValidator(testDir);

    // Create config directory structure
    await mkdir(join(testDir, 'tools', 'docs-manager', 'config'), { recursive: true });
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration files', async () => {
      const configDir = join(testDir, 'tools', 'docs-manager', 'config');
      
      await writeFile(join(configDir, 'backup.json'), JSON.stringify({
        diagramsRoot: './docs/diagrams',
        backupDir: './backups',
        maxBackupAge: '30d',
        excludePatterns: ['*.tmp']
      }));

      await writeFile(join(configDir, 'docs.json'), JSON.stringify({
        validation: {
          requireFrontMatter: true,
          requireHeadingIds: true,
          maxLineLength: 80
        },
        formatting: {
          headingStyle: 'atx',
          listStyle: 'dash',
          lineWidth: 80,
          codeBlockStyle: 'fenced'
        }
      }));

      const result = await validator.validateAll();
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid JSON syntax', async () => {
      const configDir = join(testDir, 'tools', 'docs-manager', 'config');
      await writeFile(join(configDir, 'docs.json'), 'invalid json');

      const result = await validator.validateAll();
      expect(result.success).toBe(false);
      expect(result.errors[0].type).toBe('json-syntax');
    });

    it('should detect schema violations', async () => {
      const configDir = join(testDir, 'tools', 'docs-manager', 'config');
      await writeFile(join(configDir, 'docs.json'), JSON.stringify({
        validation: {
          invalidOption: true
        }
      }));

      const result = await validator.validateAll();
      expect(result.success).toBe(false);
      expect(result.errors[0].type).toBe('schema-validation');
    });
  });

  describe('Markdown Validation', () => {
    beforeEach(async () => {
      const configDir = join(testDir, 'tools', 'docs-manager', 'config');
      await writeFile(join(configDir, 'docs.json'), JSON.stringify({
        validation: {
          requireFrontMatter: true,
          requireHeadingIds: true,
          maxLineLength: 80
        }
      }));
    });

    it('should validate front matter when required', async () => {
      const docWithoutFrontMatter = '# Title\n\nContent';
      await writeFile(join(testDir, 'doc.md'), docWithoutFrontMatter);

      const result = await validator.validateAll();
      expect(result.success).toBe(false);
      expect(result.errors[0].type).toBe('front-matter');
    });

    it('should validate heading IDs when required', async () => {
      const docWithoutIds = '---\ntitle: Test\n---\n# Title\n\nContent';
      await writeFile(join(testDir, 'doc.md'), docWithoutIds);

      const result = await validator.validateAll();
      expect(result.success).toBe(false);
      expect(result.errors[0].type).toBe('heading-ids');
    });

    it('should check line length when specified', async () => {
      const longLine = 'This is a very long line that definitely exceeds the maximum line length of 80 characters that we have configured.';
      const doc = '---\ntitle: Test\n---\n# Title {#title}\n\n' + longLine;
      await writeFile(join(testDir, 'doc.md'), doc);

      const result = await validator.validateAll();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('line-length');
    });

    it('should ignore code blocks for line length validation', async () => {
      const doc = '---\ntitle: Test\n---\n# Title {#title}\n\n```\nThis is a very long line inside a code block that should not trigger a line length warning even though it is quite long.\n```';
      await writeFile(join(testDir, 'doc.md'), doc);

      const result = await validator.validateAll();
      expect(result.warnings).toHaveLength(0);
    });
  });
});
