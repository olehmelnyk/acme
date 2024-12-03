import { test, expect } from '@playwright/test';

test.describe('Example test suite', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');
    
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Acme/);
  });

  test('has accessible heading', async ({ page }) => {
    await page.goto('/');

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
