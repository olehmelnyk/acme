# Package Analyzer

A tool for analyzing package dependencies across the monorepo. It helps identify frameworks, tools, and dependencies used in the project, which is particularly useful for:

- Documentation fetching prioritization
- Dependency management
- Project architecture analysis
- Stack recommendations

## Features

- 📦 Scans all package.json files in the monorepo
- 🔍 Identifies frameworks and tools in use
- 📊 Tracks dependency versions and usage patterns
- 📈 Provides project-wide dependency statistics
- 🏷️ Categorizes packages (app, lib, package, tool)
- 🔄 Detects version inconsistencies

## Usage

### Basic Analysis

```bash
# Run analysis and display results
bun run start

# Run analysis and save results to file
bun run analyze
```

### Programmatic Usage

```typescript
import { PackageAnalyzer } from '@acme/package-analyzer';

async function analyzeProject() {
  const analyzer = new PackageAnalyzer('/path/to/project');
  const analysis = await analyzer.analyze();

  // Access analysis results
  console.log('Frameworks:', analysis.frameworksUsed);
  console.log('Tools:', analysis.toolingUsed);
  console.log('Dependencies:', analysis.allDependencies);
}
```

## Output Format

The analysis provides:

```typescript
interface AnalysisResult {
  frameworksUsed: string[];
  toolingUsed: string[];
  allDependencies: DependencyInfo[];
  versionInconsistencies: VersionConflict[];
}
```

## Directory Structure

```
/tools/package-analyzer/
├── src/                   # Source code
│   └── analyzer/         # Core analysis logic

/artifacts/package-analyzer/  # Tool output directory (gitignored)
├── reports/              # Analysis reports
└── cache/               # Analysis cache
```

## Integration

This tool is used by other project tools like:

- `docs-fetcher`: Prioritizes documentation fetching based on project dependencies
- (Future) `stack-advisor`: Suggests technologies based on current stack
- (Future) `dependency-updater`: Smart dependency updates

## Configuration

The analyzer can be configured with:

```typescript
const analyzer = new PackageAnalyzer(rootDir, {
  patterns: ['**/package.json'], // Files to scan
  excludePatterns: ['**/node_modules/**'], // Paths to ignore
});
```

## Development

```bash
# Install dependencies
bun install

# Run TypeScript compiler
bun run build

# Run tests (when added)
bun test
```

## Future Improvements

- [ ] Add test coverage
- [ ] Add dependency graph visualization
- [ ] Implement version conflict detection
- [ ] Add package update recommendations
- [ ] Create GitHub Action for automated analysis
