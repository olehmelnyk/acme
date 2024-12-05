import { LinkValidationResult } from "./link-validator";

export interface DocumentationScore {
  url: string;
  score: number;
  totalScore: number;
  details: {
    freshness: number;
    size: number;
    language: string;
    readability: number;
    completeness: number;
    lastModified?: Date;
    wordCount?: number;
    codeBlockCount?: number;
    headingCount?: number;
  };
}

export interface ScoringOptions {
  minSize: number;
  maxSize: number;
  preferredLanguages: string[];
  minWordCount: number;
  maxAgeInDays: number;
  weights: {
    freshness: number;
    size: number;
    language: number;
    readability: number;
    completeness: number;
  };
}

const DEFAULT_OPTIONS: ScoringOptions = {
  minSize: 1000, // 1KB
  maxSize: 1000000, // 1MB
  preferredLanguages: ['en'],
  minWordCount: 100,
  maxAgeInDays: 365, // 1 year
  weights: {
    freshness: 0.2,
    size: 0.1,
    language: 0.2,
    readability: 0.3,
    completeness: 0.2
  }
};

export class DocumentationScorer {
  private options: ScoringOptions;

  constructor(options: Partial<ScoringOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async scoreDocumentation(
    url: string,
    content: string,
    validationResult: LinkValidationResult
  ): Promise<DocumentationScore> {
    const language = await this.detectLanguage(content);
    const wordCount = this.getWordCount(content);
    const readabilityScore = this.calculateReadabilityScore(content);
    const completenessScore = this.calculateCompletenessScore(content);
    const freshness = await this.calculateFreshnessScore(validationResult);
    const sizeScore = this.calculateSizeScore(content);

    const details = {
      freshness,
      size: sizeScore,
      language,
      readability: readabilityScore,
      completeness: completenessScore,
      wordCount,
      codeBlockCount: this.getCodeBlockCount(content),
      headingCount: this.getHeadingCount(content),
      lastModified: this.getLastModified(validationResult)
    };

    const totalScore = this.calculateTotalScore(details);

    return {
      url,
      score: totalScore,
      totalScore,
      details
    };
  }

  private async calculateFreshnessScore(validationResult: LinkValidationResult): Promise<number> {
    const lastModified = this.getLastModified(validationResult);
    if (!lastModified) return 0.5;

    const ageInDays = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (ageInDays / this.options.maxAgeInDays));
  }

  private calculateSizeScore(content: string): number {
    if (!content.trim()) return 0;
    
    const size = new TextEncoder().encode(content).length;
    if (size < this.options.minSize) return 0.3;
    if (size > this.options.maxSize) return 0.5;
    return 1 - (Math.abs(size - this.options.minSize * 2) / this.options.maxSize);
  }

