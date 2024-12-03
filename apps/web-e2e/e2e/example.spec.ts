import { test, expect } from '@playwright/test';

test.describe('Page Navigation', () => {
  test('home page has correct title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle('Acme Web App');
    await expect(page).toHaveTitle(/Acme/i);
    
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain('acme');
  });

  test('404 page shows correct title', async ({ page }) => {
    const response = await page.goto('/404', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle('404: This page could not be found.');
  });

  test('has accessible heading', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Test heading presence and accessibility
    const heading = page.getByRole('heading', { name: /welcome/i, level: 1 });
    
    // Verify visibility and semantic structure
    await expect(heading).toBeVisible();
    
    // Verify heading content
    const headingText = await heading.textContent();
    expect(headingText?.toLowerCase()).toContain('welcome');

    // Test color contrast (accessibility)
    const styles = await heading.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      };
    });
    expect(styles.color).toBeTruthy();
    expect(styles.backgroundColor).toBeTruthy();

    // Error cases
    await test.step('handle missing heading', async () => {
      await page.evaluate(() => {
        const heading = document.querySelector('h1');
        heading?.remove();
      });
      const missingHeading = page.getByRole('heading', { name: /welcome/i, level: 1 });
      await expect(missingHeading).not.toBeVisible();
    });
  });
});
