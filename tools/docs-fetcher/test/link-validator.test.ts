import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';
import { LinkValidator } from "../src/link-validator";

// Mock server responses
const mockResponses = new Map<string, Response>([
  ['https://example.com/valid', new Response('', {
    status: 200,
    headers: new Headers({ 'content-type': 'text/html' })
  })],
  ['https://example.com/redirect', new Response('', {
    status: 301,
    headers: new Headers({
      'location': 'https://example.com/valid',
      'content-type': 'text/html'
    })
  })],
  ['https://example.com/invalid-type', new Response('', {
    status: 200,
    headers: new Headers({ 'content-type': 'application/octet-stream' })
  })],
  ['https://example.com/not-found', new Response('', {
    status: 404,
    headers: new Headers({ 'content-type': 'text/html' })
  })],
  ['https://example.com/server-error', new Response('', {
    status: 500,
    headers: new Headers({ 'content-type': 'text/html' })
  })],
  ['https://example.com/timeout', new Response('', {
    status: 200,
    headers: new Headers({ 'content-type': 'text/html' })
  })],
]);

// Mock fetch function
const originalFetch = global.fetch;
const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
  const urlString = input.toString();
  
  // Simulate timeout
  if (urlString.includes('timeout')) {
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('timeout');
  }

  const response = mockResponses.get(urlString);
  if (!response) {
    throw new TypeError('Failed to fetch');
  }
  
  return response;
});

describe('LinkValidator', () => {
  let validator: LinkValidator;

  beforeEach(() => {
    global.fetch = mockFetch;
    validator = new LinkValidator();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  test("LinkValidator > should validate a valid link", async () => {
    const result = await validator.validateLink('https://example.com/valid');
    
    expect(result.isValid).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.contentType).toBe('text/html');
    expect(result.error).toBeUndefined();
  });

  test("LinkValidator > should handle invalid content type", async () => {
    const result = await validator.validateLink('https://example.com/invalid-type', {
      allowedContentTypes: ['text/html', 'text/markdown']
    });
    
    expect(result.isValid).toBe(false);
    expect(result.statusCode).toBe(200);
    expect(result.contentType).toBe('application/octet-stream');
    expect(result.error).toContain('Invalid content type');
  });

  test("LinkValidator > should handle 404 error", async () => {
    const result = await validator.validateLink('https://example.com/not-found');
    
    expect(result.isValid).toBe(false);
    expect(result.statusCode).toBe(404);
    expect(result.error).toContain('HTTP error: 404');
  });

  test("LinkValidator > should handle timeout", async () => {
    const result = await validator.validateLink('https://example.com/timeout', {
      timeout: 50
    });
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('timeout');
    expect(result.responseTimeMs).toBeGreaterThan(0);
  });

  test("LinkValidator > should validate multiple links concurrently", async () => {
    const urls = [
      'https://example.com/valid',
      'https://example.com/not-found',
      'https://example.com/invalid-type'
    ];
    
    const results = await validator.validateLinks(urls);
    
    expect(results).toHaveLength(3);
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(false);
    expect(results[2].isValid).toBe(false);
  });

  test('should respect custom options', async () => {
    const options = {
      allowedContentTypes: [], // Empty array means no content type restrictions
      timeout: 5000
    };

    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => {
            if (name === 'content-type') return 'application/json';
            return null;
          }
        }
      } as Response);
    });

    const validator = new LinkValidator();
    const result = await validator.validateLink('https://example.com/invalid-type', options);

    // Since content type validation is disabled, the link should be considered valid
    expect(result.isValid).toBe(true);
    expect(result.contentType).toBe('application/json');
  });
});
