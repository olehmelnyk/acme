import { describe, it, expect } from 'vitest';
import { DocumentationScorer, ScoringOptions } from "../src/documentation-scorer";
import { LinkValidationResult } from "../src/link-validator";

const mockValidationResult: LinkValidationResult = {
  url: "https://example.com/docs",
  isValid: true,
  statusCode: 200,
  contentType: "text/html",
  responseTimeMs: 100
};

const goodDocContent = `
# Example Documentation

This is a comprehensive guide to using our library.

## Installation

\`\`\`bash
npm install example-lib
\`\`\`

## Basic Usage

Here's how to get started:

\`\`\`javascript
const lib = require('example-lib');
const result = lib.doSomething();
\`\`\`

## Advanced Features

- Feature 1: Does something cool
- Feature 2: Does something even cooler
- Feature 3: Mind-blowing functionality

### Configuration

You can configure the library using these options:

\`\`\`javascript
{
  option1: 'value1',
  option2: true
}
\`\`\`

## Error Handling

Make sure to handle errors appropriately:

1. Check input parameters
2. Use try/catch blocks
3. Log errors for debugging
`;

const poorDocContent = `
just some text without any structure or code examples.
it's also quite short and not very helpful.
`;

describe('DocumentationScorer', () => {
  it("should score good documentation highly", async () => {
    const scorer = new DocumentationScorer();
    const result = await scorer.scoreDocumentation(
      mockValidationResult.url,
      goodDocContent,
      mockValidationResult
    );

    expect(result.totalScore).toBeGreaterThan(0.7);
    expect(result.details.readability).toBeGreaterThan(0.8);
    expect(result.details.completeness).toBeGreaterThan(0.8);
    expect(result.details.language).toBe('en');
    expect(result.details.codeBlockCount).toBe(3);
    expect(result.details.headingCount).toBe(6);
  });

  it("should score poor documentation lower", async () => {
    const scorer = new DocumentationScorer();
    const result = await scorer.scoreDocumentation(
      mockValidationResult.url,
      poorDocContent,
      mockValidationResult
    );

    expect(result.totalScore).toBeLessThan(0.5);
    expect(result.details.readability).toBeLessThan(0.7);
    expect(result.details.completeness).toBeLessThan(0.5);
    expect(result.details.codeBlockCount).toBe(0);
    expect(result.details.headingCount).toBe(0);
  });

  it("should respect custom scoring options", async () => {
    const options: Partial<ScoringOptions> = {
      minWordCount: 500,
      weights: {
        freshness: 0.1,
        size: 0.1,
        language: 0.4,
        readability: 0.2,
        completeness: 0.2
      }
    };

    const scorer = new DocumentationScorer(options);
    const result = await scorer.scoreDocumentation(
      mockValidationResult.url,
      goodDocContent,
      mockValidationResult
    );

    // With higher language weight and minWordCount, score should be different
    expect(result.totalScore).toBeDefined();
    expect(result.details.wordCount).toBeLessThan(500);
  });

  it("should handle empty content", async () => {
    const scorer = new DocumentationScorer();
    const result = await scorer.scoreDocumentation(
      mockValidationResult.url,
      "",
      mockValidationResult
    );

    expect(result.totalScore).toBe(0);
    expect(result.details.readability).toBe(0);
    expect(result.details.completeness).toBe(0);
    expect(result.details.wordCount).toBe(0);
  });

  it("should detect English language", async () => {
    const scorer = new DocumentationScorer();
    const result = await scorer.scoreDocumentation(
      mockValidationResult.url,
      "This is clearly an English text with common words like the and is and are",
      mockValidationResult
    );

    expect(result.details.language).toBe('en');
  });

  it("should calculate readability score", async () => {
    const scorer = new DocumentationScorer();
    
    // Test with well-structured content
    const wellStructured = `
# Main Title

This is a clear and simple paragraph. It uses short sentences.
Each idea is well explained. The language is straightforward.

## Section 1

- Point 1
- Point 2
- Point 3

## Section 2

More clear explanations here.
`;

    const result = await scorer.scoreDocumentation(
      mockValidationResult.url,
      wellStructured,
      mockValidationResult
    );

    expect(result.details.readability).toBeGreaterThan(0.7);
  });

  it("should calculate completeness score", async () => {
    const scorer = new DocumentationScorer();
    
    const completeDoc = `# Documentation Title

A comprehensive guide to using this package. This documentation provides detailed information about installation, usage, and examples.

## Overview
This package helps you do amazing things with minimal effort. It provides a robust API and extensive configuration options.

## Installation
\`\`\`bash
npm install my-package
bun add my-package
yarn add my-package
\`\`\`

## Usage
Here's how to get started with basic usage:

\`\`\`js
import { myFunction } from 'my-package';

const result = myFunction({
  option1: 'value1',
  option2: true
});
console.log(result);
\`\`\`

## API Reference
The package exposes several key functions:

- \`myFunction(options)\`: Main function for processing
- \`configure(config)\`: Setup configuration
- \`validate(input)\`: Validate input data

\`\`\`js
import { configure, myFunction } from 'my-package';

configure({
  timeout: 5000,
  retries: 3
});

const result = await myFunction({
  advanced: true,
  mode: 'production'
});
\`\`\`

## Examples
Here are some common use cases:

1. Basic example
2. Advanced configuration
3. Error handling

## Troubleshooting
Common issues and solutions:

- Issue 1: How to handle timeouts
- Issue 2: Debugging errors
- Issue 3: Performance optimization
`;

    const result = await scorer.scoreDocumentation(
      mockValidationResult.url,
      completeDoc,
      mockValidationResult
    );

    expect(result.details.completeness).toBeGreaterThan(0.8);
    expect(result.details.codeBlockCount).toBe(3);
    expect(result.details.headingCount).toBe(7);
  });

  it('should score documentation correctly', async () => {
    const scorer = new DocumentationScorer();
    const url = 'https://example.com/docs';
    const content = 'This is a test documentation with some code examples and headings.';
    const validationResult = {
      url: url,
      isValid: true,
      lastChecked: new Date(),
      statusCode: 200,
      error: undefined,
      responseTimeMs: 100
    };

    const score = await scorer.scoreDocumentation(url, content, validationResult);

    expect(score).toBeDefined();
    expect(score.url).toBe(url);
    expect(score.score).toBeGreaterThan(0);
    expect(score.details).toBeDefined();
  });
});
