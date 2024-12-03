import { test, expect } from '@playwright/test';

test('has welcome message', async ({ page }) => {
  await page.goto('/');

  // Check for welcome message
  const welcomeText = await page.locator('#welcome h1').innerText();
  expect(welcomeText).toContain('Hello there');
  expect(welcomeText).toContain('Welcome next');

  // Verify main sections are present
  await expect(page.locator('[data-testid="hero"]')).toBeVisible();
  await expect(page.locator('[data-testid="learning-materials"]')).toBeVisible();
  await expect(page.locator('[data-testid="commands"]')).toBeVisible();
});
