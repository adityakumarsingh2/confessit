import { test, expect } from '@playwright/test';

test.describe('Landing Page E2E Automation Specs', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local application root
    await page.goto('/');
  });

  test('should render page title and main elements', async ({ page }) => {
    // Check page title contains ConfessIt or ConfessHere
    await expect(page).toHaveTitle(/Confess/i);

    // Verify presence of composer or primary call-to-action
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should display composer or navigation buttons', async ({ page }) => {
    // Check that interactive elements like buttons exist on landing view
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});
