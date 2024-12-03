import { test, expect } from '@playwright/test';

test.describe('Example test suite', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');
    
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Acme/);
  });

  test('has heading', async ({ page }) => {
    await page.goto('/');

    // Find an element with the text 'Welcome' and verify it exists
    const heading = page.getByRole('heading', { name: /welcome/i });
    await expect(heading).toBeVisible();
  });
});
