import { beforeEach, describe, expect, it } from 'vitest';
import { DocFormatter } from '../src/formatting/doc-formatter';
import { mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Doc Formatter', () => {
  let formatter: DocFormatter;
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'formatter-tests-'));
    formatter = new DocFormatter();
  });

  describe('Heading Formatting', () => {
    it('should format setext headings to ATX style', async () => {
      const input = 'Title\n=====\n\nSubtitle\n--------\n';
      const expected = '# Title\n\n## Subtitle\n';
      
      const formatted = await formatter.formatContent(input);
      expect(formatted).toBe(expected);
    });
  });

  describe('Code Block Formatting', () => {
    it('should preserve fenced code blocks', async () => {
      const input = 'Before\n```\ncode block\nstays same\n```\nAfter';
      const formatted = await formatter.formatContent(input);
      expect(formatted).toBe(input);
    });

    it('should not wrap content inside code blocks', async () => {
      const longLine = 'This is a very long line that should normally be wrapped but since it is in a code block it should stay intact';
      const input = '```\n' + longLine + '\n```';
      const formatted = await formatter.formatContent(input);
      expect(formatted).toBe(input);
    });
  });

  describe('List Formatting', () => {
    it('should convert all list markers to configured style', async () => {
      const input = '* Item 1\n+ Item 2\n- Item 3';
      const expected = '- Item 1\n- Item 2\n- Item 3';
      
      const formatted = await formatter.formatContent(input);
      expect(formatted).toBe(expected);
    });

    it('should handle nested lists', async () => {
      const input = '* Item 1\n  + Nested 1\n  * Nested 2';
      const expected = '- Item 1\n  - Nested 1\n  - Nested 2';
      
      const formatted = await formatter.formatContent(input);
      expect(formatted).toBe(expected);
    });
  });

  describe('Line Wrapping', () => {
    it('should wrap long lines at configured length', async () => {
      const formatter = new DocFormatter({ lineWidth: 20 });
      const input = 'This is a very long line that should be wrapped at the specified width';
      const formatted = await formatter.formatContent(input);
      
      const lines = formatted.split('\n');
      expect(lines.every(line => line.length <= 20)).toBe(true);
    });

    it('should not wrap headings', async () => {
      const formatter = new DocFormatter({ lineWidth: 20 });
      const input = '# This is a very long heading that should not be wrapped';
      const formatted = await formatter.formatContent(input);
      expect(formatted).toBe(input);
    });

    it('should not wrap list items', async () => {
      const formatter = new DocFormatter({ lineWidth: 20 });
      const input = '- This is a very long list item that should not be wrapped';
      const formatted = await formatter.formatContent(input);
      expect(formatted).toBe(input);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing files gracefully', async () => {
      const nonExistentFile = join(testDir, 'nonexistent.md');
      await expect(formatter.formatFile(nonExistentFile)).rejects.toThrow();
    });
  });
});