  private async detectLanguage(content: string): Promise<string> {
    // For now, use a simple heuristic based on common English words
    const englishWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'or',
      'will', 'my', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'if',
      'about', 'who', 'get', 'which', 'go', 'when', 'make', 'can', 'like', 'no'
    ]);
    
    const words = content.toLowerCase().split(/\W+/);
    if (words.length === 0) return 'unknown';

    const englishWordCount = words.filter(word => englishWords.has(word)).length;
    const englishRatio = englishWordCount / words.length;

    return englishRatio > 0.05 ? 'en' : 'unknown';
  }

  private calculateReadabilityScore(content: string): number {
    if (!content.trim()) return 0;

    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\W+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    const avgWordLength = words.join('').length / words.length;
    const hasHeadings = /^#{1,6}\s/m.test(content);
    const hasLists = /^[-*+]\s/m.test(content);
    const hasParagraphs = content.split(/\n\s*\n/).length > 1;

    let score = 1;
    
    // Ideal sentence length is between 10-25 words
    const sentenceLengthScore = 1 - Math.abs(avgSentenceLength - 17.5) / 35;
    score *= Math.max(0.4, sentenceLengthScore);
    
    // Ideal word length is between 4-7 characters
    const wordLengthScore = 1 - Math.abs(avgWordLength - 5.5) / 11;
    score *= Math.max(0.4, wordLengthScore);
    
    // Bonus for good structure
    if (hasHeadings) score *= 1.4;
    if (hasLists) score *= 1.3;
    if (hasParagraphs) score *= 1.2;

    // Content length bonus
    const lengthScore = Math.min(1, words.length / 200);
    score *= Math.max(0.5, lengthScore);

    return Math.min(1, Math.max(0, score));
  }

  private calculateCompletenessScore(content: string): number {
    if (!content.trim()) return 0;

    const codeBlocks = this.getCodeBlockCount(content);
    const headings = this.getHeadingCount(content);
    const wordCount = this.getWordCount(content);
    const paragraphs = content.split(/\n\s*\n/).length;
    const lists = (content.match(/^[-*+]\s/gm) || []).length;

    let score = 0;

    // Code examples (25%)
    score += Math.min(1, codeBlocks / 2) * 0.25;

    // Section structure (35%)
    const structureScore = (
      Math.min(1, headings / 3) * 0.5 +
      Math.min(1, paragraphs / 4) * 0.3 +
      Math.min(1, lists / 2) * 0.2
    );
    score += structureScore * 0.35;

    // Content length (25%)
    score += Math.min(1, wordCount / (this.options.minWordCount * 0.75)) * 0.25;

    // Content distribution (15%)
    const avgWordsPerSection = wordCount / Math.max(1, headings);
    const sectionDistributionScore = Math.min(1, avgWordsPerSection / 50);
    score += sectionDistributionScore * 0.15;

    // Bonus for comprehensive documentation
    if (codeBlocks >= 3 && headings >= 4 && wordCount >= this.options.minWordCount * 1.5) {
      score *= 1.5;
    } else if (codeBlocks >= 2 && headings >= 3 && wordCount >= this.options.minWordCount) {
      score *= 1.3;
    }

    // Penalty for missing essential elements
    if (wordCount < 50 || codeBlocks === 0 || headings === 0) {
      score *= 0.1;
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculates the validity score for a documentation link
   * @param validationResult Currently unused as link validity scoring is not implemented yet
   * @returns A default score of 1.0
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private calculateLinkValidityScore(validationResult: LinkValidationResult): number {
    // Skip link validity score for now as we're not using it
    return 1.0;
  }

  /**
   * Gets the last modified date from validation result
   * @param validationResult Currently unused as we don't have access to HTTP headers
   * @returns undefined as we don't have this info in our validation results
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getLastModified(validationResult: LinkValidationResult): Date | undefined {
    // This would normally come from the HTTP headers
    // For now, return undefined as we don't have this info in our validation results
    return undefined;
  }

  private getWordCount(content: string): number {
    return content.split(/\W+/).filter(w => w.length > 0).length;
  }

  private getCodeBlockCount(content: string): number {
    const matches = content.match(/```[\s\S]*?```/g);
    return matches ? matches.length : 0;
  }

  private getHeadingCount(content: string): number {
    const matches = content.match(/^#{1,6}\s/gm);
    return matches ? matches.length : 0;
  }

  private calculateTotalScore(details: DocumentationScore['details']): number {
    if (!details.wordCount || details.wordCount === 0) return 0;

    const { weights } = this.options;
    
    let score = (
      details.freshness * weights.freshness +
      details.size * weights.size +
      (details.language === 'en' ? 1 : 0.3) * weights.language +
      details.readability * weights.readability +
      details.completeness * weights.completeness
    );

    // Apply a more generous curve to the final score
    score = Math.pow(score, 0.7); // This makes scores slightly higher overall

    if (details.wordCount < 50 || details.codeBlockCount === 0 || details.headingCount === 0) {
      score *= 0.3;
    }

    return Math.max(0, Math.min(1, score));
  }
}
