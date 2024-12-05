import { readFile, writeFile } from 'fs/promises';
import { glob, type GlobOptions } from 'glob';
import { promisify } from 'util';

const globPromise = promisify(glob) as (pattern: string, options?: GlobOptions) => Promise<string[]>;

interface FormattingResult {
  hasChanges: boolean;
  formatted: string;
}

interface FormattingOptions {
  headingStyle: 'atx' | 'setext';
  listStyle: 'dash' | 'asterisk' | 'plus';
  lineWidth: number;
  codeBlockStyle: 'fenced' | 'indented';
}

const defaultOptions: FormattingOptions = {
  headingStyle: 'atx',
  listStyle: 'dash',
  lineWidth: 80,
  codeBlockStyle: 'fenced'
};

export class DocFormatter {
  private options: FormattingOptions;
  private inCodeBlock = false;
  private isFormatted = false;

  constructor(options: Partial<FormattingOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  async findMarkdownFiles(directory: string): Promise<string[]> {
    const files = await globPromise('**/*.md', {
      cwd: directory,
      ignore: ['**/node_modules/**', '**/dist/**'],
      absolute: true
    });

    return files;
  }

  async formatFile(filePath: string): Promise<FormattingResult> {
    const content = await readFile(filePath, 'utf-8');
    const formatted = await this.formatContent(content);
    
    return {
      hasChanges: content !== formatted,
      formatted
    };
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await writeFile(filePath, content, 'utf-8');
  }

  async checkFormatting(filePath: string): Promise<{ needsFormatting: boolean; diff?: string }> {
    const content = await readFile(filePath, 'utf-8');
    const formatted = await this.formatContent(content);
    
    return {
      needsFormatting: content !== formatted,
      diff: content !== formatted ? this.generateDiff(content, formatted) : undefined
    };
  }

  async formatDocument(): Promise<string> {
    const formatted = await this.readAndFormat();
    return formatted;
  }

  async readAndFormat(): Promise<string> {
    // TO DO: implement readAndFormat function
    // For now, just return an empty string
    return '';
  }

  private async formatContent(content: string): Promise<string> {
    // Reset state
    this.inCodeBlock = false;

    // First handle setext headings
    let formatted = this.formatSetextHeadings(content);

    // Then process line by line
    const lines = formatted.split('\n');
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        this.inCodeBlock = !this.inCodeBlock;
        formattedLines.push(line);
        continue;
      }

      if (this.inCodeBlock) {
        formattedLines.push(line);
        continue;
      }

      // Apply formatting only outside code blocks
      let formattedLine = line;
      formattedLine = this.formatListMarkers(formattedLine);
      
      // Only wrap if not a heading or list item
      if (!formattedLine.trim().startsWith('#') && 
          !formattedLine.trim().match(/^[*+-]\s/)) {
        formattedLine = this.wrapLine(formattedLine);
      }
      
      formattedLines.push(formattedLine);
    }

    formatted = formattedLines.join('\n');

    // Remove trailing whitespace
    formatted = formatted.replace(/[ \t]+$/gm, '');

    // Ensure single newline at end of file
    formatted = formatted.replace(/\n+$/, '') + '\n';

    // Fix heading spacing
    formatted = formatted.replace(/^(#{1,6})([^ #])/gm, '$1 $2');

    // Fix list item spacing
    formatted = formatted.replace(/^([*+-])([^ ])/gm, '$1 $2');

    // Fix numbered list spacing
    formatted = formatted.replace(/^(\d+\.)([^ ])/gm, '$1 $2');

    // Fix blockquote spacing
    formatted = formatted.replace(/^(>)([^ ])/gm, '$1 $2');

    // Fix multiple consecutive blank lines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted;
  }

  private generateDiff(original: string, formatted: string): string {
    const originalLines = original.split('\n');
    const formattedLines = formatted.split('\n');
    let diff = '';

    for (let i = 0; i < Math.max(originalLines.length, formattedLines.length); i++) {
      if (originalLines[i] !== formattedLines[i]) {
        if (originalLines[i]) {
          diff += `- ${originalLines[i]}\n`;
        }
        if (formattedLines[i]) {
          diff += `+ ${formattedLines[i]}\n`;
        }
      }
    }

    return diff;
  }

  private formatSetextHeadings(content: string): string {
    if (this.options.headingStyle === 'atx') {
      // Process the content line by line to handle setext headings
      const lines = content.split('\n');
      const result: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
        
        if (nextLine.match(/^=+$/)) {
          result.push(`# ${line}`);
          i++; // Skip the underline
        } else if (nextLine.match(/^-+$/)) {
          result.push(`## ${line}`);
          i++; // Skip the underline
        } else {
          result.push(line);
        }
      }
      
      return result.join('\n');
    }
    return content;
  }

  private formatListMarkers(line: string): string {
    const listMarkerMap = {
      dash: '-',
      asterisk: '*',
      plus: '+'
    };

    const marker = listMarkerMap[this.options.listStyle];
    return line.replace(/^(\s*)[*+-](\s+)/, `$1${marker}$2`);
  }

  private wrapLine(line: string): string {
    if (line.length <= this.options.lineWidth || line.trim() === '') {
      return line;
    }

    const words = line.split(' ');
    const wrappedLines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).length <= this.options.lineWidth) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) wrappedLines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) wrappedLines.push(currentLine);
    return wrappedLines.join('\n');
  }
}
