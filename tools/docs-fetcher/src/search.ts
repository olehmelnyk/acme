export interface SearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
}

export interface SearchOptions {
  query: string;
  maxResults?: number;
  minScore?: number;
  caseSensitive?: boolean;
}

interface DocumentMetadata {
  url: string;
  title: string;
  content: string;
  fetchedAt: string;
  links: string[];
}

export class DocumentationSearch {
  private readonly documents: Map<string, DocumentMetadata>;
  private readonly stopWords: Set<string>;
  private readonly cacheDir: string;

  constructor(cacheDir: string) {
    this.documents = new Map();
    this.cacheDir = cacheDir;
    this.stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for',
      'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on',
      'that', 'the', 'to', 'was', 'were', 'will', 'with'
    ]);
  }

  addDocument(url: string, metadata: DocumentMetadata): void {
    this.documents.set(url, metadata);
  }

  async clearCache(): Promise<void> {
    const fs = require('fs').promises;
    const _path = require('path');

    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCacheStats(): Promise<{ totalPackages: number; size: number }> {
    const fs = require('fs').promises;
    const _path = require('path');

    try {
      const files = await fs.readdir(this.cacheDir);
      const totalPackages = files.length;

      const stats = await Promise.all(
        files.map((file: string) => fs.stat(_path.join(this.cacheDir, file)))
      );
      const size = stats.reduce((total, stat) => total + stat.size, 0);

      return { totalPackages, size };
    } catch (error) {
      throw new Error(`Failed to get cache stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  search(options: SearchOptions): SearchResult[] {
    const {
      query,
      maxResults = 10,
      minScore = 0.3,
      caseSensitive = false
    } = options;

    const searchTerms: string[] = this.tokenize(query);
    const results: SearchResult[] = [];

    for (const [url, doc] of this.documents) {
      const score: number = this.calculateRelevance(searchTerms, doc, caseSensitive);
      
      if (score >= minScore) {
        results.push({
          url,
          title: doc.title,
          content: this.extractSnippet(doc.content, searchTerms),
          score
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  async searchAll(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const fs = require('fs').promises;
    const _path = require('path');
    const files = await fs.readdir(this.cacheDir);
    const results: SearchResult[] = [];

    for (const file of files) {
      try {
        const filePath = _path.join(this.cacheDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const metadata = JSON.parse(content) as DocumentMetadata;
        results.push(...this.performSearch(metadata, query, options));
      } catch (error) {
        console.error(`Error processing file ${file}: ${error}`);
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(term => term.length > 0 && !this.stopWords.has(term));
  }

  private calculateRelevance(
    searchTerms: string[],
    doc: DocumentMetadata,
    caseSensitive: boolean
  ): number {
    const content = caseSensitive ? doc.content : doc.content.toLowerCase();
    const title = caseSensitive ? doc.title : doc.title.toLowerCase();

    let score = 0;
    let matches = 0;

    for (const term of searchTerms) {
      const termScore = this.calculateTermScore(term, content, title);
      if (termScore > 0) {
        matches++;
        score += termScore;
      }
    }

    // Boost score if all terms were found
    if (matches === searchTerms.length) {
      score *= 1.5;
    }

    return score / searchTerms.length;
  }

  private calculateTermScore(
    term: string,
    content: string,
    title: string
  ): number {
    let score = 0;

    // Title matches are weighted more heavily
    if (title.includes(term)) {
      score += 3;
    }

    // Content matches
    const contentMatches = content.split(term).length - 1;
    if (contentMatches > 0) {
      // Logarithmic scaling to prevent long documents from dominating
      score += Math.log2(contentMatches + 1);
    }

    return score;
  }

  private extractSnippet(content: string, searchTerms: string[]): string {
    const snippetLength = 150;
    let bestSnippet = '';
    let bestScore = -1;

    // Find the best snippet that contains the most search terms
    for (let i = 0; i < content.length - snippetLength; i++) {
      const snippet = content.substr(i, snippetLength);
      let score = 0;

      for (const term of searchTerms) {
        if (snippet.toLowerCase().includes(term)) {
          score++;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestSnippet = snippet;
      }
    }

    return bestSnippet || content.substr(0, snippetLength);
  }

  private performSearch(metadata: DocumentMetadata, query: string, options?: SearchOptions): SearchResult[] {
    const results: SearchResult[] = [];
    const minScore = options?.minScore ?? 0.5;
    const caseSensitive = options?.caseSensitive ?? false;

    const searchText = caseSensitive ? metadata.content : metadata.content.toLowerCase();
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    // Basic search implementation
    const score = this.calculateRelevanceScore(searchText, searchQuery);
    if (score >= minScore) {
      const { url, title } = metadata;
      results.push({
        url,
        title,
        content: this.extractRelevantSnippet(metadata.content, searchQuery),
        score: score
      });
    }

    return results;
  }

  private calculateRelevanceScore(text: string, query: string): number {
    // Simple relevance scoring based on word frequency
    const words = query.split(/\s+/).filter(word => !this.stopWords.has(word.toLowerCase()));
    const matchedWords = words.filter(word => text.includes(word));
    return matchedWords.length / words.length;
  }

  private extractRelevantSnippet(text: string, query: string, maxLength = 200): string {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text.slice(0, maxLength);

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 150);

    return text.slice(start, end) + (end < text.length ? '...' : '');
  }

  formatResults(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'No results found.';
    }

    return results.map((result, index) => {
      const scorePercentage = (result.score * 100).toFixed(2);
      const { url, title, content } = result;
      return `Result ${index + 1}:
  Title: ${title}
  URL: ${url}
  Relevance: ${scorePercentage}%
  Snippet: ${content}\n`;
    }).join('\n');
  }

  clear(): void {
    this.documents.clear();
  }

  getDocumentCount(): number {
    return this.documents.size;
  }
}
