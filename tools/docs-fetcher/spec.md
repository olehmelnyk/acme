 # Documentation Fetcher Specification

## Overview

The Documentation Fetcher is a tool designed to automatically discover, fetch, and store documentation for project dependencies. It enables offline access to documentation and supports AI-powered code generation by providing up-to-date documentation.

## Core Features

1. **Package Discovery**
   - Automatically scan workspace for packages
   - Support for monorepo structures
   - Configurable package filtering
   - Deduplication of package versions

2. **Documentation Fetching**
   - Smart URL discovery and validation
   - Configurable rate limiting
   - Support for multiple documentation formats
   - Domain validation and security checks
   - Maintains documentation structure order
   - Cleans old documentation before updates

3. **Storage and Organization**
   - Structured documentation storage in cache/
   - Sequential section and page numbering
   - Metadata tracking per document
   - Version control friendly
   - Hierarchical directory structure

## Technical Requirements

1. **Runtime Environment**
   - Bun.js for TypeScript execution
   - Node.js 18+ for Playwright
   - TypeScript for type safety

2. **Dependencies**
   - Playwright for web scraping
   - fs-extra for file operations
   - minimatch for path matching

## Implementation Details

### Package Discovery

```typescript
interface PackageInfo {
  name: string;
  version: string;
  path: string;
}

interface FetchConfig {
  rootDir: string;
  scanPaths: string[];
  excludePaths: string[];
  cacheDir: string;
  limit: number;
  maxDepth: number;
  delay: number;
}
```

### URL Management

```typescript
class UrlManager {
  // Properties
  private baseUrl: string;
  private allowedDomains: string[];
  private visitedUrls: Set<string>;
  private urlQueue: string[];
  private sectionOrder: Map<string, number>;
  private pageOrder: Map<string, Map<string, number>>;

  // Methods
  hasNext(): boolean;
  next(): string | undefined;
  addToQueue(url: string): void;
  getSectionNumber(section: string): number;
  getPageNumber(section: string, url: string): number;
}
```

### Directory Management

```typescript
class DirectoryManager {
  // Properties
  private cacheDir: string;

  // Methods
  getPackageDir(packageName: string): string;
  clearPackageDir(packageName: string): Promise<void>;
  createPackageStructure(packageName: string, category: string, sectionNumber: number): Promise<string>;
  saveDocument(
    packageName: string,
    category: string,
    title: string,
    content: string,
    metadata: any,
    sectionNumber: number,
    pageNumber: number
  ): Promise<string>;
}
```

### Documentation Fetching

```typescript
class DocsFetcher {
  // Properties
  private browser: Browser | null;
  private page: Page | null;
  private dirManager: DirectoryManager;
  private urlManager: UrlManager | null;
  private currentPackage: CurrentPackage | null;
  private config: FetchConfig;

  // Methods
  init(): Promise<void>;
  close(): Promise<void>;
  fetchDocs(packageName: string, docsUrl: string): Promise<void>;
  processPackages(): Promise<void>;
}
```

## File Structure

```
cache/
  package-name/
    001-getting-started/
      001-introduction.html
      001-introduction.meta.json
    002-features/
      001-routing.html
      001-routing.meta.json
```

## Metadata Format

```typescript
interface DocumentMetadata {
  url: string;
  title: string;
  fetchedAt: string;
  pathSegments: string[];
  category: string;
}
```

## Error Handling

1. **URL Validation**
   - Invalid URLs are logged and skipped
   - Domain validation before fetching
   - Path filtering for non-documentation URLs

2. **Fetch Failures**
   - Retry logic for navigation
   - Timeout handling (30s default)
   - Error logging with context

3. **File System**
   - Directory creation error handling
   - File write error recovery
   - Clean up on fetch failure

## Performance Considerations

1. **Rate Limiting**
   - Configurable delay between requests
   - Maximum page limit per package
   - Maximum link depth

2. **Resource Management**
   - Browser resource cleanup
   - File handle management
   - Memory usage optimization

## Security Measures

1. **URL Validation**
   - Domain whitelist
   - Path blacklist
   - Protocol validation

2. **Resource Control**
   - Blocking unnecessary resources
   - Request timeout limits
   - Maximum file size limits

## Future Enhancements

1. **Documentation Support**
   - Additional documentation formats
   - Custom site structure handlers
   - Multiple language support

2. **Performance**
   - Parallel processing
   - Incremental updates
   - Cache optimization

3. **Integration**
   - CI/CD pipeline integration
   - Documentation validation
   - API for programmatic access
