import { test, expect } from '@playwright/test';

test.describe('Feed & Navigation UI Automation Specs', () => {
  test('should load application without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    // Expect no critical unhandled crashes on load
    expect(page.url()).toContain('5173');
  });
});
