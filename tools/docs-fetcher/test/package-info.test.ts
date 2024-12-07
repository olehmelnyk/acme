import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';
import { PackageInfoFetcher } from "../src/package-info";
import { DocsFetcherError, ErrorCode } from "../src/errors";
import * as path from "path";
import * as fs from "fs";

const TEST_CACHE_DIR = path.join(process.cwd(), "test", ".cache");

describe("PackageInfoFetcher", () => {
  let fetcher: PackageInfoFetcher;

  beforeEach(async () => {
    // Create a fresh cache directory for each test
    if (fs.existsSync(TEST_CACHE_DIR)) {
      fs.rmSync(TEST_CACHE_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_CACHE_DIR, { recursive: true });
    fs.writeFileSync(path.join(TEST_CACHE_DIR, 'index.json'), '{}');
    fetcher = new PackageInfoFetcher(TEST_CACHE_DIR);
    await fetcher.init();
  });

  afterEach(() => {
    // Clean up the test cache directory
    if (fs.existsSync(TEST_CACHE_DIR)) {
      fs.rmSync(TEST_CACHE_DIR, { recursive: true });
    }
  });

  test("should fetch package info", async () => {
    const info = await fetcher.getPackageInfo("shadcn-ui");
    expect(info.name).toBe("shadcn-ui");
    expect(info.version).toBeDefined();
    expect(info.description).toBeDefined();
  });

  test("should get documentation urls", async () => {
    const links = await fetcher.getDocumentationUrls("shadcn-ui");
    expect(links.npm).toBeDefined();
    expect(links.npm).toContain("shadcn-ui");
    // Other fields might be null, which is okay
  });

  test("should format installation instructions", async () => {
    const instructions = await fetcher.findInstallationInstructions("shadcn-ui");
    expect(instructions).toContain("bun add shadcn-ui");
    expect(instructions).not.toContain("npm install");
    expect(instructions).toContain("# Note: Also available");
  });

  test("should cache package information", async () => {
    // First call should hit the network
    const firstCall = await fetcher.getAllPackageInfo("shadcn-ui");
    expect(firstCall.info.name).toBe("shadcn-ui");

    // Mock fetch to verify we're using cache
    const originalFetch = global.fetch;
    const fetchMock = vi.fn((...args) => originalFetch(...args));
    global.fetch = fetchMock;

    // Second call should use cache
    const secondCall = await fetcher.getAllPackageInfo("shadcn-ui");
    expect(secondCall.info.name).toBe("shadcn-ui");
    expect(fetchMock).not.toHaveBeenCalled();

    // Restore original fetch
    global.fetch = originalFetch;
  });

  test("should handle non-existent packages", async () => {
    try {
      await fetcher.getPackageInfo("this-package-definitely-does-not-exist-123");
      expect(false).toBe(true); // Should not reach here
    } catch (err) {
      const error = err as DocsFetcherError;
      expect(error.message).toContain("Package 'this-package-definitely-does-not-exist-123' not found");
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
    }
  });

  test("should handle network errors", async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const networkError = new TypeError("Failed to fetch");
    fetchSpy.mockImplementation(() => Promise.reject(networkError));

    try {
      await fetcher.getPackageInfo("test-package");
      expect(false).toBe(true); // Should not reach here
    } catch (err) {
      const error = err as DocsFetcherError;
      expect(error).toBeInstanceOf(DocsFetcherError);
      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.message).toContain("Network error");
    } finally {
      fetchSpy.mockRestore();
    }
  });

  test("should handle timeouts", async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const abortError = new DOMException("The operation was aborted", "AbortError");
    fetchSpy.mockImplementation(() => Promise.reject(abortError));

    try {
      await fetcher.getPackageInfo("test-package");
      expect(false).toBe(true); // Should not reach here
    } catch (err) {
      const error = err as DocsFetcherError;
      expect(error).toBeInstanceOf(DocsFetcherError);
      expect(error.code).toBe(ErrorCode.TIMEOUT);
      expect(error.message).toContain("timeout");
    } finally {
      fetchSpy.mockRestore();
    }
  });

  test('should retry on network errors', async () => {
    const mockResponse = {
      name: 'test-package',
      version: '1.0.0',
      description: 'Test package',
      repository: { url: 'https://github.com/test/test-package' }
    };

    let attempts = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts === 1) {
        throw new Error('Network error');
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);
    });

    const fetcher = new PackageInfoFetcher();
    const info = await fetcher.getPackageInfo("test-package");
    expect(attempts).toBe(2);
    expect(info.name).toBe('test-package');
  });

  test('should handle invalid package data', async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null)
      } as Response);
    });

    const fetcher = new PackageInfoFetcher();
    try {
      await fetcher.getPackageInfo("test-package");
      fail('Should throw error for invalid data');
    } catch (err) {
      expect(err).toBeInstanceOf(DocsFetcherError);
      expect((err as DocsFetcherError).code).toBe(ErrorCode.INVALID_DATA);
    }
  });
});
